mod config;
mod db;
mod error;
mod extractors;
mod modules;

use axum::{
    http::{header, HeaderValue, Method},
    Router,
};
use std::net::SocketAddr;
use tower_http::cors::CorsLayer;
use tower_http::trace::TraceLayer;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // 1. Inisialisasi Structured Logging
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "tari_api=debug,tower_http=debug,axum=trace".into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    tracing::info!("🚀 Memulai TARI (Tata Organisasi) API Daemon...");

    // 2. Load Configuration
    let config = config::AppConfig::from_env();

    // 3. Setup Database Pool & Run Migrations
    let db_pool = match db::create_pool(&config).await {
        Ok(pool) => {
            if let Err(e) = db::run_migrations(&pool).await {
                tracing::warn!("Catatan migrasi: {:?}", e);
            }
            pool
        }
        Err(err) => {
            tracing::error!("Gagal menghubungkan ke database PostgreSQL: {:?}", err);
            panic!("Database connection required: {:?}", err);
        }
    };

    // 4. Start Tokio Background Scheduler Worker for Content Publishing
    let scheduler_pool = db_pool.clone();
    tokio::spawn(async move {
        modules::media::scheduler::start_scheduler(scheduler_pool).await;
    });

    // 5. Setup CORS
    let mut cors = CorsLayer::new()
        .allow_methods([
            Method::GET,
            Method::POST,
            Method::PUT,
            Method::PATCH,
            Method::DELETE,
            Method::OPTIONS,
        ])
        .allow_headers([
            header::AUTHORIZATION,
            header::ACCEPT,
            header::CONTENT_TYPE,
            header::HeaderName::from_static("x-organization-id"),
        ]);

    for origin in &config.cors_allowed_origins {
        if let Ok(val) = HeaderValue::from_str(origin) {
            cors = cors.allow_origin(val);
        }
    }

    // 5. Build Router & Nest APIs under /api/v1
    let api_v1 = Router::new()
        .nest("/auth", modules::auth::router())
        .nest("/organizations", modules::organization::router())
        .nest("/finance", modules::finance::router())
        .nest("/vault", modules::vault::router())
        .nest("/poster", modules::poster::router())
        .nest("/audit", modules::audit::router())
        .nest("/media", modules::media::router());

    let app = Router::new()
        .merge(modules::health::router())
        .nest("/api/v1", api_v1)
        .layer(cors)
        .layer(TraceLayer::new_for_http())
        .with_state(db_pool);

    // 6. Bind Server Listener
    let addr = SocketAddr::new(
        config.server_host.parse()?,
        config.server_port,
    );

    tracing::info!("📡 TARI API beroperasi di: http://{}", addr);
    let listener = tokio::net::TcpListener::bind(addr).await?;
    axum::serve(listener, app).await?;

    Ok(())
}
