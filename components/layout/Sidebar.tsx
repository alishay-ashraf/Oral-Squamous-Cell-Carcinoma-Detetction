"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  ScanLine,
  History,
  Users,
  Settings,
  LogOut,
} from "lucide-react";
import Logo from "./Logo";
import { cx } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";
import { useRouter } from "next/navigation";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { href: "/predict", label: "Predict", icon: ScanLine },
  { href: "/history", label: "History", icon: History },
  { href: "/patients", label: "Patients", icon: Users },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const setSession = useAppStore((s) => s.setSession);
  const session = useAppStore((s) => s.session);

  function handleLogout() {
    setSession(null);
    router.push("/login");
  }

  return (
    <aside className="w-64 shrink-0 border-r border-line bg-ink-2 flex flex-col h-screen sticky top-0">
      <div className="px-6 py-6 border-b border-line-soft">
        <Logo />
      </div>

      <nav className="flex-1 px-3 py-5 space-y-1">
        {NAV.map((item) => {
          const active = pathname === item.href || pathname?.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cx(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors relative",
                active
                  ? "text-ink bg-amber"
                  : "text-muted hover:text-bone hover:bg-panel-2"
              )}
            >
              <Icon size={17} strokeWidth={2} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-line-soft">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg mb-1">
          <div className="w-8 h-8 rounded-full bg-panel-3 flex items-center justify-center text-xs font-mono text-amber border border-line">
            {(session?.name || "DR")[0]?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm text-bone truncate">{session?.name || "Demo Clinician"}</p>
            <p className="text-xs text-muted-2 truncate">{session?.email || "demo@medscan.ai"}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted hover:text-coral hover:bg-coral/10 transition-colors"
        >
          <LogOut size={16} />
          Log out
        </button>
      </div>
    </aside>
  );
}
