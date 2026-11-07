use axum::{
    extract::State,
    Json,
};
use sqlx::PgPool;
use uuid::Uuid;
use crate::error::AppError;
use crate::extractors::CurrentOrganization;
use crate::modules::organization::permissions::PermissionService;
use super::dto::{GeneratePosterRequest, GeneratePosterResponse, PosterTemplateInfo};
use super::templates::PosterEngine;

/// Handler: GET /api/v1/poster/templates
pub async fn list_templates(
    State(pool): State<PgPool>,
    current_org: CurrentOrganization,
) -> Result<Json<Vec<PosterTemplateInfo>>, AppError> {
    PermissionService::verify_permission(&pool, &current_org.role, "poster.generate").await?;
    Ok(Json(PosterEngine::get_available_templates()))
}

/// Handler: POST /api/v1/poster/generate (Generate SVG Vector from Dynamic Variables)
pub async fn generate_poster(
    State(pool): State<PgPool>,
    current_org: CurrentOrganization,
    Json(payload): Json<GeneratePosterRequest>,
) -> Result<Json<GeneratePosterResponse>, AppError> {
    PermissionService::verify_permission(&pool, &current_org.role, "poster.generate").await?;

    if payload.title.trim().is_empty() {
        return Err(AppError::BadRequest("Judul kajian wajib diisi.".to_string()));
    }
    if payload.speaker.trim().is_empty() {
        return Err(AppError::BadRequest("Nama pemateri / ustadz wajib diisi.".to_string()));
    }

    let svg_content = PosterEngine::render_svg(&payload);
    let poster_id = Uuid::new_v4();

    // Catat ke audit log
    let _ = sqlx::query!(
        r#"
        INSERT INTO audit_logs (organization_id, user_id, action, target_type, target_id, details)
        VALUES ($1, $2, 'poster.generate', 'poster', $3, json_build_object('title', $4::text, 'ratio', $5::text, 'status_type', $6::text))
        "#,
        current_org.organization_id,
        current_org.user_id,
        poster_id,
        payload.title,
        payload.aspect_ratio,
        payload.status_type
    )
    .execute(&pool)
    .await;

    Ok(Json(GeneratePosterResponse {
        poster_id,
        svg_content,
        aspect_ratio: payload.aspect_ratio,
    }))
}

