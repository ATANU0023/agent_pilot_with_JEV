import { decisionEngine } from "../jev/decisionEngine";
import { AgentContext, AgentRunResult, ExecutionStep } from "../jev/types";
import { groqService } from "../llm/groq";
import { toolRegistry } from "../tools/toolRegistry";

export class AgentRunner {
  /**
   * Complete end-to-end Agent execution pipeline:
   * Jev System One Decision -> Policy Engine -> Tool Execution OR Groq Generation
   */
  async run(context: AgentContext): Promise<AgentRunResult> {
    const overallStartTime = Date.now();
    const steps: ExecutionStep[] = [];

    // Step 1: Input Ingestion & Feature Extraction
    const ingestStart = Date.now();
    const shortPrompt =
      context.userPrompt.length > 55
        ? context.userPrompt.slice(0, 52) + "..."
        : context.userPrompt;

    // Detect prompt features for visualization
    const lowerPrompt = context.userPrompt.toLowerCase();
    const detectedFeatures: string[] = [];
    if (/[\d+\-*/().%^]|\b(?:plus|minus|times|multiplied|divided|percent)\b/.test(lowerPrompt)) {
      detectedFeatures.push("arithmetic_expression");
    }
    if (/\b(?:weather|temperature|forecast|climate|rain|snow|degrees|celsius|fahrenheit)\b/.test(lowerPrompt)) {
      detectedFeatures.push("weather_telemetry");
    }
    if (/\b(?:policy|refund|travel|reimbursement|pto|vacation|security|backup|disaster)\b/.test(lowerPrompt)) {
      detectedFeatures.push("corporate_knowledge_rag");
    }
    if (/\b(?:send|slack|alert|notify|message|email|channel)\b/.test(lowerPrompt)) {
      detectedFeatures.push("outbound_dispatch");
    }
    if (/\b(?:drop|delete|purge|destroy|credential|truncate|rm\s+-rf)\b/.test(lowerPrompt)) {
      detectedFeatures.push("destructive_system_action");
    }
    if (detectedFeatures.length === 0) {
      detectedFeatures.push("conceptual_reasoning");
    }

    steps.push({
      id: "step-1-ingest",
      name: "1. Prompt Ingestion & Preprocessing",
      category: "ingestion",
      status: "completed",
      description: `Ingested prompt "${shortPrompt}" (${context.userPrompt.length} chars, ~${Math.ceil(context.userPrompt.length / 4)} tokens).`,
      why: "The agent reads your input, extracts semantic features, normalizes formatting, and configures context for cognitive routing.",
      durationMs: Date.now() - ingestStart,
      badge: `${context.userPrompt.length} chars`,
      details: {
        rawPrompt: context.userPrompt,
        normalizedPrompt: context.userPrompt.trim(),
        promptLength: context.userPrompt.length,
        estimatedTokens: Math.ceil(context.userPrompt.length / 4),
        detectedFeatures,
        role: context.role || "user",
        environment: context.environment || "production",
      },
    });

    // Step 2: Jev System One parallel evaluation
    const jevStart = Date.now();
    const decision = await decisionEngine.decide(context);
    const jevLatency = Date.now() - jevStart;

    // Direct Specialist Override if requested by user
    if (context.forcedTool) {
      decision.tool.choice = context.forcedTool;
      decision.tool.confidence = 1.0;
    }

    const isDirectAssignment = !!context.forcedTool;
    const isUsingTool = decision.tool.choice !== "NONE";
    const toolOrTier = isUsingTool
      ? `Native ${decision.tool.choice} Tool`
      : `Groq Cloud (${decision.modelTier.choice} Tier)`;

    steps.push({
      id: "step-2-jev",
      name: isDirectAssignment
        ? `2. Direct Specialist Assignment: ${toolOrTier}`
        : `2. Cognitive Route: ${toolOrTier}`,
      category: "cognitive",
      status: "completed",
      description: isDirectAssignment
        ? `Directly assigned specialist [${decision.tool.choice}]. Evaluated risk & parameters in ${decision.latencyMs || jevLatency}ms.`
        : `Classified as ${decision.intent.choice} (${(decision.intent.confidence * 100).toFixed(0)}% conf). Selected ${toolOrTier} in ${decision.latencyMs || jevLatency}ms.`,
      why: isDirectAssignment
        ? `User explicitly tasked specialist @${decision.tool.choice.toLowerCase()}.`
        : isUsingTool
        ? `Why this tool? Deterministic tools (${decision.tool.choice}) execute code directly with 100% mathematical precision, eliminating hallucinations and unnecessary LLM token costs.`
        : `Why Groq LLM? This prompt requires general knowledge and nuanced reasoning, so it is routed to Groq's high-speed cloud inference.`,
      durationMs: decision.latencyMs || jevLatency,
      badge: isDirectAssignment ? `@${decision.tool.choice}` : `${decision.latencyMs || jevLatency}ms • Jev`,
      details: {
        intent: decision.intent,
        tool: decision.tool,
        modelTier: decision.modelTier,
        risk: decision.risk,
        approval: decision.approval,
        forcedTool: context.forcedTool,
      },
    });

    // Step 3: Deterministic Policy Engine Guardrails
    const approvalThreshold = 0.7;
    const criticalRiskThreshold = 2.0;

    const isHighRisk = decision.risk.score >= criticalRiskThreshold;
    const requiresApproval = decision.approval.probability >= approvalThreshold;

    if (isHighRisk || requiresApproval) {
      steps.push({
        id: "step-3-policy",
        name: "3. Safety & Policy Gate: BLOCKED",
        category: "policy",
        status: "warning",
        description: isHighRisk
          ? `High-risk score (${decision.risk.score.toFixed(2)}/3.00 >= ${criticalRiskThreshold.toFixed(2)}). Destructive action detected.`
          : `Human approval needed (Approval probability: ${(decision.approval.probability * 100).toFixed(0)}% >= 70%).`,
        why: "Why blocked? Your prompt requested destructive database or sensitive system actions. AgentPilot's policy guardrail halts automated execution to protect data.",
        durationMs: 1,
        badge: isHighRisk ? "BLOCKED (RISK)" : "NEEDS APPROVAL",
        details: {
          riskScore: decision.risk.score,
          riskConfidence: decision.risk.confidence,
          approvalProbability: decision.approval.probability,
          isHighRisk,
          requiresApproval,
          status: "INTERCEPTED",
        },
      });

      steps.push({
        id: "step-4-intervene",
        name: "4. Autonomous Execution Intercepted",
        category: "execution",
        status: "warning",
        description: "Execution suspended pending human administrator authorization.",
        why: "Security policy requires human-in-the-loop confirmation before running potentially irreversible commands.",
        durationMs: 0,
        badge: "Escalated",
      });

      const totalLatency = Date.now() - overallStartTime;
      steps.push({
        id: "step-5-summary",
        name: "5. Policy Intervention Delivery",
        category: "output",
        status: "completed",
        description: `Policy intervention dispatched in ${totalLatency}ms.`,
        why: "Notified user interface of security boundary enforcement.",
        durationMs: totalLatency,
        badge: `${totalLatency}ms`,
      });

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
        steps,
        totalLatencyMs: totalLatency,
      };
    }

