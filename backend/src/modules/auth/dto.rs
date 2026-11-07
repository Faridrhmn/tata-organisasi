use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Deserialize)]
pub struct RegisterRequest {
    pub email: String,
    pub password: String,
    pub full_name: String,
    pub phone_number: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct LoginRequest {
    pub email: String,
    pub password: String,
}

#[derive(Debug, Serialize)]
pub struct UserProfile {
    pub id: Uuid,
    pub email: String,
    pub full_name: String,
    pub phone_number: Option<String>,
    pub avatar_url: Option<String>,
    pub is_superadmin: bool,
}

#[derive(Debug, Serialize)]
pub struct AuthResponse {
    pub access_token: String,
    pub token_type: String,
    pub expires_in_hours: i64,
    pub user: UserProfile,
}

#[derive(Debug, Serialize)]
pub struct UserOrganizationMembership {
    pub organization_id: Uuid,
    pub organization_name: String,
    pub organization_slug: String,
    pub role: String,
    pub status: String,
}

#[derive(Debug, Serialize)]
pub struct MeResponse {
    pub user: UserProfile,
    pub organizations: Vec<UserOrganizationMembership>,
}

