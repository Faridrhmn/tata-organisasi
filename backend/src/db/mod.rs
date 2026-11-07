use sqlx::postgres::{PgPool, PgPoolOptions};
use std::time::Duration;
use crate::config::AppConfig;

pub async fn create_pool(config: &AppConfig) -> Result<PgPool, sqlx::Error> {
    tracing::info!("Menghubungkan ke PostgreSQL di: {}", config.database_url);

    let pool = PgPoolOptions::new()
        .max_connections(config.database_max_connections)
        .acquire_timeout(Duration::from_secs(5))
        .connect(&config.database_url)
        .await?;

    tracing::info!("Koneksi pool PostgreSQL berhasil diinisialisasi.");
    Ok(pool)
}

pub async fn run_migrations(pool: &PgPool) -> Result<(), sqlx::migrate::MigrateError> {
    tracing::info!("Menjalankan migrasi database otomatis...");
    sqlx::migrate!("./migrations")
        .run(pool)
        .await?;
    tracing::info!("Semua migrasi database berhasil diterapkan.");
    Ok(())
}

