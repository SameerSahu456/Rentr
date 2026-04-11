import random
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
)
from app.models.user import User
from app.schemas.user import (
    UserRegister,
    UserLogin,
    PhoneOTPRequest,
    PhoneOTPVerify,
    TokenResponse,
    TokenRefreshRequest,
    UserResponse,
)

router = APIRouter(prefix="/auth", tags=["Authentication"])

# In-memory OTP store (use Redis in production)
_otp_store: dict[str, dict] = {}


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(payload: UserRegister, db: Session = Depends(get_db)):
    """Register a new user with email and password."""
    existing = db.query(User).filter(
        (User.email == payload.email)
        | (User.phone == payload.phone if payload.phone else False)
    ).first()
    if existing:
        if existing.email == payload.email:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email already registered",
            )
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Phone number already registered",
        )

    user = User(
        email=payload.email,
        phone=payload.phone,
        full_name=payload.full_name,
        password_hash=hash_password(payload.password),
        role=payload.role,
        company_name=payload.company_name,
        industry=payload.industry,
        gst_no=payload.gst_no,
        company_pan=payload.company_pan,
        city=payload.city,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=TokenResponse)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    """Login with email and password, returns JWT tokens."""
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated",
        )

    access_token = create_access_token(data={"sub": str(user.id)})
    refresh_token = create_refresh_token(data={"sub": str(user.id)})
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
    )


@router.post("/otp/request", status_code=status.HTTP_200_OK)
def request_otp(payload: PhoneOTPRequest, db: Session = Depends(get_db)):
    """Request an OTP for phone-based login. Creates user if not exists."""
    otp = str(random.randint(1000, 9999))
    _otp_store[payload.phone] = {
        "otp": otp,
        "expires_at": datetime.now(timezone.utc) + timedelta(seconds=300),
    }
    # In production, send OTP via SMS gateway
    return {"message": "OTP sent successfully", "otp_for_dev": otp}


@router.post("/otp/verify", response_model=TokenResponse)
def verify_otp(payload: PhoneOTPVerify, db: Session = Depends(get_db)):
    """Verify OTP and return JWT tokens. Creates user if first login."""
    stored = _otp_store.get(payload.phone)
    if not stored:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="OTP not found. Please request a new one.",
        )
    if datetime.now(timezone.utc) > stored["expires_at"]:
        _otp_store.pop(payload.phone, None)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="OTP has expired",
        )
    if stored["otp"] != payload.otp:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid OTP",
        )

    _otp_store.pop(payload.phone, None)

    user = db.query(User).filter(User.phone == payload.phone).first()
    if not user:
        # Auto-create user on first OTP login
        user = User(
            email=f"{payload.phone}@phone.rentr.in",
            phone=payload.phone,
            full_name="Phone User",
            password_hash=hash_password(str(random.randint(100000, 999999))),
            role="customer",
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    access_token = create_access_token(data={"sub": str(user.id)})
    refresh_token = create_refresh_token(data={"sub": str(user.id)})
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
    )


@router.post("/refresh", response_model=TokenResponse)
def refresh_token(payload: TokenRefreshRequest):
    """Refresh an access token using a valid refresh token."""
    token_data = decode_token(payload.refresh_token)
    if token_data.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid refresh token",
        )
    user_id = token_data.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid token payload",
        )

    access_token = create_access_token(data={"sub": user_id})
    new_refresh_token = create_refresh_token(data={"sub": user_id})
    return TokenResponse(
        access_token=access_token,
        refresh_token=new_refresh_token,
    )
