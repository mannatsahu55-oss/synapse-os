import { GoogleGenerativeAI } from "@google/generative-ai";

const MODELS_TO_TRY = [
  "gemini-1.5-flash",
  "gemini-2.0-flash",
  "gemini-1.5-pro",
];

const NEURAL_CORE_SYSTEM_PROMPT = `You are the Neural Core AI — the primary intelligence and workflow architect of Synapse OS (an enterprise observability, monitoring, and orchestration platform for autonomous AI agent swarms).

Your capabilities:
1. Conversation & Guidance: Answer user questions, discuss agent architectures, explain swarm topology, hallucination detection, telemetry, and system governance.
2. Workflow & Automation Architecture: When the user asks to build, create, or generate a workflow/pipeline/automation:
   - Explain the workflow logic and the nodes involved.
   - Provide a valid n8n-compatible workflow JSON enclosed in a \`\`\`json ... \`\`\` code block containing "nodes" and "connections".
   - Standard node types include: 'n8n-nodes-base.webhook', 'n8n-nodes-base.httpRequest', 'n8n-nodes-base.set', 'n8n-nodes-base.code', 'n8n-nodes-base.slack', 'n8n-nodes-base.emailSend'.
   - Position nodes cleanly with [X, Y] coordinates spaced ~200px apart horizontally.
   - Instruct the user that they can copy the JSON block and press Ctrl+V in the Orchestration Editor canvas to import it.
3. Code & Technical Assistance: Provide clear, modular scripts (JavaScript, Python, SQL) and technical troubleshooting when requested.

Tone and style:
- Direct, intelligent, and articulate.
- Use clean Markdown with headers, bold text, bullet points, and code blocks.`;

/**
 * Generate an AI response from Gemini with multi-model fallback and chat history.
 */
export async function generateAiResponse(prompt, apiKey, conversationHistory = []) {
  if (!apiKey || !apiKey.trim()) {
    throw new Error("Gemini API Key is missing. Please configure it in Settings.");
  }

  const cleanKey = apiKey.trim();
  const genAI = new GoogleGenerativeAI(cleanKey);

  // Sanitize conversation history for Gemini chat format
  const sanitizedHistory = [];
  if (Array.isArray(conversationHistory)) {
    for (const msg of conversationHistory.slice(-10)) {
      if (!msg || !msg.content || msg.content.includes("Generating workflow configuration...")) continue;
      const role = msg.role === 'assistant' ? 'model' : 'user';
      if (sanitizedHistory.length > 0 && sanitizedHistory[sanitizedHistory.length - 1].role === role) {
        sanitizedHistory[sanitizedHistory.length - 1].parts[0].text += `\n${msg.content}`;
      } else {
        sanitizedHistory.push({
          role,
          parts: [{ text: String(msg.content) }]
        });
      }
    }
  }

  while (sanitizedHistory.length > 0 && sanitizedHistory[0].role !== 'user') {
    sanitizedHistory.shift();
  }

  let lastError = null;

  for (const modelName of MODELS_TO_TRY) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: NEURAL_CORE_SYSTEM_PROMPT,
      });

      if (sanitizedHistory.length > 0) {
        try {
          const chat = model.startChat({ history: sanitizedHistory });
          const result = await chat.sendMessage(prompt);
          const response = await result.response;
          const text = response.text();
          if (text) return text;
        } catch (chatErr) {
          console.warn(`[Gemini] Chat mode failed for ${modelName}, falling back to direct generate:`, chatErr.message);
        }
      }

      // Direct generateContent fallback
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      if (text) return text;
    } catch (err) {
      console.warn(`[Gemini] Attempt with model '${modelName}' failed:`, err.message);
      lastError = err;
    }
  }

  const cleanError = formatGeminiErrorMessage(lastError);
  const errorObj = new Error(cleanError);
  errorObj.isFormatted = true;
  throw errorObj;
}

