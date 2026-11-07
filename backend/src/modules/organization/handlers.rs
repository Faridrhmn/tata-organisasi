use axum::{
    extract::{Path, State},
    Json,
};
use sqlx::PgPool;
use uuid::Uuid;
use crate::error::AppError;
use crate::extractors::{AuthUser, CurrentOrganization};
use super::dto::{
    CreateOrganizationRequest, InviteMemberRequest, MemberResponse, OrganizationResponse,
    UpdateMemberRoleRequest, UpdateOrganizationRequest,
};
use super::permissions::PermissionService;

/// Helper to generate URL-friendly slug
fn slugify(text: &str) -> String {
    text.to_lowercase()
        .chars()
        .map(|c| if c.is_alphanumeric() { c } else { '-' })
        .collect::<String>()
        .split('-')
        .filter(|s| !s.is_empty())
        .collect::<Vec<_>>()
        .join("-")
}

/// Handler: POST /api/v1/organizations (Create new Organization)
pub async fn create_organization(
    State(pool): State<PgPool>,
    auth_user: AuthUser,
    Json(payload): Json<CreateOrganizationRequest>,
) -> Result<Json<OrganizationResponse>, AppError> {
    let name = payload.name.trim();
    if name.is_empty() {
        return Err(AppError::BadRequest("Nama organisasi wajib diisi.".to_string()));
    }

    let slug = payload
        .slug
        .map(|s| slugify(&s))
        .filter(|s| !s.is_empty())
        .unwrap_or_else(|| slugify(name));

    // 1. Cek apakah slug sudah terpakai
    let slug_exists = sqlx::query!(
        "SELECT id FROM organizations WHERE slug = $1",
        slug
    )
    .fetch_optional(&pool)
    .await?;

    if slug_exists.is_some() {
        return Err(AppError::Conflict("Slug/identitas organisasi ini sudah digunakan. Silakan pilih slug lain.".to_string()));
    }

    // 2. Transaksi Database: Buat Organisasi & Tetapkan Pembuat sebagai 'owner'
    let mut tx = pool.begin().await?;

    let org = sqlx::query_as!(
        OrganizationResponse,
        r#"
        INSERT INTO organizations (name, slug, description, plan_tier)
        VALUES ($1, $2, $3, 'free')
        RETURNING id, name, slug, description, logo_url, plan_tier, is_active, created_at
        "#,
        name,
        slug,
        payload.description
    )
    .fetch_one(&mut *tx)
    .await?;

    // Tambahkan user sebagai owner
    sqlx::query!(
        r#"
        INSERT INTO organization_members (organization_id, user_id, role, status)
        VALUES ($1, $2, 'owner', 'active')
        "#,
        org.id,
        auth_user.id
    )
    .execute(&mut *tx)
    .await?;

    // Catat Audit Log
    sqlx::query!(
        r#"
        INSERT INTO audit_logs (organization_id, user_id, action, target_type, target_id, details)
        VALUES ($1, $2, 'org.create', 'organization', $1, '{"role": "owner"}'::jsonb)
        "#,
        org.id,
        auth_user.id
    )
    .execute(&mut *tx)
    .await?;

    tx.commit().await?;

    Ok(Json(org))
}

/// Handler: GET /api/v1/organizations (List My Organizations)
pub async fn list_my_organizations(
    State(pool): State<PgPool>,
    auth_user: AuthUser,
) -> Result<Json<Vec<OrganizationResponse>>, AppError> {
    let orgs = sqlx::query_as!(
        OrganizationResponse,
        r#"
        SELECT o.id, o.name, o.slug, o.description, o.logo_url, o.plan_tier, o.is_active, o.created_at
        FROM organizations o
        JOIN organization_members om ON om.organization_id = o.id
        WHERE om.user_id = $1 AND o.is_active = TRUE
        ORDER BY o.created_at DESC
        "#,
        auth_user.id
    )
    .fetch_all(&pool)
    .await?;

    Ok(Json(orgs))
}

