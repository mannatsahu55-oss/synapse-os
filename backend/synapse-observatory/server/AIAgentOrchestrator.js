// ═══════════════════════════════════════════════════════════
// SYNAPSE OBSERVATORY — AI Agent Orchestrator (REAL LLM)
// Each agent is a real Gemini API call with specialized prompts.
// Agents chain outputs: Agent 1 → Agent 2 → Agent 3 → ...
// ═══════════════════════════════════════════════════════════

const { GoogleGenerativeAI } = require('@google/generative-ai');

// ── Agent Definitions with System Prompts ──
const AGENT_DEFINITIONS = {
  inventory: {
    id: 'inventory',
    name: 'Inventory Agent',
    icon: '📦',
    color: '#3B82F6',
    systemPrompt: `You are the Inventory Agent in a multi-agent supply chain management system.
Your role: Monitor stock levels, detect low-stock items, verify product availability, and cross-reference incoming data against current inventory.

Current Inventory State:
- Widget A: 450 units (reorder threshold: 200, price: $24.99)
- Widget B: 120 units (reorder threshold: 150, price: $49.99)
- Component X: 800 units (reorder threshold: 300, price: $12.50)
- Module Y: 65 units (reorder threshold: 100, price: $89.00)
- Sensor Z: 290 units (reorder threshold: 250, price: $35.00)

IMPORTANT: Respond with REAL analysis. Be specific with numbers. Flag any items below reorder threshold.
Format your response as a structured analysis with clear sections: ANALYSIS, FINDINGS, ACTIONS TAKEN, HANDOFF SUMMARY.
Keep response concise (under 200 words).`,
  },
  procurement: {
    id: 'procurement',
    name: 'Procurement Agent',
    icon: '🛒',
    color: '#F59E0B',
    systemPrompt: `You are the Procurement Agent in a multi-agent supply chain management system.
Your role: Analyze supplier options, generate purchase orders, negotiate pricing, and optimize procurement strategy.

Available Suppliers:
- TechParts Co.: 95% reliability, standard pricing (1.0x), 3-day lead time
- GlobalSource Ltd.: 88% reliability, discount pricing (0.85x), 7-day lead time
- QuickShip Inc.: 92% reliability, premium pricing (1.15x), 1-day lead time

IMPORTANT: Make real supplier recommendations based on the data. Calculate actual costs. Generate realistic PO numbers.
Format your response as: SUPPLIER ANALYSIS, RECOMMENDED ACTION, PURCHASE ORDER DRAFT, HANDOFF SUMMARY.
Keep response concise (under 200 words).`,
  },
  finance: {
    id: 'finance',
    name: 'Finance Agent',
    icon: '💰',
    color: '#10B981',
    systemPrompt: `You are the Finance Agent in a multi-agent supply chain management system.
Your role: Validate purchases against cash flow, approve or flag expenditures, calculate financial impact, and ensure fiscal responsibility.

Current Financial State:
- Cash Balance: $287,450.00
- Monthly Revenue: $145,000.00
- Monthly Expenses: $98,000.00
- Pending Payables: $34,200.00
- Pending Receivables: $67,800.00
- Available Cash (after payables): $253,250.00

RULES:
- If purchase amount > $10,000: FLAG FOR HUMAN APPROVAL (set requiresApproval: true)
- If purchase amount > available cash: REJECT
- Always calculate net impact on cash flow

Format your response as: FINANCIAL REVIEW, CASH FLOW IMPACT, DECISION (APPROVED/FLAGGED/REJECTED), REASONING.
Keep response concise (under 200 words).`,
  },
  logistics: {
    id: 'logistics',
    name: 'Logistics Agent',
    icon: '🚛',
    color: '#8B5CF6',
    systemPrompt: `You are the Logistics Agent in a multi-agent supply chain management system.
Your role: Plan shipping routes, manage deliveries, handle disruptions, reschedule workforce, and optimize transportation.

Active Routes:
- Route NH-48: Mumbai → Delhi (3 days, $800)
- Route NH-44: Chennai → Bangalore (2 days, $400)
- Route NH-27: Jaipur → Ahmedabad (1 day, $300)

Active Shipments:
- SHP-2847: 500 units Widget A (Route NH-48, value: $12,495)
- SHP-2851: 200 units Component X (Route NH-48, value: $2,500)
- SHP-2856: 100 units Module Y (Route NH-44, value: $8,900)

Warehouse Staff: 24 workers across 3 shifts

Format your response as: SITUATION ASSESSMENT, ROUTE ANALYSIS, ACTIONS TAKEN, IMPACT SUMMARY.
Keep response concise (under 200 words).`,
  },
  pricing: {
    id: 'pricing',
    name: 'Pricing Agent',
    icon: '📊',
    color: '#EC4899',
    systemPrompt: `You are the Pricing Agent in a multi-agent supply chain management system.
Your role: Calculate optimal pricing, apply demand-based adjustments, manage margins, and activate dynamic pricing strategies.

Current Pricing:
- Widget A: $24.99 (margin: 35%, demand: MEDIUM)
- Widget B: $49.99 (margin: 42%, demand: LOW)
- Component X: $12.50 (margin: 28%, demand: HIGH)
- Module Y: $89.00 (margin: 45%, demand: MEDIUM)
- Sensor Z: $35.00 (margin: 31%, demand: LOW)

Pricing Rules:
- Supply disruption → increase affected SKU prices by 5-15%
- High demand + low stock → surge pricing up to 20%
- Bulk orders (>100 units) → volume discount 5-10%
- Priority orders → premium surcharge 8%

Format your response as: PRICING ANALYSIS, ADJUSTMENTS MADE, PROJECTED REVENUE IMPACT, SUMMARY.
Keep response concise (under 200 words).`,
  },
};

