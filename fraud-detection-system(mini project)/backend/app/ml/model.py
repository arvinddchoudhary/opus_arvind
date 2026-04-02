import joblib
import numpy as np
import pandas as pd
from pathlib import Path
from app.config import settings
import logging

logger = logging.getLogger(__name__)

class FraudDetectionModel:
    def __init__(self):
        self.model        = None
        self.feature_cols = None
        self.model_path   = Path(settings.model_path)
        self.is_loaded    = False

    def load(self):
        if self.model_path.exists():
            try:
                data              = joblib.load(self.model_path)
                self.model        = data["model"]
                self.feature_cols = data["feature_cols"]
                self.is_loaded    = True
                logger.info(f"ML model loaded from {self.model_path}")
            except Exception as e:
                logger.error(f"Failed to load model: {e}")
                self._fallback()
        else:
            logger.warning("No trained model found, using rule-based fallback")
            self._fallback()

    def _fallback(self):
        self.model     = None
        self.is_loaded = True

    def predict(self, transaction: dict) -> dict:
        if not self.is_loaded:
            self.load()
        return self._rule_based_predict(transaction)

    def _rule_based_predict(self, transaction: dict) -> dict:
        amount   = float(transaction.get("amount", 0))
        hour     = int(transaction.get("hour_of_day", 12))
        distance = float(transaction.get("distance_from_home", 0))
        is_weekend = bool(transaction.get("is_weekend", False))
        category = transaction.get("merchant_category", "").lower()

        score = 0.0

        # Amount scoring
        if amount > 20000:   score += 0.50
        elif amount > 10000: score += 0.40
        elif amount > 5000:  score += 0.30
        elif amount > 1000:  score += 0.15

        # Time scoring
        if hour <= 4 or hour >= 23:   score += 0.30
        elif hour <= 6 or hour >= 22: score += 0.15

        # Distance scoring
        if distance > 1000:   score += 0.30
        elif distance > 500:  score += 0.20
        elif distance > 200:  score += 0.10

        # Weekend + late night combo
        if is_weekend and (hour <= 4 or hour >= 23):
            score += 0.15

        # High risk categories
        if category in ["atm"] and amount > 500:
            score += 0.15
        if category in ["online"] and amount > 2000:
            score += 0.10

        score      = min(round(score, 4), 0.99)
        is_fraud   = score >= settings.fraud_threshold
        risk_level = (
            "critical" if score >= 0.85 else
            "high"     if score >= 0.70 else
            "medium"   if score >= 0.50 else "low"
        )
        return {
            "is_fraud":    is_fraud,
            "fraud_score": score,
            "risk_level":  risk_level,
            "reasons":     self._get_reasons(transaction, score),
        }

    def _get_reasons(self, transaction: dict, score: float) -> list:
        reasons  = []
        amount   = float(transaction.get("amount", 0))
        hour     = int(transaction.get("hour_of_day", 12))
        distance = float(transaction.get("distance_from_home", 0))
        category = transaction.get("merchant_category", "").lower()

        if amount > 10000:   reasons.append(f"Very high transaction amount (${amount:,.2f})")
        elif amount > 5000:  reasons.append(f"High transaction amount (${amount:,.2f})")
        elif amount > 1000:  reasons.append(f"Above average amount (${amount:,.2f})")

        if hour <= 4:        reasons.append(f"Transaction at suspicious hour ({hour}:00 AM)")
        elif hour >= 23:     reasons.append(f"Late night transaction ({hour}:00)")

        if distance > 1000:  reasons.append(f"Very large distance from home ({distance:.0f} km)")
        elif distance > 500: reasons.append(f"Large distance from home ({distance:.0f} km)")

        if category == "atm" and amount > 500:
            reasons.append("Large ATM withdrawal")
        if category == "online" and amount > 2000:
            reasons.append("Large online transaction")

        if score >= 0.85:    reasons.append("Multiple high-risk indicators detected")
        elif score >= 0.50:  reasons.append("Suspicious transaction pattern")

        return reasons if reasons else ["Transaction within normal parameters"]

fraud_model = FraudDetectionModel()
