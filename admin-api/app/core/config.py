from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/rentr_admin"
    SECRET_KEY: str = "rentr-admin-secret-key-change-in-production"
    SALEOR_API_URL: str = "http://localhost:8000/graphql/"
    SALEOR_CHANNEL: str = "default-channel"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480

    model_config = {"env_file": ".env", "extra": "ignore"}


settings = Settings()
