from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    database_url: str = "postgresql://fraud_user:fraud_pass@localhost:5432/fraud_db"
    redis_url: str = "redis://localhost:6379"
    secret_key: str = "changeme"
    algorithm: str = "HS256"
    model_path: str = "./app/ml/trained_model.pkl"
    env: str = "development"
    fraud_threshold: float = 0.5
    high_risk_threshold: float = 0.8

    class Config:
        env_file = ".env"

@lru_cache()
def get_settings():
    return Settings()

settings = get_settings()
