export type ScanModality = "Ultrasound";

export type Finding = "Normal" | "OSCC";


export interface ClassProbability {
  label: string;
  probability: number; // 0-1
}

export interface PredictionResult {
  id: string;
  patientId: string;
  patientName: string;
  modality: ScanModality;
  finding: Finding;
  confidence: number; // 0-1
  probabilities: ClassProbability[];
  imageUrl: string;
  heatmapUrl?: string;
  notes: string;
  modelVersion: string;
  inferenceMs: number;
  createdAt: string; // ISO
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  sex: "M" | "F" | "Other";
  mrn: string;
  phone?: string;
  email?: string;
  lastVisit: string;
  scanCount: number;
  riskFlag: "low" | "watch" | "elevated";
  avatarSeed: string;
}


export interface DashboardStats {
  totalScans: number;
  scansThisWeek: number;
  avgConfidence: number;
  avgInferenceMs: number;
  malignantFlags: number;
  activePatients: number;
}
