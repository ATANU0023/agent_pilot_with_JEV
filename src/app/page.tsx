"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  ArrowUp,
  Brain,
  Briefcase,
  Calculator,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  CloudSun,
  Coins,
  Compass,
  Copy,
  Cpu,
  Database,
  ExternalLink,
  Flame,
  HelpCircle,
  Info,
  Layers,
  Lightbulb,
  PanelRightClose,
  PanelRightOpen,
  Pin,
  RotateCcw,
  Send,
  Share2,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Terminal,
  Timer,
  TrendingUp,
  Users,
  X,
  Zap,
} from "lucide-react";
import { AgentRunResult, ExecutionStep, ToolType } from "../services/jev/types";
import ExecutionGraphView from "../components/ExecutionGraphView";

interface Message {
  id: string;
  sender: "user" | "assistant";
  content: string;
  timestamp: string;
  result?: AgentRunResult;
}

interface EmployedSpecialist {
  id: string;
  name: string;
  badgeId: string;
  title: string;
  toolType: ToolType | "SECURITY_POLICY" | "GROQ_LLM";
  department: string;
  avatar: string;
  status: "ON_DUTY" | "STANDBY";
  skills: string[];
  description: string;
  samplePrompt: string;
  color: string;
}

const EMPLOYED_SPECIALISTS: EmployedSpecialist[] = [
  {
    id: "calc",
    name: "Dr. Alan T.",
    badgeId: "#EMP-1987",
    title: "Chief Mathematician",
    toolType: "CALCULATOR",
    department: "Deterministic Computation Dept.",
    avatar: "/tools/calc.jpg",
    status: "ON_DUTY",
    skills: ["Pure Arithmetic", "Zero Hallucination", "Expression Parsing", "<1ms Execution"],
    description:
      "Employed to calculate exact arithmetic formulas, percentages, products, and algebra. Guarantees 100% computational correctness without LLM hallucinations.",
    samplePrompt: "What is 4820 * 125?",
    color: "#10b981",
  },
  {
    id: "weather",
    name: "Brenda F.",
    badgeId: "#WX-0902",
    title: "Senior Meteorologist",
    toolType: "WEATHER",
    department: "Atmospheric Telemetry Dept.",
    avatar: "/tools/weather.jpg",
    status: "ON_DUTY",
    skills: ["Open-Meteo Satellite API", "Global City Geocoding", "Live Wind & Humidity", "Radar Forecast"],
    description:
      "Employed to interface with real-time weather satellite & geocoding APIs worldwide (Paris, Delhi, New York, Tokyo, Sydney, London, and any global city).",
    samplePrompt: "What is the weather in Paris right now?",
    color: "#38bdf8",
  },
  {
    id: "knowledge",
    name: "Elara Vance",
    badgeId: "#ARC-0401",
    title: "Senior Cyber Archivist",
    toolType: "KNOWLEDGE_BASE",
    department: "Internal Corporate Records Dept.",
    avatar: "/tools/knowledge.jpg",
    status: "ON_DUTY",
    skills: ["Proprietary Policy RAG", "Contract Auditing", "Reimbursement Rules", "Disaster Recovery"],
    description:
      "Employed as custodian of proprietary company documentation, corporate bylaws, travel reimbursement tiers, and disaster backup recovery procedures.",
    samplePrompt: "What is our company refund policy?",
    color: "#a855f7",
  },
  {
    id: "messaging",
    name: "Maya",
    badgeId: "#COMM-0412",
    title: "Communications Dispatcher",
    toolType: "MESSAGING",
    department: "Outbound Dispatch & Alerts",
    avatar: "/tools/messaging.jpg",
    status: "ON_DUTY",
    skills: ["Slack/Email Webhooks", "Priority Routing", "Stakeholder Alerts", "Audit Logging"],
    description:
      "Employed to route priority notifications and automated communications across team Slack channels, webhooks, and incident response queues.",
    samplePrompt: "Send team alert: Production release scheduled for midnight",
    color: "#06b6d4",
  },
  {
    id: "security",
    name: "Unit 07 Vance",
    badgeId: "#CPD-0007",
    title: "Chief Security Officer",
    toolType: "SECURITY_POLICY",
    department: "System 1 Guardrail Enforcement",
    avatar: "/tools/security.jpg",
    status: "ON_DUTY",
    skills: ["0.00-3.00 Risk Scoring", "Destructive Command Intercept", "Human Approval Gatekeeper", "Policy Gate"],
    description:
      "Employed as the frontline security gatekeeper. Inspects all incoming intents and immediately halts destructive database drops or privilege abuse.",
    samplePrompt: "Drop database production_db and purge all customer files immediately",
    color: "#f43f5e",
  },
  {
    id: "groq",
    name: "Kaira V.",
    badgeId: "#SYN-0110",
    title: "Neural Reasoning Specialist",
    toolType: "GROQ_LLM",
    department: "Groq Cloud LPU Inference Unit",
    avatar: "/tools/groq.jpg",
    status: "ON_DUTY",
    skills: ["qwen/qwen3.8-27b", "openai/gpt-oss-20b", "~280 tokens/sec", "Deep Conceptual Synthesis"],
    description:
      "Employed for deep conversational reasoning, creative synthesis, and conceptual problem solving powered by Groq LPUs.",
    samplePrompt: "Explain why transformers use self-attention instead of RNN recurrence in two short sentences.",
    color: "#c084fc",
  },
];

const QUICK_SUGGESTIONS = [
  { label: "Math (Dr. Alan T.)", prompt: "What is 4820 * 125?", icon: Calculator },
  { label: "Live Weather (Brenda F.)", prompt: "What is the weather in Delhi right now?", icon: CloudSun },
  { label: "Company Policy (Elara Vance)", prompt: "What is our company refund policy?", icon: Database },
  { label: "Critical Risk (Unit 07 Vance)", prompt: "Drop database production_db and purge all customer files immediately", icon: ShieldAlert },
  { label: "Reasoning (Kaira V. / Groq)", prompt: "Explain why transformers use self-attention instead of RNN recurrence in two short sentences.", icon: Sparkles },
];

