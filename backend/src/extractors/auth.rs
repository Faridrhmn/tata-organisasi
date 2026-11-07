use axum::{
    async_trait,
    extract::FromRequestParts,
    http::request::Parts,
};
use crate::config::AppConfig;
use crate::error::AppError;
use crate::extractors::tenant::AuthUser;
use crate::modules::auth::service::AuthService;

#[async_trait]
impl<S> FromRequestParts<S> for AuthUser
where
    S: Send + Sync,
{
    type Rejection = AppError;

    async fn from_request_parts(parts: &mut Parts, _state: &S) -> Result<Self, Self::Rejection> {
        // Ambil header Authorization: Bearer <token>
        let auth_header = parts
            .headers
            .get("Authorization")
            .ok_or_else(|| AppError::Unauthorized("Token otorisasi diperlukan.".to_string()))?
            .to_str()
            .map_err(|_| AppError::Unauthorized("Format header Authorization tidak valid.".to_string()))?;

        if !auth_header.starts_with("Bearer ") {
            return Err(AppError::Unauthorized("Format token harus berupa Bearer <token>.".to_string()));
        }

        let token = &auth_header[7..];
        let config = AppConfig::from_env();
        let claims = AuthService::verify_token(token, &config.jwt_secret)?;

        let auth_user = AuthUser {
            id: claims.sub,
            email: claims.email,
            is_superadmin: claims.is_superadmin,
        };

        // Simpan juga ke parts.extensions agar dapat diakses oleh CurrentOrganization extractor
        parts.extensions.insert(auth_user.clone());

        Ok(auth_user)
    }
}

