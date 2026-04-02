from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.services.transaction_service import transaction_service

router = APIRouter(prefix="/analytics", tags=["analytics"])

@router.get("/summary")
async def get_summary(db: AsyncSession = Depends(get_db)):
    return await transaction_service.get_analytics(db)
