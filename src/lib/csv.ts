import type { Order } from "./orders";

export const CSV_HEADER = "id,customer,email,sku,amount_cents,status";

export function orderToCsvRow(order: Order): string {
  return [
    order.id,
    quote(order.customer),
    order.email,
    order.sku,
    String(order.amountCents),
    order.status,
  ].join(",");
}

function quote(value: string): string {
  if (value.includes(",") || value.includes('"')) {
    return `"${value.replaceAll('"', '""')}"`;
  }
  return value;
}

export function parseCsvDataRows(csv: string): string[] {
  return csv
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && line !== CSV_HEADER);
}

export function countDataRows(csv: string): number {
  return parseCsvDataRows(csv).length;
}

/** Mutable CSV buffer for one export job. Cleared at the start of each attempt. */
export class CsvBuffer {
  private lines: string[];

  constructor(seed?: string[]) {
    this.lines = seed ? [...seed] : [CSV_HEADER];
  }

  write(order: Order): void {
    this.lines.push(orderToCsvRow(order));
  }

  clear(): void {
    this.lines = [CSV_HEADER];
  }

  snapshot(): string[] {
    return [...this.lines];
  }

  toString(): string {
    return this.lines.join("\n");
  }

  dataRowCount(): number {
    return Math.max(0, this.lines.length - 1);
  }
}