/**
 * Format Gemini error messages into clear, actionable instructions
 */
export function formatGeminiErrorMessage(err) {
  const msg = err?.message || String(err);
  if (
    msg.includes('404') || 
    msg.includes('not found') || 
    msg.includes('API_KEY_SERVICE_BLOCKED') || 
    msg.includes('UNAUTHENTICATED') || 
    msg.includes('ACCESS_TOKEN_TYPE_UNSUPPORTED')
  ) {
    return `### ⚠️ Google Cloud: API_KEY_SERVICE_BLOCKED (404/401)\n\nGoogle rejected this API key because the **Generative Language API** is blocked or restricted on Google Cloud for this key.\n\n**Root Cause:**\n- In Google Cloud Console, the key has **API restrictions** that don't include \`generativelanguage.googleapis.com\`, OR\n- The key was created in GCP without enabling the **Generative Language API** for your project.\n\n**How to Fix:**\n1. **Recommended (Fastest):** Go to **[Google AI Studio (aistudio.google.com/app/apikey)](https://aistudio.google.com/app/apikey)**, create a free API key (which has Gemini enabled by default), and paste it into **Settings**.\n2. **Google Cloud Console:** Navigate to [Credentials](https://console.cloud.google.com/apis/credentials), edit your key, and enable **Generative Language API** under API restrictions.\n\n💡 *Tip: You can also use **Neural Core Simulator Mode** below to interact and generate workflows instantly without an external API key!*`;
  }
  if (msg.includes('429') || msg.includes('quota') || msg.includes('RESOURCE_EXHAUSTED')) {
    return `### ⚠️ Gemini API Quota Exceeded (429)\n\nYour Gemini API key has temporarily exceeded its rate limit. Please wait a minute or check your quota on [Google AI Studio](https://aistudio.google.com).`;
  }
  return `### ⚠️ Gemini API Request Failed\n\n**Details:** ${msg}\n\nPlease verify that your Gemini API key in Settings is valid and has access to Gemini 1.5/2.0 models.`;
}

/**
 * Generate intelligent simulated responses with valid n8n workflows
 */
