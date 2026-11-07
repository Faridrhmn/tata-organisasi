use axum::{routing::get, Json, Router};
use serde_json::{json, Value};
use sqlx::PgPool;

pub fn router() -> Router<PgPool> {
    Router::new()
        .route("/health", get(health_check))
        .route("/api/v1/health", get(health_check))
}

async fn health_check() -> Json<Value> {
    Json(json!({
        "status": "healthy",
        "service": "tari-api",
        "version": env!("CARGO_PKG_VERSION"),
        "timestamp": chrono::Utc::now().to_rfc3339()
    }))
}

