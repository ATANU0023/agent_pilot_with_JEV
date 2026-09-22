import { NextRequest, NextResponse } from "next/server";
import { agentRunner } from "@/services/agent/agentRunner";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, role, environment } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Field 'message' (string) is required in request body." },
        { status: 400 }
      );
    }

    const result = await agentRunner.run({
      userPrompt: message,
      role: role || "user",
      environment: environment || "production",
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error: unknown) {
    console.error("API Route Error:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Agent run failed", details: message },
      { status: 500 }
    );
  }
}
