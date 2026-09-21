/**
 * API bridge for the FastAPI backend.
 * Set NEXT_PUBLIC_API_URL in .env.local to your running backend
 * (e.g. http://localhost:8000). See .env.local.example.
 */

import { DashboardStats, Patient, PredictionResult } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

export const backendConfigured = Boolean(API_BASE);

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  if (!API_BASE) {
    throw new Error("NEXT_PUBLIC_API_URL is not set. Add it to .env.local.");
  }
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API error ${res.status}: ${text || res.statusText}`);
  }
  return (await res.json()) as T;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  return apiFetch<DashboardStats>("/api/dashboard/stats");
}

export async function getPatients(): Promise<Patient[]> {
  return apiFetch<Patient[]>("/api/patients");
}

export async function getPatient(id: string): Promise<Patient | null> {
  try {
    return await apiFetch<Patient>(`/api/patients/${id}`);
  } catch {
    return null;
  }
}

export interface NewPatientInput {
  name: string;
  age: number;
  sex: "M" | "F" | "Other";
  phone?: string;
  email?: string;
}
export async function createPatient(input: NewPatientInput): Promise<Patient> {
  return apiFetch<Patient>("/api/patients", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function getPredictions(): Promise<PredictionResult[]> {
  return apiFetch<PredictionResult[]>("/api/predictions");
}

export async function getPredictionsForPatient(patientId: string): Promise<PredictionResult[]> {
  return apiFetch<PredictionResult[]>(`/api/predictions?patient_id=${patientId}`);
}

export async function predictImage(file: File, patientId: string): Promise<PredictionResult> {
  if (!API_BASE) {
    throw new Error("NEXT_PUBLIC_API_URL is not set. Add it to .env.local.");
  }
  const form = new FormData();
  form.append("file", file);
  form.append("patientId", patientId);
  const res = await fetch(`${API_BASE}/api/predict`, { method: "POST", body: form });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Prediction failed (${res.status}): ${text || res.statusText}`);
  }
  return (await res.json()) as PredictionResult;
}

export interface AuthResponse {
  token: string;
  name: string;
  email: string;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function signup(name: string, email: string, password: string): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
}



