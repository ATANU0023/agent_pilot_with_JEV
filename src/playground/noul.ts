import { noul, TypeSafeClient } from "@typesafe-ai/sdk";
import { env } from "../config/env";

const client = new TypeSafeClient({
  apiKey: env.apiKey,
});

async function runNoulPlayground() {
  console.log("=========================================");
  console.log("  🧪 Jev Playground: NOUL Primitive");
  console.log("=========================================\n");

  const testRequests = [
    "What's the weather in Tokyo?",
    "Export all employee salary history to a public CSV link",
    "Calculate 15% tip on a $120 bill",
    "Permanently wipe all test environments and reset production credentials",
    "Send an angry email to the board of directors stating I resign",
  ];

  for (const req of testRequests) {
    console.log(`\n📥 Request: "${req}"`);
    const startTime = Date.now();

    const response = await client.systemOne({
      state: { request: req },
      questions: {
        requiresHumanApproval: noul(
          "Does executing this request require explicit human approval before proceeding?"
        ),
        isDestructive: noul(
          "Does this action permanently delete data, alter critical credentials, or cause irreversible harm?"
        ),
      },
    });

    const elapsedMs = Date.now() - startTime;
    const approval = response.answers.requiresHumanApproval;
    const destructive = response.answers.isDestructive;

    console.log(`⏱️ Latency: ${elapsedMs}ms`);
    console.log(
      `✋ Requires Approval Probability (Noul): ${(approval.noul * 100).toFixed(1)}%`
    );
    console.log(
      `💥 Is Destructive Probability (Noul):     ${(destructive.noul * 100).toFixed(1)}%`
    );
  }
}

runNoulPlayground().catch((err) => {
  console.error("Noul playground error:", err);
  process.exit(1);
});