// ── Scenario Definitions ──
const SCENARIO_CONFIGS = {
  invoice: {
    title: 'Invoice OCR Processing',
    icon: '📄',
    description: 'AI agents parse an invoice, verify stock, draft purchase orders, and prepare financial approvals.',
    agentChain: ['inventory', 'procurement', 'finance'],
    steps: [
      { title: 'Multi-Modal OCR Parsing', desc: 'Vision model extracts structured data from invoice image' },
      { title: 'Inventory Cross-Reference', desc: 'Stock levels checked, low-stock alerts triggered' },
      { title: 'Autonomous Procurement', desc: 'Supplier analysis, PO generation with best pricing' },
      { title: 'Financial Validation', desc: 'Cash flow check, approval request for human review' },
    ],
    initialPrompt: `A warehouse manager has photographed a paper invoice. Here is the extracted data:

Invoice: INV-2024-4872
Vendor: Mumbai Parts Distributors Pvt. Ltd.
Date: 2024-07-06
Items:
  - Widget B: 80 units @ $49.99 each
  - Module Y: 45 units @ $89.00 each
  - Sensor Z: 60 units @ $35.00 each
Total: $10,104.20

Process this invoice: update inventory levels, check for low-stock items, and prepare for procurement if needed.`,
  },
  whatsapp: {
    title: 'WhatsApp Custom Order',
    icon: '💬',
    description: 'NLP parses a customer order from natural language, checks availability, and processes fulfillment.',
    agentChain: ['inventory', 'pricing', 'logistics'],
    steps: [
      { title: 'NLP Message Parsing', desc: 'Extract order intent from natural language WhatsApp text' },
      { title: 'Stock Availability Check', desc: 'Verify all requested items are in stock' },
      { title: 'Dynamic Pricing Engine', desc: 'Calculate order total with demand-based pricing' },
      { title: 'Order Fulfillment', desc: 'Generate invoice, schedule delivery, notify customer' },
    ],
    initialPrompt: `A customer sent this WhatsApp message:

"Hi, I need 25 units of Widget A and 10 units of Module Y delivered to our Bangalore warehouse by Thursday. Can you also add 50 Sensor Z? Priority order for Rajesh at TechCorp."

Parse this natural language order. Extract: customer name, items with quantities, destination, deadline, and priority level. Then check inventory availability for all items.`,
  },
  selfhealing: {
    title: 'Self-Healing Supply Chain',
    icon: '🌀',
    description: 'A cyclone disrupts shipping. Agents autonomously adjust pricing, reroute shipments, and resolve the crisis.',
    agentChain: ['logistics', 'pricing', 'procurement', 'finance'],
    steps: [
      { title: 'External Disruption Alert', desc: 'Weather API detects cyclone on shipping corridor' },
      { title: 'Dynamic Pricing Activation', desc: 'Optimize pricing on affected SKUs, reserve safety stock' },
      { title: 'Alternative Route Planning', desc: 'Find backup suppliers and shipping routes' },
      { title: 'Autonomous Resolution', desc: 'Calculate net impact, notify stakeholders' },
    ],
    initialPrompt: `⚠️ CRITICAL WEATHER ALERT:

Cyclone Biparjoy (Category 2) detected on shipping corridor Mumbai→Delhi (Route NH-48).
- Expected landfall: 18 hours
- Estimated disruption: 4-5 days
- Affected shipments: SHP-2847 (500 units Widget A, value $12,495), SHP-2851 (200 units Component X, value $2,500)
- Total goods at risk: $14,995

Assess the situation. Identify affected shipments, calculate delay impact, and recommend immediate actions.`,
  },
};

