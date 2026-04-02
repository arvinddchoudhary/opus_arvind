from pydantic import BaseModel, UUID4
from typing import Optional, List
from datetime import datetime

class TransactionCreate(BaseModel):
    transaction_id: str
    user_id: str
    amount: float
    merchant_name: Optional[str] = None
    merchant_category: Optional[str] = None
    merchant_country: Optional[str] = "US"
    card_type: Optional[str] = "credit"
    transaction_type: Optional[str] = "purchase"
    hour_of_day: Optional[int] = None
    day_of_week: Optional[int] = None
    is_weekend: Optional[bool] = False
    distance_from_home: Optional[float] = 0.0

class TransactionResponse(BaseModel):
    id: UUID4
    transaction_id: str
    user_id: str
    amount: float
    merchant_name: Optional[str]
    merchant_category: Optional[str]
    is_fraud: bool
    fraud_score: Optional[float]
    fraud_reason: Optional[str]
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class AlertResponse(BaseModel):
    id: UUID4
    transaction_id: UUID4
    alert_type: str
    severity: str
    message: Optional[str]
    is_resolved: bool
    created_at: datetime

    class Config:
        from_attributes = True

class FraudPrediction(BaseModel):
    transaction_id: str
    is_fraud: bool
    fraud_score: float
    risk_level: str
    reasons: List[str]

class AnalyticsResponse(BaseModel):
    total_transactions: int
    total_fraud: int
    fraud_rate: float
    total_amount: float
    fraud_amount: float
    avg_fraud_score: float
    transactions_by_hour: dict
    fraud_by_category: dict
