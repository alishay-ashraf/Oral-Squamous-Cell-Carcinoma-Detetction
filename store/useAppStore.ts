"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Session {
  name: string;
  email: string;
  token: string;
}

interface Preferences {
  defaultModality: "Ultrasound";
  confidenceThreshold: number; // 0-1, flag predictions below this
  emailAlerts: boolean;
  autoSaveToHistory: boolean;
}

interface AppState {
  session: Session | null;
  setSession: (s: Session | null) => void;
  preferences: Preferences;
  setPreferences: (p: Partial<Preferences>) => void;
  hasHydrated: boolean;
  setHasHydrated: (v: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      session: null,
      setSession: (session) => set({ session }),
      preferences: {
        defaultModality: "Ultrasound",
        confidenceThreshold: 0.7,
        emailAlerts: true,
        autoSaveToHistory: true,
      },
      setPreferences: (p) =>
        set((state) => ({ preferences: { ...state.preferences, ...p } })),
      hasHydrated: false,
      setHasHydrated: (v) => set({ hasHydrated: v }),
    }),
    {
      name: "medscan-session",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
