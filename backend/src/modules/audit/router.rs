use axum::{routing::get, Router};
use sqlx::PgPool;
use super::handlers;

pub fn router() -> Router<PgPool> {
    Router::new().route("/", get(handlers::list_audit_logs))
}

