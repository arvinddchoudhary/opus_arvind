from app.ml.model import fraud_model
from app.config import settings
import logging

logger = logging.getLogger(__name__)

class FraudDetectorService:
    def __init__(self):
        fraud_model.load()

    async def analyze_transaction(self, transaction_data: dict) -> dict:
        try:
            return fraud_model.predict(transaction_data)
        except Exception as e:
            logger.error(f"Fraud detection error: {e}")
            return {"is_fraud": False, "fraud_score": 0.0, "risk_level": "unknown", "reasons": ["Detection service error"]}

    def get_alert_severity(self, risk_level: str) -> str:
        return {"critical":"critical","high":"high","medium":"medium","low":"low"}.get(risk_level, "low")

fraud_detector_service = FraudDetectorService()
