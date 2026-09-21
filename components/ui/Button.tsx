"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";
import { cx } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  icon?: ReactNode;
}

export default function Button({
  variant = "primary",
  size = "md",
  icon,
  className,
  children,
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber disabled:opacity-40 disabled:pointer-events-none";

  const variants: Record<string, string> = {
    primary: "bg-amber text-ink hover:brightness-110 active:brightness-95 shadow-[0_0_0_1px_rgba(255,180,84,0.4)]",
    secondary: "bg-panel-3 text-bone hover:bg-panel-2 border border-line",
    ghost: "bg-transparent text-muted hover:text-bone hover:bg-panel-2",
    danger: "bg-transparent text-coral border border-coral/40 hover:bg-coral/10",
  };

  const sizes: Record<string, string> = {
    sm: "text-xs px-3 py-1.5",
    md: "text-sm px-4 py-2.5",
    lg: "text-base px-6 py-3.5",
  };

  return (
    <button className={cx(base, variants[variant], sizes[size], className)} {...props}>
      {icon}
      {children}
    </button>
  );
}
