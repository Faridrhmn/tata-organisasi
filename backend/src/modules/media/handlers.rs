use axum::{
    extract::{Path, Query, State},
    Json,
};
use serde::Deserialize;
use sqlx::PgPool;
use uuid::Uuid;
use crate::error::AppError;
use crate::extractors::CurrentOrganization;
use crate::modules::organization::permissions::PermissionService;
use super::dto::{ApprovePostRequest, CreatePostRequest, PostResponse};

#[derive(Debug, Deserialize)]
pub struct PostFilterQuery {
    pub status: Option<String>,
    pub campaign: Option<String>,
    pub limit: Option<i64>,
    pub offset: Option<i64>,
}

/// Handler: GET /api/v1/media/posts (List Planned Content Posts)
pub async fn list_posts(
    State(pool): State<PgPool>,
    current_org: CurrentOrganization,
    Query(filter): Query<PostFilterQuery>,
) -> Result<Json<Vec<PostResponse>>, AppError> {
    PermissionService::verify_permission(&pool, &current_org.role, "media.view").await?;

    let limit = filter.limit.unwrap_or(50).min(100);
    let offset = filter.offset.unwrap_or(0);

    let rows = sqlx::query_as!(
        PostResponse,
        r#"
        SELECT 
            cp.id,
            cp.title,
            cp.caption,
            cp.target_platforms,
            cp.media_urls,
            cp.scheduled_at,
            cp.status,
            cp.campaign_name,
            u_creator.full_name as created_by_name,
            u_approver.full_name as approved_by_name,
            cp.published_at,
            cp.created_at
        FROM content_posts cp
        LEFT JOIN users u_creator ON u_creator.id = cp.created_by
        LEFT JOIN users u_approver ON u_approver.id = cp.approved_by
        WHERE cp.organization_id = $1
          AND ($2::varchar IS NULL OR cp.status = $2)
          AND ($3::varchar IS NULL OR cp.campaign_name = $3)
        ORDER BY COALESCE(cp.scheduled_at, cp.created_at) DESC
        LIMIT $4 OFFSET $5
        "#,
        current_org.organization_id,
        filter.status,
        filter.campaign,
        limit,
        offset
    )
    .fetch_all(&pool)
    .await?;

    Ok(Json(rows))
}

