-- ========================================================
-- TARI (Tata Organisasi) — Baseline Multi-Tenant Schema
-- Migration: 20261107000001_initial_multi_tenant_schema.sql
-- ========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS TABLE (Global Platform Identity)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    phone_number VARCHAR(30),
    avatar_url TEXT,
    is_superadmin BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_is_superadmin ON users(is_superadmin);

-- 2. ORGANIZATIONS TABLE (Tenant Root)
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    logo_url TEXT,
    plan_tier VARCHAR(50) NOT NULL DEFAULT 'free', -- free, pro, enterprise
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_organizations_slug ON organizations(slug);
CREATE INDEX idx_organizations_is_active ON organizations(is_active);

-- 3. PERMISSIONS TABLE (Granular RBAC definitions)
CREATE TABLE IF NOT EXISTS permissions (
    code VARCHAR(64) PRIMARY KEY,
    module VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4. ROLE PERMISSIONS TABLE (Default role mappings)
CREATE TABLE IF NOT EXISTS role_permissions (
    role VARCHAR(32) NOT NULL,
    permission_code VARCHAR(64) NOT NULL REFERENCES permissions(code) ON DELETE CASCADE,
    PRIMARY KEY (role, permission_code)
);

-- 5. ORGANIZATION MEMBERS (Multi-tenant membership & roles)
CREATE TABLE IF NOT EXISTS organization_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(32) NOT NULL DEFAULT 'member', -- owner, ketua, sekretaris, bendahara, admin_media, member
    status VARCHAR(30) NOT NULL DEFAULT 'active', -- active, invited, suspended
    joined_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_org_user UNIQUE (organization_id, user_id)
);

CREATE INDEX idx_org_members_org ON organization_members(organization_id);
CREATE INDEX idx_org_members_user ON organization_members(user_id);
CREATE INDEX idx_org_members_role ON organization_members(role);

-- 6. AUDIT LOGS (Immutable Security & Operation Trail)
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE, -- NULL for platform-level actions
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL, -- e.g. 'vault.reveal_password', 'finance.create_transaction'
    target_type VARCHAR(50) NOT NULL, -- e.g. 'vault_credential', 'transaction', 'member'
    target_id UUID,
    details JSONB DEFAULT '{}'::jsonb,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_org_created ON audit_logs(organization_id, created_at DESC);
CREATE INDEX idx_audit_logs_user_created ON audit_logs(user_id, created_at DESC);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);

-- ========================================================
-- SEED INITIAL PERMISSIONS
-- ========================================================
INSERT INTO permissions (code, module, description) VALUES
    -- Organization & Members
    ('org.view', 'organization', 'Melihat informasi organisasi'),
    ('org.update', 'organization', 'Memperbarui profil organisasi'),
    ('org.delete', 'organization', 'Menghapus organisasi'),
    ('members.view', 'members', 'Melihat daftar anggota'),
    ('members.manage', 'members', 'Mengundang, mengubah role, atau menghapus anggota'),
    
    -- Financial Management
    ('finance.view', 'finance', 'Melihat buku kas, saldo, dan laporan keuangan'),
    ('finance.create', 'finance', 'Mencatat pemasukan dan pengeluaran kas'),
    ('finance.update', 'finance', 'Memperbarui catatan transaksi'),
    ('finance.approve', 'finance', 'Menyetujui pengeluaran dana'),
    ('finance.export', 'finance', 'Mengekspor laporan keuangan PDF/Excel'),
    
    -- Account Vault
    ('vault.view', 'vault', 'Melihat daftar nama akun digital'),
    ('vault.reveal', 'vault', 'Membuka / menyalin password kredensial akun'),
    ('vault.manage', 'vault', 'Menambah, mengubah, atau menghapus kredensial akun'),
    
    -- Media & Poster
    ('media.view', 'media', 'Melihat jadwal dan perencanaan konten'),
    ('media.manage', 'media', 'Membuat draft konten dan mengatur jadwal publikasi'),
    ('poster.generate', 'poster', 'Menggunakan template dan men-generate poster'),
    ('poster.manage_templates', 'poster', 'Membuat dan mengelola template poster'),
    
    -- Audit & Settings
    ('audit.view', 'audit', 'Melihat catatan audit log aktivitas organisasi')
ON CONFLICT (code) DO NOTHING;

-- SEED DEFAULT ROLE PERMISSIONS
-- 1. Owner & Ketua: Full access
INSERT INTO role_permissions (role, permission_code)
SELECT 'owner', code FROM permissions
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role, permission_code)
SELECT 'ketua', code FROM permissions
ON CONFLICT DO NOTHING;

-- 2. Sekretaris
INSERT INTO role_permissions (role, permission_code) VALUES
    ('sekretaris', 'org.view'),
    ('sekretaris', 'members.view'),
    ('sekretaris', 'members.manage'),
    ('sekretaris', 'media.view'),
    ('sekretaris', 'media.manage'),
    ('sekretaris', 'poster.generate'),
    ('sekretaris', 'finance.view')
ON CONFLICT DO NOTHING;

-- 3. Bendahara
INSERT INTO role_permissions (role, permission_code) VALUES
    ('bendahara', 'org.view'),
    ('bendahara', 'members.view'),
    ('bendahara', 'finance.view'),
    ('bendahara', 'finance.create'),
    ('bendahara', 'finance.update'),
    ('bendahara', 'finance.approve'),
    ('bendahara', 'finance.export'),
    ('bendahara', 'audit.view')
ON CONFLICT DO NOTHING;

-- 4. Admin Media
INSERT INTO role_permissions (role, permission_code) VALUES
    ('admin_media', 'org.view'),
    ('admin_media', 'members.view'),
    ('admin_media', 'media.view'),
    ('admin_media', 'media.manage'),
    ('admin_media', 'poster.generate'),
    ('admin_media', 'poster.manage_templates'),
    ('admin_media', 'vault.view'),
    ('admin_media', 'vault.reveal')
ON CONFLICT DO NOTHING;

-- 5. Anggota Biasa
INSERT INTO role_permissions (role, permission_code) VALUES
    ('member', 'org.view'),
    ('member', 'members.view')
ON CONFLICT DO NOTHING;

