import { choice, TypeSafeClient } from "@typesafe-ai/sdk";
import { env } from "../config/env";

const client = new TypeSafeClient({
  apiKey: env.apiKey,
});

async function runChoicePlayground() {
  console.log("=========================================");
  console.log("  🧪 Jev Playground: CHOICE Primitive");
  console.log("=========================================\n");

  const testPrompts = [
    "What is the weather like in New York tomorrow?",
    "Calculate 4829 multiplied by 382",
    "Can you explain how attention mechanisms work in transformers?",
    "Search our internal docs for the employee travel reimbursement policy",
    "Send a slack message to the team saying the release is delayed",
  ];

  for (const prompt of testPrompts) {
    console.log(`\n📥 Input: "${prompt}"`);
    const startTime = Date.now();

    const response = await client.systemOne({
      state: { userInput: prompt },
      questions: {
        intent: choice(
          "Classify the user's primary intent.",
          {
            QUESTION: "User is asking a conceptual or informational question",
            SEARCH: "User wants to look up or search internal/external data",
            CALCULATION: "User wants to perform a math or numerical calculation",
            ACTION: "User wants to trigger an action or side-effect like messaging or updating data",
          }
        ),
        tool: choice(
          "Select the single best tool to resolve this request.",
          {
            NONE: "No external tool required; direct explanation or conversation",
            WEATHER_API: "Retrieve live or forecast weather information",
            CALCULATOR: "Perform arithmetic or scientific calculations",
            KNOWLEDGE_BASE: "Search company docs or refund/travel policies",
            MESSAGING: "Send emails, Slack messages, or notifications",
          }
        ),
      },
    });

    const elapsedMs = Date.now() - startTime;
    console.log(`⏱️ Latency: ${elapsedMs}ms`);

    const intentAnswer = response.answers.intent;
    const toolAnswer = response.answers.tool;

    console.log(
      `🎯 Intent: ${intentAnswer.choice} (Confidence: ${(intentAnswer.confidence * 100).toFixed(1)}%)`
    );
    console.log(
      `🛠️  Tool:   ${toolAnswer.choice} (Confidence: ${(toolAnswer.confidence * 100).toFixed(1)}%)`
    );
    console.log("📊 Tool Probabilities:", toolAnswer.probabilities);
  }
}

runChoicePlayground().catch((err) => {
  console.error("Playground error:", err);
  process.exit(1);
});
