import pandas as pd
import numpy as np
from typing import Dict, Any

FEATURE_COLUMNS = [
    "amount","hour_of_day","day_of_week","is_weekend","distance_from_home",
    "merchant_category_encoded","card_type_encoded","transaction_type_encoded",
    "amount_log","is_high_amount","is_odd_hour",
]

MERCHANT_CATEGORIES = [
    "grocery","gas_station","restaurant","retail","online",
    "travel","entertainment","healthcare","atm","other"
]
CARD_TYPES        = ["credit","debit","prepaid"]
TRANSACTION_TYPES = ["purchase","withdrawal","transfer","refund"]

def encode_categorical(value: str, options: list) -> int:
    try:
        return options.index(value.lower())
    except (ValueError, AttributeError):
        return len(options)

def extract_features(transaction: Dict[str, Any]) -> pd.DataFrame:
    amount      = float(transaction.get("amount", 0))
    hour        = int(transaction.get("hour_of_day", 12))
    day         = int(transaction.get("day_of_week", 1))
    is_weekend  = int(transaction.get("is_weekend", False))
    distance    = float(transaction.get("distance_from_home", 0))
    merchant_cat= transaction.get("merchant_category", "other")
    card_type   = transaction.get("card_type", "credit")
    txn_type    = transaction.get("transaction_type", "purchase")

    features = {
        "amount": amount,
        "hour_of_day": hour,
        "day_of_week": day,
        "is_weekend": is_weekend,
        "distance_from_home": distance,
        "merchant_category_encoded": encode_categorical(merchant_cat, MERCHANT_CATEGORIES),
        "card_type_encoded": encode_categorical(card_type, CARD_TYPES),
        "transaction_type_encoded": encode_categorical(txn_type, TRANSACTION_TYPES),
        "amount_log": np.log1p(amount),
        "is_high_amount": int(amount > 1000),
        "is_odd_hour": int(hour < 6 or hour > 22),
    }
    return pd.DataFrame([features])[FEATURE_COLUMNS]

def get_fraud_reasons(transaction: Dict[str, Any], fraud_score: float) -> list:
    reasons  = []
    amount   = float(transaction.get("amount", 0))
    hour     = int(transaction.get("hour_of_day", 12))
    distance = float(transaction.get("distance_from_home", 0))

    if amount > 5000:
        reasons.append(f"Unusually high transaction amount (${amount:,.2f})")
    elif amount > 1000:
        reasons.append(f"High transaction amount (${amount:,.2f})")
    if hour < 3 or hour > 23:
        reasons.append(f"Transaction at suspicious hour ({hour}:00)")
    if distance > 500:
        reasons.append(f"Large distance from home ({distance:.0f} km)")
    if fraud_score > 0.8:
        reasons.append("ML model flagged as high risk")
    elif fraud_score > 0.5:
        reasons.append("ML model flagged as moderate risk")

    return reasons if reasons else ["Anomalous transaction pattern detected"]
