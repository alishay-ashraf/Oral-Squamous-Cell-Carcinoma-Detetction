from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from datetime import datetime

def to_camel(s: str) -> str:
    parts = s.split("_")
    return parts[0] + "".join(p.title() for p in parts[1:])

class CamelModel(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True, from_attributes=True)

class ClassProbabilityOut(CamelModel):
    label: str
    probability: float

class PatientOut(CamelModel):
    id: str
    name: str
    age: int
    sex: str
    mrn: str
    phone: Optional[str] = None
    email: Optional[str] = None
    last_visit: datetime
    scan_count: int
    risk_flag: str
    avatar_seed: str

class PatientCreate(BaseModel):
    name: str
    age: int
    sex: str
    phone: Optional[str] = None
    email: Optional[str] = None

class PredictionOut(CamelModel):
    id: str
    patient_id: str
    patient_name: str
    modality: str
    finding: str
    confidence: float
    probabilities: List[ClassProbabilityOut]
    image_url: str
    heatmap_url: Optional[str] = None
    notes: str
    model_version: str
    inference_ms: int
    created_at: datetime

class DashboardStatsOut(CamelModel):
    total_scans: int
    scans_this_week: int
    avg_confidence: float
    avg_inference_ms: int
    malignant_flags: int
    active_patients: int

class LoginRequest(BaseModel):
    email: str
    password: str

class SignupRequest(BaseModel):
    name: str
    email: str
    password: str

class AuthResponse(BaseModel):
    token: str
    name: str
    email: str