/// Handler: GET /api/v1/organizations/:id
pub async fn get_organization(
    State(pool): State<PgPool>,
    current_org: CurrentOrganization,
    Path(org_id): Path<Uuid>,
) -> Result<Json<OrganizationResponse>, AppError> {
    if current_org.organization_id != org_id && current_org.role != "superadmin" {
        return Err(AppError::Forbidden("Anda tidak memiliki akses ke organisasi ini.".to_string()));
    }

    let org = sqlx::query_as!(
        OrganizationResponse,
        r#"
        SELECT id, name, slug, description, logo_url, plan_tier, is_active, created_at
        FROM organizations
        WHERE id = $1
        "#,
        org_id
    )
    .fetch_optional(&pool)
    .await?
    .ok_or_else(|| AppError::NotFound("Organisasi tidak ditemukan.".to_string()))?;

    Ok(Json(org))
}

/// Handler: PATCH /api/v1/organizations/:id (Update Organization Details)
pub async fn update_organization(
    State(pool): State<PgPool>,
    current_org: CurrentOrganization,
    Path(org_id): Path<Uuid>,
    Json(payload): Json<UpdateOrganizationRequest>,
) -> Result<Json<OrganizationResponse>, AppError> {
    if current_org.organization_id != org_id && current_org.role != "superadmin" {
        return Err(AppError::Forbidden("Anda tidak memiliki akses ke organisasi ini.".to_string()));
    }

    // Validasi Izin RBAC: org.update
    PermissionService::verify_permission(&pool, &current_org.role, "org.update").await?;

    let existing = sqlx::query_as!(
        OrganizationResponse,
        r#"
        SELECT id, name, slug, description, logo_url, plan_tier, is_active, created_at
        FROM organizations
        WHERE id = $1
        "#,
        org_id
    )
    .fetch_optional(&pool)
    .await?
    .ok_or_else(|| AppError::NotFound("Organisasi tidak ditemukan.".to_string()))?;

    let updated_name = payload.name.unwrap_or(existing.name);
    let updated_desc = payload.description.or(existing.description);
    let updated_logo = payload.logo_url.or(existing.logo_url);

    let updated_org = sqlx::query_as!(
        OrganizationResponse,
        r#"
        UPDATE organizations
        SET name = $1, description = $2, logo_url = $3, updated_at = CURRENT_TIMESTAMP
        WHERE id = $4
        RETURNING id, name, slug, description, logo_url, plan_tier, is_active, created_at
        "#,
        updated_name,
        updated_desc,
        updated_logo,
        org_id
    )
    .fetch_one(&pool)
    .await?;

    let _ = sqlx::query!(
        r#"
        INSERT INTO audit_logs (organization_id, user_id, action, target_type, target_id)
        VALUES ($1, $2, 'org.update', 'organization', $1)
        "#,
        org_id,
        current_org.user_id
    )
    .execute(&pool)
    .await;

    Ok(Json(updated_org))
}

/// Handler: GET /api/v1/organizations/:id/members (List Members)
pub async fn list_members(
    State(pool): State<PgPool>,
    current_org: CurrentOrganization,
    Path(org_id): Path<Uuid>,
) -> Result<Json<Vec<MemberResponse>>, AppError> {
    if current_org.organization_id != org_id && current_org.role != "superadmin" {
        return Err(AppError::Forbidden("Anda tidak memiliki akses ke data anggota organisasi ini.".to_string()));
    }

    // Validasi Izin RBAC: members.view
    PermissionService::verify_permission(&pool, &current_org.role, "members.view").await?;

    let members = sqlx::query_as!(
        MemberResponse,
        r#"
        SELECT 
            om.id,
            om.user_id,
            u.email,
            u.full_name,
            u.avatar_url,
            om.role,
            om.status,
            om.joined_at
        FROM organization_members om
        JOIN users u ON u.id = om.user_id
        WHERE om.organization_id = $1
        ORDER BY 
            CASE om.role
                WHEN 'owner' THEN 1
                WHEN 'ketua' THEN 2
                WHEN 'sekretaris' THEN 3
                WHEN 'bendahara' THEN 4
                WHEN 'admin_media' THEN 5
                ELSE 6
            END,
            om.joined_at ASC
        "#,
        org_id
    )
    .fetch_all(&pool)
    .await?;

    Ok(Json(members))
}

