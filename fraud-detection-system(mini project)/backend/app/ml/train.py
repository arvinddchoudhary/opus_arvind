import argparse, pandas as pd, numpy as np, joblib
from pathlib import Path
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import classification_report, roc_auc_score, average_precision_score, confusion_matrix
from imblearn.pipeline import Pipeline as ImbPipeline
from imblearn.over_sampling import SMOTE
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def train(data_path, model_output="./app/ml/trained_model.pkl"):
    logger.info(f"Loading dataset from {data_path}")
    df = pd.read_csv(data_path)
    logger.info(f"Shape: {df.shape}")
    logger.info(f"Columns: {list(df.columns)}")
    logger.info(f"Fraud rate: {df['Class'].mean()*100:.4f}%")
    logger.info(f"Fraud cases: {df['Class'].sum()} / {len(df)}")

    feature_cols = [c for c in df.columns if c not in ["Class", "Time"]]
    X = df[feature_cols].fillna(0)
    y = df["Class"].astype(int)

    logger.info(f"Features used: {feature_cols}")

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    logger.info(f"Train: {len(X_train)} | Test: {len(X_test)}")

    pipeline = ImbPipeline([
        ("scaler", StandardScaler()),
        ("smote",  SMOTE(random_state=42, k_neighbors=5)),
        ("clf",    RandomForestClassifier(
            n_estimators=100,
            max_depth=10,
            min_samples_split=5,
            class_weight="balanced",
            random_state=42,
            n_jobs=-1,
        )),
    ])

    logger.info("Training Random Forest with SMOTE...")
    pipeline.fit(X_train, y_train)

    y_pred  = pipeline.predict(X_test)
    y_proba = pipeline.predict_proba(X_test)[:, 1]

    logger.info("\n" + classification_report(y_test, y_pred))
    logger.info(f"AUC-ROC        : {roc_auc_score(y_test, y_proba):.4f}")
    logger.info(f"Avg Precision  : {average_precision_score(y_test, y_proba):.4f}")
    logger.info(f"Confusion Matrix:\n{confusion_matrix(y_test, y_pred)}")

    Path(model_output).parent.mkdir(parents=True, exist_ok=True)
    joblib.dump({"model": pipeline, "feature_cols": feature_cols}, model_output)
    logger.info(f"Model saved to {model_output}")

if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("--data",   required=True)
    p.add_argument("--output", default="./app/ml/trained_model.pkl")
    args = p.parse_args()
    train(args.data, args.output)
