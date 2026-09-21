import { Finding } from "./types";

export function cx(...args: Array<string | false | null | undefined>) {
  return args.filter(Boolean).join(" ");
}

export function formatPercent(v: number, digits = 1) {
  return `${(v * 100).toFixed(digits)}%`;
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function findingColor(finding: Finding) {
  switch (finding) {
    case "Normal":
      return "var(--teal)";
    case "OSCC":
      return "var(--coral)";
    default:
      return "var(--muted)";
  }
}



export function riskColor(risk: "low" | "watch" | "elevated") {
  switch (risk) {
    case "low":
      return "var(--teal)";
    case "watch":
      return "var(--amber)";
    case "elevated":
      return "var(--coral)";
  }
}
