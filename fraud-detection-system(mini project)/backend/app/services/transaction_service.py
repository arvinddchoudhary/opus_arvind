from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from app.models.transaction import Transaction, Alert
from app.schemas.transaction import TransactionCreate
from app.services.fraud_detector import fraud_detector_service
import logging

logger = logging.getLogger(__name__)

class TransactionService:
    async def create_transaction(self, db: AsyncSession, txn_data: TransactionCreate) -> Transaction:
        fraud_result = await fraud_detector_service.analyze_transaction(txn_data.model_dump())
        txn = Transaction(
            transaction_id=txn_data.transaction_id, user_id=txn_data.user_id,
            amount=txn_data.amount, merchant_name=txn_data.merchant_name,
            merchant_category=txn_data.merchant_category, merchant_country=txn_data.merchant_country,
            card_type=txn_data.card_type, transaction_type=txn_data.transaction_type,
            hour_of_day=txn_data.hour_of_day, day_of_week=txn_data.day_of_week,
            is_weekend=txn_data.is_weekend, distance_from_home=txn_data.distance_from_home,
            is_fraud=fraud_result["is_fraud"], fraud_score=fraud_result["fraud_score"],
            fraud_reason="; ".join(fraud_result["reasons"]),
            status="flagged" if fraud_result["is_fraud"] else "approved",
        )
        db.add(txn)
        await db.flush()
        if fraud_result["is_fraud"]:
            db.add(Alert(
                transaction_id=txn.id, alert_type="fraud_detected",
                severity=fraud_detector_service.get_alert_severity(fraud_result["risk_level"]),
                message=f"Fraud detected: {'; '.join(fraud_result['reasons'])}",
            ))
        await db.commit()
        await db.refresh(txn)
        return txn

    async def get_transactions(self, db: AsyncSession, skip=0, limit=50, fraud_only=False):
        q = select(Transaction).order_by(desc(Transaction.created_at))
        if fraud_only:
            q = q.where(Transaction.is_fraud == True)
        result = await db.execute(q.offset(skip).limit(limit))
        return result.scalars().all()

    async def get_alerts(self, db: AsyncSession, unresolved_only=True):
        q = select(Alert).order_by(desc(Alert.created_at))
        if unresolved_only:
            q = q.where(Alert.is_resolved == False)
        result = await db.execute(q)
        return result.scalars().all()

    async def resolve_alert(self, db: AsyncSession, alert_id: str, resolved_by: str):
        from datetime import datetime, timezone
        result = await db.execute(select(Alert).where(Alert.id == alert_id))
        alert  = result.scalar_one_or_none()
        if alert:
            alert.is_resolved = True
            alert.resolved_at = datetime.now(timezone.utc)
            alert.resolved_by = resolved_by
            await db.commit()
            await db.refresh(alert)
        return alert

    async def get_analytics(self, db: AsyncSession):
        total      = (await db.execute(select(func.count(Transaction.id)))).scalar()
        fraud      = (await db.execute(select(func.count(Transaction.id)).where(Transaction.is_fraud==True))).scalar()
        total_amt  = float((await db.execute(select(func.sum(Transaction.amount)))).scalar() or 0)
        fraud_amt  = float((await db.execute(select(func.sum(Transaction.amount)).where(Transaction.is_fraud==True))).scalar() or 0)
        avg_score  = float((await db.execute(select(func.avg(Transaction.fraud_score)).where(Transaction.is_fraud==True))).scalar() or 0)
        return {"total_transactions":total,"total_fraud":fraud,
                "fraud_rate":round((fraud/total*100) if total else 0,2),
                "total_amount":total_amt,"fraud_amount":fraud_amt,
                "avg_fraud_score":round(avg_score,4),"transactions_by_hour":{},"fraud_by_category":{}}

transaction_service = TransactionService()
