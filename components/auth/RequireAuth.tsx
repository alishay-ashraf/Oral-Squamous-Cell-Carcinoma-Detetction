"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";

export default function RequireAuth({ children }: { children: ReactNode }) {
  const session = useAppStore((s) => s.session);
  const hasHydrated = useAppStore((s) => s.hasHydrated);
  const router = useRouter();

  useEffect(() => {
    if (hasHydrated && !session) {
      router.replace("/login");
    }
  }, [hasHydrated, session, router]);

  if (!hasHydrated || !session) {
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center">
        <div className="w-2 h-2 rounded-full bg-amber animate-pulse-soft" />
      </div>
    );
  }

  return <>{children}</>;
}