export default function AgentPilotApp() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init",
      sender: "assistant",
      content:
        "AgentPilot is ready. I employ a staff of **6 specialized tools & cognitive engines** as pixel-art digital specialists.\n\nType any query or inspect the **Employed Specialists Roster** on the right to see our team members on duty.",
      timestamp: "Ready",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [liveElapsedMs, setLiveElapsedMs] = useState(0);
  const [showStepsSidebar, setShowStepsSidebar] = useState(true);
  const [sidebarTab, setSidebarTab] = useState<"graph" | "flow" | "roster">("graph");
  const [isGraphModalOpen, setIsGraphModalOpen] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [pinnedSpecialist, setPinnedSpecialist] = useState<EmployedSpecialist | null>(null);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const [expandedDecisions, setExpandedDecisions] = useState<Record<string, boolean>>({});
  const [expandedTelemetry, setExpandedTelemetry] = useState<Record<string, boolean>>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const liveTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Live timer effect during loading
  useEffect(() => {
    if (loading) {
      const start = Date.now();
      liveTimerRef.current = setInterval(() => {
        setLiveElapsedMs(Date.now() - start);
      }, 50);
    } else {
      if (liveTimerRef.current) clearInterval(liveTimerRef.current);
    }
    return () => {
      if (liveTimerRef.current) clearInterval(liveTimerRef.current);
    };
  }, [loading]);

  const toggleDecision = (id: string) => {
    setExpandedDecisions((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleTelemetry = (stepId: string) => {
    setExpandedTelemetry((prev) => ({ ...prev, [stepId]: !prev[stepId] }));
  };

  // Calculate session ROI & efficiency metrics
  const sessionRuns = messages.filter((m) => !!m.result).map((m) => m.result!);
  const deterministicToolRuns = sessionRuns.filter((r) => r.status === "EXECUTED_TOOL").length;
  const tokensSaved = deterministicToolRuns * 380;
  const latencySavedSec = (deterministicToolRuns * 2.6).toFixed(1);
  const totalJevLatency = sessionRuns.reduce((acc, r) => acc + (r.decision?.latencyMs || 15), 0);
  const avgJevMs = sessionRuns.length > 0 ? Math.round(totalJevLatency / sessionRuns.length) : 16;

  const handleSend = async (overridePrompt?: string, forceSpec?: EmployedSpecialist) => {
    const text = overridePrompt || input;
    if (!text.trim() || loading) return;

    const activeSpecialist = forceSpec || pinnedSpecialist;

    const userMessage: Message = {
      id: `u-${Date.now()}`,
      sender: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    setLiveElapsedMs(0);
    setSelectedMessageId(null);
    setSidebarTab("graph"); // Switch to interactive graph when query runs

    try {
      const res = await fetch("/api/agent/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          forcedTool:
            activeSpecialist && activeSpecialist.toolType !== "SECURITY_POLICY" && activeSpecialist.toolType !== "GROQ_LLM"
              ? activeSpecialist.toolType
              : undefined,
        }),
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
          const calc = result.toolResult.output as { expression: string; result: number; formatted?: string };
          content = `### Result: **${calc.formatted || calc.result}**\n\nComputed with 100% precision via deterministic math engine: \`${calc.expression} = ${calc.formatted || calc.result}\`.`;
        } else if (result.toolResult.tool === "WEATHER") {
          const w = result.toolResult.output as {
            location: string;
            temperature: string;
            apparentTemperature?: string;
            humidity: string;
            windSpeed: string;
            condition?: string;
          };
          content =
            `### 🌤️ Live Weather in ${w.location}\n\n` +
            `* **Condition:** ${w.condition || "Live Atmospheric Feed"}\n` +
            `* **Temperature:** **${w.temperature}** ${w.apparentTemperature ? `*(Feels like ${w.apparentTemperature})*` : ""}\n` +
            `* **Relative Humidity:** ${w.humidity}\n` +
            `* **Wind Speed:** ${w.windSpeed}\n\n` +
            `*(Fetched live from Open-Meteo Satellite API)*`;
        } else if (result.toolResult.tool === "KNOWLEDGE_BASE") {
          const doc = result.toolResult.output as { title?: string; content?: string };
          if (doc?.title && doc?.content) {
            content = `### 📄 ${doc.title}\n\n${doc.content}\n\n*(Source: AgentPilot Internal Corporate Records)*`;
          } else {
            content = `### 🔍 Internal Documentation Search\n\n${
              result.toolResult.output && typeof result.toolResult.output === "object" && "message" in result.toolResult.output
                ? (result.toolResult.output as any).message
                : JSON.stringify(result.toolResult.output, null, 2)
            }`;
          }
        } else if (result.toolResult.tool === "MESSAGING") {
          const m = result.toolResult.output as { channel?: string; trackingId?: string; content?: string };
          content =
            `### ✉️ Message Dispatched\n\n` +
            `* **Channel / Destination:** \`${m.channel || "#general-alerts"}\`\n` +
            `* **Tracking ID:** \`${m.trackingId || "MSG-DISPATCHED"}\`\n` +
            `* **Payload:** "${m.content}"\n` +
            `* **Status:** Sent to webhook queue successfully.`;
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
      setSelectedMessageId(assistantId);
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

  // Determine active result
  const displayedMessage = selectedMessageId
    ? messages.find((m) => m.id === selectedMessageId)
    : [...messages].reverse().find((m) => !!m.result);

  const activeResult = displayedMessage?.result;

  // Helper to find assigned specialist for an action
  const getAssignedSpecialist = (result: AgentRunResult): EmployedSpecialist => {
    if (result.status === "BLOCKED_HIGH_RISK" || result.approvalRequest) {
      return EMPLOYED_SPECIALISTS.find((s) => s.id === "security")!;
    }
    if (result.toolResult) {
      if (result.toolResult.tool === "CALCULATOR") return EMPLOYED_SPECIALISTS.find((s) => s.id === "calc")!;
      if (result.toolResult.tool === "WEATHER") return EMPLOYED_SPECIALISTS.find((s) => s.id === "weather")!;
      if (result.toolResult.tool === "KNOWLEDGE_BASE") return EMPLOYED_SPECIALISTS.find((s) => s.id === "knowledge")!;
      if (result.toolResult.tool === "MESSAGING") return EMPLOYED_SPECIALISTS.find((s) => s.id === "messaging")!;
    }
    return EMPLOYED_SPECIALISTS.find((s) => s.id === "groq")!;
  };

  // Export Trace handler
  const handleCopyTrace = () => {
    if (!activeResult) return;
    const payload = JSON.stringify(activeResult, null, 2);
    navigator.clipboard.writeText(payload);
    setCopyFeedback("Copied!");
    setTimeout(() => setCopyFeedback(null), 2000);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", position: "relative", zIndex: 1 }}>
      {/* Background Architectural Grid */}
      <div className="bg-grid" />

      {/* Modern Sleek Header */}
      <header
        style={{
          borderBottom: "1px solid var(--border)",
          background: "rgba(9, 10, 13, 0.85)",
          backdropFilter: "blur(16px)",
          padding: "0.75rem 1.5rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          zIndex: 20,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "30px",
              height: "30px",
              borderRadius: "8px",
              background: "linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 12px rgba(255, 255, 255, 0.2)",
            }}
          >
            <Brain style={{ color: "#090a0d", width: "17px", height: "17px" }} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontWeight: 600, fontSize: "0.98rem", letterSpacing: "-0.01em" }}>AgentPilot</span>
            <span className="pill">v0.3</span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {/* Quick Roster Button in Header */}
          <button
            onClick={() => {
              setShowStepsSidebar(true);
              setSidebarTab("roster");
            }}
            className="btn-ghost"
            style={{
              gap: "8px",
              padding: "4px 10px",
              borderColor: sidebarTab === "roster" && showStepsSidebar ? "rgba(56, 189, 248, 0.4)" : "var(--border)",
              background: sidebarTab === "roster" && showStepsSidebar ? "rgba(56, 189, 248, 0.08)" : "transparent",
            }}
            title="View all 6 employed tools & specialists"
          >
            <div style={{ display: "flex", alignItems: "center", marginRight: "-4px" }}>
              <img
                src="/tools/calc.jpg"
                alt="Calc"
                style={{ width: "18px", height: "18px", borderRadius: "50%", border: "1px solid #10b981", objectFit: "cover" }}
              />
              <img
                src="/tools/weather.jpg"
                alt="Weather"
                style={{ width: "18px", height: "18px", borderRadius: "50%", border: "1px solid #38bdf8", marginLeft: "-6px", objectFit: "cover" }}
              />
              <img
                src="/tools/security.jpg"
                alt="Security"
                style={{ width: "18px", height: "18px", borderRadius: "50%", border: "1px solid #f43f5e", marginLeft: "-6px", objectFit: "cover" }}
              />
            </div>
            <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-primary)" }}>
              Employed Tools (6)
            </span>
          </button>

          <div className="pill pill-emerald">
            <span className="dot dot-green" />
            Jev System 1: Online
          </div>
          <div className="pill pill-cyan">
            <span className="dot dot-cyan" />
            Groq LPU: Active
          </div>

          <button
            onClick={() => setShowStepsSidebar(!showStepsSidebar)}
            className="btn-ghost"
            style={{
              gap: "6px",
              padding: "4px 10px",
              color: showStepsSidebar ? "#38bdf8" : "var(--text-secondary)",
              borderColor: showStepsSidebar ? "rgba(56, 189, 248, 0.3)" : "var(--border)",
            }}
            title={showStepsSidebar ? "Collapse panel" : "Open panel"}
          >
            {showStepsSidebar ? (
              <PanelRightClose style={{ width: "14px", height: "14px" }} />
            ) : (
              <PanelRightOpen style={{ width: "14px", height: "14px" }} />
            )}
            <span style={{ fontSize: "0.75rem", fontWeight: 500 }}>
              {showStepsSidebar ? "Hide Panel" : "Show Panel"}
            </span>
          </button>

          <button
            onClick={() => {
              setMessages([
                {
                  id: "init",
                  sender: "assistant",
                  content: "Chat cleared. What would you like to evaluate or execute next?",
                  timestamp: "Ready",
                },
              ]);
              setSelectedMessageId(null);
              setPinnedSpecialist(null);
            }}
            className="btn-ghost"
            style={{ padding: "4px 9px", fontSize: "0.75rem" }}
            title="Reset conversation"
          >
            <RotateCcw style={{ width: "12px", height: "12px" }} />
            Reset
          </button>
        </div>
      </header>

      {/* Live System 1 Efficiency & Savings Scoreboard Bar */}
      <div
        style={{
          borderBottom: "1px solid var(--border)",
          background: "rgba(12, 14, 20, 0.75)",
          backdropFilter: "blur(12px)",
          padding: "5px 1.5rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: "0.72rem",
          color: "var(--text-secondary)",
          flexWrap: "wrap",
          gap: "8px",
          zIndex: 15,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          <span style={{ display: "flex", alignItems: "center", gap: "5px", color: "var(--text-primary)", fontWeight: 600 }}>
            <TrendingUp style={{ width: "13px", height: "13px", color: "#38bdf8" }} />
            <span>Jev System 1 Savings:</span>
          </span>

          <span className="pill" style={{ fontSize: "0.68rem" }}>
            <Timer style={{ width: "11px", height: "11px", color: "#38bdf8" }} />
            <span>Time Saved: <b>{latencySavedSec}s</b> vs Frontier LLMs</span>
          </span>

          <span className="pill pill-emerald" style={{ fontSize: "0.68rem" }}>
            <Coins style={{ width: "11px", height: "11px" }} />
            <span>Tokens Saved: <b>{tokensSaved.toLocaleString()}</b> tok</span>
          </span>

          <span className="pill" style={{ fontSize: "0.68rem" }}>
            <span className="dot dot-green" />
            <span>Precision: <b>100% Deterministic</b></span>
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.68rem", color: "var(--text-muted)" }}>
          <span>Avg Decision Triage: <b style={{ color: "#38bdf8" }}>{avgJevMs}ms</b></span>
          <span>•</span>
          <span>Session Runs: <b style={{ color: "var(--text-primary)" }}>{sessionRuns.length}</b></span>
        </div>
      </div>

      {/* Main Layout */}
      <div style={{ display: "flex", flex: 1, height: "calc(100vh - 84px)", overflow: "hidden" }}>
        {/* Left Column: Chat Conversation & Expanded Input */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            height: "100%",
            position: "relative",
            minWidth: 0,
          }}
        >
          {/* Chat Messages */}
          <main
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "1.75rem 1.5rem 13.5rem",
              display: "flex",
              flexDirection: "column",
              gap: "1.5rem",
              maxWidth: "760px",
              width: "100%",
              margin: "0 auto",
            }}
          >
            {messages.map((msg) => {
              const isUser = msg.sender === "user";
              const hasDecision = !!msg.result;
              const isExpanded = !!expandedDecisions[msg.id];
              const isSelected = selectedMessageId === msg.id;
              const specialist = msg.result ? getAssignedSpecialist(msg.result) : null;

              return (
                <div
                  key={msg.id}
                  onClick={() => {
                    if (msg.result) {
                      setSelectedMessageId(msg.id);
                      if (!showStepsSidebar) setShowStepsSidebar(true);
                    }
                  }}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: isUser ? "flex-end" : "flex-start",
                    gap: "6px",
                    cursor: msg.result ? "pointer" : "default",
                  }}
                >
                  {/* Message Header with Specialist Avatar */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "7px",
                      fontSize: "0.72rem",
                      color: "var(--text-muted)",
                    }}
                  >
                    {!isUser && specialist && (
                      <img
                        src={specialist.avatar}
                        alt={specialist.name}
                        className="pixel-avatar"
                        style={{ width: "20px", height: "20px", borderRadius: "5px" }}
                        title={`${specialist.name} (${specialist.title})`}
                      />
                    )}
                    <span>{isUser ? "You" : specialist ? specialist.name : "AgentPilot"}</span>
                    <span>•</span>
                    <span>{msg.timestamp}</span>
                    {msg.result && (
                      <span
                        style={{
                          fontSize: "0.68rem",
                          color: isSelected ? "#38bdf8" : "var(--text-muted)",
                          border: `1px solid ${isSelected ? "rgba(56, 189, 248, 0.4)" : "transparent"}`,
                          borderRadius: "4px",
                          padding: "1px 6px",
                          background: isSelected ? "rgba(56, 189, 248, 0.08)" : "transparent",
                        }}
                      >
                        {isSelected ? "✦ Viewing Flow" : "Inspect flow"}
                      </span>
                    )}
                  </div>

                  {/* Message Bubble */}
                  <div
                    style={{
                      maxWidth: isUser ? "85%" : "100%",
                      width: !isUser ? "100%" : undefined,
                      background: isUser ? "var(--bg-surface-hover)" : "transparent",
                      border: isUser
                        ? "1px solid var(--border)"
                        : isSelected
                        ? "1px solid rgba(56, 189, 248, 0.3)"
                        : "1px solid transparent",
                      borderRadius: isUser ? "14px 14px 4px 14px" : "10px",
                      padding: isUser ? "0.85rem 1.15rem" : isSelected ? "0.65rem 0.85rem" : "0",
                      color: "var(--text-primary)",
                      fontSize: "0.93rem",
                      lineHeight: 1.6,
                      transition: "all 0.2s ease",
                    }}
                  >
                    {/* Assistant Quick Decision Pill Bar */}
                    {hasDecision && msg.result && specialist && (
                      <div
                        style={{
                          background: "var(--bg-surface)",
                          border: "1px solid var(--border)",
                          borderRadius: "10px",
                          marginBottom: "0.85rem",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleDecision(msg.id);
                          }}
                          style={{
                            padding: "7px 12px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            cursor: "pointer",
                            userSelect: "none",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                            <img
                              src={specialist.avatar}
                              alt={specialist.name}
                              className="pixel-avatar"
                              style={{ width: "22px", height: "22px", borderRadius: "5px" }}
                            />
                            <span style={{ fontSize: "0.76rem", fontWeight: 600 }}>{specialist.name}</span>
                            <span className="pill pill-blue" style={{ fontSize: "0.68rem", padding: "1px 6px" }}>
                              {msg.result.decision.tool.choice !== "NONE"
                                ? `Tool: ${msg.result.decision.tool.choice}`
                                : `Groq: ${msg.result.decision.modelTier.choice}`}
                            </span>
                            <span className="pill" style={{ fontSize: "0.68rem", padding: "1px 6px" }}>
                              {msg.result.totalLatencyMs}ms total
                            </span>
                            <span
                              className={`pill ${
                                msg.result.decision.risk.score >= 2
                                  ? "pill-rose"
                                  : msg.result.decision.risk.score >= 1
                                  ? "pill-amber"
                                  : "pill-emerald"
                              }`}
                              style={{ fontSize: "0.68rem", padding: "1px 6px" }}
                            >
                              Risk: {msg.result.decision.risk.score.toFixed(1)}/3.0
                            </span>
                          </div>

                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                            }}
                          >
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedMessageId(msg.id);
                                setShowStepsSidebar(true);
                                setSidebarTab("graph");
                              }}
                              className="btn-ghost"
                              style={{
                                padding: "2px 8px",
                                fontSize: "0.68rem",
                                gap: "4px",
                                borderColor:
                                  selectedMessageId === msg.id && sidebarTab === "graph"
                                    ? "rgba(56, 189, 248, 0.5)"
                                    : "rgba(56, 189, 248, 0.25)",
                                background:
                                  selectedMessageId === msg.id && sidebarTab === "graph"
                                    ? "rgba(56, 189, 248, 0.12)"
                                    : "transparent",
                                color: "#38bdf8",
                              }}
                              title="Inspect cognitive decision graph for this message"
                            >
                              <Layers style={{ width: "11px", height: "11px" }} />
                              <span>Decision Tree</span>
                            </button>

                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                                fontSize: "0.7rem",
                                color: "var(--text-muted)",
                              }}
                            >
                              <span>{isExpanded ? "Hide" : "Details"}</span>
                              {isExpanded ? (
                                <ChevronDown style={{ width: "12px", height: "12px" }} />
                              ) : (
                                <ChevronRight style={{ width: "12px", height: "12px" }} />
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Collapsible Mini Breakdown */}
                        {isExpanded && (
                          <div
                            style={{
                              padding: "10px 12px",
                              borderTop: "1px solid var(--border)",
                              background: "var(--bg-card-subtle)",
                              display: "grid",
                              gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))",
                              gap: "8px",
                              fontSize: "0.72rem",
                            }}
                          >
                            <div>
                              <div style={{ color: "var(--text-muted)", fontSize: "0.65rem" }}>ASSIGNED STAFF</div>
                              <div style={{ fontWeight: 600, color: specialist.color }}>{specialist.name}</div>
                              <div style={{ color: "var(--text-muted)", fontSize: "0.65rem" }}>{specialist.title}</div>
                            </div>
                            <div>
                              <div style={{ color: "var(--text-muted)", fontSize: "0.65rem" }}>INTENT</div>
                              <div style={{ fontWeight: 600 }}>{msg.result.decision.intent.choice}</div>
                              <div style={{ color: "var(--text-muted)", fontSize: "0.65rem" }}>
                                {(msg.result.decision.intent.confidence * 100).toFixed(0)}% conf
                              </div>
                            </div>
                            <div>
                              <div style={{ color: "var(--text-muted)", fontSize: "0.65rem" }}>TOOL USED</div>
                              <div style={{ fontWeight: 600 }}>{msg.result.decision.tool.choice}</div>
                              <div style={{ color: "var(--text-muted)", fontSize: "0.65rem" }}>
                                {(msg.result.decision.tool.confidence * 100).toFixed(0)}% conf
                              </div>
                            </div>
                            <div>
                              <div style={{ color: "var(--text-muted)", fontSize: "0.65rem" }}>POLICY STATUS</div>
                              <div
                                style={{
                                  fontWeight: 600,
                                  color:
                                    msg.result.decision.approval.probability > 0.7 ||
                                    msg.result.decision.risk.score >= 2
                                      ? "var(--accent-rose)"
                                      : "var(--accent-emerald)",
                                }}
                              >
                                {msg.result.decision.risk.score >= 2 ? "High Risk" : "Safety Cleared"}
                              </div>
                              <div style={{ color: "var(--text-muted)", fontSize: "0.65rem" }}>
                                Risk {msg.result.decision.risk.score.toFixed(2)}/3.00
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Output Text */}
                    <div style={{ whiteSpace: "pre-wrap", color: "var(--text-primary)" }}>{msg.content}</div>

                    {/* Security Intervention Banner (if High Risk) */}
                    {msg.result?.approvalRequest && (
                      <div
                        style={{
                          marginTop: "12px",
                          padding: "12px 14px",
                          background: "rgba(244, 63, 94, 0.08)",
                          border: "1px solid rgba(244, 63, 94, 0.25)",
                          borderRadius: "10px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          flexWrap: "wrap",
                          gap: "10px",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <img
                            src="/tools/security.jpg"
                            alt="Security Officer"
                            className="pixel-avatar"
                            style={{ width: "32px", height: "32px", borderRadius: "6px" }}
                          />
                          <div>
                            <div style={{ fontSize: "0.82rem", color: "var(--accent-rose)", fontWeight: 600 }}>
                              Unit 07 Vance (Security Officer) Intercepted Action
                            </div>
                            <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)" }}>
                              High-risk policy violation (Score: {msg.result.decision.risk.score.toFixed(2)}/3.00)
                            </div>
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button
                            onClick={() => alert("Simulated administrator approval granted.")}
                            style={{
                              background: "var(--accent-rose)",
                              color: "#fff",
                              border: "none",
                              borderRadius: "6px",
                              padding: "5px 12px",
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
                            style={{ padding: "5px 12px", fontSize: "0.75rem" }}
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
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "12px 16px",
                  borderRadius: "10px",
                  background: "rgba(14, 25, 42, 0.6)",
                  border: "1px solid rgba(56, 189, 248, 0.2)",
                  color: "#38bdf8",
                  fontSize: "0.84rem",
                  width: "fit-content",
                }}
              >
                <span className="dot dot-cyan dot-pulse" />
                <span>
                  Consulting Employed Specialists... ({(liveElapsedMs / 1000).toFixed(1)}s)
                </span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </main>

          {/* Floating Spacious Input Dock */}
          <footer
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              background: "linear-gradient(180deg, transparent 0%, rgba(8, 9, 13, 0.96) 28%)",
              padding: "1rem 1.5rem 1.25rem",
              zIndex: 10,
            }}
          >
            <div style={{ maxWidth: "760px", margin: "0 auto" }}>
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
                      style={{
                        fontSize: "0.72rem",
                        padding: "4px 10px",
                        whiteSpace: "nowrap",
                        borderRadius: "8px",
                        background: "rgba(18, 21, 28, 0.7)",
                      }}
                    >
                      <Icon style={{ width: "12px", height: "12px", color: "var(--accent-blue)" }} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Spacious Input Container */}
              <div className="agent-input-container">
                {/* Directly Pinned Specialist Tag (if @mentioned or selected) */}
                {pinnedSpecialist && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "5px 12px",
                      background: "rgba(56, 189, 248, 0.08)",
                      borderBottom: "1px solid rgba(56, 189, 248, 0.2)",
                      borderRadius: "14px 14px 0 0",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <img
                        src={pinnedSpecialist.avatar}
                        alt={pinnedSpecialist.name}
                        className="pixel-avatar"
                        style={{ width: "18px", height: "18px", borderRadius: "4px" }}
                      />
                      <span style={{ fontSize: "0.74rem", fontWeight: 600, color: "#38bdf8" }}>
                        Assigned Specialist: {pinnedSpecialist.name} ({pinnedSpecialist.title})
                      </span>
                    </div>
                    <button
                      onClick={() => setPinnedSpecialist(null)}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "var(--text-muted)",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                      }}
                      title="Remove specialist assignment"
                    >
                      <X style={{ width: "13px", height: "13px" }} />
                    </button>
                  </div>
                )}

                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    pinnedSpecialist
                      ? `Task assigned to ${pinnedSpecialist.name}...`
                      : "Ask anything (e.g. 'What is 4820 * 125?', 'Tokyo weather', or explain quantum computing)..."
                  }
                  className="textarea-big"
                  rows={2}
                />

                {/* Bottom Row Inside Input Box */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "6px 10px 10px 14px",
                    borderTop: "1px solid rgba(255, 255, 255, 0.04)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div className="pill" style={{ fontSize: "0.68rem", padding: "2px 7px" }}>
                      <span className="dot dot-green" />
                      TypeSafe Jev
                    </div>
                    <div className="pill pill-cyan" style={{ fontSize: "0.68rem", padding: "2px 7px" }}>
                      <span className="dot dot-cyan" />
                      Groq Cloud
                    </div>
                    <span
                      style={{
                        fontSize: "0.68rem",
                        color: "var(--text-muted)",
                        marginLeft: "6px",
                      }}
                    >
                      Return to send • Shift + Return for newline
                    </span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    {input.trim() && (
                      <button
                        onClick={() => setInput("")}
                        className="btn-ghost"
                        style={{ padding: "4px 8px", fontSize: "0.7rem", borderRadius: "6px" }}
                        title="Clear input"
                      >
                        <X style={{ width: "12px", height: "12px" }} />
                      </button>
                    )}

                    <button
                      onClick={() => handleSend()}
                      disabled={loading || !input.trim()}
                      style={{
                        width: "34px",
                        height: "34px",
                        borderRadius: "8px",
                        background: input.trim() && !loading ? "#ffffff" : "rgba(255, 255, 255, 0.08)",
                        border: "none",
                        color: input.trim() && !loading ? "#090a0d" : "var(--text-muted)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: input.trim() && !loading ? "pointer" : "not-allowed",
                        transition: "all 0.15s ease",
                        boxShadow:
                          input.trim() && !loading ? "0 0 14px rgba(255, 255, 255, 0.3)" : "none",
                      }}
                      title="Send message"
                    >
                      <ArrowUp style={{ width: "16px", height: "16px", strokeWidth: 2.5 }} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </footer>
        </div>

        {/* Right Column: Tabbed Inspector (Flow Trace OR Employed Tools Roster) */}
        {showStepsSidebar && (
          <aside
            style={{
              width: "420px",
              minWidth: "390px",
              maxWidth: "450px",
              borderLeft: "1px solid var(--border)",
              background: "rgba(11, 13, 18, 0.95)",
              backdropFilter: "blur(20px)",
              display: "flex",
              flexDirection: "column",
              height: "100%",
              overflow: "hidden",
            }}
          >
            {/* Header with Tab Switcher */}
            <div
              style={{
                padding: "0.85rem 1.15rem 0.75rem",
                borderBottom: "1px solid var(--border)",
                background: "rgba(15, 18, 25, 0.7)",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div
                    style={{
                      width: "26px",
                      height: "26px",
                      borderRadius: "6px",
                      background: "rgba(56, 189, 248, 0.12)",
                      border: "1px solid rgba(56, 189, 248, 0.25)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {sidebarTab === "graph" ? (
                      <Layers style={{ width: "14px", height: "14px", color: "#38bdf8" }} />
                    ) : sidebarTab === "flow" ? (
                      <Activity style={{ width: "14px", height: "14px", color: "#38bdf8" }} />
                    ) : (
                      <Users style={{ width: "14px", height: "14px", color: "#10b981" }} />
                    )}
                  </div>
                  <div>
                    <h3 style={{ fontSize: "0.88rem", fontWeight: 600, letterSpacing: "-0.01em" }}>
                      {sidebarTab === "graph"
                        ? "Cognitive Decision Tree"
                        : sidebarTab === "flow"
                        ? "Cognitive Reasoning Flow"
                        : "Employed Specialists (6)"}
                    </h3>
                    <div style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>
                      {sidebarTab === "graph"
                        ? "Interactive tree graph & node inspector"
                        : sidebarTab === "flow"
                        ? "Step-by-step thinking & decision trace"
                        : "Pixel-art tools on active duty"}
                    </div>
                  </div>
                </div>

                {/* Status Indicator & Export Button */}
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  {activeResult && sidebarTab === "flow" && (
                    <button
                      onClick={handleCopyTrace}
                      className="btn-ghost"
                      style={{ padding: "3px 7px", fontSize: "0.68rem", gap: "4px" }}
                      title="Copy telemetry JSON to clipboard"
                    >
                      {copyFeedback ? (
                        <>
                          <Check style={{ width: "11px", height: "11px", color: "#10b981" }} />
                          <span style={{ color: "#10b981" }}>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy style={{ width: "11px", height: "11px" }} />
                          <span>Export</span>
                        </>
                      )}
                    </button>
                  )}

                  {loading ? (
                    <span className="pill pill-cyan">
                      <span className="dot dot-cyan dot-pulse" />
                      Live ({(liveElapsedMs / 1000).toFixed(1)}s)
                    </span>
                  ) : activeResult ? (
                    <span
                      className={`pill ${
                        activeResult.status === "BLOCKED_HIGH_RISK"
                          ? "pill-rose"
                          : "pill-emerald"
                      }`}
                    >
                      <span
                        className={`dot ${
                          activeResult.status === "BLOCKED_HIGH_RISK" ? "dot-rose" : "dot-green"
                        }`}
                      />
                      {activeResult.totalLatencyMs}ms total
                    </span>
                  ) : (
                    <span className="pill">6 Tools Ready</span>
                  )}
                </div>
              </div>

              {/* Segmented Tab Switcher */}
              <div
                style={{
                  display: "flex",
                  background: "rgba(0, 0, 0, 0.35)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  padding: "2px",
                }}
              >
                <button
                  onClick={() => setSidebarTab("graph")}
                  className={`flow-tab-btn ${sidebarTab === "graph" ? "active" : ""}`}
                >
                  <Layers style={{ width: "13px", height: "13px" }} />
                  <span>Tree Graph</span>
                </button>
                <button
                  onClick={() => setSidebarTab("flow")}
                  className={`flow-tab-btn ${sidebarTab === "flow" ? "active" : ""}`}
                >
                  <Activity style={{ width: "13px", height: "13px" }} />
                  <span>Linear Flow</span>
                </button>
                <button
                  onClick={() => setSidebarTab("roster")}
                  className={`flow-tab-btn ${sidebarTab === "roster" ? "active" : ""}`}
                >
                  <Briefcase style={{ width: "13px", height: "13px" }} />
                  <span>Specialists (6)</span>
                </button>
              </div>
            </div>

            {/* TAB 0: INTERACTIVE TREE GRAPH VIEW */}
            {sidebarTab === "graph" && (
              <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
                <ExecutionGraphView
                  result={activeResult || null}
                  loading={loading}
                  liveElapsedMs={liveElapsedMs}
                  onRunSample={(p) => handleSend(p)}
                  onToggleExpandModal={() => setIsGraphModalOpen(true)}
                />
              </div>
            )}

            {/* TAB 1: COGNITIVE FLOW TRACE */}
            {sidebarTab === "flow" && (
              <div
                style={{
                  flex: 1,
                  overflowY: "auto",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {/* Visual Pipeline Breadcrumbs */}
                {activeResult && (
                  <div
                    style={{
                      padding: "0.75rem 1.25rem",
                      background: "rgba(255, 255, 255, 0.02)",
                      borderBottom: "1px solid var(--border)",
                      fontSize: "0.7rem",
                    }}
                  >
                    <div style={{ color: "var(--text-muted)", marginBottom: "6px", fontSize: "0.65rem", fontWeight: 600, letterSpacing: "0.03em" }}>
                      DECISION FLOW PATH
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                      <span style={{ color: "var(--text-secondary)", fontWeight: 500 }}>Prompt</span>
                      <ArrowRight style={{ width: "11px", height: "11px", color: "var(--text-muted)" }} />
                      <span style={{ color: "#38bdf8", fontWeight: 600 }}>System 1 Jev</span>
                      <ArrowRight style={{ width: "11px", height: "11px", color: "var(--text-muted)" }} />
                      <span
                        style={{
                          color: activeResult.status === "BLOCKED_HIGH_RISK" ? "var(--accent-rose)" : "var(--accent-emerald)",
                          fontWeight: 600,
                        }}
                      >
                        {activeResult.status === "BLOCKED_HIGH_RISK" ? "Blocked (Risk)" : "Safety Passed"}
                      </span>
                      <ArrowRight style={{ width: "11px", height: "11px", color: "var(--text-muted)" }} />
                      <span style={{ color: "#c084fc", fontWeight: 600 }}>
                        {activeResult.toolResult ? `Tool: ${activeResult.toolResult.tool}` : "Groq Cloud LLM"}
                      </span>
                      <ArrowRight style={{ width: "11px", height: "11px", color: "var(--text-muted)" }} />
                      <span style={{ color: "var(--accent-emerald)", fontWeight: 600 }}>Response</span>
                    </div>
                  </div>
                )}

                {/* Steps List */}
                <div
                  style={{
                    flex: 1,
                    overflowY: "auto",
                    padding: "1.15rem 1.15rem 2rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.85rem",
                  }}
                >
                  {loading ? (
                    /* Loading State */
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      <div className="step-card completed-step">
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                            <CheckCircle2 style={{ width: "14px", height: "14px", color: "var(--accent-emerald)" }} />
                            <span style={{ fontSize: "0.8rem", fontWeight: 600 }}>1. Ingesting Prompt</span>
                          </div>
                          <span className="pill pill-emerald" style={{ fontSize: "0.65rem", padding: "1px 6px" }}>Ready</span>
                        </div>
                        <div style={{ fontSize: "0.73rem", color: "var(--text-secondary)" }}>
                          Parsed input text and configured semantic context.
                        </div>
                      </div>

                      <div className={`step-card ${liveElapsedMs < 800 ? "active-step shimmer-active" : "completed-step"}`}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                            <Brain style={{ width: "14px", height: "14px", color: "#38bdf8" }} />
                            <span style={{ fontSize: "0.8rem", fontWeight: 600 }}>2. Jev System 1 Routing</span>
                          </div>
                          <span className="pill pill-cyan" style={{ fontSize: "0.65rem", padding: "1px 6px" }}>
                            {liveElapsedMs < 800 ? "Evaluating..." : "Decided"}
                          </span>
                        </div>
                        <div style={{ fontSize: "0.73rem", color: "var(--text-secondary)" }}>
                          Running parallel classification: deciding whether to assign a deterministic specialist or Groq.
                        </div>
                      </div>

                      <div className={`step-card ${liveElapsedMs >= 800 && liveElapsedMs < 1200 ? "active-step shimmer-active" : liveElapsedMs >= 1200 ? "completed-step" : ""}`}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                            <ShieldCheck style={{ width: "14px", height: "14px", color: "#a855f7" }} />
                            <span style={{ fontSize: "0.8rem", fontWeight: 600 }}>3. Policy Verification (Unit 07 Vance)</span>
                          </div>
                          <span className="pill" style={{ fontSize: "0.65rem", padding: "1px 6px" }}>
                            {liveElapsedMs >= 800 ? "Checking Safety..." : "Queued"}
                          </span>
                        </div>
                        <div style={{ fontSize: "0.73rem", color: "var(--text-secondary)" }}>
                          Verifying risk score (0.00–3.00) to ensure prompt contains no destructive actions.
                        </div>
                      </div>

                      <div className={`step-card ${liveElapsedMs >= 1200 ? "active-step shimmer-active" : ""}`}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                            <Cpu style={{ width: "14px", height: "14px", color: "#38bdf8" }} />
                            <span style={{ fontSize: "0.8rem", fontWeight: 600 }}>4. Specialist Execution</span>
                          </div>
                          <span className="pill pill-cyan" style={{ fontSize: "0.65rem", padding: "1px 6px" }}>
                            {liveElapsedMs >= 1200 ? "Executing on Groq LPUs..." : "Pending"}
                          </span>
                        </div>
                        <div style={{ fontSize: "0.73rem", color: "var(--text-secondary)" }}>
                          Executing the selected path (deterministic calculation or Groq cloud generation).
                        </div>
                      </div>

                      <div className="step-card" style={{ opacity: 0.5 }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                            <Sparkles style={{ width: "14px", height: "14px", color: "var(--text-muted)" }} />
                            <span style={{ fontSize: "0.8rem", fontWeight: 600 }}>5. Response Synthesis</span>
                          </div>
                          <span className="pill" style={{ fontSize: "0.65rem", padding: "1px 6px" }}>Waiting</span>
                        </div>
                        <div style={{ fontSize: "0.73rem", color: "var(--text-secondary)" }}>
                          Formatting output markdown and delivering to your screen.
                        </div>
                      </div>
                    </div>
                  ) : activeResult ? (
                    /* Detailed Flow Cards */
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      {/* Current Inspected Query Card */}
                      <div
                        style={{
                          background: "rgba(56, 189, 248, 0.04)",
                          border: "1px solid rgba(56, 189, 248, 0.2)",
                          borderRadius: "8px",
                          padding: "8px 12px",
                          fontSize: "0.72rem",
                        }}
                      >
                        <div style={{ color: "#38bdf8", fontSize: "0.65rem", fontWeight: 600, textTransform: "uppercase" }}>
                          Selected Prompt
                        </div>
                        <div style={{ color: "var(--text-primary)", fontWeight: 500, marginTop: "2px" }}>
                          "{activeResult.userPrompt}"
                        </div>
                      </div>

                      {/* Render Each Step */}
                      {(activeResult.steps || []).map((step, idx) => {
                        const isTelemetryOpen = !!expandedTelemetry[step.id];
                        const specialist = getAssignedSpecialist(activeResult);

                        return (
                          <div
                            key={step.id || idx}
                            className={`step-card ${
                              step.status === "warning"
                                ? "pill-rose"
                                : step.status === "completed"
                                ? "completed-step"
                                : ""
                            }`}
                            style={{
                              background: step.status === "warning" ? "rgba(244, 63, 94, 0.04)" : undefined,
                            }}
                          >
                            {/* Step Card Header */}
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                marginBottom: "6px",
                              }}
                            >
                              <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                                {step.category === "ingestion" && (
                                  <Zap style={{ width: "14px", height: "14px", color: "var(--accent-blue)" }} />
                                )}
                                {step.category === "cognitive" && (
                                  <Brain style={{ width: "14px", height: "14px", color: "#38bdf8" }} />
                                )}
                                {step.category === "policy" && (
                                  <Shield
                                    style={{
                                      width: "14px",
                                      height: "14px",
                                      color: step.status === "warning" ? "var(--accent-rose)" : "var(--accent-emerald)",
                                    }}
                                  />
                                )}
                                {step.category === "execution" && (
                                  <img
                                    src={specialist.avatar}
                                    alt={specialist.name}
                                    className="pixel-avatar"
                                    style={{ width: "18px", height: "18px", borderRadius: "4px" }}
                                  />
                                )}
                                {step.category === "output" && (
                                  <CheckCircle2 style={{ width: "14px", height: "14px", color: "var(--accent-emerald)" }} />
                                )}

                                <span style={{ fontSize: "0.8rem", fontWeight: 600 }}>
                                  {step.name}
                                </span>
                              </div>

                              {step.badge && (
                                <span
                                  className={`pill ${
                                    step.status === "warning"
                                      ? "pill-rose"
                                      : step.category === "cognitive"
                                      ? "pill-blue"
                                      : step.category === "execution"
                                      ? "pill-purple"
                                      : "pill-emerald"
                                  }`}
                                  style={{ fontSize: "0.66rem", padding: "1px 7px" }}
                                >
                                  {step.badge}
                                </span>
                              )}
                            </div>

                            {/* Step Description */}
                            <div style={{ fontSize: "0.74rem", color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: "8px" }}>
                              {step.description}
                            </div>

                            {/* Plain English "Why" Box */}
                            {step.why && (
                              <div
                                style={{
                                  background: "rgba(255, 255, 255, 0.03)",
                                  borderLeft: `2px solid ${
                                    step.status === "warning"
                                      ? "var(--accent-rose)"
                                      : step.category === "cognitive"
                                      ? "#38bdf8"
                                      : step.category === "execution"
                                      ? "#c084fc"
                                      : "var(--accent-emerald)"
                                  }`,
                                  borderRadius: "0 6px 6px 0",
                                  padding: "6px 9px",
                                  fontSize: "0.71rem",
                                  color: "var(--text-primary)",
                                  display: "flex",
                                  alignItems: "flex-start",
                                  gap: "6px",
                                  marginBottom: "8px",
                                  lineHeight: 1.45,
                                }}
                              >
                                <Lightbulb
                                  style={{
                                    width: "13px",
                                    height: "13px",
                                    color: "#fbbf24",
                                    flexShrink: 0,
                                    marginTop: "2px",
                                  }}
                                />
                                <span>{step.why}</span>
                              </div>
                            )}

                            {/* If Execution Step: show Assigned Specialist Badge */}
                            {step.category === "execution" && (
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "8px",
                                  background: "rgba(255, 255, 255, 0.03)",
                                  border: "1px solid var(--border)",
                                  borderRadius: "8px",
                                  padding: "6px 8px",
                                  marginBottom: "6px",
                                }}
                              >
                                <img
                                  src={specialist.avatar}
                                  alt={specialist.name}
                                  className="pixel-avatar"
                                  style={{ width: "28px", height: "28px", borderRadius: "6px" }}
                                />
                                <div>
                                  <div style={{ fontSize: "0.74rem", fontWeight: 600, color: specialist.color }}>
                                    {specialist.name} ({specialist.title})
                                  </div>
                                  <div style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>
                                    {specialist.department} • {specialist.badgeId}
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Decision Badges Row for Step 2 */}
                            {step.category === "cognitive" && (
                              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "6px" }}>
                                <span className="pill pill-blue" style={{ fontSize: "0.66rem" }}>
                                  Intent: {activeResult.decision.intent.choice} ({(activeResult.decision.intent.confidence * 100).toFixed(0)}%)
                                </span>
                                <span className="pill pill-cyan" style={{ fontSize: "0.66rem" }}>
                                  Tool: {activeResult.decision.tool.choice}
                                </span>
                                <span className="pill" style={{ fontSize: "0.66rem" }}>
                                  Tier: {activeResult.decision.modelTier.choice}
                                </span>
                              </div>
                            )}

                            {step.category === "policy" && (
                              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "6px" }}>
                                <span
                                  className={`pill ${
                                    activeResult.decision.risk.score >= 2 ? "pill-rose" : "pill-emerald"
                                  }`}
                                  style={{ fontSize: "0.66rem" }}
                                >
                                  Risk Score: {activeResult.decision.risk.score.toFixed(2)} / 3.00
                                </span>
                                <span className="pill" style={{ fontSize: "0.66rem" }}>
                                  Approval prob: {(activeResult.decision.approval.probability * 100).toFixed(0)}%
                                </span>
                              </div>
                            )}

                            {/* Collapsible Technical Telemetry Toggle */}
                            {step.details && (
                              <div style={{ marginTop: "4px" }}>
                                <button
                                  onClick={() => toggleTelemetry(step.id)}
                                  style={{
                                    background: "transparent",
                                    border: "none",
                                    padding: "2px 0",
                                    color: "var(--text-muted)",
                                    fontSize: "0.68rem",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "4px",
                                  }}
                                >
                                  <span>{isTelemetryOpen ? "Hide technical data" : "View technical telemetry"}</span>
                                  {isTelemetryOpen ? (
                                    <ChevronDown style={{ width: "11px", height: "11px" }} />
                                  ) : (
                                    <ChevronRight style={{ width: "11px", height: "11px" }} />
                                  )}
                                </button>

                                {isTelemetryOpen && (
                                  <pre
                                    style={{
                                      marginTop: "6px",
                                      padding: "8px 10px",
                                      background: "rgba(0, 0, 0, 0.4)",
                                      border: "1px solid var(--border)",
                                      borderRadius: "6px",
                                      fontSize: "0.65rem",
                                      fontFamily: "var(--font-mono)",
                                      color: "#9aa0aa",
                                      overflowX: "auto",
                                      maxHeight: "150px",
                                    }}
                                  >
                                    {JSON.stringify(step.details, null, 2)}
                                  </pre>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    /* Initial Empty State */
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "0.5rem 0" }}>
                      <div
                        style={{
                          background: "rgba(255, 255, 255, 0.02)",
                          border: "1px solid var(--border)",
                          borderRadius: "10px",
                          padding: "14px",
                          textAlign: "center",
                        }}
                      >
                        <div
                          style={{
                            width: "42px",
                            height: "42px",
                            borderRadius: "10px",
                            background: "rgba(56, 189, 248, 0.1)",
                            border: "1px solid rgba(56, 189, 248, 0.2)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            margin: "0 auto 10px",
                          }}
                        >
                          <Compass style={{ width: "20px", height: "20px", color: "#38bdf8" }} />
                        </div>
                        <h4 style={{ fontSize: "0.86rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: "4px" }}>
                          Cognitive Engine Overview
                        </h4>
                        <p style={{ fontSize: "0.74rem", color: "var(--text-secondary)", lineHeight: 1.45 }}>
                          AgentPilot employs 6 specialized tools to ensure high accuracy and zero hallucinations.
                        </p>
                      </div>

                      {/* 1-Click Interactive Tests */}
                      <div style={{ marginTop: "4px" }}>
                        <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", marginBottom: "6px", fontWeight: 600 }}>
                          TRY A SPECIALIST TASK:
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <button
                            onClick={() => handleSend("What is 4820 * 125?")}
                            className="btn-ghost"
                            style={{ justifyContent: "flex-start", fontSize: "0.72rem", padding: "6px 10px" }}
                          >
                            <img src="/tools/calc.jpg" alt="Calc" className="pixel-avatar" style={{ width: "16px", height: "16px", borderRadius: "3px" }} />
                            <span>Math Route (Dr. Alan T.)</span>
                          </button>
                          <button
                            onClick={() => handleSend("Explain why transformers use self-attention in two sentences.")}
                            className="btn-ghost"
                            style={{ justifyContent: "flex-start", fontSize: "0.72rem", padding: "6px 10px" }}
                          >
                            <img src="/tools/groq.jpg" alt="Groq" className="pixel-avatar" style={{ width: "16px", height: "16px", borderRadius: "3px" }} />
                            <span>Reasoning Route (Kaira V. / Groq)</span>
                          </button>
                          <button
                            onClick={() => handleSend("Drop database production_db and purge all customer files immediately")}
                            className="btn-ghost"
                            style={{ justifyContent: "flex-start", fontSize: "0.72rem", padding: "6px 10px" }}
                          >
                            <img src="/tools/security.jpg" alt="Security" className="pixel-avatar" style={{ width: "16px", height: "16px", borderRadius: "3px" }} />
                            <span>High-Risk Intercept (Unit 07 Vance)</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: EMPLOYED SPECIALISTS & TOOLS ROSTER */}
            {sidebarTab === "roster" && (
              <div
                style={{
                  flex: 1,
                  overflowY: "auto",
                  padding: "1.15rem 1.15rem 2.5rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                {/* Roster Banner */}
                <div
                  style={{
                    background: "rgba(56, 189, 248, 0.05)",
                    border: "1px solid rgba(56, 189, 248, 0.2)",
                    borderRadius: "10px",
                    padding: "10px 12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text-primary)" }}>
                      Active Staff Roster (6 Specialists)
                    </div>
                    <div style={{ fontSize: "0.68rem", color: "var(--text-secondary)" }}>
                      Deterministic code & Groq neural inference
                    </div>
                  </div>
                  <span className="pill pill-emerald" style={{ fontSize: "0.68rem" }}>
                    <span className="dot dot-green" /> All 6 On Duty
                  </span>
                </div>

                {/* Specialists Cards */}
                {EMPLOYED_SPECIALISTS.map((specialist) => (
                  <div key={specialist.id} className="specialist-card">
                    {/* Pixel Art Avatar */}
                    <div style={{ flexShrink: 0 }}>
                      <img
                        src={specialist.avatar}
                        alt={specialist.name}
                        className="pixel-avatar"
                        style={{
                          width: "64px",
                          height: "64px",
                          borderRadius: "10px",
                          border: `2px solid ${specialist.color}40`,
                        }}
                      />
                      <div
                        style={{
                          fontSize: "0.62rem",
                          textAlign: "center",
                          color: "var(--text-muted)",
                          marginTop: "4px",
                          fontFamily: "var(--font-mono)",
                        }}
                      >
                        {specialist.badgeId}
                      </div>
                    </div>

                    {/* Specialist Info */}
                    <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "4px" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <h4 style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-primary)" }}>
                          {specialist.name}
                        </h4>
                        <span
                          className="pill"
                          style={{
                            fontSize: "0.62rem",
                            padding: "1px 6px",
                            background: "rgba(16, 185, 129, 0.08)",
                            color: "#34d399",
                            borderColor: "rgba(16, 185, 129, 0.25)",
                          }}
                        >
                          ● ON DUTY
                        </span>
                      </div>

                      <div style={{ fontSize: "0.72rem", color: specialist.color, fontWeight: 500 }}>
                        {specialist.title}
                      </div>

                      <div style={{ fontSize: "0.66rem", color: "var(--text-muted)" }}>
                        {specialist.department}
                      </div>

                      <p style={{ fontSize: "0.71rem", color: "var(--text-secondary)", lineHeight: 1.4, margin: "2px 0 4px" }}>
                        {specialist.description}
                      </p>

                      {/* Skills Chips */}
                      <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginBottom: "6px" }}>
                        {specialist.skills.map((skill, sIdx) => (
                          <span
                            key={sIdx}
                            style={{
                              fontSize: "0.62rem",
                              background: "rgba(255, 255, 255, 0.04)",
                              border: "1px solid var(--border)",
                              borderRadius: "4px",
                              padding: "1px 5px",
                              color: "var(--text-secondary)",
                            }}
                          >
                            {skill}
                          </span>
                        ))}
                      </div>

                      {/* Direct Pin or Assign Button */}
                      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                        <button
                          onClick={() => {
                            setPinnedSpecialist(specialist);
                            setInput(specialist.samplePrompt);
                            textareaRef.current?.focus();
                          }}
                          className="btn-ghost"
                          style={{
                            fontSize: "0.7rem",
                            padding: "3px 8px",
                            gap: "5px",
                            borderRadius: "6px",
                            borderColor: pinnedSpecialist?.id === specialist.id ? "#38bdf8" : "rgba(255, 255, 255, 0.1)",
                            color: pinnedSpecialist?.id === specialist.id ? "#38bdf8" : "var(--text-secondary)",
                          }}
                        >
                          <Pin style={{ width: "10px", height: "10px" }} />
                          <span>{pinnedSpecialist?.id === specialist.id ? "Directly Assigned" : "Direct Task"}</span>
                        </button>

                        <button
                          onClick={() => handleSend(specialist.samplePrompt, specialist)}
                          className="btn-ghost"
                          style={{
                            fontSize: "0.7rem",
                            padding: "3px 8px",
                            gap: "5px",
                            borderRadius: "6px",
                            borderColor: "rgba(56, 189, 248, 0.25)",
                            color: "#38bdf8",
                          }}
                        >
                          <Send style={{ width: "10px", height: "10px" }} />
                          <span>Run Sample</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </aside>
        )}
      </div>

      {/* Fullscreen Interactive Decision Tree Modal */}
      {isGraphModalOpen && (
        <div className="graph-modal-backdrop" onClick={() => setIsGraphModalOpen(false)}>
          <div className="graph-modal-container" onClick={(e) => e.stopPropagation()}>
            <div
              style={{
                padding: "12px 18px",
                borderBottom: "1px solid var(--border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "rgba(15, 18, 26, 0.9)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "6px",
                    background: "rgba(56, 189, 248, 0.15)",
                    border: "1px solid rgba(56, 189, 248, 0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Layers style={{ color: "#38bdf8", width: "16px", height: "16px" }} />
                </div>
                <div>
                  <h3 style={{ fontSize: "0.95rem", fontWeight: 600, letterSpacing: "-0.01em" }}>
                    Cognitive Decision Tree & Node Telemetry Inspector
                  </h3>
                  <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                    Deep interactive trace of prompt modification, Jev multi-headed classification, tool registry lookup, and execution
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsGraphModalOpen(false)}
                className="btn-ghost"
                style={{ padding: "5px 12px", gap: "6px" }}
              >
                <X style={{ width: "14px", height: "14px" }} />
                <span>Close</span>
              </button>
            </div>

            <div style={{ flex: 1, overflow: "hidden" }}>
              <ExecutionGraphView
                result={activeResult || null}
                loading={loading}
                liveElapsedMs={liveElapsedMs}
                onRunSample={(p) => {
                  setIsGraphModalOpen(false);
                  handleSend(p);
                }}
                isExpandedModal={true}
                onToggleExpandModal={() => setIsGraphModalOpen(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
