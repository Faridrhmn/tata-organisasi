use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Deserialize)]
pub struct GeneratePosterRequest {
    pub template_id: String,
    pub aspect_ratio: String, // "1:1" or "9:16"
    pub title: String,
    pub speaker: String,
    pub date_text: String,
    pub time_text: String,
    pub location: String,
    pub status_type: String, // "regular", "cancelled", "special"
    pub cancellation_reason: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct PosterTemplateInfo {
    pub id: String,
    pub name: String,
    pub description: String,
    pub supported_ratios: Vec<String>,
    pub preview_thumbnail: String,
}

#[derive(Debug, Serialize)]
pub struct GeneratePosterResponse {
    pub poster_id: Uuid,
    pub svg_content: String,
    pub aspect_ratio: String,
}

