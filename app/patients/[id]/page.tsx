"use client";

import { use, useEffect, useState } from "react";
import ScanViewer from "@/components/ui/ScanViewer";
import Link from "next/link";
import { ArrowLeft, ScanLine } from "lucide-react";
import RequireAuth from "@/components/auth/RequireAuth";
import AppShell from "@/components/layout/AppShell";
import Panel from "@/components/ui/Panel";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { getPatient, getPredictionsForPatient } from "@/lib/api";
import { Patient, PredictionResult } from "@/lib/types";
import { findingColor, formatDate, formatDateTime, formatPercent, riskColor } from "@/lib/utils";

export default function PatientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [predictions, setPredictions] = useState<PredictionResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeScan, setActiveScan] = useState<PredictionResult | null>(null);

  useEffect(() => {
    Promise.all([getPatient(id), getPredictionsForPatient(id)]).then(([p, preds]) => {
      setPatient(p);
      setPredictions(preds);
      setLoading(false);
    });
  }, [id]);

  return (
    <RequireAuth>
      <AppShell title="Patient record" subtitle={patient ? patient.name : "Loading…"}>
        <Link
          href="/patients"
          className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-bone transition-colors mb-5"
        >
          <ArrowLeft size={13} /> Back to patients
        </Link>

        {loading || !patient ? (
          <p className="text-sm text-muted font-mono">Loading record…</p>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            <Panel className="p-6 lg:col-span-1 h-fit">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-panel-3 border border-line flex items-center justify-center font-mono text-lg text-amber shrink-0">
                  {patient.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div>
                  <h2 className="font-display font-semibold text-lg">{patient.name}</h2>
                  <p className="text-xs text-muted-2 font-mono mt-0.5">{patient.mrn}</p>
                </div>
              </div>

              <div className="mt-6 space-y-3 text-sm">
                <div className="flex items-center justify-between py-2 border-b border-line-soft">
                  <span className="text-muted">Age</span>
                  <span className="text-bone-dim">{patient.age}</span>
                </div>
                                <div className="flex items-center justify-between py-2 border-b border-line-soft">
                  <span className="text-muted">Sex</span>
                  <span className="text-bone-dim">{patient.sex}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-line-soft">
                  <span className="text-muted">Phone</span>
                  <span className="text-bone-dim">{patient.phone || "—"}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-line-soft">
                  <span className="text-muted">Email</span>
                  <span className="text-bone-dim">{patient.email || "—"}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-line-soft">
                  <span className="text-muted">Total scans</span>
                  <span className="text-bone-dim">{patient.scanCount}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-line-soft">
                  <span className="text-muted">Last visit</span>
                  <span className="text-bone-dim">{formatDate(patient.lastVisit)}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-muted">Risk flag</span>
                  <Badge color={riskColor(patient.riskFlag)}>{patient.riskFlag}</Badge>
                </div>
              </div>

              <Link href="/predict">
                <Button variant="primary" className="w-full mt-6" icon={<ScanLine size={16} />}>
                  Read a new scan
                </Button>
              </Link>
            </Panel>

            <Panel className="p-6 lg:col-span-2">
              <h3 className="font-display font-semibold text-lg mb-4">Scan history</h3>
              {predictions.length === 0 ? (
                <p className="text-sm text-muted-2 font-mono">No scans on record yet.</p>
              ) : (
                <div className="space-y-1">
                  {predictions
                    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
                    .map((p) => (
                      <button
                        key={p.id}
                        onClick={() => setActiveScan(p)}
                        className="flex items-center gap-4 py-3.5 px-3 -mx-3 rounded-lg hover:bg-panel-2/60 transition-colors w-full text-left"
                      >
                        <img
                          src={p.imageUrl}
                          alt=""
                          className="w-12 h-12 rounded-lg object-cover border border-line shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-bone-dim font-medium">{p.modality} scan</p>
                          <p className="text-xs text-muted-2 font-mono mt-0.5">
                            {formatDateTime(p.createdAt)}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <Badge color={findingColor(p.finding)}>{p.finding}</Badge>
                          <p className="text-xs font-mono text-muted mt-1.5">
                            {formatPercent(p.confidence)}
                          </p>
                        </div>
                      </button>
                    ))}
                </div>
              )}
            </Panel>
          </div>
        )}
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
