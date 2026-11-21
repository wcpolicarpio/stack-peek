import { NextResponse } from "next/server";
import { getExportEngine } from "@/lib/export-job";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const engine = getExportEngine();
  const job = engine.get(id);
  if (!job) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return NextResponse.json({ job, summary: engine.summarize(id) });
}

export async function POST(request: Request, { params }: Params) {
  const { id } = await params;
  const body = (await request.json().catch(() => ({}))) as {
    action?: "retry" | "cancel";
  };
  const engine = getExportEngine();

  try {
    if (body.action === "retry") {
      const job = engine.retry(id);
      return NextResponse.json({ job, summary: engine.summarize(id) });
    }
    if (body.action === "cancel") {
      const job = engine.cancel(id);
      return NextResponse.json({ job, summary: engine.summarize(id) });
    }
    return NextResponse.json(
      { error: "action must be retry or cancel" },
      { status: 400 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "failed" },
      { status: 400 },
    );
  }
}
