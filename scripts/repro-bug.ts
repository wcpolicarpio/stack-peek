import { ExportEngine } from "../src/lib/export-job";
import { EXPECTED_ORDER_COUNT } from "../src/lib/orders";

const engine = new ExportEngine();
const job = engine.create({ failAfterRows: 4 });

const failed = engine.run(job.id);
console.log("=== Export Lab repro: fail after 4, then retry ===");
console.log("after fail :", {
  status: failed.status,
  attempts: failed.attempts,
  writtenRows: failed.writtenRows,
  error: failed.error,
});

const recovered = engine.retry(job.id);
const summary = engine.summarize(recovered.id);

console.log("after retry:", {
  status: summary.status,
  attempts: summary.attempts,
  writtenRows: summary.writtenRows,
  uniqueOrderIds: summary.uniqueOrderIds,
  expectedRows: EXPECTED_ORDER_COUNT,
  duplicateRows: summary.duplicateRows,
});

if (summary.duplicateRows > 0 || summary.writtenRows !== EXPECTED_ORDER_COUNT) {
  console.log(
    `\nBUG CONFIRMED: wrote ${summary.writtenRows} rows with ${summary.duplicateRows} duplicates (expected ${EXPECTED_ORDER_COUNT} unique).`,
  );
  process.exitCode = 1;
} else {
  console.log("\nNo duplicates — bug appears fixed.");
}
