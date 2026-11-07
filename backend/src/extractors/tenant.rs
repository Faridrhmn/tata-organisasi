use axum::{
    async_trait,
    extract::FromRequestParts,
    http::request::Parts,
};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use uuid::Uuid;
use crate::error::AppError;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AuthUser {
    pub id: Uuid,
    pub email: String,
    pub is_superadmin: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CurrentOrganization {
    pub organization_id: Uuid,
    pub user_id: Uuid,
    pub role: String,
}

/// Extractor to ensure request has a valid X-Organization-Id header
/// and verifies the user is an active member of that tenant.
#[async_trait]
impl<S> FromRequestParts<S> for CurrentOrganization
where
    S: Send + Sync,
    PgPool: axum::extract::FromRef<S>,
{
    type Rejection = AppError;

    async fn from_request_parts(parts: &mut Parts, state: &S) -> Result<Self, Self::Rejection> {
        let pool = PgPool::from_ref(state);

        // 1. Ambil header X-Organization-Id
        let org_header = parts
            .headers
            .get("X-Organization-Id")
            .ok_or_else(|| AppError::BadRequest("Header 'X-Organization-Id' wajib disertakan.".to_string()))?
            .to_str()
            .map_err(|_| AppError::BadRequest("Format header X-Organization-Id tidak valid.".to_string()))?;

        let organization_id = Uuid::parse_str(org_header)
            .map_err(|_| AppError::BadRequest("Nilai X-Organization-Id bukan UUID yang valid.".to_string()))?;

        // 2. Ambil user ID dari request extensions (setelah lolos AuthGuard)
        let auth_user = parts
            .extensions
            .get::<AuthUser>()
            .cloned()
            .ok_or_else(|| AppError::Unauthorized("Sesi pengguna tidak ditemukan. Silakan login.".to_string()))?;

        // Superadmin platform bypasses membership check
        if auth_user.is_superadmin {
            return Ok(CurrentOrganization {
                organization_id,
                user_id: auth_user.id,
                role: "superadmin".to_string(),
            });
        }

        // 3. Verifikasi keanggotaan aktif di database
        let membership = sqlx::query!(
            r#"
            SELECT role, status
            FROM organization_members
            WHERE organization_id = $1 AND user_id = $2 AND status = 'active'
            "#,
            organization_id,
            auth_user.id
        )
        .fetch_optional(&pool)
        .await
        .map_err(AppError::Database)?
        .ok_or_else(|| {
            AppError::Forbidden("Anda tidak memiliki akses ke ruang kerja organisasi ini.".to_string())
        })?;

        Ok(CurrentOrganization {
            organization_id,
            user_id: auth_user.id,
            role: membership.role,
        })
    }
}

