import { NextResponse } from "next/server";
import { getExportEngine } from "@/lib/export-job";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const job = getExportEngine().get(id);
  if (!job) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  return new NextResponse(job.csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${id}.csv"`,
    },
  });
}
