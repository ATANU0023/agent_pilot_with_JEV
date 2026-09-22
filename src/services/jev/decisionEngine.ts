import { choice, noul, score, TypeSafeClient } from "@typesafe-ai/sdk";
import { env } from "../../config/env";
import { AgentContext, IntentType, JevDecision, ModelTier, ToolType } from "./types";

const client = new TypeSafeClient({
  apiKey: env.apiKey,
});

const riskLevels = [
  "LOW: Read-only, public facts, calculation, conversational explanation",
  "MEDIUM: Reading internal docs, generating draft content, non-destructive queries",
  "HIGH: External notifications, updating non-critical user records, external API calls",
  "CRITICAL: Destructive operations, credential resets, dropping databases, transferring funds",
] as const;

export class DecisionEngine {
  /**
   * Executes parallel Jev System One questions against the provided agent context.
   */
  async decide(context: AgentContext): Promise<JevDecision> {
    const startTime = Date.now();

    const response = await client.systemOne({
      state: {
        userPrompt: context.userPrompt,
        role: context.role || "user",
        environment: context.environment || "production",
      },
      questions: {
        intent: choice(
          "Classify the user's primary intent.",
          {
            QUESTION: "General question, conceptual inquiry, or conversation",
            CALCULATION: "Math or numerical calculation",
            SEARCH: "Searching documentation or internal knowledge base",
            ACTION: "Modifying data, running system commands, or sending communications",
          }
        ),
        tool: choice(
          "Select the single best tool to resolve this request.",
          {
            NONE: "No external tool required; pure conversational LLM explanation",
            CALCULATOR: "Deterministic math engine for arithmetic/calculations",
            WEATHER: "Live weather information and forecasts",
            KNOWLEDGE_BASE: "Vector RAG search for internal company docs, policies, and FAQs",
            MESSAGING: "Sending emails, Slack messages, or chat updates",
            SYSTEM_COMMAND: "Executing database migrations, shell commands, or infrastructure changes",
          }
        ),
        modelTier: choice(
          "If an LLM is needed, which model tier is required for sufficient quality?",
          {
            FAST: "Simple lookups, formatting, quick answers (low latency, cheap)",
            STANDARD: "Standard coding, summarization, general tasks",
            REASONING: "Complex logic, deep architectural design, subtle edge cases",
          }
        ),
        risk: score(
          "Assess operational and security risk on an ascending scale.",
          riskLevels
        ),
        approval: noul(
          "Should this action be paused and require human confirmation before execution?"
        ),
      },
    });

    const latencyMs = Date.now() - startTime;
    const { intent, tool, modelTier, risk, approval } = response.answers;

    return {
      intent: {
        choice: intent.choice as IntentType,
        confidence: intent.confidence,
        probabilities: (intent.probabilities || {}) as Record<string, number>,
      },
      tool: {
        choice: tool.choice as ToolType,
        confidence: tool.confidence,
        probabilities: (tool.probabilities || {}) as Record<string, number>,
      },
      modelTier: {
        choice: modelTier.choice as ModelTier,
        confidence: modelTier.confidence,
        probabilities: (modelTier.probabilities || {}) as Record<string, number>,
      },
      risk: {
        score: risk.score,
        confidence: risk.confidence,
        probabilities: (risk.probabilities || {}) as Record<string, number>,
      },
      approval: {
        probability: approval.noul,
      },
      latencyMs,
    };
  }
}

export const decisionEngine = new DecisionEngine();
