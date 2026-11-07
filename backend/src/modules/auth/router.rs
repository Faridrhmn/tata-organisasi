use axum::{
    routing::{get, post},
    Router,
};
use sqlx::PgPool;
use super::handlers;

pub fn router() -> Router<PgPool> {
    Router::new()
        .route("/register", post(handlers::register))
        .route("/login", post(handlers::login))
        .route("/me", get(handlers::me))
}

