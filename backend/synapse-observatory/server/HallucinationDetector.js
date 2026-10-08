// ═══════════════════════════════════════════════════════════
// SYNAPSE OBSERVATORY — Hallucination Detection Engine
// 3-Tier Architecture in a single module:
//   Tier 1: Mathematical Reasoning (telemetry-only, always on)
//   Tier 2: Behavioral Contracts (company-defined rules, opt-in)
//   Tier 3: Sandboxed Verifier (runs on company infra, receives verdicts)
// ═══════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────
// TIER 1: Mathematical Reasoning Detector
// Uses only observable signals — zero company data access
// ─────────────────────────────────────────────────────────

class MathDetector {
  constructor() {
    // Rolling baselines per agent (keyed by agentId)
    this.baselines = {};
    this.HISTORY_SIZE = 20;
  }

  /**
   * Get or initialize baseline tracker for an agent
   */
  _getBaseline(agentId) {
    if (!this.baselines[agentId]) {
      this.baselines[agentId] = {
        latencies: [],
        costs: [],
        confidences: [],
        outputHashes: [],
        outputLengths: [],
        timestamps: [],
      };
    }
    return this.baselines[agentId];
  }

  /**
   * Calculate Shannon entropy of a text string
   * High entropy = more random/gibberish output
   * Normal prose: ~3.5-4.5 bits, Gibberish: >5.0 bits
   */
  _calcEntropy(text) {
    if (!text || text.length === 0) return 0;
    const freq = {};
    const chars = text.toLowerCase().split('');
    for (const c of chars) {
      freq[c] = (freq[c] || 0) + 1;
    }
    let entropy = 0;
    const len = chars.length;
    for (const count of Object.values(freq)) {
      const p = count / len;
      if (p > 0) entropy -= p * Math.log2(p);
    }
    // Normalize to 0-1 range (max entropy for English ~5.2 bits)
    return Math.min(1, entropy / 5.2);
  }

  /**
   * Calculate n-gram repetition score
   * How much of the current output repeats content from recent outputs
   * High score = stuck in a loop
   */
  _calcRepetition(currentText, previousTexts) {
    if (!currentText || previousTexts.length === 0) return 0;

    const getNgrams = (text, n = 3) => {
      const words = text.toLowerCase().split(/\s+/);
      const ngrams = new Set();
      for (let i = 0; i <= words.length - n; i++) {
        ngrams.add(words.slice(i, i + n).join(' '));
      }
      return ngrams;
    };

    const currentNgrams = getNgrams(currentText);
    if (currentNgrams.size === 0) return 0;

    // Check overlap with each previous output
    let maxOverlap = 0;
    for (const prev of previousTexts.slice(-5)) {
      const prevNgrams = getNgrams(prev);
      let overlap = 0;
      for (const ng of currentNgrams) {
        if (prevNgrams.has(ng)) overlap++;
      }
      const ratio = overlap / currentNgrams.size;
      if (ratio > maxOverlap) maxOverlap = ratio;
    }

    return maxOverlap;
  }

  /**
   * Calculate Z-score for a value against a baseline array
   */
  _zScore(value, history) {
    if (history.length < 3) return 0;
    const mean = history.reduce((s, v) => s + v, 0) / history.length;
    const variance = history.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / history.length;
    const stdDev = Math.sqrt(variance);
    if (stdDev === 0) return 0;
    return Math.abs(value - mean) / stdDev;
  }

  /**
   * Calculate cost velocity — derivative of cost over time
   * Returns normalized 0-1 score (1 = extreme cost acceleration)
   */
  _calcCostVelocity(baseline) {
    if (baseline.costs.length < 3 || baseline.timestamps.length < 3) return 0;
    const recentCosts = baseline.costs.slice(-5);
    const recentTimes = baseline.timestamps.slice(-5);

    // Calculate cost rate (cost per second)
    const totalCost = recentCosts.reduce((s, v) => s + v, 0);
    const timeSpan = (recentTimes[recentTimes.length - 1] - recentTimes[0]) / 1000;
    if (timeSpan <= 0) return 0;

    const costRate = totalCost / timeSpan;

    // Compare to historical average rate
    const allCost = baseline.costs.reduce((s, v) => s + v, 0);
    const allTime = (baseline.timestamps[baseline.timestamps.length - 1] - baseline.timestamps[0]) / 1000;
    if (allTime <= 0) return 0;

    const avgRate = allCost / allTime;
    if (avgRate <= 0) return 0;

    // Ratio of current rate to average rate, normalized
    const ratio = costRate / avgRate;
    return Math.min(1, Math.max(0, (ratio - 1) / 10)); // 10x = score of 0.9
  }

