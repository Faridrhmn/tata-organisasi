use axum::{
    extract::{Path, State},
    Json,
};
use sqlx::PgPool;
use uuid::Uuid;
use crate::config::AppConfig;
use crate::error::AppError;
use crate::extractors::CurrentOrganization;
use crate::modules::auth::service::AuthService;
use crate::modules::organization::permissions::PermissionService;
use super::crypto::VaultCrypto;
use super::dto::{
    CreateCredentialRequest, CredentialListItem, RevealPasswordRequest, RevealPasswordResponse,
    UpdateCredentialRequest,
};

/// Handler: GET /api/v1/vault/credentials (List All Credentials in Masked Mode)
pub async fn list_credentials(
    State(pool): State<PgPool>,
    current_org: CurrentOrganization,
) -> Result<Json<Vec<CredentialListItem>>, AppError> {
    PermissionService::verify_permission(&pool, &current_org.role, "vault.view").await?;

    let rows = sqlx::query!(
        r#"
        SELECT 
            id, platform, label, username, recovery_email, phone_number, notes,
            created_at, updated_at
        FROM vault_credentials
        WHERE organization_id = $1
        ORDER BY platform ASC, label ASC
        "#,
        current_org.organization_id
    )
    .fetch_all(&pool)
    .await?;

    let items = rows
        .into_iter()
        .map(|r| CredentialListItem {
            id: r.id,
            platform: r.platform,
            label: r.label,
            username: r.username,
            recovery_email: r.recovery_email,
            phone_number: r.phone_number,
            notes: r.notes,
            has_password: true,
            created_at: r.created_at,
            updated_at: r.updated_at,
        })
        .collect();

    Ok(Json(items))
}

/// Handler: POST /api/v1/vault/credentials (Store New Encrypted Credential)
pub async fn create_credential(
    State(pool): State<PgPool>,
    current_org: CurrentOrganization,
    Json(payload): Json<CreateCredentialRequest>,
) -> Result<Json<CredentialListItem>, AppError> {
    PermissionService::verify_permission(&pool, &current_org.role, "vault.manage").await?;

    let platform = payload.platform.trim();
    let label = payload.label.trim();
    let username = payload.username.trim();

    if platform.is_empty() || label.is_empty() || username.is_empty() {
        return Err(AppError::BadRequest("Platform, nama akun (label), dan username wajib diisi.".to_string()));
    }

    if payload.password.is_empty() {
        return Err(AppError::BadRequest("Kata sandi akun digital tidak boleh kosong.".to_string()));
    }

    // 1. Enkripsi password menggunakan AES-256-GCM
    let config = AppConfig::from_env();
    let (encrypted_password, nonce) = VaultCrypto::encrypt(&payload.password, &config.vault_master_key)?;

    // 2. Simpan ke database
    let cred = sqlx::query!(
        r#"
        INSERT INTO vault_credentials (
            organization_id, platform, label, username, encrypted_password, nonce,
            recovery_email, phone_number, notes, created_by, updated_by
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $10)
        RETURNING id, platform, label, username, recovery_email, phone_number, notes, created_at, updated_at
        "#,
        current_org.organization_id,
        platform,
        label,
        username,
        encrypted_password,
        nonce,
        payload.recovery_email,
        payload.phone_number,
        payload.notes,
        current_org.user_id
    )
    .fetch_one(&pool)
    .await?;

    // 3. Catat audit log
    let _ = sqlx::query!(
        r#"
        INSERT INTO audit_logs (organization_id, user_id, action, target_type, target_id, details)
        VALUES ($1, $2, 'vault.create', 'vault_credential', $3, json_build_object('platform', $4, 'label', $5))
        "#,
        current_org.organization_id,
        current_org.user_id,
        cred.id,
        platform,
        label
    )
    .execute(&pool)
    .await;

    Ok(Json(CredentialListItem {
        id: cred.id,
        platform: cred.platform,
        label: cred.label,
        username: cred.username,
        recovery_email: cred.recovery_email,
        phone_number: cred.phone_number,
        notes: cred.notes,
        has_password: true,
        created_at: cred.created_at,
        updated_at: cred.updated_at,
    }))
}

