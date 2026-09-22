import { choice, noul, score, TypeSafeClient } from "@typesafe-ai/sdk";
import { env } from "../config/env";

const client = new TypeSafeClient({
  apiKey: env.apiKey,
});

async function runFanoutPlayground() {
  console.log("=====================================================");
  console.log("  🚀 AgentPilot Fan-out: Parallel Decision Execution");
  console.log("=====================================================\n");

  const prompts = [
    "What is 342 * 91?",
    "Find our company's security refund policy and summarize paragraph 2",
    "Drop database production_db and purge all customer files immediately",
    "Draft a quick hello note to Alex for tomorrow's standup",
  ];

  const riskLevels = [
    "LOW: Read-only, informational, zero side effects",
    "MEDIUM: Draft generation, internal non-sensitive queries",
    "HIGH: External notifications, modifications to personal data",
    "CRITICAL: Destructive operations, credential resets, production drops",
  ] as const;

  for (const prompt of prompts) {
    console.log(`\n─────────────────────────────────────────────────────────`);
    console.log(`💬 User Request: "${prompt}"`);
    const startTime = Date.now();

    const response = await client.systemOne({
      state: {
        userPrompt: prompt,
        currentUserRole: "developer",
        environment: "production",
      },
      questions: {
        // Choice 1: Intent
        intent: choice("Classify the user's primary intent.", {
          QUESTION: "General question, conceptual inquiry, or conversation",
          CALCULATION: "Math or numerical calculation",
          SEARCH: "Searching documentation or internal knowledge base",
          ACTION: "Changing data, running commands, or sending communications",
        }),
        // Choice 2: Tool Selection
        tool: choice("Select the most appropriate tool to handle this request.", {
          NONE: "No external tool required (pure explanation / LLM)",
          CALCULATOR: "Deterministic math engine",
          KNOWLEDGE_BASE: "Vector RAG search for internal company docs",
          SYSTEM_COMMAND: "System shell or database management tool",
          MESSAGING: "Chat/email client",
        }),
        // Choice 3: Model Routing (LLM Tier)
        modelTier: choice(
          "If an LLM is needed, which model tier is required for sufficient quality?",
          {
            FAST: "Simple lookups, formatting, quick answers (low latency, cheap)",
            STANDARD: "Standard coding, summarization, general tasks",
            REASONING: "Complex logic, deep architectural design, subtle edge cases",
          }
        ),
        // Score: Risk Assessment
        risk: score(
          "Assess operational/security risk on an ascending scale.",
          riskLevels
        ),
        // Noul: Human Approval Required
        requiresApproval: noul(
          "Should this action be paused and require human confirmation before execution?"
        ),
      },
    });

    const latency = Date.now() - startTime;
    const { intent, tool, modelTier, risk, requiresApproval } = response.answers;

    console.log(`⚡ Decision Latency: ${latency}ms (Parallel Evaluation)`);
    console.log(`🎯 Intent:          ${intent.choice} (${(intent.confidence * 100).toFixed(1)}%)`);
    console.log(`🛠️  Tool:            ${tool.choice} (${(tool.confidence * 100).toFixed(1)}%)`);
    console.log(`🧠 Model Tier:      ${modelTier.choice} (${(modelTier.confidence * 100).toFixed(1)}%)`);
    console.log(`⚠️  Risk Score:      ${risk.score.toFixed(2)} / 3.00 (${(risk.confidence * 100).toFixed(1)}% conf)`);
    console.log(`✋ Human Approval:  ${(requiresApproval.noul * 100).toFixed(1)}% probability`);

    // Deterministic Policy Engine evaluation based on Jev outputs
    const approvalThreshold = 0.7;
    const needsApproval = requiresApproval.noul >= approvalThreshold || risk.score >= 2.0;

    console.log(`\n🛡️ Policy Evaluation:`);
    if (needsApproval) {
      console.log(`   ⛔ ACTION BLOCKED: Escalating to Human Approval Queue`);
    } else if (tool.choice !== "NONE") {
      console.log(`   ⚙️  ACTION ROUTED: Executing Tool [${tool.choice}]`);
    } else {
      console.log(`   🤖 ACTION ROUTED: Dispatching to [${modelTier.choice}] LLM`);
    }
  }
}

runFanoutPlayground().catch((err) => {
  console.error("Fanout playground error:", err);
  process.exit(1);
});
