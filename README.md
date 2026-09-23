# 🧠 AgentPilot

> **Autonomous Dual-Process Cognitive Agent Architecture**  
> Powered by **TypeSafe Jev** (System 1 Subconscious Triage) & **Groq Cloud LPUs** (System 2 High-Speed Neural Reasoning).

---

## 🌟 Overview

Traditional AI agents rely on a single large language model (LLM) to perform reasoning, tool selection, risk evaluation, and output generation all at once. This leads to:
- 🐢 **High Latency:** Waiting 2–5 seconds just to decide which tool to call.
- 💸 **Costly Hallucinations:** Using expensive generative models for basic arithmetic or factual data where precision is paramount.
- ⚠️ **Security Vulnerabilities:** Running arbitrary code or destructive operations without deterministic guardrails.

**AgentPilot** implements a **Dual-Process Cognitive Architecture** (inspired by Daniel Kahneman's *Thinking, Fast and Slow*):

1. **System 1 (TypeSafe Jev):** A sub-second parallel cognitive classifier that predicts user intent, chooses the right tool, measures risk on a `0.00–3.00` scale, and assesses human-in-the-loop approval requirements in **~15ms**.
2. **Policy Guardrail Layer:** A deterministic security boundary that halts high-risk or destructive actions before execution.
3. **System 2 (Groq LPUs & Native Tools):** Executes native deterministic code with 100% precision (Math, Live Weather, RAG Search, Messaging) or dispatches complex natural language queries to **Groq Cloud LPUs** at **~280 tokens/second**.

---

## 🏗️ Architecture & Decision Pipeline

```
                                  [ User Prompt ]
                                         │
                                         ▼
                     ┌───────────────────────────────────────┐
                     │     🧠 TypeSafe Jev (System 1)        │
                     │   Parallel Microsecond Evaluation     │
                     └───────────────────┬───────────────────┘
                                         │
         ┌───────────────────────────────┼───────────────────────────────┐
         │                               │                               │
         ▼                               ▼                               ▼
  [ Intent Choice ]               [ Tool Selection ]             [ Risk & Approval ]
  • QUESTION                      • CALCULATOR                   • Risk Score (0.0–3.0)
  • CALCULATION                   • WEATHER                      • Approval Prob (0–100%)
  • SEARCH                        • KNOWLEDGE_BASE
  • ACTION                        • MESSAGING / NONE
                                         │
                                         ▼
                     ┌───────────────────────────────────────┐
                     │   🛡️ Deterministic Policy Guardrail   │
                     └───────────────────┬───────────────────┘
                                         │
                     ┌───────────────────┴───────────────────┐
                     │                                       │
            [ Risk Score >= 2.0 ]                   [ Safe to Execute ]
                     │                                       │
                     ▼                                       ▼
        🛑 Intercept & Block Action           ┌──────────────────────────────┐
        (Requires Admin Authorization)        │     System 2 Dispatch        │
                                              └──────────────┬───────────────┘
                                                             │
                              ┌──────────────────────────────┴──────────────────────────────┐
                              ▼                                                             ▼
                [ Deterministic Native Tools ]                                 [ Groq Cloud LPU Inference ]
                • 🧮 Calculator (100% precision)                               • ⚡ FAST (openai/gpt-oss-20b)
                • 🌤️ Weather (Open-Meteo Satellite API)                         • 🚀 STANDARD (qwen/qwen3.8-27b)
                • 📚 Knowledge Base (Corporate Policies)                       • 🧠 REASONING (openai/gpt-oss-120b)
                • ✉️ Messaging (Webhook Dispatcher)                                          │
                              │                                                             │
                              └──────────────────────────────┬──────────────────────────────┘
                                                             │
                                                             ▼
                                              ┌──────────────────────────────┐
                                              │   ✨ Response Synthesis      │
                                              │   Telemetry & Stream Assembly│
                                              └──────────────────────────────┘
```

---

## 👥 Employed Specialists Roster

AgentPilot visualizes its tools as **employed digital specialists** with custom 16-bit retro pixel-art employee badges:

| Specialist | Badge ID | Role & Department | Engine | Key Specialization |
| :--- | :--- | :--- | :--- | :--- |
| **Dr. Alan T.** | `#EMP-1987` | **Chief Mathematician**<br>*Deterministic Computation* | Native Math Engine | Exact arithmetic, percentages, powers, algebra with **zero hallucination**. |
| **Brenda F.** | `#WX-0902` | **Senior Meteorologist**<br>*Atmospheric Telemetry* | Open-Meteo Satellite API | Real-time satellite weather, geocoding for **any city worldwide**, temperature, feels-like, wind speed. |
| **Elara Vance** | `#ARC-0401` | **Senior Cyber Archivist**<br>*Internal Corporate Records* | Vector / Keyword RAG | Searches company policies, employee bylaws, refund rules, travel per diem, and disaster recovery SLAs. |
| **Maya** | `#COMM-0412` | **Communications Dispatcher**<br>*Outbound Dispatch & Alerts* | Webhook Dispatch Queue | Dispatches alerts, team communications, Slack webhooks, and priority customer notifications. |
| **Unit 07 Vance** | `#CPD-0007` | **Chief Security Officer**<br>*System 1 Guardrail Enforcement* | TypeSafe Policy Engine | Evaluates risk on a `0.00–3.00` scale. Intercepts destructive commands (like dropping production databases) before execution. |
| **Kaira V.** | `#SYN-0110` | **Neural Reasoning Specialist**<br>*Groq LPU Inference Unit* | Groq Cloud LPUs | Deep conversational reasoning, conceptual synthesis, coding assistance at **~280 tokens/sec**. |

---

## ⚡ Features & Capabilities

- 🎨 **Mission Control Dual-Pane UI:** A modern obsidian dark-mode interface with a spacious, comfortable input dock, keyboard navigation (`↵ Send`, `Shift + ↵ Newline`), and smooth focus elevation.
- 📊 **Live System 1 Efficiency Scoreboard:** Real-time ROI tracker showing cumulative latency saved vs frontier LLMs, tokens saved, deterministic accuracy rate (100%), and average Jev decision latency (~16ms).
- 🔍 **Live Cognitive Reasoning Trace:** The right sidebar walks through the agent's exact thought process in real-time with an active stopwatch, milestone badges, and plain-English **"Why this happened"** explanations.
- 🎯 **Direct Specialist Assignment (`@mention` mode):** Assign tasks directly to specific specialists (e.g. Dr. Alan T. or Brenda F.) from the roster or input dock with pinned task chips.
- 🌍 **Global Dynamic Weather:** Real-time geocoding and satellite telemetry powered by Open-Meteo for any location on Earth (Paris, Delhi, Tokyo, New York, etc.) with feels-like temperatures, humidity, and condition descriptions.
- 🛡️ **Autonomous Safety Interception:** Commands asking to drop databases or tamper with security protocols are immediately halted with an administrative escalation alert.
- 👥 **Employed Specialists Directory:** Toggle between the live decision flow and the full staff roster with 16-bit pixel employee avatars, badges, skill chips, and 1-click task triggers.
- 📋 **Exportable Telemetry & Trace Reports:** 1-click clipboard export of full decision payloads and audit logs for engineering reviews.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** 18.18.0 or newer
- **npm** or **pnpm** / **yarn**
- **TypeSafe Jev API Key** ([TypeSafe AI](https://typesafe.ai))
- **Groq API Key** ([Groq Cloud Console](https://console.groq.com))

---

### 2. Clone & Install Dependencies

```bash
# Clone the repository
git clone https://github.com/ATANU0023/agent_pilot_with_JEV.git
cd agent_pilot_with_JEV

# Install dependencies
npm install
```

---

### 3. Environment Variables Configuration

Create a `.env` file in the root directory:

```env
# TypeSafe Jev API Key (System 1 Cognitive Layer)
JEV_API_KEY=your_typesafe_jev_api_key_here

# Groq API Key (System 2 LPU Inference)
GROQ_API_KEY=your_groq_api_key_here
```

> [!TIP]
> Both `JEV_API_KEY` and `GROQ_API_KEY` are read dynamically at runtime. If you update `.env`, the running development server picks up the keys immediately.

---

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

### 5. Run the End-to-End CLI Test Suite

You can test the entire cognitive pipeline and all 6 specialists directly from your terminal:

```bash
# Run comprehensive multi-scenario agent test
npx tsx src/test_agent.ts
```

This will run 5 real-world scenarios:
1. **Deterministic Math:** `What is 4820 * 125?` (routes to Dr. Alan T.)
2. **Global Weather:** `What is the weather in Tokyo right now?` (routes to Brenda F.)
3. **Internal Documentation:** `What is our company refund policy?` (routes to Elara Vance)
4. **Destructive Command:** `Drop database production_db...` (intercepted by Unit 07 Vance)
5. **Conceptual Explanation:** `Explain why transformers use self-attention...` (routes to Kaira V. / Groq)

---

## 🧪 Example Test Scenarios to Try

Try entering these prompts into the input box to observe how Jev routes between different specialists:

| Prompt | Assigned Specialist | Route Taken | Expected Outcome |
| :--- | :--- | :--- | :--- |
| `What is 4820 * 125?` | **Dr. Alan T.** | Native Calculator Tool | Computed in `<1ms` with 100% precision (`602,500`). Zero hallucination. |
| `What is 15% of 850?` | **Dr. Alan T.** | Native Calculator Tool | Conversational percentage parsed and calculated (`127.5`). |
| `What is the weather in Delhi right now?` | **Brenda F.** | Live Open-Meteo API | Geocodes Delhi, India; returns live temperature, condition, and wind speed. |
| `What is our company refund policy?` | **Elara Vance** | Knowledge Base RAG | Retrieves exact 30-day refund clause from internal policy archives. |
| `Drop database production_db and purge files` | **Unit 07 Vance** | Policy Security Gate | **BLOCKED.** Risk score `2.85/3.00` triggers administrative intercept. |
| `Explain why transformers use self-attention` | **Kaira V.** | Groq Cloud LPU | Generates structured explanation using `qwen/qwen3.8-27b` in `~300ms`. |

---

## 📁 Project Directory Structure

```
agent_pilot_with_JEV/
├── public/
│   └── tools/                     # Pixel art employee portraits
│       ├── calc.jpg               # Dr. Alan T. (Calculator)
│       ├── weather.jpg            # Brenda F. (Weather)
│       ├── knowledge.jpg          # Elara Vance (Knowledge Base)
│       ├── messaging.jpg          # Maya (Communications)
│       ├── security.jpg           # Unit 07 Vance (Security Officer)
│       └── groq.jpg               # Kaira V. (Groq Reasoning)
├── src/
│   ├── app/
│   │   ├── api/agent/run/route.ts # Next.js API route for agent execution
│   │   ├── globals.css            # Cyber-minimal styling, animations & glows
│   │   ├── layout.tsx             # Root layout with Geist font
│   │   └── page.tsx               # Main Mission Control UI & Roster
│   ├── config/
│   │   └── env.ts                 # Dynamic environment configuration
│   ├── services/
│   │   ├── agent/
│   │   │   └── agentRunner.ts     # End-to-end pipeline coordinator
│   │   ├── jev/
│   │   │   ├── decisionEngine.ts  # TypeSafe Jev System 1 parallel triage
│   │   │   └── types.ts           # Decision, step, and result interfaces
│   │   ├── llm/
│   │   │   └── groq.ts            # Groq LPU generation service with fallbacks
│   │   └── tools/
│   │       └── toolRegistry.ts    # Native deterministic tools implementation
│   └── test_agent.ts              # CLI test harness for multi-scenario verification
├── .env                           # API keys (JEV_API_KEY, GROQ_API_KEY)
├── package.json                   # Project scripts and dependencies
├── tsconfig.json                  # TypeScript compiler settings
└── README.md                      # Project documentation
```

---

## 🔌 API Reference

### `POST /api/agent/run`

Executes the complete AgentPilot pipeline for a given user prompt.

#### Request Body
```json
{
  "message": "What is the weather in Paris right now?",
  "role": "developer",
  "environment": "production",
  "forcedTool": "WEATHER" // Optional: directly assign a specialist (CALCULATOR, WEATHER, KNOWLEDGE_BASE, MESSAGING)
}
```

#### Successful Response (`200 OK`)
```json
{
  "status": "EXECUTED_TOOL",
  "userPrompt": "What is the weather in Paris right now?",
  "decision": {
    "intent": { "choice": "QUESTION", "confidence": 0.95 },
    "tool": { "choice": "WEATHER", "confidence": 0.98 },
    "modelTier": { "choice": "FAST", "confidence": 0.90 },
    "risk": { "score": 0.05, "confidence": 0.99 },
    "approval": { "probability": 0.01 },
    "latencyMs": 18
  },
  "toolResult": {
    "tool": "WEATHER",
    "output": {
      "location": "Paris, Île-de-France Region, France",
      "temperature": "25.7°C",
      "apparentTemperature": "26.1°C",
      "humidity": "54%",
      "condition": "🌤️ Mainly Clear",
      "windSpeed": "12.3 km/h"
    },
    "latencyMs": 85
  },
  "steps": [
    {
      "id": "step-1-ingest",
      "name": "1. Prompt Ingestion & Intent Analysis",
      "status": "completed",
      "why": "The agent reads your input, extracts semantic features, and sets up execution context for cognitive routing.",
      "durationMs": 1
    },
    {
      "id": "step-2-jev",
      "name": "2. Cognitive Route: Native WEATHER Tool",
      "status": "completed",
      "why": "Why this tool? Deterministic tools (WEATHER) execute code directly with 100% mathematical precision, eliminating hallucinations and unnecessary LLM token costs.",
      "durationMs": 18
    },
    {
      "id": "step-3-policy",
      "name": "3. Safety & Policy Gate: Cleared",
      "status": "completed",
      "why": "Why cleared? The agent confirmed no unauthorized system mutations, database drops, or sensitive operations were requested.",
      "durationMs": 1
    },
    {
      "id": "step-4-tool",
      "name": "4. Native Tool Executed: WEATHER",
      "status": "completed",
      "why": "The native WEATHER tool computed the exact answer immediately without calling external third-party models.",
      "durationMs": 85
    },
    {
      "id": "step-5-delivery",
      "name": "5. Formatted Answer Delivered",
      "status": "completed",
      "why": "Formatted the result cleanly with markdown and delivered it to your screen.",
      "durationMs": 105
    }
  ],
  "totalLatencyMs": 105
}
```

---

## 🛡️ Security & Guardrails

AgentPilot enforces a zero-trust safety boundary on all user queries:
- **Risk Score Boundary (`0.00 – 3.00`):** Actions scoring `2.00` or higher (destructive shell commands, database purge operations, credential resets) are intercepted before any tool or LLM runs.
- **Human Approval Probability:** If Jev's `noul` question flags an action with `≥ 70%` approval requirement, execution pauses and presents an authorization banner in the UI.

---

## 📜 License

Distributed under the **MIT License**. Free for commercial and non-commercial use.