/// Handler: POST /api/v1/organizations/:id/members (Invite / Add Member)
pub async fn invite_member(
    State(pool): State<PgPool>,
    current_org: CurrentOrganization,
    Path(org_id): Path<Uuid>,
    Json(payload): Json<InviteMemberRequest>,
) -> Result<Json<MemberResponse>, AppError> {
    if current_org.organization_id != org_id && current_org.role != "superadmin" {
        return Err(AppError::Forbidden("Anda tidak memiliki akses ke organisasi ini.".to_string()));
    }

    // Validasi Izin RBAC: members.manage
    PermissionService::verify_permission(&pool, &current_org.role, "members.manage").await?;

    let target_email = payload.email.trim().to_lowercase();
    let target_role = payload.role.to_lowercase();

    // Validasi role yang diperbolehkan
    let valid_roles = ["ketua", "sekretaris", "bendahara", "admin_media", "member"];
    if !valid_roles.contains(&target_role.as_str()) {
        return Err(AppError::BadRequest(format!(
            "Peran '{}' tidak valid. Pilih antara: {}",
            target_role,
            valid_roles.join(", ")
        )));
    }

    // 1. Cari apakah user sudah ada di platform
    let existing_user = sqlx::query!(
        "SELECT id, email, full_name, avatar_url FROM users WHERE email = $1",
        target_email
    )
    .fetch_optional(&pool)
    .await?;

    let user_id = match existing_user {
        Some(u) => u.id,
        None => {
            // Jika user belum mendaftar, buat akun placeholder
            let dummy_pass = crate::modules::auth::service::AuthService::hash_password(&Uuid::new_v4().to_string())?;
            let name = payload.full_name.unwrap_or_else(|| target_email.split('@').next().unwrap_or("Anggota").to_string());
            let new_user = sqlx::query!(
                r#"
                INSERT INTO users (email, password_hash, full_name)
                VALUES ($1, $2, $3)
                RETURNING id
                "#,
                target_email,
                dummy_pass,
                name
            )
            .fetch_one(&pool)
            .await?;
            new_user.id
        }
    };

    // 2. Cek apakah user sudah terdaftar di organisasi ini
    let member_exists = sqlx::query!(
        "SELECT id FROM organization_members WHERE organization_id = $1 AND user_id = $2",
        org_id,
        user_id
    )
    .fetch_optional(&pool)
    .await?;

    if member_exists.is_some() {
        return Err(AppError::Conflict("Pengguna dengan email ini sudah menjadi anggota organisasi.".to_string()));
    }

    // 3. Masukkan ke organization_members
    let member = sqlx::query_as!(
        MemberResponse,
        r#"
        WITH inserted AS (
            INSERT INTO organization_members (organization_id, user_id, role, status)
            VALUES ($1, $2, $3, 'active')
            RETURNING id, organization_id, user_id, role, status, joined_at
        )
        SELECT 
            i.id,
            i.user_id,
            u.email,
            u.full_name,
            u.avatar_url,
            i.role,
            i.status,
            i.joined_at
        FROM inserted i
        JOIN users u ON u.id = i.user_id
        "#,
        org_id,
        user_id,
        target_role
    )
    .fetch_one(&pool)
    .await?;

    let _ = sqlx::query!(
        r#"
        INSERT INTO audit_logs (organization_id, user_id, action, target_type, target_id, details)
        VALUES ($1, $2, 'members.invite', 'member', $3, json_build_object('role', $4, 'email', $5))
        "#,
        org_id,
        current_org.user_id,
        member.id,
        target_role,
        target_email
    )
    .execute(&pool)
    .await;

    Ok(Json(member))
}

