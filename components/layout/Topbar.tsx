"use client";

export default function Topbar({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between gap-4 px-8 py-5 border-b border-line-soft bg-ink/85 backdrop-blur-md">
      <div>
        <h1 className="text-xl font-display font-semibold text-bone">{title}</h1>
        {subtitle && <p className="text-sm text-muted mt-0.5">{subtitle}</p>}
      </div>
    </header>
  );
}