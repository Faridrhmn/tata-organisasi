use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Copy, Deserialize, Serialize, PartialEq, Eq, Default)]
#[serde(rename_all = "lowercase")]
pub enum PosterTextAlign {
    Left,
    #[default]
    Center,
    Right,
}

impl PosterTextAlign {
    pub fn as_svg_anchor(&self) -> &'static str {
        match self {
            PosterTextAlign::Left => "start",
            PosterTextAlign::Center => "middle",
            PosterTextAlign::Right => "end",
        }
    }
}

#[derive(Debug, Clone, Deserialize, Serialize)]
#[serde(default)]
pub struct PosterElementLayout {
    pub x: f64,
    pub y: f64,
    pub font_family: String,
    pub font_size: f64,
    pub font_weight: String,
    pub color: String,
    pub align: PosterTextAlign,
    pub letter_spacing: f64,
    pub max_width: f64,
    pub visible: bool,
    pub background_color: Option<String>,
    pub border_color: Option<String>,
}

impl Default for PosterElementLayout {
    fn default() -> Self {
        Self {
            x: 540.0,
            y: 120.0,
            font_family: "'Inter', 'Noto Sans Local', sans-serif".to_string(),
            font_size: 24.0,
            font_weight: "700".to_string(),
            color: "#ffffff".to_string(),
            align: PosterTextAlign::Center,
            letter_spacing: 0.0,
            max_width: 860.0,
            visible: true,
            background_color: None,
            border_color: None,
        }
    }
}

#[derive(Debug, Clone, Deserialize, Serialize, Default)]
#[serde(default)]
pub struct PosterLayoutConfig {
    pub basmalah: Option<PosterElementLayout>,
    pub badge: Option<PosterElementLayout>,
    pub title: Option<PosterElementLayout>,
    pub speaker_label: Option<PosterElementLayout>,
    pub speaker: Option<PosterElementLayout>,
    pub cancellation_notice: Option<PosterElementLayout>,
    pub details_box: Option<PosterElementLayout>,
    pub footer: Option<PosterElementLayout>,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
#[serde(default)]
pub struct CustomTextBlock {
    pub id: String,
    pub label: Option<String>,
    pub text: String,
    pub x: f64,
    pub y: f64,
    pub font_family: String,
    pub font_size: f64,
    pub font_weight: String,
    pub color: String,
    pub align: PosterTextAlign,
    pub letter_spacing: f64,
    pub max_width: f64,
    pub visible: bool,
}

impl Default for CustomTextBlock {
    fn default() -> Self {
        Self {
            id: "custom-text".to_string(),
            label: None,
            text: String::new(),
            x: 540.0,
            y: 920.0,
            font_family: "'Plus Jakarta Sans', 'Noto Sans Local', sans-serif".to_string(),
            font_size: 26.0,
            font_weight: "700".to_string(),
            color: "#fef08a".to_string(),
            align: PosterTextAlign::Center,
            letter_spacing: 0.5,
            max_width: 820.0,
            visible: true,
        }
    }
}

#[derive(Debug, Clone, Deserialize, Serialize)]
#[serde(default)]
pub struct PosterLogoOverlay {
    pub id: String,
    pub name: Option<String>,
    pub image_url: String,
    pub x: f64,
    pub y: f64,
    pub width: f64,
    pub height: f64,
    pub opacity: f64,
    pub border_radius: f64,
    pub visible: bool,
}

impl Default for PosterLogoOverlay {
    fn default() -> Self {
        Self {
            id: "logo".to_string(),
            name: None,
            image_url: String::new(),
            x: 68.0,
            y: 62.0,
            width: 160.0,
            height: 160.0,
            opacity: 1.0,
            border_radius: 0.0,
            visible: true,
        }
    }
}

#[derive(Debug, Clone, Serialize)]
pub struct PosterFontOption {
    pub id: String,
    pub label: String,
    pub family: String,
    pub category: String,
    pub source: String,
}

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
    #[serde(default)]
    pub footer_text: Option<String>,
    #[serde(default)]
    pub background_image_url: Option<String>,
    #[serde(default)]
    pub layout: Option<PosterLayoutConfig>,
    #[serde(default)]
    pub custom_text_blocks: Vec<CustomTextBlock>,
    #[serde(default)]
    pub logos: Vec<PosterLogoOverlay>,
}

#[derive(Debug, Serialize)]
pub struct PosterTemplateInfo {
    pub id: String,
    pub name: String,
    pub description: String,
    pub supported_ratios: Vec<String>,
    pub preview_thumbnail: String,
    pub default_layout_feed: PosterLayoutConfig,
    pub default_layout_story: PosterLayoutConfig,
}

#[derive(Debug, Serialize)]
pub struct GeneratePosterResponse {
    pub poster_id: Uuid,
    pub svg_content: String,
    pub aspect_ratio: String,
}