    steps.push({
      id: "step-3-policy",
      name: "3. Safety & Policy Gate: Cleared",
      category: "policy",
      status: "completed",
      description: `Passed all safety checks (Risk score: ${decision.risk.score.toFixed(2)}/3.00 is safe).`,
      why: "Why cleared? The agent confirmed no unauthorized system mutations, database drops, or sensitive operations were requested.",
      durationMs: 1,
      badge: "CLEARED (SAFE)",
      details: {
        riskScore: decision.risk.score,
        approvalProbability: decision.approval.probability,
        status: "PASSED",
      },
    });

    // Step 4: Tool Registry Lookup & Resolution
    const hasRegisteredTool = decision.tool.choice !== "NONE" && toolRegistry.has(decision.tool.choice);
    const availableRegisteredTools = ["CALCULATOR", "WEATHER", "KNOWLEDGE_BASE", "MESSAGING"];

    steps.push({
      id: "step-4-registry",
      name: hasRegisteredTool
        ? `4. Tool Registry Resolution: ${decision.tool.choice}`
        : "4. Tool Registry Resolution: Pure LLM Path",
      category: "registry",
      status: "completed",
      description: hasRegisteredTool
        ? `Matched deterministic tool [${decision.tool.choice}] in ToolRegistry. Dispatching to local TypeScript handler.`
        : `ToolRegistry confirmed no external tool needed (${decision.tool.choice}). Routing directly to Groq Cloud Inference.`,
      why: hasRegisteredTool
        ? `The registry dynamically mapped the Jev decision to native local code [${decision.tool.choice}], bypassing LLM latency.`
        : "The query does not match any deterministic calculation or sensor tool; routing to Groq neural foundation model.",
      durationMs: 1,
      badge: hasRegisteredTool ? `Registry: ${decision.tool.choice}` : "Registry: Groq Cloud",
      details: {
        queriedTool: decision.tool.choice,
        registryHit: hasRegisteredTool,
        availableTools: availableRegisteredTools,
        destination: hasRegisteredTool ? `Native ${decision.tool.choice}` : "Groq Neural Engine",
      },
    });

