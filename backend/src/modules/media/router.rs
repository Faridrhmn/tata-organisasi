use axum::{
    routing::{delete, get, post},
    Router,
};
use sqlx::PgPool;
use super::handlers;

pub fn router() -> Router<PgPool> {
    Router::new()
        .route("/posts", get(handlers::list_posts).post(handlers::create_post))
        .route("/posts/:id/approve", post(handlers::approve_post))
        .route("/posts/:id", delete(handlers::delete_post))
        .route("/scheduler/run-now", post(handlers::trigger_scheduler))
        .route("/scheduler/status", get(handlers::get_scheduler_status))
}

