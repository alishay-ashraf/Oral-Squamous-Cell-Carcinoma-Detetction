"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, ChevronRight, UserPlus } from "lucide-react";
import RequireAuth from "@/components/auth/RequireAuth";
import AppShell from "@/components/layout/AppShell";
import Panel from "@/components/ui/Panel";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import TextField from "@/components/ui/TextField";
import { createPatient, getPatients } from "@/lib/api";
import { Patient } from "@/lib/types";
import { formatDate, riskColor } from "@/lib/utils";

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", age: "", sex: "F" as "M" | "F" | "Other", phone: "", email: "" });

  function refresh() {
    setLoading(true);
    getPatients().then((p) => {
      setPatients(p);
      setLoading(false);
    });
  }

  useEffect(() => {
    refresh();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
        const age = Number(form.age);
    if (!form.name.trim() || !age || age <= 0) {
      setFormError("Fill in a name and a valid age.");
      return;
    }
    setSaving(true);
    try {
            await createPatient({
        name: form.name.trim(), age, sex: form.sex,
        phone: form.phone.trim() || undefined,
        email: form.email.trim() || undefined,
      });
      setForm({ name: "", age: "", sex: "F", phone: "", email: "" });
      setModalOpen(false);
      refresh();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Couldn't create patient.");
    } finally {
      setSaving(false);
    }
  }

  const filtered = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.mrn.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <RequireAuth>
      <AppShell title="Patients" subtitle="Records for everyone in your workspace.">
        <div className="flex items-center gap-3 mb-5">
          <Panel className="p-4 flex items-center gap-2 bg-panel border border-line rounded-lg px-3 py-2 max-w-sm flex-1">
            <Search size={15} className="text-muted-2" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or MRN…"
              className="bg-transparent text-sm text-bone placeholder:text-muted-2 outline-none w-full"
            />
          </Panel>
          <Button variant="primary" icon={<UserPlus size={16} />} onClick={() => setModalOpen(true)}>
            New patient
          </Button>
        </div>

        <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Register a new patient">
          <form onSubmit={handleCreate} className="space-y-4">
            <TextField
              label="Full name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Jane Doe"
            />
            <div className="grid grid-cols-2 gap-3">
              <TextField
                label="Age"
                type="number"
                min={0}
                value={form.age}
                onChange={(e) => setForm({ ...form, age: e.target.value })}
                placeholder="41"
              />
              <div>
                <label className="block text-xs font-mono uppercase tracking-wide text-muted mb-2">Sex</label>
                <select
                  value={form.sex}
                  onChange={(e) => setForm({ ...form, sex: e.target.value as "M" | "F" | "Other" })}
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
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+1 555 123 4567"
            />
            <TextField
              label="Email (optional)"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="patient@example.com"
            />
            {formError && <p className="text-sm text-coral">{formError}</p>}
            <Button type="submit" variant="primary" className="w-full" disabled={saving}>
              {saving ? "Saving…" : "Add patient"}
            </Button>
          </form>
        </Modal>

        {loading ? (
          <p className="text-sm text-muted font-mono">Loading patients…</p>
        ) : (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((p) => (
              <Link key={p.id} href={`/patients/${p.id}`}>
                <Panel className="p-5 h-full hover:border-amber/40 transition-colors group cursor-pointer">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-panel-3 border border-line flex items-center justify-center font-mono text-sm text-amber shrink-0">
                        {p.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-bone">{p.name}</p>
                        <p className="text-xs text-muted-2 font-mono mt-0.5">{p.mrn}</p>
                      </div>
                    </div>
                    <ChevronRight
                      size={16}
                      className="text-muted-2 group-hover:text-amber group-hover:translate-x-0.5 transition-all mt-2"
                    />
                  </div>

                  <div className="mt-4 flex items-center justify-between text-xs text-muted">
                    <span>
                      {p.age}y · {p.sex}
                    </span>
                    <span className="font-mono">{p.scanCount} scans</span>
                  </div>
                  <div className="mt-4 pt-4 border-t border-line-soft flex items-center justify-between">
                    <span className="text-xs text-muted-2">Last visit {formatDate(p.lastVisit)}</span>
                    <Badge color={riskColor(p.riskFlag)}>{p.riskFlag}</Badge>
                  </div>
                </Panel>
              </Link>
            ))}
          </div>
        )}
      </AppShell>
    </RequireAuth>
  );
}