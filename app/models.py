import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, JSON, Text
from sqlalchemy.orm import relationship
from app.database import Base

def gen_id(prefix):
    return f"{prefix}-{uuid.uuid4().hex[:10]}"

class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, default=lambda: gen_id("usr"))
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class Patient(Base):
    __tablename__ = "patients"
    id = Column(String, primary_key=True, default=lambda: gen_id("pt"))
    name = Column(String, nullable=False)
    age = Column(Integer, nullable=False)
    sex = Column(String, nullable=False)
    mrn = Column(String, unique=True, nullable=False)
    phone = Column(String, nullable=True)
    email = Column(String, nullable=True)
    last_visit = Column(DateTime, default=datetime.utcnow)
    risk_flag = Column(String, default="low")
    created_at = Column(DateTime, default=datetime.utcnow)

    predictions = relationship("Prediction", back_populates="patient")

class Prediction(Base):
    __tablename__ = "predictions"
    id = Column(String, primary_key=True, default=lambda: gen_id("pred"))
    patient_id = Column(String, ForeignKey("patients.id"), nullable=False)
    modality = Column(String, default="Ultrasound")
    finding = Column(String, nullable=False)
    confidence = Column(Float, nullable=False)
    probabilities = Column(JSON, nullable=False)
    image_path = Column(String, nullable=False)
    heatmap_path = Column(String, nullable=True)
    notes = Column(Text, default="")
    model_version = Column(String, default="oscc_second")
    inference_ms = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    patient = relationship("Patient", back_populates="predictions")