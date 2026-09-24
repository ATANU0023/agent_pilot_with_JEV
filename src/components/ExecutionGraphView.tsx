"use client";

import React, { useState } from "react";
import {
  Brain,
  Calculator,
  Check,
  CheckCircle2,
  CloudSun,
  Copy,
  Cpu,
  Database,
  Layers,
  Maximize2,
  Minimize2,
  Send,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import { AgentRunResult, ToolType } from "../services/jev/types";

interface ExecutionGraphViewProps {
  result: AgentRunResult | null;
  loading?: boolean;
  liveElapsedMs?: number;
  onRunSample?: (prompt: string) => void;
  isExpandedModal?: boolean;
  onToggleExpandModal?: () => void;
}

export type GraphNodeType =
  | "ingest"
  | "jev"
  | "policy"
  | "intercept"
  | "registry"
  | "calc"
  | "weather"
  | "knowledge"
  | "messaging"
  | "groq"
  | "exec_result"
  | "formatting";

interface SpecialistDef {
  id: string;
  toolType: ToolType | "GROQ_LLM";
  name: string;
  specialistName: string;
  title: string;
  department: string;
  avatar: string;
  color: string;
  icon: React.ComponentType<{ style?: React.CSSProperties }>;
  description: string;
  samplePrompt: string;
}

// Clean solid enterprise colors
const REGISTRY_SPECIALISTS: SpecialistDef[] = [
  {
    id: "calc",
    toolType: "CALCULATOR",
    name: "Native Calculator Tool",
    specialistName: "Dr. Alan T.",
    title: "Chief Mathematician",
    department: "Deterministic Computation Dept.",
    avatar: "/tools/calc.jpg",
    color: "#059669",
    icon: Calculator,
    description: "Evaluates arithmetic math expressions with 100% precision & 0 token cost.",
    samplePrompt: "What is 4820 * 125?",
  },
  {
    id: "weather",
    toolType: "WEATHER",
    name: "Weather Telemetry API",
    specialistName: "Brenda F.",
    title: "Senior Meteorologist",
    department: "Atmospheric Telemetry Dept.",
    avatar: "/tools/weather.jpg",
    color: "#0284c7",
    icon: CloudSun,
    description: "Live Open-Meteo satellite & global city geocoding API.",
    samplePrompt: "What is the weather in Tokyo right now?",
  },
  {
    id: "knowledge",
    toolType: "KNOWLEDGE_BASE",
    name: "Corporate Records RAG",
    specialistName: "Elara Vance",
    title: "Senior Cyber Archivist",
    department: "Internal Corporate Records Dept.",
    avatar: "/tools/knowledge.jpg",
    color: "#7c3aed",
    icon: Database,
    description: "Searches proprietary company policies, SLAs, and refund bylaws.",
    samplePrompt: "What is our company refund policy?",
  },
  {
    id: "messaging",
    toolType: "MESSAGING",
    name: "Outbound Dispatcher",
    specialistName: "Maya",
    title: "Communications Dispatcher",
    department: "Outbound Dispatch & Alerts",
    avatar: "/tools/messaging.jpg",
    color: "#0891b2",
    icon: Send,
    description: "Dispatches alerts to Slack channels, incident queues, and webhooks.",
    samplePrompt: "Send team alert: Production deployment at midnight",
  },
  {
    id: "groq",
    toolType: "GROQ_LLM",
    name: "Groq Cloud LPUs",
    specialistName: "Kaira V.",
    title: "Neural Reasoning Specialist",
    department: "Groq Cloud LPU Inference Unit",
    avatar: "/tools/groq.jpg",
    color: "#4f46e5",
    icon: Sparkles,
    description: "Ultra-fast neural foundation inference at ~280 tokens/sec.",
    samplePrompt: "Explain why transformers use self-attention in two short sentences.",
  },
];

export default function ExecutionGraphView({
  result,
  loading = false,
  liveElapsedMs = 0,
  onRunSample,
  isExpandedModal = false,
  onToggleExpandModal,
}: ExecutionGraphViewProps) {
  const [selectedNodeId, setSelectedNodeId] = useState<GraphNodeType>("registry");
  const [activeTab, setActiveTab] = useState<"overview" | "matrix" | "transform" | "probabilities" | "json">("overview");
  const [copied, setCopied] = useState(false);

  // Derive execution status
  const isHighRisk = result ? result.status === "BLOCKED_HIGH_RISK" || !!result.approvalRequest : false;
  const isTool = result ? result.status === "EXECUTED_TOOL" && result.decision.tool.choice !== "NONE" : false;
  const selectedToolChoice = result ? result.decision.tool.choice : "NONE";

  // Identify which specialist is active/selected
  const selectedSpecialist = isHighRisk
    ? {
        id: "security",
        name: "Security Guardrail Intercept",
        specialistName: "Unit 07 Vance",
        title: "Chief Security Officer",
        color: "#dc2626",
        avatar: "/tools/security.jpg",
        department: "System 1 Guardrail Enforcement",
        description: "Frontline security gatekeeper that halts destructive operations.",
      }
    : isTool
    ? REGISTRY_SPECIALISTS.find((s) => s.toolType === selectedToolChoice) || REGISTRY_SPECIALISTS[0]
    : REGISTRY_SPECIALISTS.find((s) => s.id === "groq")!;

  const ingestStep = result?.steps?.find((s) => s.id === "step-1-ingest");

  const promptDetails = (ingestStep?.details || {}) as {
    rawPrompt?: string;
    normalizedPrompt?: string;
    promptLength?: number;
    estimatedTokens?: number;
    detectedFeatures?: string[];
  };

  const handleCopyTelemetry = () => {
    if (!result) return;
    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
        background: "#0d1117",
      }}
    >
      {/* Top Graph Toolbar & Quick Path Tester */}
      <div
        style={{
          padding: "10px 14px",
          borderBottom: "1px solid #21262d",
          background: "#161b22",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div
              style={{
                width: "24px",
                height: "24px",
                borderRadius: "5px",
                background: "#1f2937",
                border: "1px solid #374151",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Layers style={{ width: "13px", height: "13px", color: "#60a5fa" }} />
            </div>
            <div>
              <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#f3f4f6" }}>
                Cognitive Decision Tree
              </span>
              <span style={{ fontSize: "0.68rem", color: "#8b949e", marginLeft: "8px" }}>
                Solid Path Trace
              </span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            {result && (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px",
                  fontSize: "0.68rem",
                  fontWeight: 600,
                  padding: "2px 8px",
                  borderRadius: "4px",
                  background: isHighRisk ? "#451a1a" : "#132b20",
                  color: isHighRisk ? "#f87171" : "#34d399",
                  border: `1px solid ${isHighRisk ? "#dc2626" : "#059669"}`,
                }}
              >
                <span
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: isHighRisk ? "#dc2626" : "#059669",
                  }}
                />
                {isHighRisk
                  ? "Policy Blocked"
                  : isTool
                  ? `Selected: ${selectedToolChoice} Tool`
                  : "Selected: Groq Cloud LPU"}
              </span>
            )}

            {result && (
              <button
                onClick={handleCopyTelemetry}
                className="btn-ghost"
                style={{ padding: "3px 8px", fontSize: "0.68rem", gap: "4px" }}
                title="Copy trace JSON"
              >
                {copied ? (
                  <>
                    <Check style={{ width: "11px", height: "11px", color: "#10b981" }} />
                    <span style={{ color: "#10b981" }}>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy style={{ width: "11px", height: "11px" }} />
                    <span>Telemetry</span>
                  </>
                )}
              </button>
            )}

            {onToggleExpandModal && (
              <button
                onClick={onToggleExpandModal}
                className="btn-ghost"
                style={{ padding: "3px 8px", fontSize: "0.68rem", gap: "4px" }}
                title={isExpandedModal ? "Close Fullscreen" : "Expand to Fullscreen"}
              >
                {isExpandedModal ? (
                  <>
                    <Minimize2 style={{ width: "11px", height: "11px" }} />
                    <span>Collapse</span>
                  </>
                ) : (
                  <>
                    <Maximize2 style={{ width: "11px", height: "11px" }} />
                    <span>Expand</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Quick Test Path Scenarios */}
        <div style={{ display: "flex", alignItems: "center", gap: "5px", overflowX: "auto", paddingBottom: "2px" }}>
          <span style={{ fontSize: "0.64rem", color: "#8b949e", textTransform: "uppercase", fontWeight: 600, flexShrink: 0 }}>
            Simulate:
          </span>
          <button
            onClick={() => onRunSample && onRunSample("What is 4820 * 125?")}
            className="btn-ghost"
            style={{ fontSize: "0.66rem", padding: "2px 7px", whiteSpace: "nowrap", borderRadius: "4px" }}
          >
            Math Tool
          </button>
          <button
            onClick={() => onRunSample && onRunSample("What is the weather in Tokyo right now?")}
            className="btn-ghost"
            style={{ fontSize: "0.66rem", padding: "2px 7px", whiteSpace: "nowrap", borderRadius: "4px" }}
          >
            Weather API
          </button>
          <button
            onClick={() => onRunSample && onRunSample("What is our company refund policy?")}
            className="btn-ghost"
            style={{ fontSize: "0.66rem", padding: "2px 7px", whiteSpace: "nowrap", borderRadius: "4px" }}
          >
            Policy RAG
          </button>
          <button
            onClick={() => onRunSample && onRunSample("Send team alert: Production deployment at midnight")}
            className="btn-ghost"
            style={{ fontSize: "0.66rem", padding: "2px 7px", whiteSpace: "nowrap", borderRadius: "4px" }}
          >
            Dispatch
          </button>
          <button
            onClick={() => onRunSample && onRunSample("Drop database production_db and purge all customer files immediately")}
            className="btn-ghost"
            style={{ fontSize: "0.66rem", padding: "2px 7px", whiteSpace: "nowrap", borderRadius: "4px", borderColor: "#7f1d1d", color: "#f87171" }}
          >
            Drop DB (Risk)
          </button>
          <button
            onClick={() => onRunSample && onRunSample("Explain why transformers use self-attention in two short sentences.")}
            className="btn-ghost"
            style={{ fontSize: "0.66rem", padding: "2px 7px", whiteSpace: "nowrap", borderRadius: "4px", borderColor: "#4338ca", color: "#a5b4fc" }}
          >
            Groq LLM
          </button>
        </div>
      </div>

      {/* Main Interactive Tree Canvas */}
      <div
        style={{
          flex: isExpandedModal ? "0 0 58%" : "0 0 52%",
          overflowY: "auto",
          overflowX: "hidden",
          padding: "16px 14px 24px",
          position: "relative",
          background: "#0d1117",
          borderBottom: "1px solid #21262d",
        }}
      >
        {loading && (
          <div
            style={{
              position: "absolute",
              top: "12px",
              right: "14px",
              zIndex: 10,
              background: "#161b22",
              border: "1px solid #3b82f6",
              borderRadius: "6px",
              padding: "4px 10px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "0.72rem",
              color: "#60a5fa",
            }}
          >
            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "#3b82f6",
                display: "inline-block",
              }}
            />
            <span>Evaluating cognitive path... ({(liveElapsedMs / 1000).toFixed(1)}s)</span>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", maxWidth: "480px", margin: "0 auto" }}>
          {/* NODE 1: PROMPT INGESTION & FEATURE EXTRACTION */}
          <div
            onClick={() => setSelectedNodeId("ingest")}
            style={{
              cursor: "pointer",
              width: "100%",
              borderRadius: "8px",
              padding: "10px 14px",
              background: selectedNodeId === "ingest" ? "#1b2533" : "#161b22",
              border: `1.5px solid ${selectedNodeId === "ingest" ? "#2563eb" : "#30363d"}`,
              transition: "all 0.15s ease",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                <div
                  style={{
                    width: "22px",
                    height: "22px",
                    borderRadius: "4px",
                    background: "#1e293b",
                    border: "1px solid #334155",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Zap style={{ width: "12px", height: "12px", color: "#60a5fa" }} />
                </div>
                <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "#f3f4f6" }}>
                  1. Prompt Ingestion & Preprocessing
                </span>
              </div>
              <span
                style={{
                  fontSize: "0.62rem",
                  padding: "1px 6px",
                  borderRadius: "4px",
                  background: "#1e293b",
                  color: "#94a3b8",
                  border: "1px solid #334155",
                }}
              >
                {result?.userPrompt.length || 0} chars • ~{Math.ceil((result?.userPrompt.length || 0) / 4)} tokens
              </span>
            </div>

            <div style={{ fontSize: "0.72rem", color: "#9ca3af", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              &ldquo;{result?.userPrompt || "Awaiting prompt..."}&rdquo;
            </div>

            {promptDetails.detectedFeatures && promptDetails.detectedFeatures.length > 0 && (
              <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginTop: "6px" }}>
                {promptDetails.detectedFeatures.map((f, i) => (
                  <span
                    key={i}
                    style={{
                      fontSize: "0.62rem",
                      background: "#1f2937",
                      border: "1px solid #374151",
                      borderRadius: "4px",
                      padding: "1px 5px",
                      color: "#93c5fd",
                    }}
                  >
                    {f.replace(/_/g, " ")}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Wire 1 -> 2 (Solid slate) */}
          <div style={{ width: "2px", height: "16px", background: "#334155" }} />

          {/* NODE 2: JEV SYSTEM ONE COGNITIVE ROUTER */}
          <div
            onClick={() => setSelectedNodeId("jev")}
            style={{
              cursor: "pointer",
              width: "100%",
              borderRadius: "8px",
              padding: "10px 14px",
              background: selectedNodeId === "jev" ? "#1e2433" : "#161b22",
              border: `1.5px solid ${selectedNodeId === "jev" ? "#3b82f6" : "#30363d"}`,
              transition: "all 0.15s ease",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                <div
                  style={{
                    width: "22px",
                    height: "22px",
                    borderRadius: "4px",
                    background: "#1e293b",
                    border: "1px solid #334155",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Brain style={{ width: "13px", height: "13px", color: "#60a5fa" }} />
                </div>
                <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "#f3f4f6" }}>
                  2. Jev System 1 Multi-Headed Decision
                </span>
              </div>
              <span
                style={{
                  fontSize: "0.62rem",
                  padding: "1px 6px",
                  borderRadius: "4px",
                  background: "#1e293b",
                  color: "#94a3b8",
                  border: "1px solid #334155",
                }}
              >
                {result?.decision.latencyMs || liveElapsedMs}ms parallel
              </span>
            </div>

            {result && (
              <div style={{ display: "flex", gap: "5px", flexWrap: "wrap", marginTop: "4px" }}>
                <span style={{ fontSize: "0.62rem", padding: "1px 5px", background: "#1e293b", border: "1px solid #334155", borderRadius: "3px", color: "#93c5fd" }}>
                  Intent: {result.decision.intent.choice} ({((result.decision.intent.confidence || 0) * 100).toFixed(0)}%)
                </span>
                <span style={{ fontSize: "0.62rem", padding: "1px 5px", background: "#14291f", border: "1px solid #059669", borderRadius: "3px", color: "#34d399" }}>
                  Tool Pick: {result.decision.tool.choice}
                </span>
                <span style={{ fontSize: "0.62rem", padding: "1px 5px", background: "#1e293b", border: "1px solid #334155", borderRadius: "3px", color: "#d1d5db" }}>
                  Tier: {result.decision.modelTier.choice}
                </span>
                <span
                  style={{
                    fontSize: "0.62rem",
                    padding: "1px 5px",
                    borderRadius: "3px",
                    background: result.decision.risk.score >= 2 ? "#451a1a" : "#14291f",
                    border: `1px solid ${result.decision.risk.score >= 2 ? "#dc2626" : "#059669"}`,
                    color: result.decision.risk.score >= 2 ? "#f87171" : "#34d399",
                  }}
                >
                  Risk: {result.decision.risk.score.toFixed(1)}/3.0
                </span>
              </div>
            )}
          </div>

          {/* Wire 2 -> 3 (Solid slate) */}
          <div style={{ width: "2px", height: "16px", background: "#334155" }} />

          {/* NODE 3: SAFETY & POLICY GATE */}
          <div
            onClick={() => setSelectedNodeId("policy")}
            style={{
              cursor: "pointer",
              width: "100%",
              borderRadius: "8px",
              padding: "10px 14px",
              background: selectedNodeId === "policy" ? (isHighRisk ? "#2d1616" : "#13271c") : "#161b22",
              border: `1.5px solid ${
                selectedNodeId === "policy"
                  ? isHighRisk
                    ? "#dc2626"
                    : "#059669"
                  : isHighRisk
                  ? "#b91c1c"
                  : "#30363d"
              }`,
              transition: "all 0.15s ease",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                <div
                  style={{
                    width: "22px",
                    height: "22px",
                    borderRadius: "4px",
                    background: isHighRisk ? "#451a1a" : "#14291f",
                    border: `1px solid ${isHighRisk ? "#dc2626" : "#059669"}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {isHighRisk ? (
                    <ShieldAlert style={{ width: "12px", height: "12px", color: "#ef4444" }} />
                  ) : (
                    <ShieldCheck style={{ width: "12px", height: "12px", color: "#10b981" }} />
                  )}
                </div>
                <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "#f3f4f6" }}>
                  3. Safety & Policy Gatekeeper
                </span>
              </div>
              <span
                style={{
                  fontSize: "0.62rem",
                  padding: "1px 6px",
                  borderRadius: "4px",
                  fontWeight: 600,
                  background: isHighRisk ? "#dc2626" : "#059669",
                  color: "#ffffff",
                }}
              >
                {isHighRisk ? "BLOCKED (RISK)" : "CLEARED (SAFE)"}
              </span>
            </div>

            <div style={{ fontSize: "0.7rem", color: "#9ca3af" }}>
              {isHighRisk
                ? `Critical risk detected (Score: ${result?.decision.risk.score.toFixed(2)}/3.00 >= 2.00 threshold)`
                : `Passed safety guardrails (Risk score: ${result?.decision.risk.score.toFixed(2) || "0.00"}/3.00 < 2.00 threshold)`}
            </div>
          </div>

          {/* BRANCH A: HIGH RISK INTERCEPT */}
          {isHighRisk ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
              <div style={{ width: "2px", height: "16px", background: "#dc2626" }} />

              <div
                onClick={() => setSelectedNodeId("intercept")}
                style={{
                  cursor: "pointer",
                  width: "100%",
                  borderRadius: "8px",
                  padding: "10px 14px",
                  background: "#221313",
                  border: "1.5px solid #dc2626",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "9px", marginBottom: "4px" }}>
                  <img
                    src="/tools/security.jpg"
                    alt="Unit 07 Vance"
                    style={{ width: "28px", height: "28px", borderRadius: "5px", border: "1px solid #dc2626", objectFit: "cover" }}
                  />
                  <div>
                    <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "#f87171" }}>
                      Unit 07 Vance (Security Officer) Intercepted Action
                    </div>
                    <div style={{ fontSize: "0.65rem", color: "#9ca3af" }}>
                      Destructive command intercepted • Automated tool dispatch quarantined
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: "0.68rem", color: "#d1d5db", lineHeight: 1.4, marginTop: "4px" }}>
                  {result?.approvalRequest?.reason || "Execution suspended pending human administrator authorization."}
                </div>
              </div>

              <div style={{ width: "2px", height: "16px", background: "#dc2626" }} />

              <div
                onClick={() => setSelectedNodeId("formatting")}
                style={{
                  cursor: "pointer",
                  width: "100%",
                  borderRadius: "8px",
                  padding: "8px 12px",
                  background: "#161b22",
                  border: "1px solid #30363d",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span style={{ fontSize: "0.74rem", fontWeight: 600, color: "#f3f4f6" }}>
                  5. Security Warning Dispatched to Chat
                </span>
                <span style={{ fontSize: "0.62rem", padding: "1px 6px", borderRadius: "4px", background: "#451a1a", color: "#f87171", border: "1px solid #dc2626" }}>
                  Dispatched
                </span>
              </div>
            </div>
          ) : (
            /* BRANCH B: SAFE PATH -> TOOL REGISTRY FAN-OUT WITH SOLID SELECTION */
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
              {/* Wire 3 -> 4 */}
              <div style={{ width: "2px", height: "16px", background: "#334155" }} />

              {/* NODE 4: TOOL REGISTRY DISPATCHER */}
              <div
                onClick={() => setSelectedNodeId("registry")}
                style={{
                  cursor: "pointer",
                  width: "100%",
                  borderRadius: "8px",
                  padding: "10px 14px",
                  background: selectedNodeId === "registry" ? "#221c13" : "#161b22",
                  border: `1.5px solid ${selectedNodeId === "registry" ? "#d97706" : "#30363d"}`,
                  transition: "all 0.15s ease",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "3px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                    <div
                      style={{
                        width: "22px",
                        height: "22px",
                        borderRadius: "4px",
                        background: "#2d2315",
                        border: "1px solid #d97706",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Layers style={{ width: "12px", height: "12px", color: "#f59e0b" }} />
                    </div>
                    <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "#f3f4f6" }}>
                      4. Tool Registry Specialist Resolution
                    </span>
                  </div>
                  <span style={{ fontSize: "0.62rem", padding: "1px 6px", borderRadius: "4px", background: "#2d2315", color: "#fbbf24", border: "1px solid #b45309" }}>
                    Evaluating 5 Candidates
                  </span>
                </div>
                <div style={{ fontSize: "0.7rem", color: "#9ca3af" }}>
                  Queried registered handlers for Jev recommendation:{" "}
                  <strong style={{ color: "#60a5fa" }}>{selectedToolChoice}</strong>
                </div>
              </div>

              {/* Connecting solid SVG wire branch from Registry to tools */}
              <div style={{ width: "100%", height: "20px", position: "relative" }}>
                <svg width="100%" height="100%" viewBox="0 0 400 20" preserveAspectRatio="none">
                  <path d="M 200 0 L 200 10" stroke="#475569" strokeWidth="2" />
                  <path d="M 40 10 L 360 10" stroke="#334155" strokeWidth="1.5" />
                  <path d="M 40 10 L 40 20" stroke="#334155" strokeWidth="1.5" />
                  <path d="M 120 10 L 120 20" stroke="#334155" strokeWidth="1.5" />
                  <path d="M 200 10 L 200 20" stroke="#334155" strokeWidth="1.5" />
                  <path d="M 280 10 L 280 20" stroke="#334155" strokeWidth="1.5" />
                  <path d="M 360 10 L 360 20" stroke="#334155" strokeWidth="1.5" />
                </svg>
              </div>

              {/* CANDIDATE TOOLS LIST WITH SOLID COLOR SELECTION */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                  width: "100%",
                }}
              >
                {REGISTRY_SPECIALISTS.map((specialist) => {
                  const isSelected = isTool
                    ? specialist.toolType === selectedToolChoice
                    : specialist.id === "groq";

                  const Icon = specialist.icon;

                  return (
                    <div
                      key={specialist.id}
                      onClick={() => setSelectedNodeId(specialist.id as GraphNodeType)}
                      style={{
                        cursor: "pointer",
                        borderRadius: "8px",
                        padding: "8px 12px",
                        background: isSelected ? "#15241b" : "#161b22",
                        border: isSelected ? `2px solid ${specialist.color}` : "1px solid #21262d",
                        opacity: isSelected ? 1 : 0.55,
                        transition: "all 0.15s ease",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "10px",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "9px", minWidth: 0 }}>
                        <img
                          src={specialist.avatar}
                          alt={specialist.specialistName}
                          style={{
                            width: isSelected ? "30px" : "24px",
                            height: isSelected ? "30px" : "24px",
                            borderRadius: "5px",
                            border: `1px solid ${isSelected ? specialist.color : "#30363d"}`,
                            objectFit: "cover",
                            flexShrink: 0,
                          }}
                        />

                        <div style={{ minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <Icon style={{ width: "12px", height: "12px", color: specialist.color }} />
                            <span
                              style={{
                                fontSize: "0.78rem",
                                fontWeight: isSelected ? 700 : 500,
                                color: isSelected ? "#ffffff" : "#9ca3af",
                              }}
                            >
                              {specialist.specialistName}
                            </span>
                            <span style={{ fontSize: "0.68rem", color: specialist.color, fontWeight: 500 }}>
                              ({specialist.title})
                            </span>
                          </div>

                          <div style={{ fontSize: "0.66rem", color: "#8b949e", marginTop: "1px" }}>
                            {specialist.name}
                          </div>
                        </div>
                      </div>

                      {/* Explicit Selected vs Bypassed Badge */}
                      <div style={{ flexShrink: 0, textAlign: "right" }}>
                        {isSelected ? (
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "2px" }}>
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                                background: specialist.color,
                                color: "#ffffff",
                                borderRadius: "4px",
                                padding: "2px 7px",
                                fontSize: "0.65rem",
                                fontWeight: 700,
                                letterSpacing: "0.01em",
                              }}
                            >
                              ★ SELECTED TOOL
                            </span>
                            <span style={{ fontSize: "0.62rem", color: "#8b949e" }}>
                              {isTool ? "<1ms • 0 Tokens • 100% Precision" : "~280 tok/s neural"}
                            </span>
                          </div>
                        ) : (
                          <span
                            style={{
                              fontSize: "0.62rem",
                              color: "#8b949e",
                              background: "#21262d",
                              borderRadius: "4px",
                              padding: "2px 6px",
                            }}
                          >
                            Bypassed
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Wire from Selected Tool to Execution Result (Solid color) */}
              <div
                style={{
                  width: "2px",
                  height: "18px",
                  background: selectedSpecialist.color,
                }}
              />

              {/* NODE 5: EXECUTION RESULT & PAYLOAD */}
              <div
                onClick={() => setSelectedNodeId("exec_result")}
                style={{
                  cursor: "pointer",
                  width: "100%",
                  borderRadius: "8px",
                  padding: "10px 14px",
                  background: selectedNodeId === "exec_result" ? "#14241c" : "#161b22",
                  border: `1.5px solid ${selectedNodeId === "exec_result" ? "#059669" : "#30363d"}`,
                  transition: "all 0.15s ease",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                    <div
                      style={{
                        width: "22px",
                        height: "22px",
                        borderRadius: "4px",
                        background: "#14291f",
                        border: "1px solid #059669",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Cpu style={{ width: "12px", height: "12px", color: "#10b981" }} />
                    </div>
                    <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "#f3f4f6" }}>
                      5. {isTool ? `Native Execution: ${selectedToolChoice}` : "Groq Neural LPU Execution"}
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: "0.62rem",
                      padding: "1px 6px",
                      borderRadius: "4px",
                      background: "#14291f",
                      color: "#34d399",
                      border: "1px solid #059669",
                    }}
                  >
                    {isTool ? `${result?.toolResult?.latencyMs || 0}ms • 0 Tokens` : `${result?.llmResult?.latencyMs || 0}ms`}
                  </span>
                </div>

                <div style={{ fontSize: "0.7rem", color: "#9ca3af" }}>
                  {isTool ? (
                    <span>
                      Computed exact answer with <strong style={{ color: "#34d399" }}>100% mathematical precision</strong> (Saved ~380 foundation model tokens).
                    </span>
                  ) : (
                    <span>
                      Generated full cognitive synthesis with Groq LPUs (Model: {result?.llmResult?.model || "qwen/qwen3.8-27b"}).
                    </span>
                  )}
                </div>
              </div>

              {/* Wire 5 -> 6 (Solid slate) */}
              <div style={{ width: "2px", height: "16px", background: "#334155" }} />

              {/* NODE 6: RESPONSE FORMATTING & SYNTHESIS */}
              <div
                onClick={() => setSelectedNodeId("formatting")}
                style={{
                  cursor: "pointer",
                  width: "100%",
                  borderRadius: "8px",
                  padding: "10px 14px",
                  background: selectedNodeId === "formatting" ? "#14241c" : "#161b22",
                  border: `1.5px solid ${selectedNodeId === "formatting" ? "#059669" : "#30363d"}`,
                  transition: "all 0.15s ease",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                    <div
                      style={{
                        width: "22px",
                        height: "22px",
                        borderRadius: "4px",
                        background: "#14291f",
                        border: "1px solid #059669",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <CheckCircle2 style={{ width: "12px", height: "12px", color: "#10b981" }} />
                    </div>
                    <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "#f3f4f6" }}>
                      6. Response Formatter & Delivered to Chat
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: "0.62rem",
                      padding: "1px 6px",
                      borderRadius: "4px",
                      background: "#14291f",
                      color: "#34d399",
                      border: "1px solid #059669",
                    }}
                  >
                    {result?.totalLatencyMs}ms total pipeline
                  </span>
                </div>
                <div style={{ fontSize: "0.7rem", color: "#9ca3af" }}>
                  Rendered verified answer with clean Markdown formatting, badges, and integrity check.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Node Deep-Dive Inspector Panel */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          background: "#0d1117",
        }}
      >
        {/* Inspector Header & Segmented Tabs */}
        <div
          style={{
            padding: "8px 14px",
            borderBottom: "1px solid #21262d",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "#161b22",
            flexWrap: "wrap",
            gap: "6px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "0.76rem", fontWeight: 600, color: "#f3f4f6" }}>
              {selectedNodeId === "ingest" && "Node 1: Prompt Ingestion & Preprocessing"}
              {selectedNodeId === "jev" && "Node 2: Jev System One Cognitive Brain"}
              {selectedNodeId === "policy" && "Node 3: Safety & Policy Gatekeeper"}
              {selectedNodeId === "intercept" && "Node 3b: Security Intercept (Unit 07 Vance)"}
              {selectedNodeId === "registry" && "Node 4: Tool Registry Specialist Selector"}
              {selectedNodeId === "calc" && "Specialist: Dr. Alan T. (Calculator Tool)"}
              {selectedNodeId === "weather" && "Specialist: Brenda F. (Weather Telemetry API)"}
              {selectedNodeId === "knowledge" && "Specialist: Elara Vance (Corporate Records RAG)"}
              {selectedNodeId === "messaging" && "Specialist: Maya (Communications Dispatcher)"}
              {selectedNodeId === "groq" && "Specialist: Kaira V. (Groq Cloud LPUs)"}
              {selectedNodeId === "exec_result" && "Node 5: Execution Result & Payload"}
              {selectedNodeId === "formatting" && "Node 6: Response Formatting & Delivery"}
            </span>
          </div>

          <div
            style={{
              display: "flex",
              background: "#0d1117",
              borderRadius: "5px",
              padding: "2px",
              border: "1px solid #30363d",
            }}
          >
            <button
              onClick={() => setActiveTab("overview")}
              className={`flow-tab-btn ${activeTab === "overview" ? "active" : ""}`}
              style={{ padding: "2px 8px", fontSize: "0.64rem" }}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("matrix")}
              className={`flow-tab-btn ${activeTab === "matrix" ? "active" : ""}`}
              style={{ padding: "2px 8px", fontSize: "0.64rem" }}
            >
              Tool Matrix
            </button>
            <button
              onClick={() => setActiveTab("transform")}
              className={`flow-tab-btn ${activeTab === "transform" ? "active" : ""}`}
              style={{ padding: "2px 8px", fontSize: "0.64rem" }}
            >
              Transform
            </button>
            <button
              onClick={() => setActiveTab("probabilities")}
              className={`flow-tab-btn ${activeTab === "probabilities" ? "active" : ""}`}
              style={{ padding: "2px 8px", fontSize: "0.64rem" }}
            >
              Probabilities
            </button>
            <button
              onClick={() => setActiveTab("json")}
              className={`flow-tab-btn ${activeTab === "json" ? "active" : ""}`}
              style={{ padding: "2px 8px", fontSize: "0.64rem" }}
            >
              JSON
            </button>
          </div>
        </div>

        {/* Tab Content Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "12px 14px", fontSize: "0.74rem" }}>
          {activeTab === "overview" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {/* Solid Highlight Banner of the Selected Tool */}
              <div
                style={{
                  background: "#161b22",
                  borderLeft: `3px solid ${selectedSpecialist.color}`,
                  borderTop: "1px solid #21262d",
                  borderRight: "1px solid #21262d",
                  borderBottom: "1px solid #21262d",
                  padding: "9px 12px",
                  borderRadius: "0 6px 6px 0",
                  lineHeight: 1.45,
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "9px",
                }}
              >
                <img
                  src={selectedSpecialist.avatar}
                  alt={selectedSpecialist.specialistName}
                  style={{ width: "32px", height: "32px", borderRadius: "5px", flexShrink: 0, border: `1px solid ${selectedSpecialist.color}`, objectFit: "cover" }}
                />
                <div>
                  <div style={{ fontWeight: 600, color: "#f3f4f6", marginBottom: "2px", display: "flex", alignItems: "center", gap: "6px" }}>
                    <span>Selected Tool: {selectedSpecialist.name}</span>
                    <span style={{ fontSize: "0.66rem", color: selectedSpecialist.color }}>
                      ({selectedSpecialist.specialistName})
                    </span>
                  </div>
                  <div style={{ color: "#9ca3af", fontSize: "0.72rem" }}>
                    {isHighRisk
                      ? "High-risk command quarantined by Unit 07 Vance. Automated tool execution was blocked to protect system integrity."
                      : isTool
                      ? `Jev System 1 mapped this request directly to native code [${selectedToolChoice}]. This executes deterministically with 100% precision, completely eliminating LLM hallucinations and saving ~380 foundation model tokens.`
                      : `No calculation, sensor API, or corporate document was required. Jev System 1 classified this as general conversational reasoning and assigned it to Groq Cloud LPUs.`}
                  </div>
                </div>
              </div>

              {/* Core Metrics Grid with Solid Cards */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "8px" }}>
                <div style={{ background: "#161b22", border: "1px solid #21262d", borderRadius: "6px", padding: "8px" }}>
                  <div style={{ fontSize: "0.64rem", color: "#8b949e" }}>ASSIGNED SPECIALIST</div>
                  <div style={{ fontSize: "0.85rem", fontWeight: 600, color: selectedSpecialist.color, marginTop: "2px" }}>
                    {selectedSpecialist.specialistName}
                  </div>
                  <div style={{ fontSize: "0.64rem", color: "#8b949e" }}>{selectedSpecialist.title}</div>
                </div>

                <div style={{ background: "#161b22", border: "1px solid #21262d", borderRadius: "6px", padding: "8px" }}>
                  <div style={{ fontSize: "0.64rem", color: "#8b949e" }}>EXECUTION RUNTIME</div>
                  <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "#34d399", marginTop: "2px" }}>
                    {isTool ? `${result?.toolResult?.latencyMs || 0}ms (Native TS)` : `${result?.llmResult?.latencyMs || 0}ms (Groq)`}
                  </div>
                  <div style={{ fontSize: "0.64rem", color: "#8b949e" }}>
                    {isTool ? "100% Mathematical Precision" : "~280 tokens/sec"}
                  </div>
                </div>

                <div style={{ background: "#161b22", border: "1px solid #21262d", borderRadius: "6px", padding: "8px" }}>
                  <div style={{ fontSize: "0.64rem", color: "#8b949e" }}>TOKENS CONSUMED</div>
                  <div style={{ fontSize: "0.85rem", fontWeight: 600, color: isTool ? "#10b981" : "#818cf8", marginTop: "2px" }}>
                    {isTool ? "0 Tokens (Saved ~380)" : `${result?.llmResult?.usage?.totalTokens || 0} tokens`}
                  </div>
                  <div style={{ fontSize: "0.64rem", color: "#8b949e" }}>
                    {isTool ? "100% Free Deterministic Run" : "Standard LPU Billing"}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: TOOL SELECTION MATRIX (ALL 5 TOOLS COMPARED) */}
          {activeTab === "matrix" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ fontSize: "0.72rem", color: "#8b949e", marginBottom: "4px" }}>
                REGISTRY CANDIDATES EVALUATED BY JEV SYSTEM ONE:
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {REGISTRY_SPECIALISTS.map((s) => {
                  const isSelected = isTool ? s.toolType === selectedToolChoice : s.id === "groq";

                  return (
                    <div
                      key={s.id}
                      style={{
                        padding: "8px 10px",
                        borderRadius: "6px",
                        background: isSelected ? "#14271c" : "#161b22",
                        border: isSelected ? "1.5px solid #059669" : "1px solid #21262d",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "10px",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <img
                          src={s.avatar}
                          alt={s.specialistName}
                          style={{ width: "24px", height: "24px", borderRadius: "4px", border: "1px solid #30363d", objectFit: "cover" }}
                        />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: "0.74rem", color: isSelected ? "#34d399" : "#f3f4f6" }}>
                            {s.specialistName} ({s.name})
                          </div>
                          <div style={{ fontSize: "0.64rem", color: "#8b949e" }}>
                            {s.department}
                          </div>
                        </div>
                      </div>

                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        {isSelected ? (
                          <span
                            style={{
                              fontSize: "0.62rem",
                              fontWeight: 700,
                              background: "#059669",
                              color: "#ffffff",
                              borderRadius: "4px",
                              padding: "2px 7px",
                            }}
                          >
                            ★ CHOSEN TOOL
                          </span>
                        ) : (
                          <span style={{ fontSize: "0.62rem", color: "#8b949e" }}>
                            Not Selected
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB: TRANSFORMATION DETAILS */}
          {activeTab === "transform" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div>
                <span style={{ fontSize: "0.66rem", color: "#60a5fa", fontWeight: 600 }}>1. PROMPT INGESTION:</span>
                <pre style={{ background: "#161b22", border: "1px solid #21262d", padding: "7px 10px", borderRadius: "5px", fontSize: "0.7rem", color: "#f3f4f6", marginTop: "3px" }}>
                  {promptDetails.rawPrompt || result?.userPrompt}
                </pre>
              </div>

              <div>
                <span style={{ fontSize: "0.66rem", color: "#38bdf8", fontWeight: 600 }}>2. JEV DECISION ROUTING:</span>
                <pre style={{ background: "#161b22", border: "1px solid #21262d", padding: "7px 10px", borderRadius: "5px", fontSize: "0.68rem", color: "#93c5fd", marginTop: "3px" }}>
                  {JSON.stringify(
                    {
                      intent: result?.decision.intent.choice,
                      selectedTool: result?.decision.tool.choice,
                      modelTier: result?.decision.modelTier.choice,
                      riskScore: result?.decision.risk.score,
                    },
                    null,
                    2
                  )}
                </pre>
              </div>

              <div>
                <span style={{ fontSize: "0.66rem", color: "#34d399", fontWeight: 600 }}>
                  3. {isTool ? `TOOL OUTPUT (${selectedToolChoice})` : "GROQ LLM GENERATION"}:
                </span>
                <pre style={{ background: "#161b22", border: "1px solid #21262d", padding: "7px 10px", borderRadius: "5px", fontSize: "0.68rem", color: "#d1d5db", marginTop: "3px", maxHeight: "120px", overflowY: "auto" }}>
                  {result?.toolResult
                    ? JSON.stringify(result.toolResult.output, null, 2)
                    : result?.llmResult
                    ? result.llmResult.content
                    : "No payload"}
                </pre>
              </div>
            </div>
          )}

          {/* TAB: PROBABILITIES */}
          {activeTab === "probabilities" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ fontSize: "0.72rem", color: "#8b949e" }}>
                JEV SYSTEM ONE MULTI-HEADED PROBABILITIES:
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px", fontSize: "0.68rem" }}>
                  <span>Intent: <strong>{result?.decision.intent.choice}</strong></span>
                  <span style={{ color: "#60a5fa" }}>{(((result?.decision.intent.confidence || 0)) * 100).toFixed(0)}%</span>
                </div>
                <div style={{ width: "100%", height: "6px", background: "#21262d", borderRadius: "3px", overflow: "hidden" }}>
                  <div style={{ width: `${(result?.decision.intent.confidence || 0) * 100}%`, height: "100%", background: "#2563eb" }} />
                </div>
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px", fontSize: "0.68rem" }}>
                  <span>Tool Chosen: <strong>{result?.decision.tool.choice}</strong></span>
                  <span style={{ color: "#34d399" }}>{(((result?.decision.tool.confidence || 0)) * 100).toFixed(0)}%</span>
                </div>
                <div style={{ width: "100%", height: "6px", background: "#21262d", borderRadius: "3px", overflow: "hidden" }}>
                  <div style={{ width: `${(result?.decision.tool.confidence || 0) * 100}%`, height: "100%", background: "#059669" }} />
                </div>
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px", fontSize: "0.68rem" }}>
                  <span>Operational Risk Score: <strong>{result?.decision.risk.score.toFixed(2)} / 3.00</strong></span>
                  <span style={{ color: isHighRisk ? "#ef4444" : "#34d399" }}>
                    {isHighRisk ? "Quarantine Triggered" : "Safe Zone (< 2.00)"}
                  </span>
                </div>
                <div style={{ width: "100%", height: "6px", background: "#21262d", borderRadius: "3px", overflow: "hidden" }}>
                  <div
                    style={{
                      width: `${((result?.decision.risk.score || 0) / 3.0) * 100}%`,
                      height: "100%",
                      background: isHighRisk ? "#dc2626" : "#059669",
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB: JSON RAW TELEMETRY */}
          {activeTab === "json" && (
            <pre
              style={{
                background: "#161b22",
                border: "1px solid #21262d",
                padding: "8px",
                borderRadius: "5px",
                fontSize: "0.66rem",
                color: "#9ca3af",
                overflowX: "auto",
                fontFamily: "var(--font-mono)",
              }}
            >
              {JSON.stringify(result, null, 2)}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}
