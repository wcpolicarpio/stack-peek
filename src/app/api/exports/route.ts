import { NextResponse } from "next/server";
import { getExportEngine } from "@/lib/export-job";

export async function GET() {
  const engine = getExportEngine();
  const jobs = engine.list().map((job) => ({
    ...job,
    summary: engine.summarize(job.id),
  }));
  return NextResponse.json({ jobs });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    failAfterRows?: number | null;
    run?: boolean;
  };

  const engine = getExportEngine();
  const job = engine.create({
    failAfterRows:
      body.failAfterRows === undefined ? 4 : body.failAfterRows,
  });

  const ran = body.run === false ? job : engine.run(job.id);

  return NextResponse.json({
    job: ran,
    summary: engine.summarize(ran.id),
  });
}
