from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class UserBase(BaseModel):
    email: EmailStr
    full_name: str = Field(..., min_length=1, max_length=255)
    phone: Optional[str] = Field(None, max_length=20)
    role: str = Field(default="customer", pattern="^(customer|partner)$")


class UserRegister(UserBase):
    password: str = Field(..., min_length=8, max_length=128)
    company_name: Optional[str] = None
    industry: Optional[str] = None
    gst_no: Optional[str] = None
    company_pan: Optional[str] = None
    city: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class PhoneOTPRequest(BaseModel):
    phone: str = Field(..., max_length=20)


class PhoneOTPVerify(BaseModel):
    phone: str = Field(..., max_length=20)
    otp: str = Field(..., min_length=4, max_length=6)


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenRefreshRequest(BaseModel):
    refresh_token: str


class UserResponse(BaseModel):
    id: int
    email: str
    phone: Optional[str] = None
    full_name: str
    role: str
    company_name: Optional[str] = None
    industry: Optional[str] = None
    gst_no: Optional[str] = None
    company_pan: Optional[str] = None
    city: Optional[str] = None
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class UserUpdate(BaseModel):
    full_name: Optional[str] = Field(None, min_length=1, max_length=255)
    phone: Optional[str] = Field(None, max_length=20)
    city: Optional[str] = None


class CompanyUpdate(BaseModel):
    company_name: Optional[str] = None
    industry: Optional[str] = None
    gst_no: Optional[str] = None
    company_pan: Optional[str] = None


class PasswordChange(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=8, max_length=128)