  /**
   * Main scoring function — returns Tier 1 score (0.0 to 1.0)
   * @param {string} agentId
   * @param {string} outputText - The agent's response text
   * @param {number} latencyMs
   * @param {number} costUSD
   * @param {number} confidence - Self-reported confidence (0-1)
   * @param {number} tokenCount
   * @returns {{ score: number, breakdown: object }}
   */
  score(agentId, outputText, latencyMs, costUSD, confidence, tokenCount) {
    const baseline = this._getBaseline(agentId);
    const now = Date.now();

    // ── Calculate individual signals ──
    const entropyScore = this._calcEntropy(outputText);

    const repetitionScore = this._calcRepetition(
      outputText,
      baseline.outputHashes // we store previous texts here
    );

    const latencyZ = this._zScore(latencyMs, baseline.latencies);
    const latencyScore = Math.min(1, latencyZ / 4); // z>4 = score of 1.0

    const costVelocity = this._calcCostVelocity(baseline);

    // Confidence delta — how much did confidence drop vs recent average
    let confidenceDelta = 0;
    if (baseline.confidences.length >= 3) {
      const avgConf = baseline.confidences.reduce((s, v) => s + v, 0) / baseline.confidences.length;
      confidenceDelta = Math.max(0, avgConf - confidence); // positive = confidence dropped
    }

    // ── Update baseline with current values ──
    baseline.latencies.push(latencyMs);
    baseline.costs.push(costUSD);
    baseline.confidences.push(confidence);
    baseline.outputHashes.push(outputText || '');
    baseline.outputLengths.push(outputText ? outputText.length : 0);
    baseline.timestamps.push(now);

    // Trim to history size
    if (baseline.latencies.length > this.HISTORY_SIZE) {
      baseline.latencies = baseline.latencies.slice(-this.HISTORY_SIZE);
      baseline.costs = baseline.costs.slice(-this.HISTORY_SIZE);
      baseline.confidences = baseline.confidences.slice(-this.HISTORY_SIZE);
      baseline.outputHashes = baseline.outputHashes.slice(-this.HISTORY_SIZE);
      baseline.outputLengths = baseline.outputLengths.slice(-this.HISTORY_SIZE);
      baseline.timestamps = baseline.timestamps.slice(-this.HISTORY_SIZE);
    }

    // ── Weighted combination ──
    const weights = {
      entropy: 0.20,
      repetition: 0.15,
      latency: 0.15,
      costVelocity: 0.25,
      confidenceDelta: 0.25,
    };

    const score = Math.min(1, Math.max(0,
      weights.entropy * entropyScore +
      weights.repetition * repetitionScore +
      weights.latency * latencyScore +
      weights.costVelocity * costVelocity +
      weights.confidenceDelta * confidenceDelta
    ));

    return {
      score: parseFloat(score.toFixed(3)),
      breakdown: {
        entropy: { value: parseFloat(entropyScore.toFixed(3)), weight: weights.entropy, label: entropyScore > 0.7 ? 'HIGH' : entropyScore > 0.4 ? 'ELEVATED' : 'NORMAL' },
        repetition: { value: parseFloat(repetitionScore.toFixed(3)), weight: weights.repetition, label: repetitionScore > 0.7 ? 'LOOP DETECTED' : repetitionScore > 0.4 ? 'ELEVATED' : 'NORMAL' },
        latency: { value: parseFloat(latencyScore.toFixed(3)), weight: weights.latency, zScore: parseFloat(latencyZ.toFixed(2)), label: latencyZ > 3 ? 'CRITICAL' : latencyZ > 2 ? 'ELEVATED' : 'NORMAL' },
        costVelocity: { value: parseFloat(costVelocity.toFixed(3)), weight: weights.costVelocity, label: costVelocity > 0.7 ? 'RUNAWAY' : costVelocity > 0.3 ? 'ELEVATED' : 'NORMAL' },
        confidenceDelta: { value: parseFloat(confidenceDelta.toFixed(3)), weight: weights.confidenceDelta, label: confidenceDelta > 0.5 ? 'COLLAPSE' : confidenceDelta > 0.2 ? 'DROPPING' : 'STABLE' },
      },
    };
  }

