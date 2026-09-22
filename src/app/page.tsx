"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  ArrowUp,
  Brain,
  Calculator,
  Check,
  ChevronDown,
  ChevronRight,
  CloudSun,
  Database,
  Layers,
  RotateCcw,
  Shield,
  ShieldAlert,
  Sparkles,
  X,
} from "lucide-react";
import { AgentRunResult } from "../services/jev/types";

interface Message {
  id: string;
  sender: "user" | "assistant";
  content: string;
  timestamp: string;
  result?: AgentRunResult;
}

const QUICK_SUGGESTIONS = [
  { label: "Math evaluation", prompt: "What is 4820 * 125?", icon: Calculator },
  { label: "Tokyo weather", prompt: "What is the weather in Tokyo right now?", icon: CloudSun },
  { label: "Company refund policy", prompt: "What is our company refund policy?", icon: Database },
  { label: "Critical risk check", prompt: "Drop database production_db and purge all customer files immediately", icon: ShieldAlert },
  { label: "Self-attention explanation", prompt: "Explain why transformers use self-attention instead of RNN recurrence in two short sentences.", icon: Sparkles },
];

export default function AgentPilotApp() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init",
      sender: "assistant",
      content:
        "AgentPilot is ready. I use **TypeSafe Jev** as a System One cognitive layer to evaluate intent, safety, and deterministic tools before dispatching to Groq.\n\nTry entering a math expression, weather query, policy question, or destructive command.",
      timestamp: "Ready",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [expandedDecisions, setExpandedDecisions] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const toggleDecision = (id: string) => {
    setExpandedDecisions((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSend = async (overridePrompt?: string) => {
    const text = overridePrompt || input;
    if (!text.trim() || loading) return;

    const userMessage: Message = {
      id: `u-${Date.now()}`,
      sender: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/agent/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.details || errorData.error || "Request failed");
      }

      const result: AgentRunResult = await res.json();
      const assistantId = `a-${Date.now()}`;

      let content = "";
      if (result.status === "EXECUTED_TOOL" && result.toolResult) {
        if (result.toolResult.tool === "CALCULATOR") {
          const calc = result.toolResult.output as { expression: string; result: number };
          content = `**${calc.result}**\n\nComputed via deterministic calculator tool (\`${calc.expression}\`).`;
        } else if (result.toolResult.tool === "WEATHER") {
          const w = result.toolResult.output as { location: string; temperature: string; humidity: string; windSpeed: string };
          content = `Weather in **${w.location}**:\n- **Temperature:** ${w.temperature}\n- **Relative Humidity:** ${w.humidity}\n- **Wind Speed:** ${w.windSpeed}`;
        } else if (result.toolResult.tool === "KNOWLEDGE_BASE") {
          const doc = result.toolResult.output as { title: string; content: string };
          content = `**${doc.title}**\n\n${doc.content}`;
        } else {
          content = JSON.stringify(result.toolResult.output, null, 2);
        }
      } else if (result.status === "GENERATED_LLM" && result.llmResult) {
        content = result.llmResult.content;
      } else if (result.status === "BLOCKED_HIGH_RISK" || result.status === "PENDING_HUMAN_APPROVAL") {
        content = `Security Policy Intervention: ${result.approvalRequest?.reason}`;
      }

      const assistantMessage: Message = {
        id: assistantId,
        sender: "assistant",
        content,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        result,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: "assistant",
          content: `Error executing request: ${errMsg}`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", position: "relative", zIndex: 1 }}>
      {/* Minimal Header */}
      <header
        style={{
          borderBottom: "1px solid var(--border)",
          background: "rgba(9, 10, 13, 0.8)",
          backdropFilter: "blur(12px)",
          padding: "0.75rem 1.5rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "7px",
              background: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Brain style={{ color: "#090a0d", width: "16px", height: "16px" }} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontWeight: 600, fontSize: "0.95rem", letterSpacing: "-0.01em" }}>AgentPilot</span>
            <span className="pill">v0.1</span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div className="pill pill-emerald">
            <span className="dot dot-green" />
            Jev System 1: Online
          </div>
          <div className="pill">
            Groq: Ready
          </div>
          <button
            onClick={() =>
              setMessages([
                {
                  id: "init",
                  sender: "assistant",
                  content: "Chat cleared. What would you like to evaluate or execute next?",
                  timestamp: "Ready",
                },
              ])
            }
            className="btn-ghost"
            title="Reset conversation"
          >
            <RotateCcw style={{ width: "12px", height: "12px" }} />
            Reset
          </button>
        </div>
      </header>

      {/* Chat Thread */}
      <main
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "2rem 1.5rem 8rem",
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem",
          maxWidth: "768px",
          width: "100%",
          margin: "0 auto",
        }}
      >
        {messages.map((msg) => {
          const isUser = msg.sender === "user";
          const hasDecision = !!msg.result;
          const isExpanded = !!expandedDecisions[msg.id];

          return (
            <div
              key={msg.id}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: isUser ? "flex-end" : "flex-start",
                gap: "6px",
              }}
            >
              {/* Message Header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "0.72rem",
                  color: "var(--text-muted)",
                }}
              >
                <span>{isUser ? "You" : "AgentPilot"}</span>
                <span>•</span>
                <span>{msg.timestamp}</span>
              </div>

              {/* Message Bubble */}
              <div
                style={{
                  maxWidth: isUser ? "85%" : "100%",
                  width: !isUser ? "100%" : undefined,
                  background: isUser ? "var(--bg-surface-hover)" : "transparent",
                  border: isUser ? "1px solid var(--border)" : "none",
                  borderRadius: isUser ? "14px 14px 4px 14px" : "0",
                  padding: isUser ? "0.75rem 1rem" : "0",
                  color: "var(--text-primary)",
                  fontSize: "0.92rem",
                  lineHeight: 1.6,
                }}
              >
                {/* Assistant: Jev System One Decision Bar */}
                {hasDecision && msg.result && (
                  <div
                    style={{
                      background: "var(--bg-surface)",
                      border: "1px solid var(--border)",
                      borderRadius: "10px",
                      marginBottom: "1rem",
                      overflow: "hidden",
                    }}
                  >
                    {/* Collapsible Header */}
                    <div
                      onClick={() => toggleDecision(msg.id)}
                      style={{
                        padding: "8px 12px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        cursor: "pointer",
                        userSelect: "none",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                        <Brain style={{ width: "14px", height: "14px", color: "var(--accent-blue)" }} />
                        <span style={{ fontSize: "0.78rem", fontWeight: 600 }}>Jev Routing</span>
                        <span className="pill pill-blue">
                          Tool: {msg.result.decision.tool.choice}
                        </span>
                        <span className="pill">
                          {msg.result.decision.latencyMs}ms
                        </span>
                        <span className={`pill ${msg.result.decision.risk.score >= 2 ? "pill-rose" : msg.result.decision.risk.score >= 1 ? "pill-amber" : "pill-emerald"}`}>
                          Risk: {msg.result.decision.risk.score.toFixed(1)}/3.0
                        </span>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.72rem", color: "var(--text-muted)" }}>
                        <span>{isExpanded ? "Hide" : "Details"}</span>
                        {isExpanded ? (
                          <ChevronDown style={{ width: "13px", height: "13px" }} />
                        ) : (
                          <ChevronRight style={{ width: "13px", height: "13px" }} />
                        )}
                      </div>
                    </div>

                    {/* Expanded Technical Breakdown */}
                    {isExpanded && (
                      <div
                        style={{
                          padding: "10px 12px",
                          borderTop: "1px solid var(--border)",
                          background: "var(--bg-card-subtle)",
                          display: "grid",
                          gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
                          gap: "8px",
                          fontSize: "0.75rem",
                        }}
                      >
                        <div>
                          <div style={{ color: "var(--text-muted)", fontSize: "0.68rem" }}>INTENT</div>
                          <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{msg.result.decision.intent.choice}</div>
                          <div style={{ color: "var(--text-muted)", fontSize: "0.68rem" }}>{(msg.result.decision.intent.confidence * 100).toFixed(0)}% conf</div>
                        </div>
                        <div>
                          <div style={{ color: "var(--text-muted)", fontSize: "0.68rem" }}>TOOL</div>
                          <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{msg.result.decision.tool.choice}</div>
                          <div style={{ color: "var(--text-muted)", fontSize: "0.68rem" }}>{(msg.result.decision.tool.confidence * 100).toFixed(0)}% conf</div>
                        </div>
                        <div>
                          <div style={{ color: "var(--text-muted)", fontSize: "0.68rem" }}>MODEL TIER</div>
                          <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{msg.result.decision.modelTier.choice}</div>
                          <div style={{ color: "var(--text-muted)", fontSize: "0.68rem" }}>{(msg.result.decision.modelTier.confidence * 100).toFixed(0)}% conf</div>
                        </div>
                        <div>
                          <div style={{ color: "var(--text-muted)", fontSize: "0.68rem" }}>RISK SCORE</div>
                          <div style={{ fontWeight: 600, color: msg.result.decision.risk.score >= 2 ? "var(--accent-rose)" : "var(--text-primary)" }}>
                            {msg.result.decision.risk.score.toFixed(2)} / 3.00
                          </div>
                          <div style={{ color: "var(--text-muted)", fontSize: "0.68rem" }}>{(msg.result.decision.risk.confidence * 100).toFixed(0)}% conf</div>
                        </div>
                        <div>
                          <div style={{ color: "var(--text-muted)", fontSize: "0.68rem" }}>APPROVAL GATE</div>
                          <div style={{ fontWeight: 600, color: msg.result.decision.approval.probability > 0.7 ? "var(--accent-rose)" : "var(--accent-emerald)" }}>
                            {(msg.result.decision.approval.probability * 100).toFixed(0)}%
                          </div>
                          <div style={{ color: "var(--text-muted)", fontSize: "0.68rem" }}>
                            {msg.result.decision.approval.probability > 0.7 ? "Requires Approval" : "Auto-Execute"}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Response Text / Output */}
                <div style={{ whiteSpace: "pre-wrap", color: "var(--text-primary)" }}>
                  {msg.content}
                </div>

                {/* Security Intervention Banner (if High Risk) */}
                {msg.result?.approvalRequest && (
                  <div
                    style={{
                      marginTop: "12px",
                      padding: "12px",
                      background: "rgba(244, 63, 94, 0.06)",
                      border: "1px solid rgba(244, 63, 94, 0.2)",
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: "10px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <AlertCircle style={{ color: "var(--accent-rose)", width: "16px", height: "16px" }} />
                      <span style={{ fontSize: "0.8rem", color: "var(--accent-rose)", fontWeight: 500 }}>
                        High-risk execution blocked by policy
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button
                        onClick={() => alert("Simulated administrator approval granted.")}
                        style={{
                          background: "var(--accent-rose)",
                          color: "#fff",
                          border: "none",
                          borderRadius: "6px",
                          padding: "4px 10px",
                          fontSize: "0.75rem",
                          fontWeight: 500,
                          cursor: "pointer",
                        }}
                      >
                        Authorize
                      </button>
                      <button
                        onClick={() => alert("Operation cancelled.")}
                        className="btn-ghost"
                        style={{ padding: "4px 10px", fontSize: "0.75rem" }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {loading && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--text-muted)", fontSize: "0.8rem" }}>
            <span className="dot dot-green" />
            <span>Evaluating Jev System One & routing...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </main>

      {/* Floating Bottom Input Bar */}
      <footer
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          background: "linear-gradient(180deg, transparent 0%, rgba(9, 10, 13, 0.95) 30%)",
          padding: "1rem 1.5rem 1.25rem",
          zIndex: 10,
        }}
      >
        <div style={{ maxWidth: "768px", margin: "0 auto" }}>
          {/* Suggestion Chips */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              overflowX: "auto",
              paddingBottom: "8px",
              marginBottom: "4px",
            }}
          >
            {QUICK_SUGGESTIONS.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={idx}
                  onClick={() => handleSend(item.prompt)}
                  disabled={loading}
                  className="btn-ghost"
                  style={{ fontSize: "0.72rem", padding: "3px 9px", whiteSpace: "nowrap" }}
                >
                  <Icon style={{ width: "11px", height: "11px" }} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Clean Input Field */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              gap: "8px",
              background: "var(--bg-surface)",
              border: "1px solid var(--border)",
              borderRadius: "10px",
              padding: "6px 8px 6px 12px",
              transition: "border-color 0.15s ease",
            }}
          >
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything (e.g. 4820 * 125, Tokyo weather, refund policy, drop database...)"
              rows={1}
              style={{
                flex: 1,
                background: "transparent",
                border: "none",
                outline: "none",
                color: "var(--text-primary)",
                fontSize: "0.9rem",
                fontFamily: "inherit",
                resize: "none",
                maxHeight: "100px",
                padding: "4px 0",
              }}
            />
            <button
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "6px",
                background: input.trim() && !loading ? "#ffffff" : "rgba(255, 255, 255, 0.08)",
                border: "none",
                color: input.trim() && !loading ? "#090a0d" : "var(--text-muted)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: input.trim() && !loading ? "pointer" : "not-allowed",
                transition: "opacity 0.15s ease",
                flexShrink: 0,
              }}
            >
              <ArrowUp style={{ width: "15px", height: "15px", strokeWidth: 2.5 }} />
            </button>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "5px",
              fontSize: "0.68rem",
              color: "var(--text-muted)",
              padding: "0 2px",
            }}
          >
            <span>TypeSafe Jev + Groq Engine</span>
            <span>Return to send • Shift + Return for new line</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
