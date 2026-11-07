use axum::{
    routing::{delete, get, post},
    Router,
};
use sqlx::PgPool;
use super::handlers;

pub fn router() -> Router<PgPool> {
    Router::new()
        .route("/credentials", get(handlers::list_credentials).post(handlers::create_credential))
        .route("/credentials/:id/reveal", post(handlers::reveal_credential))
        .route("/credentials/:id", delete(handlers::delete_credential))
}

