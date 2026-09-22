import { ToolType } from "../jev/types";

export interface ToolResult {
  tool: ToolType;
  success: boolean;
  data: unknown;
  message: string;
}

export interface ITool {
  name: ToolType;
  description: string;
  execute(input: string): Promise<ToolResult>;
}

// 1. Calculator Tool (Deterministic Math)
export class CalculatorTool implements ITool {
  name: ToolType = "CALCULATOR";
  description = "Evaluates arithmetic math expressions safely";

  async execute(input: string): Promise<ToolResult> {
    // Extract math expression from string
    const sanitized = input.replace(/[^0-9+\-*/().^%\s]/g, "").trim();
    if (!sanitized) {
      return {
        tool: this.name,
        success: false,
        data: null,
        message: "No valid mathematical expression found in input.",
      };
    }

    try {
      // Safe arithmetic evaluator
      const fn = new Function(`return (${sanitized});`);
      const result = fn();
      return {
        tool: this.name,
        success: true,
        data: { expression: sanitized, result },
        message: `Calculated ${sanitized} = ${result}`,
      };
    } catch {
      return {
        tool: this.name,
        success: false,
        data: null,
        message: `Failed to compute mathematical expression: "${sanitized}"`,
      };
    }
  }
}

// 2. Weather Tool (Open-Meteo Public API)
export class WeatherTool implements ITool {
  name: ToolType = "WEATHER";
  description = "Fetches weather information for a requested city";

  private cityCoords: Record<string, { lat: number; lon: number; name: string }> = {
    newyork: { lat: 40.7128, lon: -74.006, name: "New York, USA" },
    tokyo: { lat: 35.6762, lon: 139.6503, name: "Tokyo, Japan" },
    london: { lat: 51.5074, lon: -0.1278, name: "London, UK" },
    kolkata: { lat: 22.5726, lon: 88.3639, name: "Kolkata, India" },
    paris: { lat: 48.8566, lon: 2.3522, name: "Paris, France" },
    sf: { lat: 37.7749, lon: -122.4194, name: "San Francisco, USA" },
  };

  async execute(input: string): Promise<ToolResult> {
    const lower = input.toLowerCase();
    let selected = this.cityCoords.tokyo; // default
    for (const [key, coord] of Object.entries(this.cityCoords)) {
      if (lower.includes(key) || lower.includes(coord.name.toLowerCase().split(",")[0])) {
        selected = coord;
        break;
      }
    }

    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${selected.lat}&longitude=${selected.lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m`;
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Open-Meteo returned status ${res.status}`);
      }
      const data = await res.json();
      const current = data.current;
      return {
        tool: this.name,
        success: true,
        data: {
          location: selected.name,
          temperature: `${current.temperature_2m}°C`,
          humidity: `${current.relative_humidity_2m}%`,
          windSpeed: `${current.wind_speed_10m} km/h`,
        },
        message: `Current weather in ${selected.name}: ${current.temperature_2m}°C, Humidity: ${current.relative_humidity_2m}%, Wind: ${current.wind_speed_10m} km/h`,
      };
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      return {
        tool: this.name,
        success: false,
        data: null,
        message: `Weather service error: ${errMsg}`,
      };
    }
  }
}

// 3. Knowledge Base Tool (Internal Company Docs RAG mock)
export class KnowledgeBaseTool implements ITool {
  name: ToolType = "KNOWLEDGE_BASE";
  description = "Searches internal company knowledge base documents";

  private docs = [
    {
      title: "Company Refund Policy",
      content:
        "Full refunds are available within 30 days of purchase for unused licenses. Enterprise annual contracts require a 60-day written cancellation notice before renewal.",
      tags: ["refund", "billing", "cancellation", "policy"],
    },
    {
      title: "Employee Travel & Expense Reimbursement Policy",
      content:
        "All employee travel expenses up to $500 per month are automatically approved upon submitting itemized receipts within 14 days of travel. Flights over 4 hours qualify for premium economy.",
      tags: ["travel", "expense", "reimbursement", "employee"],
    },
    {
      title: "Database Backup and Disaster Recovery",
      content:
        "Automated continuous WAL backups run every 5 minutes in PostgreSQL. Production database drops require two-person authorization and a VP of Engineering sign-off.",
      tags: ["database", "backup", "disaster", "security"],
    },
  ];

  async execute(input: string): Promise<ToolResult> {
    const lower = input.toLowerCase();
    const matched = this.docs.find((doc) =>
      doc.tags.some((tag) => lower.includes(tag))
    );

    if (matched) {
      return {
        tool: this.name,
        success: true,
        data: matched,
        message: `Found document "${matched.title}": ${matched.content}`,
      };
    }

    return {
      tool: this.name,
      success: true,
      data: this.docs[0],
      message: `Retrieved general policy document: "${this.docs[0].title}": ${this.docs[0].content}`,
    };
  }
}

// 4. Messaging Tool (Simulated external communications)
export class MessagingTool implements ITool {
  name: ToolType = "MESSAGING";
  description = "Dispatches communication messages via Slack/Email";

  async execute(input: string): Promise<ToolResult> {
    return {
      tool: this.name,
      success: true,
      data: { messagePreview: input, status: "QUEUED_FOR_DISPATCH" },
      message: `Message queued for delivery: "${input}"`,
    };
  }
}

export class ToolRegistry {
  private tools: Map<ToolType, ITool> = new Map();

  constructor() {
    this.register(new CalculatorTool());
    this.register(new WeatherTool());
    this.register(new KnowledgeBaseTool());
    this.register(new MessagingTool());
  }

  register(tool: ITool) {
    this.tools.set(tool.name, tool);
  }

  get(name: ToolType): ITool | undefined {
    return this.tools.get(name);
  }

  has(name: ToolType): boolean {
    return this.tools.has(name);
  }
}

export const toolRegistry = new ToolRegistry();
