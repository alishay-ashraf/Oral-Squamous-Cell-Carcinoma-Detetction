"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, ScanLine, Layers, Image as ImageIcon, RotateCcw, UserPlus, Download } from "lucide-react";
import RequireAuth from "@/components/auth/RequireAuth";
import AppShell from "@/components/layout/AppShell";
import Panel from "@/components/ui/Panel";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import TextField from "@/components/ui/TextField";
import ProbabilityBar from "@/components/predict/ProbabilityBar";
import ConfidenceRing from "@/components/three/ConfidenceRing";
import { createPatient, getPatients, predictImage } from "@/lib/api";
import { downloadPredictionPdf } from "@/lib/pdfReport";
import { Patient, PredictionResult } from "@/lib/types";
import { cx, findingColor, formatDateTime } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";

export default function PredictPage() {
  const preferences = useAppStore((s) => s.preferences);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [patientId, setPatientId] = useState("");
  const modality = "Ultrasound";
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [view, setView] = useState<"scan" | "heatmap">("scan");
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);


  // New patient modal
  const [patientModalOpen, setPatientModalOpen] = useState(false);
  const [savingPatient, setSavingPatient] = useState(false);
  const [patientFormError, setPatientFormError] = useState<string | null>(null);
  const [patientForm, setPatientForm] = useState({ name: "", age: "", sex: "F" as "M" | "F" | "Other", phone: "", email: "" });

  function loadPatients(selectId?: string) {
    getPatients().then((pts) => {
      setPatients(pts);
      if (selectId) {
        setPatientId(selectId);
      } else if (pts[0] && !patientId) {
        setPatientId(pts[0].id);
      }
    });
  }

  useEffect(() => {
    loadPatients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleCreatePatient(e: React.FormEvent) {
    e.preventDefault();
    setPatientFormError(null);
    const age = Number(patientForm.age);
    if (!patientForm.name.trim() || !age || age <= 0) {
      setPatientFormError("Fill in a name and a valid age.");
      return;
    }
    setSavingPatient(true);
    try {
            const created = await createPatient({
        name: patientForm.name.trim(), age, sex: patientForm.sex,
        phone: patientForm.phone.trim() || undefined,
        email: patientForm.email.trim() || undefined,
      });
      setPatientForm({ name: "", age: "", sex: "F", phone: "", email: "" });
      setPatientModalOpen(false);
      loadPatients(created.id);
    } catch (err) {
      setPatientFormError(err instanceof Error ? err.message : "Couldn't create patient.");
    } finally {
      setSavingPatient(false);
    }
  }

  function handleFile(f: File | null) {
    if (!f) return;
    setFile(f);
    setResult(null);
    setView("scan");
    setPreviewUrl(URL.createObjectURL(f));
  }

  async function handleRun() {
    if (!file || !patientId) return;
    setRunning(true);
    try {
      const res = await predictImage(file, patientId);
      setResult(res);
    } finally {
      setRunning(false);
    }
  }

    function handleReset() {
    setFile(null);
    setPreviewUrl(null);
    setResult(null);
  }

  
  async function handleDownloadPdf() {
    if (!result) return;
    setDownloadingPdf(true);
    try {
      await downloadPredictionPdf(result);
    } finally {
      setDownloadingPdf(false);
    }
  }

  const belowThreshold = result && result.confidence < preferences.confidenceThreshold;

  return (
    <RequireAuth>
      <AppShell title="Predict" subtitle="Upload a scan to get a structured, confidence-scored read.">
        <div className="grid lg:grid-cols-5 gap-6">
          {/* Left: upload + controls */}
          <div className="lg:col-span-2 space-y-5">
            <Panel className="p-6">
              <h2 className="font-display font-semibold text-lg mb-4">Scan input</h2>

              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragging(false);
                  handleFile(e.dataTransfer.files?.[0] ?? null);
                }}
                onClick={() => inputRef.current?.click()}
                className={cx(
                  "relative rounded-xl border-2 border-dashed cursor-pointer transition-colors overflow-hidden",
                  "aspect-square flex flex-col items-center justify-center gap-3 text-center px-6",
                  dragging ? "border-amber bg-amber/5" : "border-line hover:border-muted-2 bg-panel-2/40"
                )}
              >
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
                />
                {previewUrl ? (
                  <img src={previewUrl} alt="Selected scan preview" className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                  <>
                    <div className="p-3 rounded-full bg-panel-3 text-amber">
                      <Upload size={20} />
                    </div>
                    <p className="text-sm text-bone-dim font-medium">Drop a scan image here</p>
                    <p className="text-xs text-muted-2">JPG, PNG, or DICOM-exported PNG — click to browse</p>
                  </>
                )}
              </div>

              {file && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleReset();
                  }}
                  className="mt-3 flex items-center gap-1.5 text-xs text-muted hover:text-coral transition-colors"
                >
                  <RotateCcw size={12} /> Clear selection
                </button>
              )}

              <div className="mt-5 space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-mono uppercase tracking-wide text-muted">
                      Patient
                    </label>
                    <button
                      onClick={() => setPatientModalOpen(true)}
                      className="flex items-center gap-1 text-xs text-amber hover:underline"
                    >
                      <UserPlus size={12} /> New patient
                    </button>
                  </div>
                  <select
                    value={patientId}
                    onChange={(e) => setPatientId(e.target.value)}
                    className="w-full bg-panel border border-line rounded-lg px-3.5 py-2.5 text-sm text-bone outline-none focus:border-amber transition-colors"
                  >
                    {patients.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} · {p.mrn}
                      </option>
                    ))}
                  </select>
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  className="w-full"
                  disabled={!file || !patientId || running}
                  onClick={handleRun}
                  icon={<ScanLine size={18} />}
                >
                  {running ? "Reading scan…" : "Run prediction"}
                </Button>
                
              </div>
            </Panel>
          </div>

          {/* Right: result */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {running && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full min-h-[420px]"
                >
                  <Panel className="p-6 h-full flex flex-col items-center justify-center gap-4">
                    <div className="w-40 h-40">
                      <ConfidenceRing confidence={0.75} color="#4c8dff" />
                    </div>
                    <p className="text-sm text-muted font-mono animate-pulse-soft">
                      Anlyizing uploaded image
                    </p>
                  </Panel>
                </motion.div>
              )}

              {!running && result && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-5"
                >
                  <Panel className="p-6">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="font-display font-semibold text-xl">{result.finding}</h2>
                          <Badge color={findingColor(result.finding)}>
                            {(result.confidence * 100).toFixed(1)}% confidence
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-2 font-mono mt-1.5">
                          {result.patientName} · {modality} · read at {formatDateTime(result.createdAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {result.heatmapUrl && (
                          <div className="flex items-center gap-1 bg-panel border border-line rounded-lg p-1">
                            <button
                              onClick={() => setView("scan")}
                              className={cx(
                                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                                view === "scan" ? "bg-panel-3 text-bone" : "text-muted hover:text-bone"
                              )}
                            >
                              <ImageIcon size={13} /> Scan
                            </button>
                            <button
                              onClick={() => setView("heatmap")}
                              className={cx(
                                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                                view === "heatmap" ? "bg-panel-3 text-bone" : "text-muted hover:text-bone"
                              )}
                            >
                              <Layers size={13} /> Saliency
                            </button>
                          </div>
                        )}
                                                <Button
                          variant="secondary"
                          size="sm"
                          onClick={handleDownloadPdf}
                          disabled={downloadingPdf}
                          icon={<Download size={14} />}
                        >
                          {downloadingPdf ? "Preparing…" : "PDF"}
                        </Button>
                        
                      </div>
                    </div>

                    {belowThreshold && (
                      <div className="mt-4 text-xs font-mono px-3 py-2 rounded-lg border border-amber/40 bg-amber/10 text-amber">
                        Confidence is below your {(preferences.confidenceThreshold * 100).toFixed(0)}%
                        threshold — consider a radiologist review.
                      </div>
                    )}

                    <div className="mt-5 grid sm:grid-cols-2 gap-5">
                      <div className="rounded-xl overflow-hidden border border-line aspect-square relative bg-panel-2">
                        <img
                          src={view === "scan" || !result.heatmapUrl ? result.imageUrl : result.heatmapUrl}
                          alt={view === "scan" ? "Uploaded scan" : "Saliency heatmap overlay"}
                          className="w-full h-full object-cover"
                        />
                        {view === "heatmap" && (
                          <div className="absolute inset-0 bg-gradient-to-t from-coral/25 via-transparent to-transparent mix-blend-screen" />
                        )}
                      </div>
                      <div className="flex flex-col justify-center">
                        <div className="w-full aspect-square max-h-48 mx-auto">
                          <ConfidenceRing
                            confidence={result.confidence}
                            color={findingColor(result.finding)}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 space-y-3">
                      <p className="text-xs font-mono uppercase tracking-wide text-muted">
                        Probability breakdown
                      </p>
                      {result.probabilities.map((p) => (
                        <ProbabilityBar key={p.label} item={p} />
                      ))}
                    </div>

                    <div className="mt-6 pt-5 border-t border-line-soft grid sm:grid-cols-2 gap-5 text-xs font-mono text-muted">
                      <div>
                        <p className="text-muted-2 uppercase tracking-wide mb-1">Model version</p>
                        <p className="text-bone-dim">{result.modelVersion}</p>
                      </div>
                      <div>
                        <p className="text-muted-2 uppercase tracking-wide mb-1">Inference time</p>
                        <p className="text-bone-dim">{result.inferenceMs}ms</p>
                      </div>
                    </div>

                    <div className="mt-5">
                      <p className="text-xs font-mono uppercase tracking-wide text-muted mb-2">
                        Clinical notes
                      </p>
                      <p className="text-sm text-bone-dim leading-relaxed bg-panel-2/60 border border-line-soft rounded-lg p-4">
                        {result.notes}
                      </p>
                    </div>
                  </Panel>
                </motion.div>
              )}

              {!running && !result && (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full min-h-[420px]"
                >
                  <Panel className="p-6 h-full min-h-[420px] flex flex-col items-center justify-center text-center gap-3">
                    <div className="p-3 rounded-full bg-panel-3 text-muted">
                      <ScanLine size={22} />
                    </div>
                    <p className="text-sm text-bone-dim font-medium">No read yet</p>
                    <p className="text-xs text-muted-2 max-w-xs">
                      Upload a scan on the left and run a prediction to see the structured result here.
                    </p>
                  </Panel>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <Modal open={patientModalOpen} onClose={() => setPatientModalOpen(false)} title="Register a new patient">
          <form onSubmit={handleCreatePatient} className="space-y-4">
            <TextField
              label="Full name"
              value={patientForm.name}
              onChange={(e) => setPatientForm({ ...patientForm, name: e.target.value })}
              placeholder="Jane Doe"
            />
            <div className="grid grid-cols-2 gap-3">
              <TextField
                label="Age"
                type="number"
                min={0}
                value={patientForm.age}
                onChange={(e) => setPatientForm({ ...patientForm, age: e.target.value })}
                placeholder="41"
              />
              <div>
                <label className="block text-xs font-mono uppercase tracking-wide text-muted mb-2">Sex</label>
                <select
                  value={patientForm.sex}
                  onChange={(e) => setPatientForm({ ...patientForm, sex: e.target.value as "M" | "F" | "Other" })}
                  className="w-full bg-panel border border-line rounded-lg px-3.5 py-2.5 text-sm text-bone outline-none focus:border-amber transition-colors"
                >
                  <option value="F">F</option>
                  <option value="M">M</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
                        <TextField
              label="Phone (optional)"
              type="tel"
              value={patientForm.phone}
              onChange={(e) => setPatientForm({ ...patientForm, phone: e.target.value })}
              placeholder="+1 555 123 4567"
            />
            <TextField
              label="Email (optional)"
              type="email"
              value={patientForm.email}
              onChange={(e) => setPatientForm({ ...patientForm, email: e.target.value })}
              placeholder="patient@example.com"
            />
            {patientFormError && <p className="text-sm text-coral">{patientFormError}</p>}
            <Button type="submit" variant="primary" className="w-full" disabled={savingPatient}>
              {savingPatient ? "Saving…" : "Add patient"}
            </Button>
          </form>
        </Modal>
                
      </AppShell>
    </RequireAuth>
  );
}