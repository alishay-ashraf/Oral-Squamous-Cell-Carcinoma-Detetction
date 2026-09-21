"use client";

import { useState } from "react";
import { Check, Save } from "lucide-react";
import RequireAuth from "@/components/auth/RequireAuth";
import AppShell from "@/components/layout/AppShell";
import Panel from "@/components/ui/Panel";
import Button from "@/components/ui/Button";
import TextField from "@/components/ui/TextField";
import { backendConfigured } from "@/lib/api";
import { useAppStore } from "@/store/useAppStore";
import { cx } from "@/lib/utils";


export default function SettingsPage() {
  const session = useAppStore((s) => s.session);
  const setSession = useAppStore((s) => s.setSession);
  const preferences = useAppStore((s) => s.preferences);
  const setPreferences = useAppStore((s) => s.setPreferences);

  const [name, setName] = useState(session?.name ?? "");
  const [email, setEmail] = useState(session?.email ?? "");
  const [saved, setSaved] = useState(false);

  function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (session) setSession({ ...session, name, email });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <RequireAuth>
      <AppShell title="Settings" subtitle="Your profile, model preferences, and backend connection.">
        <div className="grid lg:grid-cols-2 gap-6 max-w-4xl">

          <Panel className="p-6 lg:col-span-2">
            <h2 className="font-display font-semibold text-lg mb-4">Model preferences</h2>
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wide text-muted mb-2">
                  Imaging modality
                </label>
                <p className="text-sm text-bone-dim">Ultrasound</p>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wide text-muted mb-2">
                  Confidence flag threshold — {(preferences.confidenceThreshold * 100).toFixed(0)}%
                </label>
                <input
                  type="range"
                  min={0.5}
                  max={0.95}
                  step={0.05}
                  value={preferences.confidenceThreshold}
                  onChange={(e) => setPreferences({ confidenceThreshold: Number(e.target.value) })}
                  className="w-full accent-amber"
                />
                <p className="text-xs text-muted-2 mt-2">
                  Reads below this confidence are flagged for radiologist review.
                </p>
              </div>
            </div>

            <div className="mt-6">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="text-sm text-bone-dim">Auto-save reads to patient history</p>
                  <p className="text-xs text-muted-2 mt-0.5">Every prediction is attached to the selected patient record.</p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.autoSaveToHistory}
                  onChange={(e) => setPreferences({ autoSaveToHistory: e.target.checked })}
                  className="w-4 h-4 accent-amber"
                />
              </label>
            </div>
          </Panel>
        </div>
      </AppShell>
    </RequireAuth>
  );
}