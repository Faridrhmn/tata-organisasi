use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Deserialize)]
pub struct CreateCredentialRequest {
    pub platform: String,
    pub label: String,
    pub username: String,
    pub password: String,
    pub recovery_email: Option<String>,
    pub phone_number: Option<String>,
    pub notes: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateCredentialRequest {
    pub label: Option<String>,
    pub username: Option<String>,
    pub password: Option<String>,
    pub recovery_email: Option<String>,
    pub phone_number: Option<String>,
    pub notes: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct CredentialListItem {
    pub id: Uuid,
    pub platform: String,
    pub label: String,
    pub username: String,
    pub recovery_email: Option<String>,
    pub phone_number: Option<String>,
    pub notes: Option<String>,
    pub has_password: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct RevealPasswordRequest {
    pub user_password: String, // Password akun user untuk re-autentikasi
}

#[derive(Debug, Serialize)]
pub struct RevealPasswordResponse {
    pub id: Uuid,
    pub platform: String,
    pub username: String,
    pub decrypted_password: String,
}

