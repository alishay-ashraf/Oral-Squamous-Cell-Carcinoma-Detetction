import { ReactNode } from "react";
import { cx } from "@/lib/utils";

export default function Badge({
  children,
  color,
  className,
}: {
  children: ReactNode;
  color?: string;
  className?: string;
}) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium font-mono tracking-wide",
        className
      )}
      style={
        color
          ? {
              color,
              backgroundColor: `${color}1a`,
              border: `1px solid ${color}40`,
            }
          : undefined
      }
    >
      {color && <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />}
      {children}
    </span>
  );
}
