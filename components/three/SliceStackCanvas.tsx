"use client";

import dynamic from "next/dynamic";

const SliceStack = dynamic(() => import("./SliceStack"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-2 h-2 rounded-full bg-amber animate-pulse-soft" />
    </div>
  ),
});

export default function SliceStackCanvas({ dense = false }: { dense?: boolean }) {
  return <SliceStack dense={dense} />;
}
