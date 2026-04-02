CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id VARCHAR(100) UNIQUE NOT NULL,
    user_id VARCHAR(100) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    merchant_name VARCHAR(255),
    merchant_category VARCHAR(100),
    merchant_country VARCHAR(10),
    card_type VARCHAR(50),
    transaction_type VARCHAR(50),
    hour_of_day INTEGER,
    day_of_week INTEGER,
    is_weekend BOOLEAN DEFAULT FALSE,
    distance_from_home DECIMAL(10,2),
    is_fraud BOOLEAN DEFAULT FALSE,
    fraud_score DECIMAL(5,4),
    fraud_reason VARCHAR(500),
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID REFERENCES transactions(id),
    alert_type VARCHAR(100) NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('low','medium','high','critical')),
    message TEXT,
    is_resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE model_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    model_version VARCHAR(50),
    accuracy DECIMAL(6,4),
    precision_score DECIMAL(6,4),
    recall_score DECIMAL(6,4),
    f1_score DECIMAL(6,4),
    auc_roc DECIMAL(6,4),
    trained_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_transactions_user_id   ON transactions(user_id);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);
CREATE INDEX idx_transactions_is_fraud  ON transactions(is_fraud);
CREATE INDEX idx_alerts_transaction_id  ON alerts(transaction_id);
CREATE INDEX idx_alerts_severity        ON alerts(severity);
CREATE INDEX idx_alerts_is_resolved     ON alerts(is_resolved);
