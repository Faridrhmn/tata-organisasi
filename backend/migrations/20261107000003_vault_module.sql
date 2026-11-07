-- ========================================================
-- TARI (Tata Organisasi) — Account Vault Module Schema
-- Migration: 20261107000003_vault_module.sql
-- ========================================================

CREATE TABLE IF NOT EXISTS vault_credentials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    platform VARCHAR(60) NOT NULL, -- e.g. "Instagram", "Facebook", "Canva", "Email", "YouTube", "Website Hosting"
    label VARCHAR(120) NOT NULL, -- e.g. "Instagram Utama @masjid.alikhlas"
    username VARCHAR(255) NOT NULL, -- e.g. "@masjid.alikhlas" / "media@alikhlas.org"
    encrypted_password TEXT NOT NULL, -- Ciphertext terenkripsi AES-256-GCM (Hex encoded)
    nonce VARCHAR(32) NOT NULL, -- 12-byte initialization vector (Hex encoded)
    recovery_email VARCHAR(255),
    phone_number VARCHAR(50),
    notes TEXT, -- e.g. "2FA terhubung ke HP Humas 08123456789"
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_vault_org ON vault_credentials(organization_id);
CREATE INDEX idx_vault_org_platform ON vault_credentials(organization_id, platform);
CREATE INDEX idx_vault_created ON vault_credentials(organization_id, created_at DESC);

