-- ========================================================
-- TARI (Tata Organisasi) — Media Management & Content Planner Schema
-- Migration: 20261107000004_media_planner_module.sql
-- ========================================================

CREATE TABLE IF NOT EXISTS content_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    caption TEXT NOT NULL,
    target_platforms JSONB NOT NULL DEFAULT '["instagram"]'::jsonb, -- ['instagram', 'facebook', 'whatsapp']
    media_urls JSONB NOT NULL DEFAULT '[]'::jsonb,
    scheduled_at TIMESTAMPTZ,
    status VARCHAR(30) NOT NULL DEFAULT 'draft', -- 'draft', 'pending_approval', 'approved', 'scheduled', 'published', 'failed'
    campaign_name VARCHAR(100), -- e.g. "Kajian Akbar Ramadhan", "Program Qurban 1448H"
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_content_posts_org_sched ON content_posts(organization_id, scheduled_at ASC);
CREATE INDEX idx_content_posts_org_status ON content_posts(organization_id, status);
CREATE INDEX idx_content_posts_org_created ON content_posts(organization_id, created_at DESC);

