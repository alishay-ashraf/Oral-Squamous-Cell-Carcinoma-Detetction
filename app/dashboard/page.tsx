"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Activity,
  Clock,
  Gauge,
  ScanLine,
  TriangleAlert,
  Users,
  ArrowUpRight,
} from "lucide-react";

import RequireAuth from "@/components/auth/RequireAuth";
import AppShell from "@/components/layout/AppShell";
import StatCard from "@/components/ui/StatCard";
import Panel from "@/components/ui/Panel";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";

import {
  getDashboardStats,
  getPatients,
  getPredictions,
} from "@/lib/api";

import {
  DashboardStats,
  Patient,
  PredictionResult,
} from "@/lib/types";

import {
  findingColor,
  formatDateTime,
  formatPercent,
  riskColor,
} from "@/lib/utils";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [predictions, setPredictions] = useState<PredictionResult[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

 useEffect(() => {
  Promise.all([
    getDashboardStats(),
    getPredictions(),
    getPatients(),
  ]).then(([s, preds, pts]) => {
    setStats(s);
    setPredictions(preds.slice(0, 6));

    
    const priority = { elevated: 0, watch: 1, low: 2 };
    const sorted = [...pts].sort(
      (a, b) => priority[a.riskFlag] - priority[b.riskFlag]
    );
    setPatients(sorted.slice(0, 6));

    setLoading(false);
  });
}, []);

  return (
    <RequireAuth>
      <AppShell
        title="Dashboard"
        subtitle="Everything read across your workspace, at a glance."
      >
        {loading || !stats ? (
          <div className="text-muted text-sm font-mono">
            Loading workspace…
          </div>
        ) : (
          <div className="space-y-8">

            {/* =========================
                STAT CARDS
            ========================== */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 items-stretch">

              <div className="h-full">
                <StatCard
                  label="Total scans"
                  value={stats.totalScans.toLocaleString()}
                  sublabel={`+${stats.scansThisWeek} this week`}
                  accent="var(--amber)"
                  icon={<ScanLine size={16} />}
                />
              </div>

              <div className="h-full">
                <StatCard
                  label="Avg confidence"
                  value={formatPercent(stats.avgConfidence)}
                  sublabel="across all findings"
                  accent="var(--teal)"
                  icon={<Gauge size={16} />}
                />
              </div>

              <div className="h-full">
                <StatCard
                  label="Avg inference"
                  value={`${stats.avgInferenceMs}ms`}
                  sublabel="ONNX runtime"
                  accent="var(--blue)"
                  icon={<Clock size={16} />}
                />
              </div>

              <div className="h-full">
                <StatCard
                  label="Malignant flags"
                  value={String(stats.malignantFlags)}
                  sublabel="needs radiologist review"
                  accent="var(--coral)"
                  icon={<TriangleAlert size={16} />}
                />
              </div>

              <div className="h-full">
                <StatCard
                  label="Active patients"
                  value={String(stats.activePatients)}
                  sublabel="in your workspace"
                  accent="var(--amber)"
                  icon={<Users size={16} />}
                />
              </div>

              <div className="h-full">
                <StatCard
                  label="This week"
                  value={String(stats.scansThisWeek)}
                  sublabel="scans processed"
                  accent="var(--teal)"
                  icon={<Activity size={16} />}
                />
              </div>

            </div>

            {/* =========================
                RECENT READS + PATIENTS
            ========================== */}
            <div className="grid lg:grid-cols-3 gap-6">

              {/* Recent Reads */}
              <Panel className="lg:col-span-2 p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-display font-semibold text-lg">
                    Recent reads
                  </h2>

                  <Link href="/history">
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<ArrowUpRight size={14} />}
                    >
                      View all
                    </Button>
                  </Link>
                </div>

                <div className="space-y-1">
                  {predictions.map((p) => (
                    <Link
                      key={p.id}
                      href="/history"
                      className="flex items-center justify-between gap-4 py-3 px-3 -mx-3 rounded-lg hover:bg-panel-2 transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="text-sm text-bone font-medium truncate">
                          {p.patientName}
                        </p>

                        <p className="text-xs text-muted-2 font-mono mt-0.5">
                          {p.modality} · {formatDateTime(p.createdAt)}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs font-mono text-muted hidden sm:inline">
                          {formatPercent(p.confidence)}
                        </span>

                        <Badge color={findingColor(p.finding)}>
                          {p.finding}
                        </Badge>
                      </div>
                    </Link>
                  ))}
                </div>
              </Panel>

              {/* Patients to Watch */}
              <Panel className="p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-display font-semibold text-lg">
                    Patients to watch
                  </h2>

                  <Link href="/patients">
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<ArrowUpRight size={14} />}
                    >
                      All
                    </Button>
                  </Link>
                </div>

                <div className="space-y-1">
                  {patients.map((p) => (
                    <Link
                      key={p.id}
                      href={`/patients/${p.id}`}
                      className="flex items-center justify-between gap-3 py-3 px-3 -mx-3 rounded-lg hover:bg-panel-2 transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="text-sm text-bone font-medium truncate">
                          {p.name}
                        </p>

                        <p className="text-xs text-muted-2 font-mono mt-0.5">
                          {p.mrn}
                        </p>
                      </div>

                      <Badge color={riskColor(p.riskFlag)}>
                        {p.riskFlag}
                      </Badge>
                    </Link>
                  ))}
                </div>
              </Panel>

            </div>

            {/* =========================
                NEW PREDICTION CTA
            ========================== */}
            <Panel className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-panel/60">
              <div>
                <p className="font-display font-semibold text-bone">
                  Ready to read a new scan?
                </p>

                <p className="text-sm text-muted mt-1">
                  Upload an  ultrasound and get a
                  structured read in seconds.
                </p>
              </div>

              <Link href="/predict">
                <Button
                  variant="primary"
                  icon={<ScanLine size={16} />}
                >
                  New prediction
                </Button>
              </Link>
            </Panel>

          </div>
        )}
      </AppShell>
    </RequireAuth>
  );
}