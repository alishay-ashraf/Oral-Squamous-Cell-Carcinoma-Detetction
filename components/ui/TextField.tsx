"use client";

import { InputHTMLAttributes } from "react";

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export default function TextField({ label, id, ...props }: TextFieldProps) {
  const inputId = id || label.toLowerCase().replace(/\s/g, "-");
  return (
    <div>
      <label htmlFor={inputId} className="block text-xs font-mono uppercase tracking-wide text-muted mb-2">
        {label}
      </label>
      <input
        id={inputId}
        className="w-full bg-panel border border-line rounded-lg px-3.5 py-2.5 text-sm text-bone placeholder:text-muted-2 outline-none focus:border-amber focus:ring-1 focus:ring-amber/50 transition-colors"
        {...props}
      />
    </div>
  );
}
