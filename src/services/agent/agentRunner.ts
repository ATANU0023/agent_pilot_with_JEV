import { decisionEngine } from "../jev/decisionEngine";
import { AgentContext, AgentRunResult } from "../jev/types";
import { groqService } from "../llm/groq";
import { toolRegistry } from "../tools/toolRegistry";

export class AgentRunner {
  /**
   * Complete end-to-end Agent execution pipeline:
   * Jev System One Decision -> Policy Engine -> Tool Execution OR Groq Generation
   */
  async run(context: AgentContext): Promise<AgentRunResult> {
    const overallStartTime = Date.now();

    // 1. Jev System One parallel evaluation
    const decision = await decisionEngine.decide(context);

    // 2. Deterministic Policy Engine Guardrails
    const approvalThreshold = 0.7;
    const criticalRiskThreshold = 2.0;

    const isHighRisk = decision.risk.score >= criticalRiskThreshold;
    const requiresApproval = decision.approval.probability >= approvalThreshold;

    if (isHighRisk || requiresApproval) {
      return {
        status: isHighRisk ? "BLOCKED_HIGH_RISK" : "PENDING_HUMAN_APPROVAL",
        userPrompt: context.userPrompt,
        decision,
        approvalRequest: {
          reason: isHighRisk
            ? `Action rejected/escalated due to elevated risk level (${decision.risk.score.toFixed(2)}/3.00, confidence: ${(decision.risk.confidence * 100).toFixed(0)}%)`
            : `Action requires human authorization (Probability: ${(decision.approval.probability * 100).toFixed(0)}%)`,
          riskScore: decision.risk.score,
          approvalProbability: decision.approval.probability,
        },
        totalLatencyMs: Date.now() - overallStartTime,
      };
    }

    // 3. Tool Execution Path (if a tool was selected)
    if (decision.tool.choice !== "NONE" && toolRegistry.has(decision.tool.choice)) {
      const toolInstance = toolRegistry.get(decision.tool.choice)!;
      const toolStartTime = Date.now();

      const toolExecution = await toolInstance.execute(context.userPrompt);
      const toolLatency = Date.now() - toolStartTime;

      return {
        status: "EXECUTED_TOOL",
        userPrompt: context.userPrompt,
        decision,
        toolResult: {
          tool: decision.tool.choice,
          output: toolExecution.data || toolExecution.message,
          latencyMs: toolLatency,
        },
        totalLatencyMs: Date.now() - overallStartTime,
      };
    }

    // 4. LLM Generation Path via Groq (System Two)
    const llmResult = await groqService.generate(
      context.userPrompt,
      decision.modelTier.choice
    );

    return {
      status: "GENERATED_LLM",
      userPrompt: context.userPrompt,
      decision,
      llmResult: {
        model: llmResult.model,
        modelTier: decision.modelTier.choice,
        content: llmResult.content,
        latencyMs: llmResult.latencyMs,
      },
      totalLatencyMs: Date.now() - overallStartTime,
    };
  }
}

export const agentRunner = new AgentRunner();