// Gemini pricing per 1M tokens (flash model)
const GEMINI_PRICING = {
  promptPer1M: 0.075,    // $0.075 per 1M input tokens
  completionPer1M: 0.30, // $0.30 per 1M output tokens
};

class AIAgentOrchestrator {
  constructor(io, scorer) {
    this.io = io;
    this.scorer = scorer || null; // HallucinationScorer instance
    this.genAI = null;
    this.model = null;
    this.isRunning = false;
    this.apiKey = null;
    this.pendingApprovals = [];
    this.approvalResolvers = {};
  }

  /**
   * Initialize with API key (can be called multiple times if key changes)
   */
  initialize(apiKey) {
    if (!apiKey) {
      throw new Error('Gemini API key is required');
    }
    this.apiKey = apiKey;
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 512,
      },
    });
    console.log('[AI Orchestrator] Initialized with Gemini 2.5 Flash');
  }

  /**
   * Call a single agent with a prompt and return structured result
   */
  async callAgent(agentId, userPrompt, previousOutput = null) {
    const agentDef = AGENT_DEFINITIONS[agentId];
    if (!agentDef) throw new Error(`Unknown agent: ${agentId}`);
    if (!this.model) throw new Error('AI Orchestrator not initialized. Set API key first.');

    // Build the full prompt with agent system instructions + context
    let fullPrompt = agentDef.systemPrompt + '\n\n';

    if (previousOutput) {
      fullPrompt += `--- UPSTREAM AGENT OUTPUT ---\n${previousOutput}\n--- END UPSTREAM ---\n\n`;
    }

    fullPrompt += `USER REQUEST:\n${userPrompt}`;

    const startTime = Date.now();

    try {
      const result = await this.model.generateContent(fullPrompt);
      const response = result.response;
      const text = response.text();

      const latencyMs = Date.now() - startTime;

      // Extract real token usage from Gemini response
      const usage = response.usageMetadata || {};
      const promptTokens = usage.promptTokenCount || 0;
      const completionTokens = usage.candidatesTokenCount || 0;
      const totalTokens = usage.totalTokenCount || (promptTokens + completionTokens);

      // Calculate real cost
      const costUSD = (
        (promptTokens / 1_000_000) * GEMINI_PRICING.promptPer1M +
        (completionTokens / 1_000_000) * GEMINI_PRICING.completionPer1M
      );

      // ── RUN REAL 3-TIER SCORING ──
      let hrsResult = null;
      if (this.scorer) {
        // Run Consensus Variance Check (Tier 3)
        const consensusVerdict = await this.runConsensusCheck(fullPrompt, text, agentId);
        
        // Pass the result to the Verifier (Tier 3)
        this.scorer.verifier.receiveVerdict('demo-sandbox-token', {
          agentId,
          verdict: consensusVerdict.pass ? 'PASS' : 'FAIL',
          confidence: consensusVerdict.confidence,
          category: consensusVerdict.pass ? 'nominal' : 'consensus_variance',
          reason: consensusVerdict.reason
        });

        // Run full 3-Tier scoring (T1 + T2 + T3)
        hrsResult = this.scorer.score(agentId, text, {
          latencyMs,
          costUSD,
          confidence: 0.95, // Gemini doesn't expose logprobs yet, mock high base confidence
          tokenCount: totalTokens,
        });

        // Emit real-time score to clients
        this.io.emit('hallucination:score', {
          agentId,
          score: hrsResult.score,
          breakdown: hrsResult.breakdown,
          tiersActive: hrsResult.tiersActive
        });

        if (hrsResult.score >= this.scorer.CRITICAL_THRESHOLD) {
          throw new Error(`Auto-Pause: Agent ${agentId} exceeded safe hallucination threshold (${Math.round(hrsResult.score * 100)}%). Trigger: ${consensusVerdict.reason || 'Telemetry Anomaly'}`);
        }
      }

      // Check if the agent's response indicates need for human approval
      const requiresApproval = text.toLowerCase().includes('flag') && text.toLowerCase().includes('approval') ||
                               text.toLowerCase().includes('human approval') ||
                               text.toLowerCase().includes('requiresapproval: true');

      return {
        agentId,
        agentName: agentDef.name,
        icon: agentDef.icon,
        color: agentDef.color,
        response: text,
        tokens: { prompt: promptTokens, completion: completionTokens, total: totalTokens },
        costUSD: parseFloat(costUSD.toFixed(6)),
        latencyMs,
        requiresApproval,
        timestamp: new Date().toISOString(),
        model: 'gemini-1.5-flash',
        hrs: hrsResult
      };
    } catch (error) {
      const latencyMs = Date.now() - startTime;
      console.error(`[AI Agent ${agentId}] Error:`, error.message);

      return {
        agentId,
        agentName: agentDef.name,
        icon: agentDef.icon,
        color: agentDef.color,
        response: `ERROR: ${error.message}`,
        tokens: { prompt: 0, completion: 0, total: 0 },
        costUSD: 0,
        latencyMs,
        requiresApproval: false,
        timestamp: new Date().toISOString(),
        model: 'gemini-1.5-flash',
        error: true,
      };
    }
  }

  /**
   * Run a full scenario — chain agents sequentially, emitting events at each step
   */
  async runScenario(scenarioId, apiKey) {
    // Initialize or re-initialize with the provided key
    this.initialize(apiKey);

    const scenario = SCENARIO_CONFIGS[scenarioId];
    if (!scenario) throw new Error(`Unknown scenario: ${scenarioId}`);

    this.isRunning = true;
    const totalStartTime = Date.now();
    let cumulativeCost = 0;
    let cumulativeTokens = 0;

    // Emit scenario start
    this.io.emit('live:scenario-start', {
      scenarioId,
      title: scenario.title,
      icon: scenario.icon,
      description: scenario.description,
      steps: scenario.steps,
      agentChain: scenario.agentChain,
      timestamp: new Date().toISOString(),
    });

    let previousOutput = null;

    for (let i = 0; i < scenario.agentChain.length; i++) {
      const agentId = scenario.agentChain[i];
      const stepIndex = i;

      // Emit agent starting
      this.io.emit('live:agent-status', { agentId, status: 'processing' });
      this.io.emit('live:activity', {
        id: Date.now() + Math.random(),
        agentId,
        agent: AGENT_DEFINITIONS[agentId],
        message: `🤖 Agent activated. Processing with Gemini 2.0 Flash...`,
        type: 'info',
        timestamp: new Date().toISOString(),
        isLive: true,
      });

      // Emit step active
      this.io.emit('live:demo-step', { step: stepIndex, status: 'active' });

      // Make the REAL LLM call
      const prompt = i === 0 ? scenario.initialPrompt : `Continue processing. Previous agent's analysis:\n\n${previousOutput}`;
      const result = await this.callAgent(agentId, prompt, i === 0 ? null : previousOutput);

      cumulativeCost += result.costUSD;
      cumulativeTokens += result.tokens.total;

      // Emit the real activity log with LLM response
      this.io.emit('live:activity', {
        id: Date.now() + Math.random(),
        agentId,
        agent: AGENT_DEFINITIONS[agentId],
        message: result.response,
        type: result.error ? 'error' : 'success',
        timestamp: result.timestamp,
        isLive: true,
        tokens: result.tokens,
        costUSD: result.costUSD,
        latencyMs: result.latencyMs,
        model: result.model,
      });

      // Emit token/cost telemetry
      this.io.emit('live:telemetry', {
        agentId,
        tokens: result.tokens,
        costUSD: result.costUSD,
        latencyMs: result.latencyMs,
        cumulativeCost,
        cumulativeTokens,
        model: result.model,
      });

      // Emit step completed
      this.io.emit('live:demo-step', {
        step: stepIndex,
        status: 'completed',
        output: result.response,
      });

      // Emit agent idle
      this.io.emit('live:agent-status', { agentId, status: 'idle' });

      // ── Run through HallucinationScorer (3-Tier) ──
      let hrsResult = null;
      if (this.scorer) {
        hrsResult = this.scorer.score(agentId, result.response, {
          latencyMs: result.latencyMs,
          costUSD: result.costUSD,
          confidence: result.error ? 0.1 : 0.9,
          tokenCount: result.tokens.total,
        });

        // Emit HRS to frontend
        this.io.emit('live:activity', {
          id: Date.now() + Math.random(),
          agentId,
          agent: AGENT_DEFINITIONS[agentId],
          message: `🛡️ HRS: ${hrsResult.hrs} (${hrsResult.level}) | Tiers: ${hrsResult.activeTiers.join('+')} | Accuracy: ${hrsResult.accuracy}`,
          type: hrsResult.level === 'critical' ? 'warning' : 'info',
          timestamp: new Date().toISOString(),
          isLive: true,
          hrs: hrsResult,
        });

        // If HRS triggers auto-pause, halt the chain
        if (hrsResult.shouldPause) {
          this.io.emit('alert:hallucination', {
            agentId,
            agentName: AGENT_DEFINITIONS[agentId].name,
            message: `LIVE AI: HRS ${hrsResult.hrs} exceeded threshold. Agent chain halted to prevent downstream corruption.`,
            confidence: 1 - hrsResult.hrs,
            hrs: hrsResult,
            timestamp: new Date().toISOString(),
          });

          // Break the chain — don't hand corrupted output to next agent
          this.io.emit('live:scenario-complete', {
            scenarioId,
            title: scenario.title + ' (HALTED)',
            totalLatency: Date.now() - totalStartTime,
            totalCost: cumulativeCost,
            totalTokens: cumulativeTokens,
            agentsUsed: i + 1,
            halted: true,
            haltReason: `Agent ${agentId} HRS: ${hrsResult.hrs}`,
            timestamp: new Date().toISOString(),
          });
          this.isRunning = false;
          return { scenarioId, totalLatency: Date.now() - totalStartTime, totalCost: cumulativeCost, totalTokens: cumulativeTokens, agentsUsed: i + 1, halted: true };
        }
      }

      // Emit handoff to next agent
      if (i < scenario.agentChain.length - 1) {
        const nextAgentId = scenario.agentChain[i + 1];
        this.io.emit('live:agent-handoff', {
          from: agentId,
          to: nextAgentId,
          reason: `Handing off analysis to ${AGENT_DEFINITIONS[nextAgentId].name}`,
          timestamp: new Date().toISOString(),
        });

        this.io.emit('live:activity', {
          id: Date.now() + Math.random(),
          agentId,
          agent: AGENT_DEFINITIONS[agentId],
          message: `📤 Handing off to ${AGENT_DEFINITIONS[nextAgentId].name}`,
          type: 'info',
          timestamp: new Date().toISOString(),
          isLive: true,
        });
      }

      // Handle human approval if needed
      if (result.requiresApproval && agentId === 'finance') {
        const approval = {
          id: `APR-${Date.now().toString().slice(-6)}`,
          type: 'AI-Generated Purchase Order',
          description: `Auto-generated from ${scenario.title}`,
          agent: agentId,
          timestamp: new Date().toISOString(),
          status: 'pending',
          aiGenerated: true,
          response: result.response,
        };
        this.pendingApprovals.push(approval);
        this.io.emit('live:approval-added', approval);
      }

      previousOutput = result.response;
    }

    const totalLatency = Date.now() - totalStartTime;

    // Emit scenario complete
    this.io.emit('live:scenario-complete', {
      scenarioId,
      title: scenario.title,
      totalLatency,
      totalCost: cumulativeCost,
      totalTokens: cumulativeTokens,
      agentsUsed: scenario.agentChain.length,
      timestamp: new Date().toISOString(),
    });

    this.isRunning = false;

    return {
      scenarioId,
      totalLatency,
      totalCost: cumulativeCost,
      totalTokens: cumulativeTokens,
      agentsUsed: scenario.agentChain.length,
    };
  }

  /**
   * Run a custom prompt through the agent chain — the killer feature
   * User types any business scenario and agents collaborate to resolve it
   */
  async runCustomPrompt(userPrompt, apiKey) {
    this.initialize(apiKey);

    this.isRunning = true;
    const totalStartTime = Date.now();
    let cumulativeCost = 0;
    let cumulativeTokens = 0;

    // Smart routing: decide which agents should handle this prompt
    const routingPrompt = `Given this business scenario, decide which agents should handle it in order.
Available agents: inventory, procurement, finance, logistics, pricing.
Respond with ONLY a JSON array of agent IDs in execution order, nothing else.
Example: ["inventory", "pricing", "finance"]

Scenario: "${userPrompt}"`;

    let agentChain;
    try {
      const routingResult = await this.model.generateContent(routingPrompt);
      const routingText = routingResult.response.text().trim();
      // Extract JSON array from the response
      const jsonMatch = routingText.match(/\[.*\]/s);
      agentChain = jsonMatch ? JSON.parse(jsonMatch[0]) : ['inventory', 'pricing', 'finance'];
      // Validate agents
      agentChain = agentChain.filter(id => AGENT_DEFINITIONS[id]);
      if (agentChain.length === 0) agentChain = ['inventory', 'pricing', 'finance'];
    } catch (e) {
      agentChain = ['inventory', 'pricing', 'finance'];
    }

    // Build dynamic steps
    const steps = agentChain.map((agentId, i) => ({
      title: `${AGENT_DEFINITIONS[agentId].name} Analysis`,
      desc: `${AGENT_DEFINITIONS[agentId].name} processes the scenario`,
    }));

    this.io.emit('live:scenario-start', {
      scenarioId: 'custom',
      title: 'Custom Scenario',
      icon: '🧠',
      description: userPrompt.substring(0, 120),
      steps,
      agentChain,
      timestamp: new Date().toISOString(),
      isCustom: true,
    });

    let previousOutput = null;

    for (let i = 0; i < agentChain.length; i++) {
      const agentId = agentChain[i];

      this.io.emit('live:agent-status', { agentId, status: 'processing' });
      this.io.emit('live:activity', {
        id: Date.now() + Math.random(),
        agentId,
        agent: AGENT_DEFINITIONS[agentId],
        message: `🤖 Agent activated for custom scenario. Calling Gemini...`,
        type: 'info',
        timestamp: new Date().toISOString(),
        isLive: true,
      });
      this.io.emit('live:demo-step', { step: i, status: 'active' });

      const prompt = i === 0 ? userPrompt : `Continue processing this scenario. Previous agent output:\n\n${previousOutput}\n\nOriginal request: ${userPrompt}`;
      const result = await this.callAgent(agentId, prompt, i === 0 ? null : previousOutput);

      cumulativeCost += result.costUSD;
      cumulativeTokens += result.tokens.total;

      this.io.emit('live:activity', {
        id: Date.now() + Math.random(),
        agentId,
        agent: AGENT_DEFINITIONS[agentId],
        message: result.response,
        type: result.error ? 'error' : 'success',
        timestamp: result.timestamp,
        isLive: true,
        tokens: result.tokens,
        costUSD: result.costUSD,
        latencyMs: result.latencyMs,
        model: result.model,
      });

      this.io.emit('live:telemetry', {
        agentId,
        tokens: result.tokens,
        costUSD: result.costUSD,
        latencyMs: result.latencyMs,
        cumulativeCost,
        cumulativeTokens,
        model: result.model,
      });

      this.io.emit('live:demo-step', { step: i, status: 'completed', output: result.response });
      this.io.emit('live:agent-status', { agentId, status: 'idle' });

      // ── Run through HallucinationScorer (3-Tier) ──
      if (this.scorer) {
        const hrsResult = this.scorer.score(agentId, result.response, {
          latencyMs: result.latencyMs,
          costUSD: result.costUSD,
          confidence: result.error ? 0.1 : 0.9,
          tokenCount: result.tokens.total,
        });

        this.io.emit('live:activity', {
          id: Date.now() + Math.random(),
          agentId,
          agent: AGENT_DEFINITIONS[agentId],
          message: `🛡️ HRS: ${hrsResult.hrs} (${hrsResult.level}) | Tiers: ${hrsResult.activeTiers.join('+')} | Accuracy: ${hrsResult.accuracy}`,
          type: hrsResult.level === 'critical' ? 'warning' : 'info',
          timestamp: new Date().toISOString(),
          isLive: true,
          hrs: hrsResult,
        });

        if (hrsResult.shouldPause) {
          this.io.emit('alert:hallucination', {
            agentId,
            agentName: AGENT_DEFINITIONS[agentId].name,
            message: `CUSTOM AI: HRS ${hrsResult.hrs} exceeded threshold. Agent chain halted.`,
            confidence: 1 - hrsResult.hrs,
            hrs: hrsResult,
            timestamp: new Date().toISOString(),
          });
          this.io.emit('live:scenario-complete', {
            scenarioId: 'custom',
            title: 'Custom Scenario (HALTED)',
            totalLatency: Date.now() - totalStartTime,
            totalCost: cumulativeCost,
            totalTokens: cumulativeTokens,
            agentsUsed: i + 1,
            halted: true,
            timestamp: new Date().toISOString(),
          });
          this.isRunning = false;
          return { totalLatency: Date.now() - totalStartTime, totalCost: cumulativeCost, totalTokens: cumulativeTokens, halted: true };
        }
      }

      if (i < agentChain.length - 1) {
        const nextAgentId = agentChain[i + 1];
        this.io.emit('live:agent-handoff', {
          from: agentId,
          to: nextAgentId,
          reason: `Handing off to ${AGENT_DEFINITIONS[nextAgentId].name}`,
          timestamp: new Date().toISOString(),
        });
      }

      previousOutput = result.response;
    }

    const totalLatency = Date.now() - totalStartTime;

    this.io.emit('live:scenario-complete', {
      scenarioId: 'custom',
      title: 'Custom Scenario',
      totalLatency,
      totalCost: cumulativeCost,
      totalTokens: cumulativeTokens,
      agentsUsed: agentChain.length,
      timestamp: new Date().toISOString(),
    });

    this.isRunning = false;

    return { totalLatency, totalCost: cumulativeCost, totalTokens: cumulativeTokens };
  }

  getScenarios() {
    return SCENARIO_CONFIGS;
  }
}

module.exports = AIAgentOrchestrator;
