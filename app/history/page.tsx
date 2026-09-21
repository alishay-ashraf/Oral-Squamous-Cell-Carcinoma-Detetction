"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search, Eye } from "lucide-react";
import RequireAuth from "@/components/auth/RequireAuth";
import AppShell from "@/components/layout/AppShell";
import Panel from "@/components/ui/Panel";
import Badge from "@/components/ui/Badge";
import { getPredictions } from "@/lib/api";
import ScanViewer from "@/components/ui/ScanViewer";

import { Finding, PredictionResult } from "@/lib/types";
import { cx, findingColor, formatDateTime, formatPercent } from "@/lib/utils";

const FINDINGS: Finding[] = ["Normal", "OSCC"];

export default function HistoryPage() {
  const [predictions, setPredictions] = useState<PredictionResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [finding, setFinding] = useState<Finding | "All">("All");
  const [activeScan, setActiveScan] = useState<PredictionResult | null>(null);

  useEffect(() => {
    getPredictions().then((preds) => {
      setPredictions(
        [...preds].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
      );
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(() => {
    return predictions.filter((p) => {
      if (finding !== "All" && p.finding !== finding) return false;
      if (query && !p.patientName.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [predictions, query, finding]);

  return (
    <RequireAuth>
      <AppShell title="History" subtitle="Every read your workspace has produced.">
        <Panel className="p-4 mb-5 flex flex-col md:flex-row gap-3 md:items-center">
          <div className="flex items-center gap-2 bg-panel border border-line rounded-lg px-3 py-2 md:w-64">
            <Search size={15} className="text-muted-2" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by patient name…"
              className="bg-transparent text-sm text-bone placeholder:text-muted-2 outline-none w-full"
            />
          </div>

          <div className="flex flex-wrap gap-1.5">
            {(["All", ...FINDINGS] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFinding(f)}
                className={cx(
                  "text-xs font-medium px-3 py-1.5 rounded-full border transition-colors",
                  finding === f
                    ? "bg-amber text-ink border-amber"
                    : "bg-panel border-line text-muted hover:text-bone"
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </Panel>

        <Panel className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-mono uppercase tracking-wide text-muted-2 border-b border-line-soft">
                  <th className="px-5 py-3 font-medium">Patient</th>
                  <th className="px-5 py-3 font-medium">Scan</th>
                  <th className="px-5 py-3 font-medium">Modality</th>
                  <th className="px-5 py-3 font-medium">Finding</th>
                  <th className="px-5 py-3 font-medium">Confidence</th>
                  <th className="px-5 py-3 font-medium">Model</th>
                  <th className="px-5 py-3 font-medium">Read at</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-8 text-center text-muted font-mono text-xs">
                      Loading history…
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-8 text-center text-muted font-mono text-xs">
                      No reads match these filters.
                    </td>
                  </tr>
                ) : (
                  filtered.map((p) => (
                    <tr
                      key={p.id}
                      className="border-b border-line-soft last:border-0 hover:bg-panel-2/60 transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <Link href={`/patients/${p.patientId}`} className="text-bone-dim font-medium hover:text-amber transition-colors">
                          {p.patientName}
                        </Link>
                      </td>
                      <td className="px-5 py-3.5">
                        <button
                          onClick={() => setActiveScan(p)}
                          className="group relative w-10 h-10 rounded-md overflow-hidden border border-line shrink-0"
                        >
                          <img src={p.imageUrl} alt="" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 flex items-center justify-center transition-colors">
                            <Eye size={14} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </button>
                      </td>
                      <td className="px-5 py-3.5 text-muted">{p.modality}</td>
                      <td className="px-5 py-3.5">
                        <Badge color={findingColor(p.finding)}>{p.finding}</Badge>
                      </td>
                      <td className="px-5 py-3.5 font-mono text-muted">{formatPercent(p.confidence)}</td>
                      <td className="px-5 py-3.5 font-mono text-muted-2 text-xs">{p.modelVersion}</td>
                      <td className="px-5 py-3.5 text-muted-2 text-xs font-mono">{formatDateTime(p.createdAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Panel>

        {activeScan && (
          <ScanViewer
            prediction={activeScan}
            open={!!activeScan}
            onClose={() => setActiveScan(null)}
          />
        )}
      </AppShell>
    </RequireAuth>
  );
}