from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas, security

router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.post("/signup", response_model=schemas.AuthResponse)
def signup(body: schemas.SignupRequest, db: Session = Depends(get_db)):
    if db.query(models.User).filter(models.User.email == body.email).first():
        raise HTTPException(400, "An account with this email already exists.")
    user = models.User(name=body.name, email=body.email, hashed_password=security.hash_password(body.password))
    db.add(user)
    db.commit()
    return schemas.AuthResponse(token=security.create_token(user.email), name=user.name, email=user.email)

@router.post("/login", response_model=schemas.AuthResponse)
def login(body: schemas.LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == body.email).first()
    if not user or not security.verify_password(body.password, user.hashed_password):
        raise HTTPException(401, "Invalid email or password.")
    return schemas.AuthResponse(token=security.create_token(user.email), name=user.name, email=user.email)

