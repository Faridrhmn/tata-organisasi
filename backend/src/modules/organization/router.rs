use axum::{
    routing::{delete, get, patch, post},
    Router,
};
use sqlx::PgPool;
use super::handlers;

pub fn router() -> Router<PgPool> {
    Router::new()
        .route("/", post(handlers::create_organization))
        .route("/", get(handlers::list_my_organizations))
        .route("/:id", get(handlers::get_organization))
        .route("/:id", patch(handlers::update_organization))
        .route("/:id/members", get(handlers::list_members))
        .route("/:id/members", post(handlers::invite_member))
        .route("/:id/members/:member_id", patch(handlers::update_member_role))
        .route("/:id/members/:member_id", delete(handlers::remove_member))
}

