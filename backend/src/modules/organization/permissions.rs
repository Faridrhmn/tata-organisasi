use sqlx::PgPool;
use crate::error::AppError;

pub struct PermissionService;

impl PermissionService {
    /// Check whether a given organization role has the required permission
    pub async fn verify_permission(
        pool: &PgPool,
        role: &str,
        permission_code: &str,
    ) -> Result<(), AppError> {
        // Owner and Superadmin always have full bypass permissions
        if role == "owner" || role == "superadmin" {
            return Ok(());
        }

        let has_perm = sqlx::query!(
            r#"
            SELECT 1 as "exists!"
            FROM role_permissions
            WHERE role = $1 AND permission_code = $2
            "#,
            role,
            permission_code
        )
        .fetch_optional(pool)
        .await?;

        if has_perm.is_none() {
            return Err(AppError::Forbidden(format!(
                "Akses ditolak: Peran '{}' tidak memiliki izin '{}'.",
                role, permission_code
            )));
        }

        Ok(())
    }
}

