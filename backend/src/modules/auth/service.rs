use argon2::{
    password_hash::{rand_core::OsRng, PasswordHash, PasswordHasher, PasswordVerifier, SaltString},
    Argon2,
};
use chrono::{Duration, Utc};
use jsonwebtoken::{decode, encode, DecodingKey, EncodingKey, Header, Validation};
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use crate::error::AppError;

#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub sub: Uuid,             // User ID
    pub email: String,
    pub is_superadmin: bool,
    pub exp: i64,              // Expiration timestamp
    pub iat: i64,              // Issued at
}

pub struct AuthService;

impl AuthService {
    /// Hash a plaintext password using Argon2id
    pub fn hash_password(password: &str) -> Result<String, AppError> {
        let salt = SaltString::generate(&mut OsRng);
        let argon2 = Argon2::default();
        let hash = argon2
            .hash_password(password.as_bytes(), &salt)
            .map_err(|e| AppError::Crypto(format!("Gagal mengenkripsi kata sandi: {}", e)))?
            .to_string();
        Ok(hash)
    }

    /// Verify a plaintext password against an Argon2id hash
    pub fn verify_password(password: &str, password_hash: &str) -> Result<bool, AppError> {
        let parsed_hash = PasswordHash::new(password_hash)
            .map_err(|e| AppError::Crypto(format!("Format hash tidak valid: {}", e)))?;
        let argon2 = Argon2::default();
        Ok(argon2.verify_password(password.as_bytes(), &parsed_hash).is_ok())
    }

    /// Generate a JWT token for a user
    pub fn generate_token(
        user_id: Uuid,
        email: &str,
        is_superadmin: bool,
        jwt_secret: &str,
        expiration_hours: i64,
    ) -> Result<String, AppError> {
        let now = Utc::now();
        let expires_at = now + Duration::hours(expiration_hours);

        let claims = Claims {
            sub: user_id,
            email: email.to_string(),
            is_superadmin,
            exp: expires_at.timestamp(),
            iat: now.timestamp(),
        };

        encode(
            &Header::default(),
            &claims,
            &EncodingKey::from_secret(jwt_secret.as_bytes()),
        )
        .map_err(|e| AppError::Crypto(format!("Gagal menerbitkan token JWT: {}", e)))
    }

    /// Verify and decode a JWT token
    pub fn verify_token(token: &str, jwt_secret: &str) -> Result<Claims, AppError> {
        let mut validation = Validation::default();
        validation.validate_exp = true;

        decode::<Claims>(
            token,
            &DecodingKey::from_secret(jwt_secret.as_bytes()),
            &validation,
        )
        .map(|data| data.claims)
        .map_err(|_| AppError::Unauthorized("Sesi tidak valid atau telah kedaluwarsa. Silakan login kembali.".to_string()))
    }
}

