"use client";

import { motion } from "framer-motion";
import { ClassProbability, Finding } from "@/lib/types";
import { findingColor, formatPercent } from "@/lib/utils";

export default function ProbabilityBar({ item }: { item: ClassProbability }) {
  const color = findingColor(item.label as Finding);
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1.5">
        <span className="text-bone-dim font-medium">{item.label}</span>
        <span className="font-mono text-muted">{formatPercent(item.probability)}</span>
      </div>
      <div className="h-2 rounded-full bg-panel-3 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${item.probability * 100}%` }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
