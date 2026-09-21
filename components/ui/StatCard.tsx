"use client";

import { ReactNode, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import Panel from "./Panel";

export default function StatCard({
  label,
  value,
  sublabel,
  accent = "var(--amber)",
  icon,
}: {
  label: string;
  value: string;
  sublabel?: string;
  accent?: string;
  icon?: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-40, 40], [8, -8]), { stiffness: 200, damping: 20 });
  const rotateY = useSpring(useTransform(x, [-40, 40], [-8, 8]), { stiffness: 200, damping: 20 });

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set(e.clientX - rect.left - rect.width / 2);
    y.set(e.clientY - rect.top - rect.height / 2);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformPerspective: 800 }}
      className="will-change-transform h-full"
    >
      <Panel className="p-5 relative overflow-hidden group h-full flex flex-col">
        <div
          className="absolute -top-10 -right-10 w-28 h-28 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity"
          style={{ background: accent }}
        />
        <div className="flex items-start justify-between relative h-full">
          <div className="flex flex-col">
            <p className="text-xs uppercase tracking-wider text-muted font-mono">{label}</p>
            <p className="mt-2 text-3xl font-display font-semibold text-bone">{value}</p>
            {sublabel && (
              <p className="mt-1 text-xs text-muted-2 line-clamp-1">{sublabel}</p>
            )}
          </div>
          {icon && (
            <div
              className="p-2 rounded-lg shrink-0"
              style={{ color: accent, backgroundColor: `${accent}1a` }}
            >
              {icon}
            </div>
          )}
        </div>
      </Panel>
    </motion.div>
  );
}