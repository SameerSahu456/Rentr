from datetime import datetime, timedelta, timezone

import bcrypt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(
        plain_password.encode("utf-8"), hashed_password.encode("utf-8")
    )


def hash_password(password: str) -> str:
    return bcrypt.hashpw(
        password.encode("utf-8"), bcrypt.gensalt()
    ).decode("utf-8")


def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


customer_oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/api/customer-auth/login", auto_error=False
)


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        sub: str | None = payload.get("sub")
        email: str | None = payload.get("email")
        if sub is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    from app.models.models import AdminUser

    user = db.query(AdminUser).filter(AdminUser.email == email).first() if email else db.query(AdminUser).filter(AdminUser.id == int(sub)).first()
    if user is None or not user.is_active:
        raise credentials_exception
    return user


def get_current_customer(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        sub: str | None = payload.get("sub")
        user_type: str | None = payload.get("user_type")
        if sub is None or user_type != "customer":
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    from app.models.models import Customer

    customer = db.query(Customer).filter(Customer.id == int(sub)).first()
    if customer is None or not customer.is_active:
        raise credentials_exception
    return customer


distributor_oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/api/distributor/auth/login", auto_error=True
)


def get_current_distributor(
    token: str = Depends(distributor_oauth2_scheme),
    db: Session = Depends(get_db),
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        sub: str | None = payload.get("sub")
        user_type: str | None = payload.get("user_type")
        if sub is None or user_type != "distributor":
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    from app.models.models import DistributorUser

    distributor = db.query(DistributorUser).filter(DistributorUser.id == int(sub)).first()
    if distributor is None or not distributor.is_active:
        raise credentials_exception
    return distributor


def get_optional_customer(
    token: str | None = Depends(customer_oauth2_scheme),
    db: Session = Depends(get_db),
):
    if not token:
        return None
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        sub: str | None = payload.get("sub")
        user_type: str | None = payload.get("user_type")
        if sub is None or user_type != "customer":
            return None
    except JWTError:
        return None

    from app.models.models import Customer

    customer = db.query(Customer).filter(Customer.id == int(sub)).first()
    if customer is None or not customer.is_active:
        return None
    return customer
