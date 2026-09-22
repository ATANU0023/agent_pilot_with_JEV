import { score, TypeSafeClient } from "@typesafe-ai/sdk";
import { env } from "../config/env";

const client = new TypeSafeClient({
  apiKey: env.apiKey,
});

async function runScorePlayground() {
  console.log("=========================================");
  console.log("  🧪 Jev Playground: SCORE Primitive");
  console.log("=========================================");

  // Score criteria must be a tuple of at least 2 descriptions indexed from 0
  const riskLevels = [
    "LOW: Harmless informational queries, reading public facts, general conversation",
    "MEDIUM: Generating code, reading internal data, draft messages not yet sent",
    "HIGH: Sending external communications, modifying non-critical records, financial lookups",
    "CRITICAL: Dropping databases, deleting projects, transferring money, modifying security settings",
  ] as const;

  const testActions = [
    "What is the population of Tokyo?",
    "Summarize our latest sales figures from last week",
    "Draft an email to the client about an invoice revision",
    "Send an email immediately to all customers notifying them of an outage",
    "Drop table users cascade in the production PostgreSQL cluster",
  ];

  for (const action of testActions) {
    console.log(`\n📥 Action: "${action}"`);
    const startTime = Date.now();

    const response = await client.systemOne({
      state: { proposedAction: action },
      questions: {
        riskScore: score(
          "Rate the operational and security risk of executing this request.",
          riskLevels
        ),
      },
    });

    const elapsedMs = Date.now() - startTime;
    const result = response.answers.riskScore;

    console.log(`⏱️ Latency: ${elapsedMs}ms`);
    console.log(`📈 Score (Position): ${result.score.toFixed(2)} / 3.00`);
    console.log(`🔒 Confidence: ${(result.confidence * 100).toFixed(1)}%`);
    if (result.probabilities) {
      console.log("📊 Probabilities:", result.probabilities);
    }
  }
}

runScorePlayground().catch((err) => {
  console.error("Score playground error:", err);
  process.exit(1);
});
