use axum::{
    extract::State,
    Json,
};
use sqlx::PgPool;
use crate::config::AppConfig;
use crate::error::AppError;
use crate::extractors::AuthUser;
use super::dto::{AuthResponse, LoginRequest, MeResponse, RegisterRequest, UserOrganizationMembership, UserProfile};
use super::service::AuthService;

/// Handler: POST /api/v1/auth/register
pub async fn register(
    State(pool): State<PgPool>,
    Json(payload): Json<RegisterRequest>,
) -> Result<Json<AuthResponse>, AppError> {
    // 1. Validasi input
    let email = payload.email.trim().to_lowercase();
    if email.is_empty() || !email.contains('@') {
        return Err(AppError::BadRequest("Format email tidak valid.".to_string()));
    }
    if payload.password.len() < 8 {
        return Err(AppError::BadRequest("Kata sandi minimal 8 karakter.".to_string()));
    }
    if payload.full_name.trim().is_empty() {
        return Err(AppError::BadRequest("Nama lengkap wajib diisi.".to_string()));
    }

    // 2. Cek apakah email sudah terdaftar
    let existing = sqlx::query!(
        "SELECT id FROM users WHERE email = $1",
        email
    )
    .fetch_optional(&pool)
    .await?;

    if existing.is_some() {
        return Err(AppError::Conflict("Email sudah terdaftar. Silakan gunakan email lain atau login.".to_string()));
    }

    // 3. Hash password menggunakan Argon2id
    let password_hash = AuthService::hash_password(&payload.password)?;

    // 4. Insert user baru
    let user = sqlx::query_as!(
        UserProfile,
        r#"
        INSERT INTO users (email, password_hash, full_name, phone_number, is_superadmin)
        VALUES ($1, $2, $3, $4, FALSE)
        RETURNING id, email, full_name, phone_number, avatar_url, is_superadmin
        "#,
        email,
        password_hash,
        payload.full_name.trim(),
        payload.phone_number
    )
    .fetch_one(&pool)
    .await?;

    // 5. Generate token JWT
    let config = AppConfig::from_env();
    let token = AuthService::generate_token(
        user.id,
        &user.email,
        user.is_superadmin,
        &config.jwt_secret,
        config.jwt_expiration_hours,
    )?;

    // 6. Catat audit log registrasi
    let _ = sqlx::query!(
        r#"
        INSERT INTO audit_logs (user_id, action, target_type, target_id, details)
        VALUES ($1, 'auth.register', 'user', $1, '{"status": "success"}'::jsonb)
        "#,
        user.id
    )
    .execute(&pool)
    .await;

    Ok(Json(AuthResponse {
        access_token: token,
        token_type: "Bearer".to_string(),
        expires_in_hours: config.jwt_expiration_hours,
        user,
    }))
}

/// Handler: POST /api/v1/auth/login
pub async fn login(
    State(pool): State<PgPool>,
    Json(payload): Json<LoginRequest>,
) -> Result<Json<AuthResponse>, AppError> {
    let email = payload.email.trim().to_lowercase();

    // 1. Ambil data user berdasarkan email
    let record = sqlx::query!(
        r#"
        SELECT id, email, password_hash, full_name, phone_number, avatar_url, is_superadmin, is_active
        FROM users
        WHERE email = $1
        "#,
        email
    )
    .fetch_optional(&pool)
    .await?
    .ok_or_else(|| AppError::Unauthorized("Email atau kata sandi tidak cocok.".to_string()))?;

    if !record.is_active {
        return Err(AppError::Forbidden("Akun Anda telah dinonaktifkan. Silakan hubungi admin.".to_string()));
    }

    // 2. Verifikasi password hash
    let is_valid = AuthService::verify_password(&payload.password, &record.password_hash)?;
    if !is_valid {
        return Err(AppError::Unauthorized("Email atau kata sandi tidak cocok.".to_string()));
    }

    // 3. Generate token JWT
    let config = AppConfig::from_env();
    let token = AuthService::generate_token(
        record.id,
        &record.email,
        record.is_superadmin,
        &config.jwt_secret,
        config.jwt_expiration_hours,
    )?;

    // 4. Catat audit log login
    let _ = sqlx::query!(
        r#"
        INSERT INTO audit_logs (user_id, action, target_type, target_id, details)
        VALUES ($1, 'auth.login', 'user', $1, '{"status": "success"}'::jsonb)
        "#,
        record.id
    )
    .execute(&pool)
    .await;

    let user = UserProfile {
        id: record.id,
        email: record.email,
        full_name: record.full_name,
        phone_number: record.phone_number,
        avatar_url: record.avatar_url,
        is_superadmin: record.is_superadmin,
    };

    Ok(Json(AuthResponse {
        access_token: token,
        token_type: "Bearer".to_string(),
        expires_in_hours: config.jwt_expiration_hours,
        user,
    }))
}

/// Handler: GET /api/v1/auth/me
pub async fn me(
    State(pool): State<PgPool>,
    auth_user: AuthUser,
) -> Result<Json<MeResponse>, AppError> {
    // 1. Ambil profil lengkap user
    let user = sqlx::query_as!(
        UserProfile,
        r#"
        SELECT id, email, full_name, phone_number, avatar_url, is_superadmin
        FROM users
        WHERE id = $1
        "#,
        auth_user.id
    )
    .fetch_one(&pool)
    .await?;

    // 2. Ambil daftar organisasi yang diikuti user
    let organizations = sqlx::query_as!(
        UserOrganizationMembership,
        r#"
        SELECT 
            o.id as organization_id,
            o.name as organization_name,
            o.slug as organization_slug,
            om.role,
            om.status
        FROM organization_members om
        JOIN organizations o ON o.id = om.organization_id
        WHERE om.user_id = $1 AND o.is_active = TRUE
        ORDER BY om.joined_at ASC
        "#,
        auth_user.id
    )
    .fetch_all(&pool)
    .await?;

    Ok(Json(MeResponse { user, organizations }))
}

