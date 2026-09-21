import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from app.database import get_db
from app import models, schemas

router = APIRouter(prefix="/api/patients", tags=["patients"])

def _to_out(p: models.Patient) -> schemas.PatientOut:
    return schemas.PatientOut(
        id=p.id, name=p.name, age=p.age, sex=p.sex, mrn=p.mrn,
        phone=p.phone, email=p.email,
        last_visit=p.last_visit, scan_count=len(p.predictions),
        risk_flag=p.risk_flag, avatar_seed=p.name.lower().replace(" ", "-"),
    )

def _generate_mrn() -> str:
    return f"MRN-{uuid.uuid4().hex[:8].upper()}"

@router.get("", response_model=list[schemas.PatientOut])
def list_patients(db: Session = Depends(get_db)):
    return [_to_out(p) for p in db.query(models.Patient).order_by(models.Patient.name).all()]

@router.get("/{patient_id}", response_model=schemas.PatientOut)
def get_patient(patient_id: str, db: Session = Depends(get_db)):
    p = db.query(models.Patient).get(patient_id)
    if not p:
        raise HTTPException(404, "Patient not found.")
    return _to_out(p)

@router.post("", response_model=schemas.PatientOut)
def create_patient(body: schemas.PatientCreate, db: Session = Depends(get_db)):
    # MRNs are server-generated; retry a few times on the astronomically
    # unlikely chance of a collision with an existing one.
    for _ in range(5):
        p = models.Patient(
            name=body.name, age=body.age, sex=body.sex, mrn=_generate_mrn(),
            phone=body.phone, email=body.email,
        )
        db.add(p)
        try:
            db.commit()
        except IntegrityError:
            db.rollback()
            continue
        db.refresh(p)
        return _to_out(p)
    raise HTTPException(500, "Couldn't generate a unique MRN. Try again.")  