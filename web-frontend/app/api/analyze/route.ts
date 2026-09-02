import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 1. Dispatch claim to FastAPI which enqueues Celery task
    const response = await fetch(`${BACKEND_URL}/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        input_type: body.input_type || "text",
        content: body.content,
      }),
    });

    if (!response.ok) {
      throw new Error(`FastAPI enqueuing error with status: ${response.status}`);
    }

    const data = await response.json();
    // Returns { task_id: "...", status: "QUEUED" }
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("[BFF Error - /api/analyze]:", error);
    return NextResponse.json(
      { error: "Truth Intelligence API is unreachable. Verify FastAPI is running on port 8000." },
      { status: 503 }
    );
  }
}