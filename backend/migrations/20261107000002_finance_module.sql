-- ========================================================
-- TARI (Tata Organisasi) — Financial Management Schema
-- Migration: 20261107000002_finance_module.sql
-- ========================================================

-- 1. FINANCIAL ACCOUNTS (Rekening Kas / Bank Organisasi)
CREATE TABLE IF NOT EXISTS financial_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(120) NOT NULL, -- e.g. "Kas Tunai Utama", "BSI Rekening Operasional", "Kas Remaja Masjid"
    account_number VARCHAR(60), -- e.g. "7123456789 (BSI)"
    currency VARCHAR(10) NOT NULL DEFAULT 'IDR',
    initial_balance BIGINT NOT NULL DEFAULT 0,
    current_balance BIGINT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_fin_accounts_org ON financial_accounts(organization_id);

-- 2. TRANSACTION CATEGORIES (Kategori Pemasukan & Pengeluaran)
CREATE TABLE IF NOT EXISTS transaction_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE, -- NULL for global system templates
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL, -- 'income' or 'expense'
    icon VARCHAR(50) DEFAULT 'Tag',
    color VARCHAR(20) DEFAULT '#16a34a',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_trans_cat_org_type ON transaction_categories(organization_id, type);

-- 3. TRANSACTIONS (Buku Kas / Transaksi)
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES financial_accounts(id) ON DELETE RESTRICT,
    category_id UUID NOT NULL REFERENCES transaction_categories(id) ON DELETE RESTRICT,
    type VARCHAR(20) NOT NULL, -- 'income', 'expense'
    amount BIGINT NOT NULL, -- Dalam Rupiah (integer)
    transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
    description TEXT NOT NULL,
    receipt_url TEXT, -- URL bukti nota / struk transfer
    status VARCHAR(30) NOT NULL DEFAULT 'completed', -- 'completed', 'pending_approval', 'void'
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    void_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_transactions_org_date ON transactions(organization_id, transaction_date DESC);
CREATE INDEX idx_transactions_org_account ON transactions(organization_id, account_id);
CREATE INDEX idx_transactions_org_category ON transactions(organization_id, category_id);
CREATE INDEX idx_transactions_status ON transactions(status);

-- 4. BALANCE TRIGGER: Otomatis Menyesuaikan current_balance pada financial_accounts
CREATE OR REPLACE FUNCTION update_financial_account_balance()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        IF NEW.status = 'completed' THEN
            IF NEW.type = 'income' THEN
                UPDATE financial_accounts 
                SET current_balance = current_balance + NEW.amount, updated_at = CURRENT_TIMESTAMP
                WHERE id = NEW.account_id;
            ELSIF NEW.type = 'expense' THEN
                UPDATE financial_accounts 
                SET current_balance = current_balance - NEW.amount, updated_at = CURRENT_TIMESTAMP
                WHERE id = NEW.account_id;
            END IF;
        END IF;
    ELSIF (TG_OP = 'UPDATE') THEN
        -- Handle voiding transaction (kembalikan saldo)
        IF OLD.status = 'completed' AND NEW.status = 'void' THEN
            IF OLD.type = 'income' THEN
                UPDATE financial_accounts 
                SET current_balance = current_balance - OLD.amount, updated_at = CURRENT_TIMESTAMP
                WHERE id = OLD.account_id;
            ELSIF OLD.type = 'expense' THEN
                UPDATE financial_accounts 
                SET current_balance = current_balance + OLD.amount, updated_at = CURRENT_TIMESTAMP
                WHERE id = OLD.account_id;
            END IF;
        -- Handle approval: pending_approval -> completed
        ELSIF OLD.status = 'pending_approval' AND NEW.status = 'completed' THEN
            IF NEW.type = 'income' THEN
                UPDATE financial_accounts 
                SET current_balance = current_balance + NEW.amount, updated_at = CURRENT_TIMESTAMP
                WHERE id = NEW.account_id;
            ELSIF NEW.type = 'expense' THEN
                UPDATE financial_accounts 
                SET current_balance = current_balance - NEW.amount, updated_at = CURRENT_TIMESTAMP
                WHERE id = NEW.account_id;
            END IF;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_account_balance ON transactions;
CREATE TRIGGER trg_update_account_balance
AFTER INSERT OR UPDATE ON transactions
FOR EACH ROW
EXECUTE FUNCTION update_financial_account_balance();

-- 5. SEED DEFAULT GLOBAL CATEGORIES
INSERT INTO transaction_categories (organization_id, name, type, icon, color) VALUES
    (NULL, 'Infaq & Sedekah Jumat', 'income', 'HandCoins', '#16a34a'),
    (NULL, 'Donasi Khusus Dakwah', 'income', 'HeartHandshake', '#10b981'),
    (NULL, 'Zakat Maal / Fitrah', 'income', 'Coins', '#059669'),
    (NULL, 'Honor & Akomodasi Pemateri', 'expense', 'UserCheck', '#d97706'),
    (NULL, 'Operasional & Tagihan Listrik/Air', 'expense', 'Zap', '#dc2626'),
    (NULL, 'Konsumsi Acara Kajian', 'expense', 'Utensils', '#ea580c'),
    (NULL, 'Pemeliharaan & Kebersihan', 'expense', 'Wrench', '#4b5563'),
    (NULL, 'Publikasi & Media Cetak', 'expense', 'Megaphone', '#7c3aed')
ON CONFLICT DO NOTHING;

