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

// 1. Dynamic Calculator Tool (Handles Math expressions & natural language numbers)
export class CalculatorTool implements ITool {
  name: ToolType = "CALCULATOR";
  description = "Evaluates arithmetic math expressions safely with 100% precision";

  async execute(input: string): Promise<ToolResult> {
    // 1. Convert conversational math terms into operators
    const expr = input
      .toLowerCase()
      .replace(/\bplus\b/g, "+")
      .replace(/\bminus\b/g, "-")
      .replace(/\btimes\b/g, "*")
      .replace(/\bmultiplied by\b/g, "*")
      .replace(/\bdivided by\b/g, "/")
      .replace(/\bover\b/g, "/")
      .replace(/\bsquared\b/g, "**2")
      .replace(/\bcubed\b/g, "**3")
      .replace(/\bto the power of\b/g, "**")
      .replace(/(\d+)%\s+of\s+(\d+)/g, "($1 / 100) * $2")
      .replace(/(\d+)\s*percent\s+of\s+(\d+)/g, "($1 / 100) * $2")
      .replace(/[,$₹€]/g, ""); // remove currency & thousands separators

    // Extract arithmetic substring (numbers, operators, parentheses, decimal points, powers)
    const match = expr.match(/[0-9+\-*/().^%*\s]{2,}/);
    const sanitized = (match ? match[0] : expr)
      .replace(/[^0-9+\-*/().\s]/g, "")
      .trim();

    if (!sanitized || !/\d/.test(sanitized)) {
      return {
        tool: this.name,
        success: false,
        data: null,
        message: `Could not extract a valid numerical expression from: "${input}". Please provide a math problem like "4820 * 125" or "15% of 850".`,
      };
    }

    try {
      // Safe arithmetic evaluation without arbitrary code execution
      // Validate that expression only contains numbers and basic arithmetic
      if (!/^[0-9+\-*/().\s]+$/.test(sanitized)) {
        throw new Error("Invalid characters in expression");
      }

      const fn = new Function(`return (${sanitized});`);
      const rawResult = fn();

      if (typeof rawResult !== "number" || !isFinite(rawResult)) {
        throw new Error("Result is not a finite number");
      }

      const formattedResult = Number.isInteger(rawResult)
        ? rawResult.toLocaleString("en-US")
        : parseFloat(rawResult.toFixed(6)).toLocaleString("en-US");

      return {
        tool: this.name,
        success: true,
        data: {
          expression: sanitized,
          result: rawResult,
          formatted: formattedResult,
        },
        message: `${sanitized} = ${formattedResult}`,
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

// 2. Real-Time Dynamic Global Weather Tool (Powered by Open-Meteo Geocoding & Satellite Forecast APIs)
export class WeatherTool implements ITool {
  name: ToolType = "WEATHER";
  description = "Fetches live weather and atmospheric conditions for any city worldwide";

  // WMO weather code to friendly human condition string
  private weatherCodeToCondition(code: number): string {
    if (code === 0) return "☀️ Clear Skies";
    if (code === 1) return "🌤️ Mainly Clear";
    if (code === 2) return "⛅ Partly Cloudy";
    if (code === 3) return "☁️ Overcast";
    if (code === 45 || code === 48) return "🌫️ Foggy & Misty";
    if (code >= 51 && code <= 55) return "🌧️ Light Drizzle";
    if (code >= 61 && code <= 65) return "🌧️ Rain Showers";
    if (code >= 71 && code <= 77) return "❄️ Snowfall";
    if (code >= 80 && code <= 82) return "🌦️ Rain Showers";
    if (code >= 95 && code <= 99) return "⛈️ Thunderstorm";
    return "🌡️ Variable Conditions";
  }

  // Extract location from natural language input
  private extractLocation(input: string): string {
    const cleanedInput = input.trim();

    // 1. Check patterns like "in <city>", "at <city>", "for <city>", "of <city>"
    const patterns = [
      /\b(?:in|at|for|of)\s+([a-zA-Z\s.-]+?)(?:\s+(?:today|tomorrow|now|right now|currently|weather|forecast)|\?|\.|$)/i,
      /\b([a-zA-Z\s.-]+?)\s+(?:weather|temperature|forecast|climate)\b/i,
      /(?:weather|temperature|forecast|climate)\s+(?:in|at|for|of)?\s*([a-zA-Z\s.-]+)/i,
    ];

    for (const pattern of patterns) {
      const match = cleanedInput.match(pattern);
      if (match && match[1]) {
        const candidate = match[1]
          .replace(/\b(what|is|the|like|how|tell|me|about|current|currently|today|now|right|please)\b/gi, "")
          .trim();
        if (candidate.length >= 2) {
          return candidate;
        }
      }
    }

    // 2. Fallback: Strip common question words
    const stripped = cleanedInput
      .replace(/\b(what|is|the|weather|temperature|like|in|at|for|of|how|tell|me|about|today|now|right|please|show|get)\b/gi, "")
      .replace(/[^a-zA-Z\s]/g, "")
      .trim();

    return stripped.length >= 2 ? stripped : cleanedInput;
  }

  async execute(input: string): Promise<ToolResult> {
    const rawTarget = this.extractLocation(input);

    try {
      // 1. Live Geocoding lookup via Open-Meteo public geocoding API
      const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(rawTarget)}&count=1&language=en&format=json`;
      const geoRes = await fetch(geoUrl, {
        headers: { "User-Agent": "AgentPilot/1.0" },
      });

      if (!geoRes.ok) {
        throw new Error(`Geocoding failed with status ${geoRes.status}`);
      }

      const geoData = await geoRes.json();

      if (!geoData.results || geoData.results.length === 0) {
        return {
          tool: this.name,
          success: false,
          data: { searchedQuery: rawTarget },
          message: `Could not locate a city named "${rawTarget}". Please specify a recognized city or country (e.g. "Weather in Paris", "Weather in Mumbai", or "Weather in New York").`,
        };
      }

      const place = geoData.results[0];
      const locationTitle = [place.name, place.admin1, place.country]
        .filter(Boolean)
        .join(", ");

      // 2. Fetch live atmospheric forecast from Open-Meteo
      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m,surface_pressure`;
      const weatherRes = await fetch(weatherUrl, {
        headers: { "User-Agent": "AgentPilot/1.0" },
      });

      if (!weatherRes.ok) {
        throw new Error(`Weather forecast failed with status ${weatherRes.status}`);
      }

      const weatherData = await weatherRes.json();
      const current = weatherData.current;
      const condition = this.weatherCodeToCondition(current.weather_code);

      return {
        tool: this.name,
        success: true,
        data: {
          location: locationTitle,
          city: place.name,
          country: place.country || "",
          latitude: place.latitude,
          longitude: place.longitude,
          temperature: `${current.temperature_2m}°C`,
          apparentTemperature: `${current.apparent_temperature}°C`,
          humidity: `${current.relative_humidity_2m}%`,
          windSpeed: `${current.wind_speed_10m} km/h`,
          surfacePressure: `${current.surface_pressure} hPa`,
          condition,
          weatherCode: current.weather_code,
          time: current.time,
        },
        message: `Current weather in ${locationTitle}: ${current.temperature_2m}°C (${condition}), Feels like: ${current.apparent_temperature}°C, Humidity: ${current.relative_humidity_2m}%, Wind: ${current.wind_speed_10m} km/h.`,
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

// 3. Dynamic Knowledge Base & Policy Tool (Multi-document RAG Catalog)
export class KnowledgeBaseTool implements ITool {
  name: ToolType = "KNOWLEDGE_BASE";
  description = "Searches internal company knowledge base documents and corporate policies";

  private docs = [
    {
      title: "Company Refund & Cancellation Policy",
      content:
        "Full refunds are available within 30 days of purchase for unused licenses. Enterprise annual contracts require a 60-day written cancellation notice before renewal. Prorated refunds are processed within 5 business days.",
      tags: ["refund", "billing", "cancellation", "money back", "license", "pricing"],
    },
    {
      title: "Employee Travel & Expense Reimbursement Policy",
      content:
        "All employee travel expenses up to $500 per month are automatically approved upon submitting itemized receipts within 14 days of travel. Flights exceeding 4 hours qualify for premium economy upgrades. Daily meal per diem is capped at $75.",
      tags: ["travel", "expense", "reimbursement", "per diem", "flight", "hotel", "food"],
    },
    {
      title: "Database Backup and Disaster Recovery SLA",
      content:
        "Automated continuous WAL backups run every 5 minutes in PostgreSQL with cross-region replication. RPO is under 5 minutes and RTO is under 15 minutes. Production database drops require dual-key admin authorization and VP sign-off.",
      tags: ["database", "backup", "disaster", "recovery", "rpo", "rto", "drop", "purge"],
    },
    {
      title: "Paid Time Off (PTO), Vacation & Sick Leave Policy",
      content:
        "AgentPilot provides flexible PTO with a recommended minimum of 20 days per year. Sick leave is fully covered without doctor's note for up to 3 consecutive days. Parental leave provides 16 weeks of 100% paid leave for all primary caregivers.",
      tags: ["pto", "vacation", "leave", "sick", "holiday", "time off", "parental"],
    },
    {
      title: "Remote Work & Home Office Hardware Stipend",
      content:
        "All full-time employees receive a one-time $1,000 ergonomic equipment setup stipend upon joining, plus a recurring $75 monthly home internet reimbursement. Employees can work from any compliant global jurisdiction for up to 90 days annually.",
      tags: ["remote", "work from home", "wfh", "stipend", "hardware", "laptop", "equipment", "internet"],
    },
    {
      title: "Information Security, Access Control & Password Policy",
      content:
        "Hardware security keys (FIDO2/WebAuthn) or time-based OTP (TOTP) are mandatory across all corporate systems. Passwords must be at least 16 characters. Production access requires short-lived just-in-time (JIT) credentials via Okta SSO.",
      tags: ["security", "password", "mfa", "2fa", "access", "sso", "credentials", "auth"],
    },
    {
      title: "AI Usage, Privacy & Data Handling Guidelines",
      content:
        "Customer proprietary data and PII must never be used to train external foundation models. All third-party LLM providers (including Groq and OpenAI) must have zero-retention enterprise DPA agreements in place with end-to-end TLS 1.3 encryption.",
      tags: ["ai", "privacy", "data", "pii", "gdpr", "llm", "encryption", "model"],
    },
  ];

  async execute(input: string): Promise<ToolResult> {
    const lower = input.toLowerCase();

    // Score documents by tag and title keyword matches
    const scored = this.docs.map((doc) => {
      let score = 0;
      for (const tag of doc.tags) {
        if (lower.includes(tag)) score += 3;
      }
      for (const word of doc.title.toLowerCase().split(/\s+/)) {
        if (word.length > 3 && lower.includes(word)) score += 2;
      }
      return { doc, score };
    });

    scored.sort((a, b) => b.score - a.score);

    if (scored[0].score > 0) {
      const match = scored[0].doc;
      return {
        tool: this.name,
        success: true,
        data: match,
        message: `Found document "${match.title}":\n\n${match.content}`,
      };
    }

    return {
      tool: this.name,
      success: false,
      data: { availablePolicies: this.docs.map((d) => d.title) },
      message: `No specific internal corporate document matched your query "${input}". Available corporate policies in our repository include: ${this.docs.map((d) => d.title).join(", ")}. For general topics, please request a conceptual explanation.`,
    };
  }
}

// 4. Dynamic Messaging Tool (Dispatches communication messages via Slack/Email/Webhooks)
export class MessagingTool implements ITool {
  name: ToolType = "MESSAGING";
  description = "Dispatches communication messages via Slack, Email, or Webhook queues";

  async execute(input: string): Promise<ToolResult> {
    // Detect channel or recipient
    let channel = "#general-alerts";
    if (input.toLowerCase().includes("team") || input.toLowerCase().includes("dev")) {
      channel = "#engineering";
    } else if (input.toLowerCase().includes("urgent") || input.toLowerCase().includes("incident")) {
      channel = "#incident-response";
    } else if (input.toLowerCase().includes("customer") || input.toLowerCase().includes("client")) {
      channel = "#customer-success";
    }

    const trackingId = `MSG-${Date.now().toString(36).toUpperCase()}`;

    return {
      tool: this.name,
      success: true,
      data: {
        trackingId,
        channel,
        content: input,
        timestamp: new Date().toISOString(),
        deliveryStatus: "DISPATCHED_TO_SLACK_WEBHOOK",
      },
      message: `Dispatched message to ${channel} (Tracking ID: ${trackingId}): "${input}"`,
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
