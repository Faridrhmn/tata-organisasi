use axum::{
    extract::{Query, State},
    Json,
};
use serde::Deserialize;
use sqlx::PgPool;
use crate::error::AppError;
use crate::extractors::CurrentOrganization;
use crate::modules::organization::permissions::PermissionService;
use super::dto::AuditLogItem;

#[derive(Debug, Deserialize)]
pub struct AuditQuery {
    pub limit: Option<i64>,
    pub offset: Option<i64>,
    pub action: Option<String>,
}

/// Handler: GET /api/v1/audit (List Audit Trail for Current Organization)
pub async fn list_audit_logs(
    State(pool): State<PgPool>,
    current_org: CurrentOrganization,
    Query(query): Query<AuditQuery>,
) -> Result<Json<Vec<AuditLogItem>>, AppError> {
    PermissionService::verify_permission(&pool, &current_org.role, "audit.view").await?;

    let limit = query.limit.unwrap_or(50).min(100);
    let offset = query.offset.unwrap_or(0);

    let rows = sqlx::query_as!(
        AuditLogItem,
        r#"
        SELECT 
            al.id,
            al.user_id,
            u.full_name as user_name,
            u.email as user_email,
            al.action,
            al.target_type,
            al.target_id,
            al.details,
            al.ip_address,
            al.created_at
        FROM audit_logs al
        LEFT JOIN users u ON u.id = al.user_id
        WHERE al.organization_id = $1
          AND ($2::varchar IS NULL OR al.action = $2)
        ORDER BY al.created_at DESC
        LIMIT $3 OFFSET $4
        "#,
        current_org.organization_id,
        query.action,
        limit,
        offset
    )
    .fetch_all(&pool)
    .await?;

    Ok(Json(rows))
}

