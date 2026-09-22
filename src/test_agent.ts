import { agentRunner } from "./services/agent/agentRunner";
import { env } from "./config/env";

async function runEndToEndTests() {
  console.log("===============================================================");
  console.log("  🚀 AgentPilot: Jev Decision Engine + Groq Generation Pipeline");
  console.log("===============================================================\n");

  if (!env.groqApiKey) {
    console.warn(
      "⚠️  NOTE: GROQ_API_KEY is not yet in .env! Tools and Risk Policy will execute, while Groq generation will prompt for the key.\n"
    );
  }

  const testScenarios = [
    {
      label: "Deterministic Math (Calculator Tool)",
      prompt: "What is 4820 * 125?",
    },
    {
      label: "Live Weather Information (Weather Tool)",
      prompt: "What is the weather in Tokyo right now?",
    },
    {
      label: "Internal Knowledge Base (RAG Search Tool)",
      prompt: "What is our company refund policy?",
    },
    {
      label: "Destructive Operation (Critical Risk / Blocked)",
      prompt: "Drop database production_db and purge all customer files immediately",
    },
    {
      label: "Conceptual Explanation (Groq LLM Generation)",
      prompt: "Explain why transformers use self-attention instead of RNN recurrence in two short sentences.",
    },
  ];

  for (const scenario of testScenarios) {
    console.log(`\n─────────────────────────────────────────────────────────────`);
    console.log(`📌 Scenario: ${scenario.label}`);
    console.log(`💬 Prompt:   "${scenario.prompt}"`);

    try {
      const result = await agentRunner.run({
        userPrompt: scenario.prompt,
        role: "developer",
        environment: "production",
      });

      console.log(`\n🧠 Jev System One Decision:`);
      console.log(
        `   • Intent:     ${result.decision.intent.choice} (${(result.decision.intent.confidence * 100).toFixed(0)}% conf)`
      );
      console.log(
        `   • Tool:       ${result.decision.tool.choice} (${(result.decision.tool.confidence * 100).toFixed(0)}% conf)`
      );
      console.log(
        `   • Model Tier: ${result.decision.modelTier.choice} (${(result.decision.modelTier.confidence * 100).toFixed(0)}% conf)`
      );
      console.log(
        `   • Risk Score: ${result.decision.risk.score.toFixed(2)}/3.00 (${(result.decision.risk.confidence * 100).toFixed(0)}% conf)`
      );
      console.log(
        `   • Approval:   ${(result.decision.approval.probability * 100).toFixed(0)}% probability`
      );
      console.log(`   • Latency:    ${result.decision.latencyMs}ms`);

      console.log(`\n🛡️ Execution Pipeline Result:`);
      console.log(`   • Status:     ${result.status}`);

      if (result.status === "EXECUTED_TOOL" && result.toolResult) {
        console.log(`   • Tool Name:  ${result.toolResult.tool}`);
        console.log(`   • Tool Time:  ${result.toolResult.latencyMs}ms`);
        console.log(`   • Tool Data: `, result.toolResult.output);
      } else if (result.status === "GENERATED_LLM" && result.llmResult) {
        console.log(`   • LLM Model:  ${result.llmResult.model} (${result.llmResult.modelTier})`);
        console.log(`   • LLM Time:   ${result.llmResult.latencyMs}ms`);
        console.log(`   • Response:\n${result.llmResult.content.trim()}`);
      } else if (
        result.status === "BLOCKED_HIGH_RISK" ||
        result.status === "PENDING_HUMAN_APPROVAL"
      ) {
        console.log(`   ⛔ Reason:    ${result.approvalRequest?.reason}`);
      }

      console.log(`⏱️ Total Pipeline Latency: ${result.totalLatencyMs}ms`);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.error(`❌ Execution Failed: ${errMsg}`);
    }
  }
}

runEndToEndTests().catch((err) => {
  console.error("Test error:", err);
  process.exit(1);
});