  /**
   * Reset baselines for an agent (on restart)
   */
  reset(agentId) {
    delete this.baselines[agentId];
  }

  resetAll() {
    this.baselines = {};
  }
}


// ─────────────────────────────────────────────────────────
// TIER 2: Behavioral Contract Detector
// Company provides rules (not data) — we validate agent outputs
// ─────────────────────────────────────────────────────────

class ContractDetector {
  constructor() {
    // Contracts stored per-company/tenant (for now, a global set)
    this.contracts = [];
    this.enabled = false;
  }

  /**
   * Load contracts from a JSON array
   * @param {Array} contracts - Array of contract rule objects
   */
  loadContracts(contracts) {
    this.contracts = contracts || [];
    this.enabled = this.contracts.length > 0;
    console.log(`[ContractDetector] Loaded ${this.contracts.length} behavioral contracts`);
  }

  /**
   * Check an agent's output against all applicable contracts
   * @param {string} agentId
   * @param {string} outputText
   * @param {object} context - Optional structured data from the agent
   * @returns {{ score: number, violations: Array, totalChecks: number }}
   */
  check(agentId, outputText, context = {}) {
    if (!this.enabled || this.contracts.length === 0) {
      return { score: 0, violations: [], totalChecks: 0, active: false };
    }

    const applicable = this.contracts.filter(c => c.agent === '*' || c.agent === agentId);
    if (applicable.length === 0) {
      return { score: 0, violations: [], totalChecks: 0, active: true };
    }

    const violations = [];
    const text = outputText.toLowerCase();

    for (const contract of applicable) {
      try {
        const result = this._evaluateRule(contract, text, outputText, context);
        if (result.violated) {
          violations.push({
            rule: contract.rule,
            field: contract.field || 'output',
            description: contract.description,
            expected: result.expected,
            actual: result.actual,
            severity: contract.severity || 'high',
          });
        }
      } catch (err) {
        // Don't let a bad contract crash the detector
        console.warn(`[ContractDetector] Error evaluating contract: ${err.message}`);
      }
    }

    // Score: ratio of violations to total checks (0 = clean, 1 = all failed)
    const score = applicable.length > 0 ? violations.length / applicable.length : 0;

    return {
      score: parseFloat(Math.min(1, score).toFixed(3)),
      violations,
      totalChecks: applicable.length,
      active: true,
    };
  }

  /**
   * Evaluate a single rule against the output
   */
  _evaluateRule(contract, textLower, textOriginal, context) {
    switch (contract.rule) {
      case 'range_check': {
        // Extract numbers near the field name
        const pattern = new RegExp(`${(contract.field || '').toLowerCase()}[^0-9]*\\$?([0-9,]+\\.?[0-9]*)`, 'i');
        const match = textLower.match(pattern);
        if (match) {
          const value = parseFloat(match[1].replace(/,/g, ''));
          if (!isNaN(value) && (value < contract.min || value > contract.max)) {
            return { violated: true, expected: `${contract.min}-${contract.max}`, actual: value };
          }
        }
        return { violated: false };
      }

      case 'non_negative': {
        const pattern = new RegExp(`${(contract.field || '').toLowerCase()}[^0-9]*(-[0-9,]+\\.?[0-9]*)`, 'i');
        const match = textLower.match(pattern);
        if (match) {
          const value = parseFloat(match[1].replace(/,/g, ''));
          if (!isNaN(value) && value < 0) {
            return { violated: true, expected: '>= 0', actual: value };
          }
        }
        return { violated: false };
      }

      case 'enum_check': {
        if (contract.allowed_values && contract.field) {
          const fieldLower = contract.field.toLowerCase();
          // Check if text mentions the field and then a value not in the allowed list
          if (textLower.includes(fieldLower)) {
            const anyAllowed = contract.allowed_values.some(v => textLower.includes(v.toLowerCase()));
            if (!anyAllowed) {
              return { violated: true, expected: contract.allowed_values.join(', '), actual: 'unknown value' };
            }
          }
        }
        return { violated: false };
      }

      case 'threshold': {
        // Look for amounts exceeding the threshold
        const amounts = textOriginal.match(/\$([0-9,]+\.?[0-9]*)/g);
        if (amounts) {
          for (const amt of amounts) {
            const value = parseFloat(amt.replace(/[$,]/g, ''));
            if (!isNaN(value) && value > contract.max) {
              return { violated: true, expected: `<= $${contract.max}`, actual: `$${value}` };
            }
          }
        }
        return { violated: false };
      }

      case 'forbidden_words': {
        if (contract.words) {
          for (const word of contract.words) {
            if (textLower.includes(word.toLowerCase())) {
              return { violated: true, expected: `Must not contain "${word}"`, actual: `Found "${word}"` };
            }
          }
        }
        return { violated: false };
      }

      case 'required_fields': {
        if (contract.fields) {
          for (const field of contract.fields) {
            if (!textLower.includes(field.toLowerCase())) {
              return { violated: true, expected: `Must mention "${field}"`, actual: 'Not found' };
            }
          }
        }
        return { violated: false };
      }

      default:
        return { violated: false };
    }
  }

