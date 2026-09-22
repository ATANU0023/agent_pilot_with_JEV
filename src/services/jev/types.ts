export type IntentType = "QUESTION" | "CALCULATION" | "SEARCH" | "ACTION";

export type ToolType =
  | "NONE"
  | "CALCULATOR"
  | "WEATHER"
  | "KNOWLEDGE_BASE"
  | "MESSAGING"
  | "SYSTEM_COMMAND";

export type ModelTier = "FAST" | "STANDARD" | "REASONING";

export interface JevDecision {
  intent: {
    choice: IntentType;
    confidence: number;
    probabilities: Record<string, number>;
  };
  tool: {
    choice: ToolType;
    confidence: number;
    probabilities: Record<string, number>;
  };
  modelTier: {
    choice: ModelTier;
    confidence: number;
    probabilities: Record<string, number>;
  };
  risk: {
    score: number; // 0.00 to 3.00
    confidence: number;
    probabilities?: Record<string, number>;
  };
  approval: {
    probability: number; // 0.0 to 1.0 (from noul)
  };
  latencyMs: number;
}

export interface AgentContext {
  userPrompt: string;
  userId?: string;
  role?: string;
  environment?: string;
  conversationHistory?: Array<{ role: string; content: string }>;
}

export type ExecutionStatus =
  | "EXECUTED_TOOL"
  | "GENERATED_LLM"
  | "PENDING_HUMAN_APPROVAL"
  | "BLOCKED_HIGH_RISK"
  | "ERROR";

export interface AgentRunResult {
  status: ExecutionStatus;
  userPrompt: string;
  decision: JevDecision;
  toolResult?: {
    tool: ToolType;
    output: unknown;
    latencyMs: number;
  };
  llmResult?: {
    model: string;
    modelTier: ModelTier;
    content: string;
    latencyMs: number;
  };
  approvalRequest?: {
    reason: string;
    riskScore: number;
    approvalProbability: number;
  };
  totalLatencyMs: number;
}
