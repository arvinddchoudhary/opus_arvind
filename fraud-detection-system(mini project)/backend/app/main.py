from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.database import init_db
from app.routers import transactions, alerts, analytics
from app.ml.model import fraud_model
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    fraud_model.load()
    logger.info("Fraud Detection System started")
    yield
    logger.info("Shutting down")

app = FastAPI(title="Fraud Detection API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(transactions.router, prefix="/api/v1")
app.include_router(alerts.router,       prefix="/api/v1")
app.include_router(analytics.router,    prefix="/api/v1")

@app.get("/health")
async def health():
    return {"status":"ok","model_loaded":fraud_model.is_loaded,"version":"1.0.0"}
