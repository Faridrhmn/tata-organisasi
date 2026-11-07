use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Deserialize)]
pub struct CreatePostRequest {
    pub title: String,
    pub caption: String,
    pub target_platforms: Vec<String>, // ["instagram", "facebook", "whatsapp"]
    pub media_urls: Option<Vec<String>>,
    pub scheduled_at: Option<DateTime<Utc>>,
    pub campaign_name: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct UpdatePostRequest {
    pub title: Option<String>,
    pub caption: Option<String>,
    pub target_platforms: Option<Vec<String>>,
    pub media_urls: Option<Vec<String>>,
    pub scheduled_at: Option<DateTime<Utc>>,
    pub status: Option<String>,
    pub campaign_name: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct PostResponse {
    pub id: Uuid,
    pub title: String,
    pub caption: String,
    pub target_platforms: serde_json::Value,
    pub media_urls: serde_json::Value,
    pub scheduled_at: Option<DateTime<Utc>>,
    pub status: String,
    pub campaign_name: Option<String>,
    pub created_by_name: Option<String>,
    pub approved_by_name: Option<String>,
    pub published_at: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct ApprovePostRequest {
    pub approved: bool,
}