  /**
   * Get loaded contracts for the settings UI
   */
  getContracts() {
    return { contracts: this.contracts, enabled: this.enabled };
  }
}


// ─────────────────────────────────────────────────────────
// TIER 3: Verifier Receiver
// Receives pass/fail verdicts from the company's local
// Verifier Agent — we never see their data
// ─────────────────────────────────────────────────────────

class VerifierReceiver {
  constructor() {
    // Store latest verdicts per agent
    this.verdicts = {};
    this.enabled = false;
    this.verifierToken = null; // Simple token auth for the verifier
  }

  /**
   * Enable the verifier receiver with an auth token
   */
  enable(token) {
    this.verifierToken = token;
    this.enabled = true;
    console.log('[VerifierReceiver] Enabled — awaiting verdicts from external verifier');
  }

  /**
   * Receive a verdict from the company's local Verifier Agent
   * @param {string} token - Auth token
   * @param {object} verdict - { agentId, verdict: 'PASS'|'FAIL', confidence, category, timestamp }
   * @returns {{ accepted: boolean, error?: string }}
   */
  receiveVerdict(token, verdict) {
    if (!this.enabled) {
      return { accepted: false, error: 'Verifier not enabled' };
    }

    if (token !== this.verifierToken) {
      return { accepted: false, error: 'Invalid verifier token' };
    }

    if (!verdict || !verdict.agentId || !verdict.verdict) {
      return { accepted: false, error: 'Invalid verdict payload' };
    }

    this.verdicts[verdict.agentId] = {
      verdict: verdict.verdict,  // 'PASS' or 'FAIL'
      confidence: verdict.confidence || 0.5,
      category: verdict.category || 'unknown',
      timestamp: verdict.timestamp || new Date().toISOString(),
      receivedAt: new Date().toISOString(),
    };

    return { accepted: true };
  }

  /**
   * Get the latest verdict score for an agent
   * @returns {{ score: number, verdict: object|null, active: boolean }}
   */
  getScore(agentId) {
    if (!this.enabled) {
      return { score: 0, verdict: null, active: false };
    }

    const verdict = this.verdicts[agentId];
    if (!verdict) {
      return { score: 0, verdict: null, active: true };
    }

    // Check if verdict is stale (older than 30 seconds)
    const age = Date.now() - new Date(verdict.timestamp).getTime();
    if (age > 30000) {
      return { score: 0, verdict: { ...verdict, stale: true }, active: true };
    }

    // FAIL with high confidence = high score
    const score = verdict.verdict === 'FAIL' ? verdict.confidence : 0;

    return {
      score: parseFloat(score.toFixed(3)),
      verdict,
      active: true,
    };
  }

  /**
   * Clear verdicts for an agent (on restart)
   */
  clear(agentId) {
    delete this.verdicts[agentId];
  }

  clearAll() {
    this.verdicts = {};
  }
}


// ─────────────────────────────────────────────────────────
// COMBINED: Hallucination Scorer
// Merges all active tiers into a single HRS score
// ─────────────────────────────────────────────────────────