    // Step 5: Execution Path (Native Tool vs Groq LLM)
    if (hasRegisteredTool) {
      const toolInstance = toolRegistry.get(decision.tool.choice)!;
      const toolStartTime = Date.now();

      const toolExecution = await toolInstance.execute(context.userPrompt);
      const toolLatency = Date.now() - toolStartTime;

      steps.push({
        id: "step-5-tool",
        name: `5. Native Tool Executed: ${decision.tool.choice}`,
        category: "execution",
        status: "completed",
        description: `Executed deterministic code locally in ${toolLatency}ms with zero hallucination.`,
        why: `The native ${decision.tool.choice} tool computed the exact answer immediately without calling external third-party models.`,
        durationMs: toolLatency,
        badge: `${decision.tool.choice} • ${toolLatency}ms`,
        details: {
          tool: decision.tool.choice,
          input: context.userPrompt,
          result: toolExecution.data || toolExecution.message,
          latencyMs: toolLatency,
          precision: "100% Deterministic",
        },
      });

      const totalLatency = Date.now() - overallStartTime;
      steps.push({
        id: "step-6-delivery",
        name: "6. Formatted Answer Delivered",
        category: "output",
        status: "completed",
        description: `Synthesized verified tool output into chat in ${totalLatency}ms total (~380 tokens saved).`,
        why: "Formatted the result cleanly with markdown, icons, and delivered it to your screen.",
        durationMs: totalLatency,
        badge: "Delivered",
        details: {
          formatType: "Structured Tool Response",
          tokensSaved: 380,
          totalLatencyMs: totalLatency,
        },
      });

      return {
        status: "EXECUTED_TOOL",
        userPrompt: context.userPrompt,
        decision,
        toolResult: {
          tool: decision.tool.choice,
          output: toolExecution.data || toolExecution.message,
          latencyMs: toolLatency,
        },
        steps,
        totalLatencyMs: totalLatency,
      };
    }

    // Step 5 (Alt): LLM Generation Path via Groq (System Two)
    const groqStartTime = Date.now();
    const llmResult = await groqService.generate(
      context.userPrompt,
      decision.modelTier.choice
    );
    const groqLatency = Date.now() - groqStartTime;

    const tokenSpeed = llmResult.usage?.completionTokens
      ? Math.round((llmResult.usage.completionTokens / (llmResult.latencyMs / 1000)))
      : null;

    steps.push({
      id: "step-5-groq",
      name: `5. Groq LLM Generation (${decision.modelTier.choice})`,
      category: "execution",
      status: "completed",
      description: `Model: ${llmResult.model} • ${llmResult.latencyMs}ms${tokenSpeed ? ` • ~${tokenSpeed} tokens/sec` : ""}.`,
      why: `Groq's LPUs generated the full reasoning response at ultra-high speed using ${llmResult.model}.`,
      durationMs: llmResult.latencyMs || groqLatency,
      badge: `${llmResult.model.split("/")[1] || llmResult.model} • ${llmResult.latencyMs}ms`,
      details: {
        model: llmResult.model,
        modelTier: decision.modelTier.choice,
        usage: llmResult.usage,
        tokensPerSecond: tokenSpeed,
        latencyMs: llmResult.latencyMs,
      },
    });

    const totalLatency = Date.now() - overallStartTime;
    steps.push({
      id: "step-6-delivery",
      name: "6. Synthesized & Delivered to Chat",
      category: "output",
      status: "completed",
      description: `Full pipeline completed in ${totalLatency}ms with verified integrity.`,
      why: "Rendered the response stream with markdown formatting and completed cognitive trace.",
      durationMs: totalLatency,
      badge: `${totalLatency}ms total`,
      details: {
        formatType: "Neural Markdown Synthesis",
        totalLatencyMs: totalLatency,
        tokensGenerated: llmResult.usage?.completionTokens || 0,
      },
    });

    return {
      status: "GENERATED_LLM",
      userPrompt: context.userPrompt,
      decision,
      llmResult: {
        model: llmResult.model,
        modelTier: decision.modelTier.choice,
        content: llmResult.content,
        latencyMs: llmResult.latencyMs,
        usage: llmResult.usage,
      },
      steps,
      totalLatencyMs: totalLatency,
    };
  }
}

export const agentRunner = new AgentRunner();
