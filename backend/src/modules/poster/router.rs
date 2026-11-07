use axum::{
    routing::{get, post},
    Router,
};
use sqlx::PgPool;
use super::handlers;

pub fn router() -> Router<PgPool> {
    Router::new()
        .route("/templates", get(handlers::list_templates))
        .route("/generate", post(handlers::generate_poster))
}

