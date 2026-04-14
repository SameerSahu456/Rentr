from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    PROJECT_NAME: str = "RENTR API"
    VERSION: str = "1.0.0"
    API_V1_PREFIX: str = "/api/v1"

    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/rentr"

    SECRET_KEY: str = "change-this-to-a-secure-random-string-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:4000",
        "http://localhost:4100",
        "https://rentr-admin-phi.vercel.app",
    ]

    # OTP settings (mock for now)
    OTP_EXPIRY_SECONDS: int = 300

    model_config = {
        "env_file": ".env",
        "case_sensitive": True,
    }


settings = Settings()
