# SYNAPSE-AI Project Architecture and File Structure

This document details the file structure and functionality of the **SYNAPSE-AI** project. It is written to be easily parseable by an AI agent, providing a comprehensive map of the codebase, key technologies, and the responsibilities of each file.

## 🏗 High-Level Architecture

**SYNAPSE-AI** (also known as Synapse OS) is a dual-stack web application designed for AI-driven workflow orchestration, AI model inference, and multimodal inbox management.
It consists of two main parts:
1. **Frontend (React + Vite + Tailwind CSS)**: Handles the UI, state management (Firebase Auth & Supabase data), and a React Flow-based visual workflow editor. It features deep custom UI elements.
2. **Backend (Python + FastAPI)**: An execution engine that receives DAG (Directed Acyclic Graph) payloads from the frontend's visual editor, processes nodes via topological sorting, and dispatches them to different executors (e.g., LLMs, email clients, python scripts).
3. **Embedded n8n**: The project uses the `n8n` automation tool under the hood, dynamically modifying its UI assets to match the Synapse branding for iframe embedding.

---

## 📂 Root Directory

```text
.
├── package.json             # NPM dependencies (React, Vite, Supabase, Firebase, Tailwind, framer-motion, etc.)
├── package-lock.json        # NPM lockfile
├── vite.config.js           # Vite configuration for the frontend React build
├── tailwind.config.js       # Tailwind CSS configuration and theme settings
├── postcss.config.js        # PostCSS configuration for Tailwind
├── .env                     # Environment variables (Firebase API keys, etc.)
├── index.html               # The root HTML file where the React app mounts
├── README.md                # Project README file
├── vercel.json              # Configuration file for Vercel deployment
├── patch-n8n.cjs            # Script that patches n8n UI assets (HTML/JS) to rebrand it as Synapse OS
├── check_headers.cjs        # Script checking for specific security headers in n8n/vite
├── update_patch.cjs         # Script handling automated updates to the n8n patches
└── dom_dumper.py            # Python script to dump/analyze the DOM locally for scraping or debugging
```

---

## 🎨 Frontend Structure (`/src`)

The `/src` folder holds the React frontend application.

```text
/src
├── main.jsx                 # Entry point of the React application
├── App.jsx                  # Main routing component using `react-router-dom`
├── App.css                  # Global styles specific to the App component
├── index.css                # Global CSS containing Tailwind directives and custom CSS variables
│
├── assets/                  # Static assets like images and SVGs
│   ├── hero.png
│   ├── logo.png
│   ├── react.svg
│   ├── synapse-logo.png
│   └── vite.svg
│
├── components/              # Reusable React UI components
│   ├── ActivityFeed/        # Component for showing activity logs/feeds in the UI
│   ├── Layout/              # Main application shell / sidebars / headers
│   ├── Modal/               # Reusable modal dialogs
│   ├── Toast/               # Custom notification/toast system
│   └── chat/                # AI Chat interface and visualization components
│       ├── command-dock.tsx       # Bottom dock for executing commands
│       ├── conversation-stream.tsx # Chat timeline
│       ├── latent-sidebar.tsx     # Context panel for the chat
│       ├── neural-core.tsx        # Central interface for the AI builder
│       ├── neural-monitor.tsx     # Animated AI state visualization
│       ├── sentient-sphere.tsx    # 3D interactive AI sphere component (uses Three.js/Fiber)
│       └── stream-message.tsx     # Individual chat message components
│
├── context/                 # React Context API providers for global state
│   ├── AuthContext.jsx      # Manages Firebase Authentication state and login/logout methods
│   └── SynapseContext.jsx   # Core application state. Fetches from Supabase (leases, products) and handles local simulator engine fallbacks.
│
├── engine/                  # Frontend simulators / core logic
│   └── AgentSimulator.js    # A client-side mock/simulator engine for demonstrating agent behavior when the Python backend isn't used
│
├── lib/                     # Utilities and service wrappers
│   ├── database.sql         # SQL schema definitions for Supabase tables (e.g., leases, products)
│   ├── firebase.js          # Firebase initialization and auth configuration
│   ├── gemini.js            # Wrapper for interacting with Google's Gemini API directly from the client
│   ├── supabase.js          # Supabase client initialization (hardcoded demo keys)
│   └── utils.js             # General helper functions (e.g., `clsx` and `tailwind-merge` combiners)
│
└── views/                   # Full-page components routed via react-router
    ├── LandingPage.jsx      # Public marketing / landing page
    ├── LoginPage.jsx        # User login page
    ├── RegisterPage.jsx     # User registration page
    ├── CommandCenter.jsx    # Main dashboard showing system stats and agent statuses
    ├── MultiModalInbox.jsx  # Inbox combining different notification types
    ├── NeuralCorePage.jsx   # Dedicated page for the AI Builder (wrapping chat components)
    ├── OrchestrationEditor.jsx # The main visual DAG editor using `xyflow/react` for creating workflows
    ├── SettingsPage.jsx     # User settings and API Key configurations
    │
    └── inbox/               # Sub-pages for the MultiModalInbox routing
        ├── FinancePage.jsx
        ├── MyStorePage.jsx
        ├── ReferralsPage.jsx
        ├── ReportPage.jsx
        ├── SellerToolsPage.jsx
        └── SupportPage.jsx
```

---

## ⚙️ Backend Structure (`/synapse-backend`)

The `/synapse-backend` folder holds the Python execution engine that processes workflows generated by the frontend editor.

```text
/synapse-backend
├── engine.py                # Main FastAPI application
├── requirements.txt         # Python dependencies (fastapi, uvicorn, pydantic, google-generativeai, openai, anthropic)
└── __pycache__/             # Compiled python bytecode
```

### 🧠 `engine.py` Functionality

The `engine.py` file contains the core backend logic:

1. **API Endpoints**:
   - `POST /api/execute-workflow`: Receives a JSON payload of `nodes` and `edges` (from React Flow).
   - `GET /api/n8n/stats`: Reads directly from the local `n8n` SQLite database to get workflow statistics.
   - `POST /api/save-keys` & `GET /api/get-keys`: Manages LLM API keys securely.

2. **DAG Processing (`topological_sort`)**:
   - Implements Kahn's algorithm to resolve dependencies and determine the exact execution order of the graph nodes. Detects cyclic dependencies.

3. **Node Executors**:
   - `execute_ingestion`: Reads raw data/telemetry context.
   - `execute_extraction`: Parses text to extract variables (Key/Value pairs).
   - `execute_ai_inference`: Integrates with LLMs (`Gemini`, `OpenAI`, `Anthropic`, `Ollama`). Dynamically connects using provided API keys and returns generated insights based on context.
   - `execute_action`: Executes side effects, such as sending emails via SMTP.
   - `execute_python_script`: Executes arbitrary Python code securely within a `subprocess`, passing state via environment variables.

---

## 🔗 Key Integrations

- **Firebase**: Handles user authentication (Login/Signup). Expected to read environment variables `VITE_FIREBASE_*`.
- **Supabase**: Primary database storage for entities like `leases` and `products`.
- **n8n**: Workflow automation tool. `patch-n8n.cjs` aggressively patches n8n's compiled JS and HTML to replace its logo with the Synapse logo, hide certain UI components, and bypass iframe security restrictions (`contentSecurityPolicy: false`) so it can be seamlessly embedded inside the Synapse UI.
- **LLMs (Gemini, OpenAI, Anthropic, Ollama)**: The Python backend has native adapters to communicate with these providers for inference nodes inside the workflow editor.
