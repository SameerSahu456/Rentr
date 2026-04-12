from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import (
    create_access_token,
    get_current_distributor,
    hash_password,
    verify_password,
)
from app.models.models import DistributorUser

router = APIRouter(prefix="/auth", tags=["distributor-auth"])


class DistributorLogin(BaseModel):
    email: EmailStr
    password: str


class DistributorSignup(BaseModel):
    email: EmailStr
    name: str
    password: str
    phone: str | None = None
    company_name: str
    gstin: str | None = None
    pan: str | None = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


@router.post("/login", response_model=TokenResponse)
def distributor_login(payload: DistributorLogin, db: Session = Depends(get_db)):
    user = db.query(DistributorUser).filter(DistributorUser.email == payload.email).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is disabled")
    token = create_access_token(data={"sub": str(user.id), "email": user.email, "user_type": "distributor"})
    return {"access_token": token, "token_type": "bearer"}


@router.get("/me")
def distributor_me(current: DistributorUser = Depends(get_current_distributor)):
    return {
        "id": current.id,
        "email": current.email,
        "name": current.name,
        "phone": current.phone,
        "company_name": current.company_name,
        "gstin": current.gstin,
        "pan": current.pan,
        "is_active": current.is_active,
        "partner_email": current.partner_email,
        "commission_rate": current.commission_rate,
        "credit_limit": current.credit_limit,
        "credit_used": current.credit_used,
        "created_at": current.created_at.isoformat() if current.created_at else None,
    }


@router.put("/profile")
def update_profile(
    payload: dict,
    db: Session = Depends(get_db),
    current: DistributorUser = Depends(get_current_distributor),
):
    allowed = {"name", "phone", "company_name", "gstin", "pan"}
    for key, val in payload.items():
        if key in allowed and val is not None:
            setattr(current, key, val)
    db.commit()
    db.refresh(current)
    return {"message": "Profile updated"}
