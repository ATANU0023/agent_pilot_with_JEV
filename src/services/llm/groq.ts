import Groq from "groq-sdk";
import { env } from "../../config/env";
import { ModelTier } from "../jev/types";

export const MODEL_MAP: Record<ModelTier, string> = {
  FAST: "openai/gpt-oss-20b",
  STANDARD: "qwen/qwen3.8-27b",
  REASONING: "openai/gpt-oss-120b",
};

// Fallback sequence if a model is unavailable
export const FALLBACK_MODELS = [
  "openai/gpt-oss-20b",
  "qwen/qwen3.8-27b",
  "openai/gpt-oss-120b",
  "llama-3.1-8b-instant",
  "llama-3.3-70b-versatile",
];

export class GroqService {
  private client: Groq | null = null;

  constructor() {
    const key = process.env.GROQ_API_KEY || env.groqApiKey;
    if (key) {
      this.client = new Groq({ apiKey: key });
    }
  }

  private getClient(): Groq {
    const key = process.env.GROQ_API_KEY || env.groqApiKey;
    if (!key) {
      throw new Error(
        "GROQ_API_KEY is not configured in .env. Please set GROQ_API_KEY to enable Groq LLM generation."
      );
    }
    if (!this.client || (this.client as any).apiKey !== key) {
      this.client = new Groq({ apiKey: key });
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
    const primaryModel = MODEL_MAP[modelTier];
    const candidateModels = [
      primaryModel,
      ...FALLBACK_MODELS.filter((m) => m !== primaryModel),
    ];
    const startTime = Date.now();

    const apiKey = process.env.GROQ_API_KEY || env.groqApiKey;

    // Graceful fallback if GROQ_API_KEY is not yet configured
    if (!apiKey) {
      const mockResponses: Record<ModelTier, string> = {
        FAST: `[⚡ Groq Fast Tier Preview — Model: ${primaryModel}]\n\nSelf-attention allows transformers to process all tokens in parallel rather than sequentially, eliminating the vanishing gradient bottleneck of recurrence while achieving orders-of-magnitude faster training on modern GPUs.`,
        STANDARD: `[🚀 Groq Standard Tier Preview — Model: ${primaryModel}]\n\nTransformers replace recurrence with self-attention mechanisms, computing pair-wise relationships across entire sequences simultaneously. This allows direct information propagation regardless of distance, overcoming the sequential dependency and memory decay inherent in RNNs.`,
        REASONING: `[🧠 Groq Reasoning Tier Preview — Model: ${primaryModel}]\n\n1. Analysis: Recurrent architectures (RNNs, LSTMs) enforce an O(n) sequential execution bottleneck that prevents horizontal GPU parallelization.\n2. In contrast, multi-head self-attention computes an O(n²) attention matrix across all token pairs concurrently, preserving global context without sequential decay.\n3. Conclusion: Self-attention enables significantly superior scaling laws, faster wall-clock training, and better long-range dependency capture.`,
      };

      return {
        content:
          mockResponses[modelTier] +
          "\n\n*(Note: Add GROQ_API_KEY to your .env file to enable live Groq cloud generation)*",
        model: primaryModel,
        modelTier,
        latencyMs: 120,
        usage: { promptTokens: 32, completionTokens: 96, totalTokens: 128 },
      };
    }

    const client = this.getClient();
    let lastError: unknown = null;

    for (const modelToTry of candidateModels) {
      try {
        const response = await client.chat.completions.create({
          model: modelToTry,
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
          model: modelToTry,
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
      } catch (err: any) {
        lastError = err;
        // If it's a model not found / 404 error, try next fallback model
        if (err?.status === 404 || err?.message?.includes("model")) {
          console.warn(`Model ${modelToTry} not available on Groq, trying fallback...`);
          continue;
        }
        throw err;
      }
    }

    throw lastError || new Error("Failed to generate response with Groq models.");
  }
}

export const groqService = new GroqService();