export function generateSimulatedResponse(prompt) {
  const p = prompt.toLowerCase();

  if (p.includes('workflow') || p.includes('dag') || p.includes('pipeline') || p.includes('automate') || p.includes('n8n') || p.includes('order') || p.includes('invoice') || p.includes('ocr')) {
    const isOcr = p.includes('invoice') || p.includes('ocr');
    const isOrder = p.includes('whatsapp') || p.includes('order');

    const workflowTitle = isOcr ? "Invoice OCR Autonomous Processing" : isOrder ? "WhatsApp Order Ingestion & Routing" : "Enterprise Agent Orchestration";
    
    return `### ⚡ Neural Core — ${workflowTitle}\n\nI have designed an autonomous execution pipeline for: **"${prompt}"**.\n\n**Pipeline Architecture:**\n1. **Webhook Ingestion**: Captures incoming payloads and HTTP events in real-time.\n2. **Neural Schema Sanitizer**: Parses, validates, and normalizes unstructured fields.\n3. **Agent Orchestrator**: Evaluates inventory thresholds, pricing models, and dispatch logic.\n4. **Downstream Dispatcher**: Sends notifications via Slack and triggers payment/fulfillment.\n\n\`\`\`json\n{\n  "nodes": [\n    {\n      "id": "1",\n      "name": "Webhook Ingest",\n      "type": "n8n-nodes-base.webhook",\n      "typeVersion": 1,\n      "position": [100, 300],\n      "parameters": {\n        "path": "synapse-ingest",\n        "httpMethod": "POST"\n      }\n    },\n    {\n      "id": "2",\n      "name": "Data Sanitizer",\n      "type": "n8n-nodes-base.code",\n      "typeVersion": 1,\n      "position": [360, 300],\n      "parameters": {\n        "language": "javascript",\n        "jsCode": "// Sanitize and validate payload\\nreturn items.map(i => ({ ...i, validated_at: new Date().toISOString() }));"\n      }\n    },\n    {\n      "id": "3",\n      "name": "Swarm Orchestrator",\n      "type": "n8n-nodes-base.httpRequest",\n      "typeVersion": 1,\n      "position": [620, 220],\n      "parameters": {\n        "url": "http://localhost:4000/api/ai/scenario",\n        "method": "POST"\n      }\n    },\n    {\n      "id": "4",\n      "name": "Notification Dispatch",\n      "type": "n8n-nodes-base.slack",\n      "typeVersion": 1,\n      "position": [880, 300],\n      "parameters": {\n        "channel": "#synapse-observatory",\n        "text": "Automated pipeline step executed successfully."\n      }\n    }\n  ],\n  "connections": {\n    "Webhook Ingest": {\n      "main": [[{ "node": "Data Sanitizer", "type": "main", "index": 0 }]]\n    },\n    "Data Sanitizer": {\n      "main": [[{ "node": "Swarm Orchestrator", "type": "main", "index": 0 }]]\n    },\n    "Swarm Orchestrator": {\n      "main": [[{ "node": "Notification Dispatch", "type": "main", "index": 0 }]]\n    }\n  }\n}\n\`\`\`\n\n**To import into Orchestration Editor:**\n1. Click **Copy** above to copy the JSON.\n2. Navigate to the **Orchestration Editor**.\n3. Click anywhere on the canvas and press \`Ctrl+V\` to paste and import!`;
  }

  if (p.includes('synapse') || p.includes('what is') || p.includes('observatory') || p.includes('agent') || p.includes('swarm')) {
    return `### 🧠 Synapse Observatory — Autonomous Agent Command Center\n\n**Synapse Observatory** is an enterprise observability, debugging, and governance platform for multi-agent systems.\n\n**Core Capabilities:**\n- **Real-Time Swarm Topology**: Interactive canvas visualizing active agents, communication hops, and task delegations.\n- **3-Tier Hallucination Scoring**:\n  - *Tier 1*: Mathematical baseline anomaly detection (entropy & drift tracking).\n  - *Tier 2*: Behavioral contracts and boundary enforcement.\n  - *Tier 3*: Sandboxed verifier assertions.\n- **Human-in-the-Loop Governance**: Halts rogue execution and requires administrative approval for high-risk actions.\n- **Execution Timeline**: Step-by-step breakdown of how multi-agent crises are autonomously resolved.\n\n*Feel free to ask me to generate a workflow, draft agent policies, or inspect system telemetry.*`;
  }

  return `### 🧠 Neural Core Intelligence\n\nI have processed your command: **"${prompt}"**.\n\nI am the intelligent workflow architect of Synapse OS. Here is what I can do for you:\n- **Build Workflow Automations**: Ask me to generate an n8n pipeline (e.g., *"Create an invoice OCR workflow"* or *"Build a webhook notification pipeline"*).\n- **Swarm Governance**: Ask me how to configure contracts, hallucination rules, or monitor agent handoffs.\n- **System Automation**: Inquire about scripts, API routes, or database configurations.\n\n*How can I assist your workflow next?*`;
}

/**
 * Backwards compatibility helper for existing callers.
 */
export async function generateWorkflow(prompt, apiKey) {
  const responseText = await generateAiResponse(prompt, apiKey);
  const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[1]);
    } catch {
      // ignore
    }
  }
  return {
    nodes: [
      { id: "1", name: "Webhook", type: "n8n-nodes-base.webhook", typeVersion: 1, position: [100, 300], parameters: {} },
      { id: "2", name: "AI Agent", type: "n8n-nodes-base.code", typeVersion: 1, position: [350, 300], parameters: {} }
    ],
    connections: {
      "Webhook": { main: [[{ node: "AI Agent", type: "main", index: 0 }]] }
    }
  };
}