/// Handler: POST /api/v1/vault/credentials/:id/reveal (Zero-Trust Re-Authentication & Reveal)
pub async fn reveal_credential(
    State(pool): State<PgPool>,
    current_org: CurrentOrganization,
    Path(cred_id): Path<Uuid>,
    Json(payload): Json<RevealPasswordRequest>,
) -> Result<Json<RevealPasswordResponse>, AppError> {
    PermissionService::verify_permission(&pool, &current_org.role, "vault.reveal").await?;

    if payload.user_password.is_empty() {
        return Err(AppError::BadRequest("Konfirmasi kata sandi login Anda wajib diisi.".to_string()));
    }

    // 1. Re-Autentikasi: Verifikasi password user yang sedang login
    let user_hash = sqlx::query!(
        "SELECT password_hash FROM users WHERE id = $1",
        current_org.user_id
    )
    .fetch_one(&pool)
    .await?;

    let is_valid = AuthService::verify_password(&payload.user_password, &user_hash.password_hash)?;
    if !is_valid {
        // Catat insiden keamanan gagal verifikasi password vault
        let _ = sqlx::query!(
            r#"
            INSERT INTO audit_logs (organization_id, user_id, action, target_type, target_id, details)
            VALUES ($1, $2, 'vault.reveal_failed_auth', 'vault_credential', $3, '{"status": "invalid_user_password"}'::jsonb)
            "#,
            current_org.organization_id,
            current_org.user_id,
            cred_id
        )
        .execute(&pool)
        .await;

        return Err(AppError::Unauthorized("Kata sandi akun Anda tidak cocok. Akses kredensial ditolak.".to_string()));
    }

    // 2. Ambil ciphertext dan nonce dari database
    let cred = sqlx::query!(
        r#"
        SELECT platform, username, encrypted_password, nonce
        FROM vault_credentials
        WHERE id = $1 AND organization_id = $2
        "#,
        cred_id,
        current_org.organization_id
    )
    .fetch_optional(&pool)
    .await?
    .ok_or_else(|| AppError::NotFound("Kredensial tidak ditemukan.".to_string()))?;

    // 3. Dekripsi menggunakan AES-256-GCM
    let config = AppConfig::from_env();
    let decrypted_password = VaultCrypto::decrypt(&cred.encrypted_password, &cred.nonce, &config.vault_master_key)?;

    // 4. Catat Audit Log Keberhasilan Reveal
    let _ = sqlx::query!(
        r#"
        INSERT INTO audit_logs (organization_id, user_id, action, target_type, target_id, details)
        VALUES ($1, $2, 'vault.reveal_success', 'vault_credential', $3, json_build_object('platform', $4, 'username', $5))
        "#,
        current_org.organization_id,
        current_org.user_id,
        cred_id,
        cred.platform,
        cred.username
    )
    .execute(&pool)
    .await;

    Ok(Json(RevealPasswordResponse {
        id: cred_id,
        platform: cred.platform,
        username: cred.username,
        decrypted_password,
    }))
}

/// Handler: DELETE /api/v1/vault/credentials/:id (Delete Credential)
pub async fn delete_credential(
    State(pool): State<PgPool>,
    current_org: CurrentOrganization,
    Path(cred_id): Path<Uuid>,
) -> Result<Json<serde_json::Value>, AppError> {
    PermissionService::verify_permission(&pool, &current_org.role, "vault.manage").await?;

    let deleted = sqlx::query!(
        "DELETE FROM vault_credentials WHERE id = $1 AND organization_id = $2 RETURNING platform, label",
        cred_id,
        current_org.organization_id
    )
    .fetch_optional(&pool)
    .await?
    .ok_or_else(|| AppError::NotFound("Kredensial tidak ditemukan.".to_string()))?;

    let _ = sqlx::query!(
        r#"
        INSERT INTO audit_logs (organization_id, user_id, action, target_type, target_id, details)
        VALUES ($1, $2, 'vault.delete', 'vault_credential', $3, json_build_object('platform', $4, 'label', $5))
        "#,
        current_org.organization_id,
        current_org.user_id,
        cred_id,
        deleted.platform,
        deleted.label
    )
    .execute(&pool)
    .await;

    Ok(Json(serde_json::json!({
        "success": true,
        "message": "Kredensial berhasil dihapus dari vault."
    })))
}

