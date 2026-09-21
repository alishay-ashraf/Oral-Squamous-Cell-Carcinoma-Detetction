export default function Logo({ size = 28 }: { size?: number }) {
  return (
    <div className="flex items-center gap-2.5">
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        <rect x="3" y="4" width="26" height="4" rx="1" fill="var(--amber)" opacity="0.9" />
        <rect x="3" y="11" width="26" height="4" rx="1" fill="var(--blue)" opacity="0.75" />
        <rect x="3" y="18" width="26" height="4" rx="1" fill="var(--teal)" opacity="0.6" />
        <rect x="3" y="25" width="26" height="3" rx="1" fill="var(--bone)" opacity="0.25" />
      </svg>
      <span className="font-display font-semibold text-lg tracking-tight text-bone">
        Med<span className="text-amber">Scan</span>
      </span>
    </div>
  );
}
