use axum::{
    routing::{get, post},
    Router,
};
use sqlx::PgPool;
use super::handlers;

pub fn router() -> Router<PgPool> {
    Router::new()
        .route("/summary", get(handlers::get_summary))
        .route("/accounts", get(handlers::list_accounts).post(handlers::create_account))
        .route("/categories", get(handlers::list_categories))
        .route("/transactions", get(handlers::list_transactions).post(handlers::create_transaction))
        .route("/transactions/:id/void", post(handlers::void_transaction))
}

