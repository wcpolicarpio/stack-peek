import { describe, expect, it, beforeEach } from "vitest";
import { ExportEngine } from "./export-job";
import { EXPECTED_ORDER_COUNT } from "./orders";

describe("ExportEngine", () => {
  let engine: ExportEngine;

  beforeEach(() => {
    engine = new ExportEngine();
  });

  it("exports every order once on a clean run", () => {
    const job = engine.create({ failAfterRows: null });
    engine.run(job.id);
    const summary = engine.summarize(job.id);

    expect(summary.status).toBe("completed");
    expect(summary.writtenRows).toBe(EXPECTED_ORDER_COUNT);
    expect(summary.duplicateRows).toBe(0);
    expect(summary.uniqueOrderIds).toBe(EXPECTED_ORDER_COUNT);
  });

  it("does not duplicate rows when a mid-run failure is retried", () => {
    const job = engine.create({ failAfterRows: 4 });
    const failed = engine.run(job.id);
    expect(failed.status).toBe("failed");
    expect(failed.writtenRows).toBe(4);

    const recovered = engine.retry(job.id);
    const summary = engine.summarize(recovered.id);

    expect(summary.status).toBe("completed");
    expect(summary.writtenRows).toBe(EXPECTED_ORDER_COUNT);
    expect(summary.duplicateRows).toBe(0);
    expect(summary.uniqueOrderIds).toBe(EXPECTED_ORDER_COUNT);
  });
});