/// Handler: PATCH /api/v1/organizations/:id/members/:member_id (Update Member Role)
pub async fn update_member_role(
    State(pool): State<PgPool>,
    current_org: CurrentOrganization,
    Path((org_id, member_id)): Path<(Uuid, Uuid)>,
    Json(payload): Json<UpdateMemberRoleRequest>,
) -> Result<Json<MemberResponse>, AppError> {
    if current_org.organization_id != org_id && current_org.role != "superadmin" {
        return Err(AppError::Forbidden("Anda tidak memiliki akses ke organisasi ini.".to_string()));
    }

    PermissionService::verify_permission(&pool, &current_org.role, "members.manage").await?;

    let target_role = payload.role.to_lowercase();
    let valid_roles = ["ketua", "sekretaris", "bendahara", "admin_media", "member"];
    if !valid_roles.contains(&target_role.as_str()) {
        return Err(AppError::BadRequest(format!(
            "Peran '{}' tidak valid. Pilih antara: {}",
            target_role,
            valid_roles.join(", ")
        )));
    }

    // Pastikan tidak mengubah role owner
    let target = sqlx::query!(
        "SELECT role FROM organization_members WHERE id = $1 AND organization_id = $2",
        member_id,
        org_id
    )
    .fetch_optional(&pool)
    .await?
    .ok_or_else(|| AppError::NotFound("Anggota tidak ditemukan.".to_string()))?;

    if target.role == "owner" {
        return Err(AppError::Forbidden("Peran 'owner' tidak dapat diubah secara langsung.".to_string()));
    }

    let updated_member = sqlx::query_as!(
        MemberResponse,
        r#"
        WITH updated AS (
            UPDATE organization_members
            SET role = $1, updated_at = CURRENT_TIMESTAMP
            WHERE id = $2 AND organization_id = $3
            RETURNING id, organization_id, user_id, role, status, joined_at
        )
        SELECT 
            u_m.id,
            u_m.user_id,
            u.email,
            u.full_name,
            u.avatar_url,
            u_m.role,
            u_m.status,
            u_m.joined_at
        FROM updated u_m
        JOIN users u ON u.id = u_m.user_id
        "#,
        target_role,
        member_id,
        org_id
    )
    .fetch_one(&pool)
    .await?;

    Ok(Json(updated_member))
}

/// Handler: DELETE /api/v1/organizations/:id/members/:member_id (Remove Member)
pub async fn remove_member(
    State(pool): State<PgPool>,
    current_org: CurrentOrganization,
    Path((org_id, member_id)): Path<(Uuid, Uuid)>,
) -> Result<Json<serde_json::Value>, AppError> {
    if current_org.organization_id != org_id && current_org.role != "superadmin" {
        return Err(AppError::Forbidden("Anda tidak memiliki akses ke organisasi ini.".to_string()));
    }

    PermissionService::verify_permission(&pool, &current_org.role, "members.manage").await?;

    let target = sqlx::query!(
        "SELECT role, user_id FROM organization_members WHERE id = $1 AND organization_id = $2",
        member_id,
        org_id
    )
    .fetch_optional(&pool)
    .await?
    .ok_or_else(|| AppError::NotFound("Anggota tidak ditemukan.".to_string()))?;

    if target.role == "owner" {
        return Err(AppError::Forbidden("Pemilik (owner) organisasi tidak dapat dihapus.".to_string()));
    }

    sqlx::query!(
        "DELETE FROM organization_members WHERE id = $1 AND organization_id = $2",
        member_id,
        org_id
    )
    .execute(&pool)
    .await?;

    let _ = sqlx::query!(
        r#"
        INSERT INTO audit_logs (organization_id, user_id, action, target_type, target_id)
        VALUES ($1, $2, 'members.remove', 'member', $3)
        "#,
        org_id,
        current_org.user_id,
        member_id
    )
    .execute(&pool)
    .await;

    Ok(Json(serde_json::json!({
        "success": true,
        "message": "Anggota berhasil dihapus dari organisasi."
    })))
}

