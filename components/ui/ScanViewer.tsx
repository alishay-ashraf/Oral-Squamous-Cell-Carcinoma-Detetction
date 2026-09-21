"use client";

import { useEffect, useRef, useState } from "react";
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sun,
  Contrast,
  Layers,
} from "lucide-react";
import Badge from "./Badge";
import { findingColor, formatDateTime, formatPercent } from "@/lib/utils";
import { PredictionResult } from "@/lib/types";

interface ScanViewerProps {
  prediction: PredictionResult;
  open: boolean;
  onClose: () => void;
}

export default function ScanViewer({ prediction, open, onClose }: ScanViewerProps) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [heatmapOpacity, setHeatmapOpacity] = useState(60);

  const dragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  // Reset view state whenever a new scan is opened
  useEffect(() => {
    if (open) {
      setZoom(1);
      setPan({ x: 0, y: 0 });
      setBrightness(100);
      setContrast(100);
      setShowHeatmap(false);
      setHeatmapOpacity(60);
    }
  }, [open, prediction.id]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  function handleWheel(e: React.WheelEvent) {
    e.preventDefault();
    setZoom((z) => Math.min(6, Math.max(1, z - e.deltaY * 0.001 * z)));
  }

  function handleMouseDown(e: React.MouseEvent) {
    dragging.current = true;
    lastPos.current = { x: e.clientX, y: e.clientY };
  }

  function handleMouseMove(e: React.MouseEvent) {
    if (!dragging.current) return;
    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;
    lastPos.current = { x: e.clientX, y: e.clientY };
    setPan((p) => ({ x: p.x + dx, y: p.y + dy }));
  }

  function handleMouseUp() {
    dragging.current = false;
  }

  function resetView() {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setBrightness(100);
    setContrast(100);
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-5xl bg-panel border border-line rounded-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-line-soft shrink-0">
          <div>
            <p className="text-sm font-medium text-bone">{prediction.patientName}</p>
            <p className="text-xs text-muted-2 font-mono mt-0.5">
              {prediction.modality} · {formatDateTime(prediction.createdAt)}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge color={findingColor(prediction.finding)}>{prediction.finding}</Badge>
            <span className="text-xs font-mono text-muted">
              {formatPercent(prediction.confidence)}
            </span>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-panel-2 text-muted hover:text-bone transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Image canvas */}
        <div
          className="relative flex-1 bg-black overflow-hidden select-none min-h-[50vh] cursor-grab active:cursor-grabbing"
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transition: dragging.current ? "none" : "transform 0.05s linear",
            }}
          >
            <img
              src={prediction.imageUrl}
              alt="Scan"
              draggable={false}
              className="max-w-none max-h-[70vh] pointer-events-none"
              style={{ filter: `brightness(${brightness}%) contrast(${contrast}%)` }}
            />
            {prediction.heatmapUrl && showHeatmap && (
              <img
                src={prediction.heatmapUrl}
                alt="AI heatmap"
                draggable={false}
                className="absolute max-w-none max-h-[70vh] pointer-events-none mix-blend-screen"
                style={{ opacity: heatmapOpacity / 100 }}
              />
            )}
          </div>

          <div className="absolute bottom-3 left-3 text-[10px] font-mono text-white/40">
            Scroll to zoom · drag to pan
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-5 px-5 py-4 border-t border-line-soft shrink-0 bg-panel-2/40">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setZoom((z) => Math.max(1, z - 0.3))}
              className="p-1.5 rounded-md hover:bg-panel-3 text-muted hover:text-bone transition-colors"
            >
              <ZoomOut size={15} />
            </button>
            <span className="text-xs font-mono text-muted-2 w-10 text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom((z) => Math.min(6, z + 0.3))}
              className="p-1.5 rounded-md hover:bg-panel-3 text-muted hover:text-bone transition-colors"
            >
              <ZoomIn size={15} />
            </button>
            <button
              onClick={resetView}
              className="p-1.5 rounded-md hover:bg-panel-3 text-muted hover:text-bone transition-colors"
              title="Reset view"
            >
              <RotateCcw size={14} />
            </button>
          </div>

          <div className="flex items-center gap-2 flex-1 min-w-[140px]">
            <Sun size={14} className="text-muted shrink-0" />
            <input
              type="range"
              min={50}
              max={150}
              value={brightness}
              onChange={(e) => setBrightness(Number(e.target.value))}
              className="w-full accent-amber"
            />
          </div>

          <div className="flex items-center gap-2 flex-1 min-w-[140px]">
            <Contrast size={14} className="text-muted shrink-0" />
            <input
              type="range"
              min={50}
              max={150}
              value={contrast}
              onChange={(e) => setContrast(Number(e.target.value))}
              className="w-full accent-amber"
            />
          </div>

          {prediction.heatmapUrl && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowHeatmap((v) => !v)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  showHeatmap
                    ? "bg-amber/15 text-amber border border-amber/30"
                    : "text-muted hover:bg-panel-3 border border-transparent"
                }`}
              >
                <Layers size={13} />
                AI heatmap
              </button>
              {showHeatmap && (
                <input
                  type="range"
                  min={10}
                  max={100}
                  value={heatmapOpacity}
                  onChange={(e) => setHeatmapOpacity(Number(e.target.value))}
                  className="w-20 accent-amber"
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}