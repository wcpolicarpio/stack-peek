import { CsvBuffer, countDataRows } from "./csv";
import { EXPECTED_ORDER_COUNT, ORDERS } from "./orders";

export type ExportStatus =
  | "queued"
  | "running"
  | "failed"
  | "completed"
  | "cancelled";

export type ExportJob = {
  id: string;
  status: ExportStatus;
  attempts: number;
  writtenRows: number;
  csv: string;
  error: string | null;
  /** When set, the runner throws after writing this many data rows on the first attempt. */
  failAfterRows: number | null;
  cancelled: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ExportSummary = {
  jobId: string;
  status: ExportStatus;
  attempts: number;
  writtenRows: number;
  expectedRows: number;
  duplicateRows: number;
  uniqueOrderIds: number;
  error: string | null;
};

type RunOptions = {
  failAfterRows?: number | null;
};

/**
 * In-memory export engine used by the API and unit tests.
 *
 * Known defect (do not "fix" casually — this is the pstack practice bug):
 * On retry after a mid-run failure, the runner reuses the existing CsvBuffer
 * and rewrites every order from index 0, which duplicates earlier rows.
 */
export class ExportEngine {
  private jobs = new Map<string, ExportJob>();
  private buffers = new Map<string, CsvBuffer>();
  private seq = 0;

  list(): ExportJob[] {
    return [...this.jobs.values()].sort((a, b) =>
      a.createdAt < b.createdAt ? 1 : -1,
    );
  }

  get(id: string): ExportJob | undefined {
    return this.jobs.get(id);
  }

  create(options: RunOptions = {}): ExportJob {
    this.seq += 1;
    const now = new Date().toISOString();
    const job: ExportJob = {
      id: `job_${String(this.seq).padStart(4, "0")}`,
      status: "queued",
      attempts: 0,
      writtenRows: 0,
      csv: "",
      error: null,
      failAfterRows:
        options.failAfterRows === undefined ? null : options.failAfterRows,
      cancelled: false,
      createdAt: now,
      updatedAt: now,
    };
    this.jobs.set(job.id, job);
    this.buffers.set(job.id, new CsvBuffer());
    return job;
  }

  run(jobId: string): ExportJob {
    const job = this.require(jobId);
    if (job.status === "completed") {
      return job;
    }
    if (job.status === "cancelled") {
      return job;
    }

    job.status = "running";
    job.attempts += 1;
    job.error = null;
    job.updatedAt = new Date().toISOString();

    const buffer = this.buffers.get(jobId) ?? new CsvBuffer();
    this.buffers.set(jobId, buffer);

    // BUG: every attempt writes the full order list into the same buffer.
    // A correct implementation would either clear the buffer on retry, or
    // resume from a durable cursor without rewriting already-emitted rows.
    for (let i = 0; i < ORDERS.length; i++) {
      if (job.cancelled) {
        job.status = "cancelled";
        job.csv = buffer.toString();
        job.writtenRows = buffer.dataRowCount();
        job.updatedAt = new Date().toISOString();
        return job;
      }

      const shouldFail =
        job.failAfterRows !== null &&
        job.attempts === 1 &&
        i === job.failAfterRows;

      if (shouldFail) {
        job.status = "failed";
        job.error = `connection reset mid-run after ${i} rows`;
        job.csv = buffer.toString();
        job.writtenRows = buffer.dataRowCount();
        job.updatedAt = new Date().toISOString();
        return job;
      }

      buffer.write(ORDERS[i]!);
    }

    job.status = "completed";
    job.csv = buffer.toString();
    job.writtenRows = buffer.dataRowCount();
    job.updatedAt = new Date().toISOString();
    return job;
  }

  /** Re-run a failed job. This is where the duplicate-row bug shows up. */
  retry(jobId: string): ExportJob {
    const job = this.require(jobId);
    if (job.status !== "failed") {
      throw new Error(`can only retry failed jobs (status=${job.status})`);
    }
    return this.run(jobId);
  }

  cancel(jobId: string): ExportJob {
    const job = this.require(jobId);
    job.cancelled = true;
    if (job.status === "queued" || job.status === "running") {
      job.status = "cancelled";
      job.updatedAt = new Date().toISOString();
    }
    return job;
  }

  summarize(jobId: string): ExportSummary {
    const job = this.require(jobId);
    const dataLines = job.csv
      .split("\n")
      .slice(1)
      .filter((line) => line.trim().length > 0);
    const ids = dataLines.map((line) => line.split(",")[0] ?? "");
    const unique = new Set(ids);
    return {
      jobId: job.id,
      status: job.status,
      attempts: job.attempts,
      writtenRows: countDataRows(job.csv),
      expectedRows: EXPECTED_ORDER_COUNT,
      duplicateRows: Math.max(0, ids.length - unique.size),
      uniqueOrderIds: unique.size,
      error: job.error,
    };
  }

  reset(): void {
    this.jobs.clear();
    this.buffers.clear();
    this.seq = 0;
  }

  private require(jobId: string): ExportJob {
    const job = this.jobs.get(jobId);
    if (!job) {
      throw new Error(`unknown job: ${jobId}`);
    }
    return job;
  }
}

const globalForExport = globalThis as typeof globalThis & {
  __exportEngine?: ExportEngine;
};

export function getExportEngine(): ExportEngine {
  if (!globalForExport.__exportEngine) {
    globalForExport.__exportEngine = new ExportEngine();
  }
  return globalForExport.__exportEngine;
}
