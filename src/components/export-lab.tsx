"use client";

import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

type Summary = {
  jobId: string;
  status: string;
  attempts: number;
  writtenRows: number;
  expectedRows: number;
  duplicateRows: number;
  uniqueOrderIds: number;
  error: string | null;
};

type Job = {
  id: string;
  status: string;
  attempts: number;
  writtenRows: number;
  csv: string;
  error: string | null;
  failAfterRows: number | null;
  createdAt: string;
  updatedAt: string;
  summary?: Summary;
};

type OrdersResponse = { count: number };

export function ExportLab() {
  const [orderCount, setOrderCount] = useState<number | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [failAfter, setFailAfter] = useState("4");
  const [selected, setSelected] = useState<Job | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const [ordersRes, jobsRes] = await Promise.all([
      fetch("/api/orders"),
      fetch("/api/exports"),
    ]);
    if (!ordersRes.ok || !jobsRes.ok) {
      throw new Error("failed to load lab state");
    }
    const ordersJson = (await ordersRes.json()) as OrdersResponse;
    const jobsJson = (await jobsRes.json()) as { jobs: Job[] };
    setOrderCount(ordersJson.count);
    setJobs(jobsJson.jobs);
    if (selected) {
      const fresh = jobsJson.jobs.find((job) => job.id === selected.id) ?? null;
      setSelected(fresh);
    }
  }, [selected]);

  useEffect(() => {
    refresh().catch((err: unknown) => {
      setError(err instanceof Error ? err.message : "load failed");
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- initial load only
  }, []);

  async function runAction(fn: () => Promise<void>) {
    setBusy(true);
    setError(null);
    try {
      await fn();
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "request failed");
    } finally {
      setBusy(false);
    }
  }

  async function startExport() {
    await runAction(async () => {
      const parsed = Number(failAfter);
      const failAfterRows = Number.isFinite(parsed) ? parsed : null;
      const res = await fetch("/api/exports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ failAfterRows, run: true }),
      });
      const json = (await res.json()) as { job: Job; error?: string };
      if (!res.ok) {
        throw new Error(json.error ?? "export failed");
      }
      setSelected(json.job);
    });
  }

  async function retrySelected() {
    if (!selected) return;
    await runAction(async () => {
      const res = await fetch(`/api/exports/${selected.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "retry" }),
      });
      const json = (await res.json()) as { job: Job; error?: string };
      if (!res.ok) {
        throw new Error(json.error ?? "retry failed");
      }
      setSelected(json.job);
    });
  }

  const summary = selected
    ? jobs.find((job) => job.id === selected.id)?.summary
    : undefined;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-10">
      <header className="space-y-3">
        <p className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
          pstack practice lab
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Export Lab
        </h1>
        <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">
          A tiny order-export service with a seeded mid-run retry bug. Use it to
          practice{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 text-sm">
            /poteto-mode
          </code>
          : repro first, then fix and verify.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Source orders</CardDescription>
            <CardTitle className="text-3xl tabular-nums">
              {orderCount ?? "—"}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Expected CSV data rows after a correct export.
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Selected written rows</CardDescription>
            <CardTitle className="text-3xl tabular-nums">
              {summary?.writtenRows ?? "—"}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Includes duplicates if a retry corrupted the buffer.
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Duplicate rows</CardDescription>
            <CardTitle className="text-3xl tabular-nums">
              {summary?.duplicateRows ?? "—"}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Done means this is 0 and written rows equals source orders.
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Reproduce the bug</CardTitle>
          <CardDescription>
            Start an export that fails after N rows, then retry. The buggy
            engine rewrites from row 0 into the same CSV buffer.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <label className="flex flex-1 flex-col gap-2 text-sm">
              Fail after N rows (first attempt)
              <Input
                type="number"
                min={0}
                max={11}
                value={failAfter}
                onChange={(event) => setFailAfter(event.target.value)}
              />
            </label>
            <div className="flex gap-2">
              <Button onClick={startExport} disabled={busy}>
                Run failing export
              </Button>
              <Button
                variant="secondary"
                onClick={retrySelected}
                disabled={busy || !selected || selected.status !== "failed"}
              >
                Retry selected
              </Button>
            </div>
          </div>
          {error ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : null}
          <p className="text-sm text-muted-foreground">
            Tip: leave fail-after at 4, run once, retry, then compare written
            rows to source orders.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
        <Card>
          <CardHeader>
            <CardTitle>Jobs</CardTitle>
            <CardDescription>Newest first. Click one to inspect.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {jobs.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No jobs yet. Run a failing export to seed the bug.
              </p>
            ) : (
              jobs.map((job) => {
                const s = job.summary;
                const active = selected?.id === job.id;
                return (
                  <button
                    key={job.id}
                    type="button"
                    onClick={() => setSelected(job)}
                    className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left transition-colors ${
                      active
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-muted/50"
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm">{job.id}</span>
                        <StatusBadge status={job.status} />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        attempts {job.attempts}
                        {s
                          ? ` · rows ${s.writtenRows} · dupes ${s.duplicateRows}`
                          : null}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>CSV output</CardTitle>
            <CardDescription>
              {selected
                ? `${selected.id} · ${selected.status}`
                : "Select a job to inspect its CSV"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {selected ? (
              <>
                <div className="flex flex-wrap gap-2 text-sm">
                  <Badge variant="secondary">
                    written {summary?.writtenRows ?? selected.writtenRows}
                  </Badge>
                  <Badge variant="secondary">
                    expected {summary?.expectedRows ?? orderCount ?? "—"}
                  </Badge>
                  <Badge
                    variant={
                      (summary?.duplicateRows ?? 0) > 0
                        ? "destructive"
                        : "secondary"
                    }
                  >
                    duplicates {summary?.duplicateRows ?? 0}
                  </Badge>
                </div>
                {selected.error ? (
                  <p className="text-sm text-destructive">{selected.error}</p>
                ) : null}
                <Separator />
                <pre className="max-h-80 overflow-auto rounded-lg bg-muted p-3 font-mono text-xs leading-relaxed">
                  {selected.csv || "(empty)"}
                </pre>
                <a
                  href={`/api/exports/${selected.id}/download`}
                  className="inline-flex h-7 items-center rounded-lg border border-border px-2.5 text-[0.8rem] font-medium hover:bg-muted"
                >
                  Download CSV
                </a>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Nothing selected.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const variant =
    status === "completed"
      ? "default"
      : status === "failed"
        ? "destructive"
        : "secondary";
  return <Badge variant={variant}>{status}</Badge>;
}