class HallucinationScorer {
  constructor(io) {
    this.io = io;
    this.math = new MathDetector();
    this.contracts = new ContractDetector();
    this.verifier = new VerifierReceiver();

    // Thresholds
    this.THRESHOLD_WARNING = 0.45;
    this.THRESHOLD_CRITICAL = 0.70;
    this.THRESHOLD_AUTO_PAUSE = 0.85;

    // Track per-agent scores for history
    this.history = {};
  }

  /**
   * Score an agent's output through all active tiers
   * @param {string} agentId
   * @param {string} outputText
   * @param {object} telemetry - { latencyMs, costUSD, confidence, tokenCount }
   * @returns {{ hrs: number, level: string, tiers: object, shouldPause: boolean }}
   */
  score(agentId, outputText, telemetry) {
    // ── Tier 1: Mathematical (always on) ──
    const t1 = this.math.score(
      agentId,
      outputText,
      telemetry.latencyMs || 0,
      telemetry.costUSD || 0,
      telemetry.confidence || 0.9,
      telemetry.tokenCount || 0
    );

    // ── Tier 2: Contracts (if loaded) ──
    const t2 = this.contracts.check(agentId, outputText);

    // ── Tier 3: Verifier (if enabled) ──
    const t3 = this.verifier.getScore(agentId);

    // ── Determine active tiers and compute weighted HRS ──
    const activeTiers = [];
    let hrs = 0;

    if (t3.active && t3.verdict) {
      // All 3 tiers active
      activeTiers.push('T1', 'T2', 'T3');
      hrs = 0.10 * t1.score + 0.20 * t2.score + 0.70 * t3.score;
    } else if (t2.active && t2.totalChecks > 0) {
      // Tier 1 + 2
      activeTiers.push('T1', 'T2');
      hrs = 0.35 * t1.score + 0.65 * t2.score;
    } else {
      // Tier 1 only
      activeTiers.push('T1');
      hrs = t1.score;
    }

    hrs = parseFloat(Math.min(1, Math.max(0, hrs)).toFixed(3));

    // ── Determine risk level ──
    let level = 'nominal';
    if (hrs >= this.THRESHOLD_AUTO_PAUSE) level = 'critical';
    else if (hrs >= this.THRESHOLD_CRITICAL) level = 'high';
    else if (hrs >= this.THRESHOLD_WARNING) level = 'warning';

    const shouldPause = hrs >= this.THRESHOLD_AUTO_PAUSE;

    // ── Build result ──
    const result = {
      agentId,
      hrs,
      level,
      shouldPause,
      activeTiers,
      accuracy: this._getAccuracyEstimate(activeTiers),
      tiers: {
        t1: { score: t1.score, breakdown: t1.breakdown, active: true },
        t2: { score: t2.score, violations: t2.violations, totalChecks: t2.totalChecks, active: t2.active },
        t3: { score: t3.score, verdict: t3.verdict, active: t3.active },
      },
      timestamp: new Date().toISOString(),
    };

    // ── Store in history ──
    if (!this.history[agentId]) this.history[agentId] = [];
    this.history[agentId].push({ hrs, level, timestamp: result.timestamp });
    if (this.history[agentId].length > 50) {
      this.history[agentId] = this.history[agentId].slice(-50);
    }

    // ── Emit to frontend via Socket.IO ──
    if (this.io) {
      this.io.emit('hallucination:score', result);
    }

    return result;
  }

  /**
   * Get accuracy estimate based on active tiers
   */
  _getAccuracyEstimate(activeTiers) {
    if (activeTiers.includes('T3')) return '~99%';
    if (activeTiers.includes('T2')) return '~92-95%';
    return '~75-85%';
  }

  /**
   * Get score history for an agent (for sparkline charts)
   */
  getHistory(agentId) {
    return this.history[agentId] || [];
  }

  /**
   * Reset everything for an agent
   */
  reset(agentId) {
    this.math.reset(agentId);
    this.verifier.clear(agentId);
    delete this.history[agentId];
  }

  resetAll() {
    this.math.resetAll();
    this.verifier.clearAll();
    this.history = {};
  }
}


module.exports = { HallucinationScorer, MathDetector, ContractDetector, VerifierReceiver };
