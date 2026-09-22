import Groq from "groq-sdk";
import { env } from "../../config/env";
import { ModelTier } from "../jev/types";

export const MODEL_MAP: Record<ModelTier, string> = {
  FAST: "llama-3.1-8b-instant",
  STANDARD: "llama-3.3-70b-versatile",
  REASONING: "deepseek-r1-distill-llama-70b",
};

export class GroqService {
  private client: Groq | null = null;

  constructor() {
    if (env.groqApiKey) {
      this.client = new Groq({ apiKey: env.groqApiKey });
    }
  }

  private getClient(): Groq {
    if (!this.client) {
      if (!env.groqApiKey) {
        throw new Error(
          "GROQ_API_KEY is not configured in .env. Please set GROQ_API_KEY to enable Groq LLM generation."
        );
      }
      this.client = new Groq({ apiKey: env.groqApiKey });
    }
    return this.client;
  }

  async generate(
    prompt: string,
    modelTier: ModelTier = "FAST",
    systemPrompt: string = "You are an intelligent, concise AI assistant for AgentPilot."
  ): Promise<{
    content: string;
    model: string;
    modelTier: ModelTier;
    latencyMs: number;
    usage?: {
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
    };
  }> {
    const model = MODEL_MAP[modelTier];
    const startTime = Date.now();

    // Graceful fallback if GROQ_API_KEY is not yet configured
    if (!env.groqApiKey) {
      const mockResponses: Record<ModelTier, string> = {
        FAST: `[⚡ Groq Fast Tier Preview — Model: ${model}]\n\nSelf-attention allows transformers to process all tokens in parallel rather than sequentially, eliminating the vanishing gradient bottleneck of recurrence while achieving orders-of-magnitude faster training on modern GPUs.`,
        STANDARD: `[🚀 Groq Standard Tier Preview — Model: ${model}]\n\nTransformers replace recurrence with self-attention mechanisms, computing pair-wise relationships across entire sequences simultaneously. This allows direct information propagation regardless of distance, overcoming the sequential dependency and memory decay inherent in RNNs.`,
        REASONING: `[🧠 Groq Reasoning Tier Preview — Model: ${model}]\n\n1. Analysis: Recurrent architectures (RNNs, LSTMs) enforce an O(n) sequential execution bottleneck that prevents horizontal GPU parallelization.\n2. In contrast, multi-head self-attention computes an O(n²) attention matrix across all token pairs concurrently, preserving global context without sequential decay.\n3. Conclusion: Self-attention enables significantly superior scaling laws, faster wall-clock training, and better long-range dependency capture.`,
      };

      return {
        content:
          mockResponses[modelTier] +
          "\n\n*(Note: Add GROQ_API_KEY to your .env file to enable live Groq cloud generation)*",
        model,
        modelTier,
        latencyMs: 120,
        usage: { promptTokens: 32, completionTokens: 96, totalTokens: 128 },
      };
    }

    const client = this.getClient();
    const response = await client.chat.completions.create({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      temperature: modelTier === "REASONING" ? 0.6 : 0.7,
      max_tokens: 1024,
    });

    const latencyMs = Date.now() - startTime;
    const content = response.choices[0]?.message?.content || "";

    return {
      content,
      model,
      modelTier,
      latencyMs,
      usage: response.usage
        ? {
            promptTokens: response.usage.prompt_tokens,
            completionTokens: response.usage.completion_tokens,
            totalTokens: response.usage.total_tokens,
          }
        : undefined,
    };
  }
}

export const groqService = new GroqService();
