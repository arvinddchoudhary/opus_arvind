from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.schemas.transaction import AlertResponse
from app.services.transaction_service import transaction_service
from typing import List
from pydantic import BaseModel

router = APIRouter(prefix="/alerts", tags=["alerts"])

class ResolveRequest(BaseModel):
    resolved_by: str = "system"

@router.get("/", response_model=List[AlertResponse])
async def list_alerts(unresolved_only: bool = Query(True), db: AsyncSession = Depends(get_db)):
    return await transaction_service.get_alerts(db, unresolved_only)

@router.patch("/{alert_id}/resolve", response_model=AlertResponse)
async def resolve_alert(alert_id: str, body: ResolveRequest, db: AsyncSession = Depends(get_db)):
    alert = await transaction_service.resolve_alert(db, alert_id, body.resolved_by)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    return alert