/// Handler: POST /api/v1/media/posts (Create Draft or Scheduled Content Post)
pub async fn create_post(
    State(pool): State<PgPool>,
    current_org: CurrentOrganization,
    Json(payload): Json<CreatePostRequest>,
) -> Result<Json<PostResponse>, AppError> {
    PermissionService::verify_permission(&pool, &current_org.role, "media.manage").await?;

    let title = payload.title.trim();
    if title.is_empty() {
        return Err(AppError::BadRequest("Judul konten wajib diisi.".to_string()));
    }

    let platforms_json = serde_json::to_value(&payload.target_platforms)
        .map_err(|e| AppError::BadRequest(format!("Format platform tidak valid: {}", e)))?;

    let media_json = serde_json::to_value(payload.media_urls.unwrap_or_default())
        .map_err(|e| AppError::BadRequest(format!("Format media_urls tidak valid: {}", e)))?;

    let initial_status = if payload.scheduled_at.is_some() {
        "pending_approval"
    } else {
        "draft"
    };

    let post = sqlx::query_as!(
        PostResponse,
        r#"
        WITH inserted AS (
            INSERT INTO content_posts (
                organization_id, title, caption, target_platforms, media_urls,
                scheduled_at, status, campaign_name, created_by
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *
        )
        SELECT 
            i.id,
            i.title,
            i.caption,
            i.target_platforms,
            i.media_urls,
            i.scheduled_at,
            i.status,
            i.campaign_name,
            u.full_name as created_by_name,
            NULL::text as approved_by_name,
            i.published_at,
            i.created_at
        FROM inserted i
        LEFT JOIN users u ON u.id = i.created_by
        "#,
        current_org.organization_id,
        title,
        payload.caption,
        platforms_json,
        media_json,
        payload.scheduled_at,
        initial_status,
        payload.campaign_name,
        current_org.user_id
    )
    .fetch_one(&pool)
    .await?;

    let _ = sqlx::query!(
        r#"
        INSERT INTO audit_logs (organization_id, user_id, action, target_type, target_id, details)
        VALUES ($1, $2, 'media.create_post', 'content_post', $3, json_build_object('title', $4::text, 'status', $5::text))
        "#,
        current_org.organization_id,
        current_org.user_id,
        post.id,
        post.title,
        post.status
    )
    .execute(&pool)
    .await;

    Ok(Json(post))
}

/// Handler: POST /api/v1/media/posts/:id/approve (Approval Workflow by Ketua/Owner)
pub async fn approve_post(
    State(pool): State<PgPool>,
    current_org: CurrentOrganization,
    Path(post_id): Path<Uuid>,
    Json(payload): Json<ApprovePostRequest>,
) -> Result<Json<PostResponse>, AppError> {
    PermissionService::verify_permission(&pool, &current_org.role, "media.manage").await?;

    let new_status = if payload.approved { "approved" } else { "draft" };

    let post = sqlx::query_as!(
        PostResponse,
        r#"
        WITH updated AS (
            UPDATE content_posts
            SET status = $1, approved_by = $2, updated_at = CURRENT_TIMESTAMP
            WHERE id = $3 AND organization_id = $4
            RETURNING *
        )
        SELECT 
            u_p.id,
            u_p.title,
            u_p.caption,
            u_p.target_platforms,
            u_p.media_urls,
            u_p.scheduled_at,
            u_p.status,
            u_p.campaign_name,
            u_c.full_name as created_by_name,
            u_a.full_name as approved_by_name,
            u_p.published_at,
            u_p.created_at
        FROM updated u_p
        LEFT JOIN users u_c ON u_c.id = u_p.created_by
        LEFT JOIN users u_a ON u_a.id = u_p.approved_by
        "#,
        new_status,
        current_org.user_id,
        post_id,
        current_org.organization_id
    )
    .fetch_optional(&pool)
    .await?
    .ok_or_else(|| AppError::NotFound("Konten tidak ditemukan.".to_string()))?;

    let _ = sqlx::query!(
        r#"
        INSERT INTO audit_logs (organization_id, user_id, action, target_type, target_id, details)
        VALUES ($1, $2, 'media.approve_post', 'content_post', $3, json_build_object('approved', $4::boolean))
        "#,
        current_org.organization_id,
        current_org.user_id,
        post_id,
        payload.approved
    )
    .execute(&pool)
    .await;

    Ok(Json(post))
}

/// Handler: DELETE /api/v1/media/posts/:id (Delete Post)
pub async fn delete_post(
    State(pool): State<PgPool>,
    current_org: CurrentOrganization,
    Path(post_id): Path<Uuid>,
) -> Result<Json<serde_json::Value>, AppError> {
    PermissionService::verify_permission(&pool, &current_org.role, "media.manage").await?;

    sqlx::query!(
        "DELETE FROM content_posts WHERE id = $1 AND organization_id = $2",
        post_id,
        current_org.organization_id
    )
    .execute(&pool)
    .await?;

    Ok(Json(serde_json::json!({
        "success": true,
        "message": "Konten berhasil dihapus."
    })))
}

/// Handler: POST /api/v1/media/scheduler/run-now (Manual trigger for scheduler cycle)
pub async fn trigger_scheduler(
    State(pool): State<PgPool>,
    current_org: CurrentOrganization,
) -> Result<Json<serde_json::Value>, AppError> {
    PermissionService::verify_permission(&pool, &current_org.role, "media.manage").await?;

    let processed = super::scheduler::execute_publish_cycle(&pool).await?;

    Ok(Json(serde_json::json!({
        "success": true,
        "processed_count": processed,
        "timestamp": chrono::Utc::now().to_rfc3339(),
        "message": format!("Siklus scheduler selesai. {} postingan diproses.", processed)
    })))
}

/// Handler: GET /api/v1/media/scheduler/status (Inspect scheduler queue)
pub async fn get_scheduler_status(
    State(pool): State<PgPool>,
    current_org: CurrentOrganization,
) -> Result<Json<serde_json::Value>, AppError> {
    PermissionService::verify_permission(&pool, &current_org.role, "media.view").await?;

    let approved_count = sqlx::query_scalar!(
        "SELECT count(*) FROM content_posts WHERE organization_id = $1 AND status = 'approved'",
        current_org.organization_id
    )
    .fetch_one(&pool)
    .await?
    .unwrap_or(0);

    let due_count = sqlx::query_scalar!(
        "SELECT count(*) FROM content_posts WHERE organization_id = $1 AND status = 'approved' AND scheduled_at <= CURRENT_TIMESTAMP",
        current_org.organization_id
    )
    .fetch_one(&pool)
    .await?
    .unwrap_or(0);

    Ok(Json(serde_json::json!({
        "status": "active",
        "interval_seconds": 60,
        "approved_posts": approved_count,
        "due_posts": due_count,
        "server_time": chrono::Utc::now().to_rfc3339()
    })))
}


