use sqlx::PgPool;
use std::time::Duration;
use super::dispatcher::{DispatchResult, SocialDispatcherEngine, SocialPlatformDispatcher};
use crate::error::AppError;

/// Fungsi yang menjalankan 1 siklus pengecekan dan eksekusi penerbitan konten
pub async fn execute_publish_cycle(pool: &PgPool) -> Result<usize, AppError> {
    let dispatcher = SocialDispatcherEngine::new();

    // 1. Ambil postingan yang telah disetujui (approved) dan waktu jadwalnya <= sekarang
    let ready_posts = sqlx::query!(
        r#"
        SELECT id, organization_id, title, caption, target_platforms, media_urls
        FROM content_posts
        WHERE status = 'approved' AND scheduled_at <= CURRENT_TIMESTAMP
        ORDER BY scheduled_at ASC
        LIMIT 10
        "#
    )
    .fetch_all(pool)
    .await?;

    if ready_posts.is_empty() {
        return Ok(0);
    }

    let total_count = ready_posts.len();
    tracing::info!(
        "📢 [SCHEDULER] Menemukan {} postingan siap dipublikasikan ke media sosial.",
        total_count
    );

    for post in ready_posts {
        tracing::info!("🚀 Memproses publikasi: '{}' (ID: {})", post.title, post.id);

        let platforms: Vec<String> = serde_json::from_value(post.target_platforms.clone()).unwrap_or_default();
        let media_urls: Vec<String> = serde_json::from_value(post.media_urls.clone()).unwrap_or_default();

        let mut results: Vec<DispatchResult> = Vec::new();
        let mut has_failure = false;

        for platform in &platforms {
            match dispatcher.publish(platform, &post.caption, &media_urls).await {
                Ok(res) => {
                    if !res.success {
                        has_failure = true;
                    }
                    results.push(res);
                }
                Err(e) => {
                    tracing::error!("Error saat dispatch ke platform {}: {:?}", platform, e);
                    has_failure = true;
                    results.push(DispatchResult {
                        platform: platform.clone(),
                        success: false,
                        external_post_id: None,
                        error_message: Some(format!("{:?}", e)),
                        dispatched_at: chrono::Utc::now(),
                    });
                }
            }
        }

        let final_status = if has_failure { "failed" } else { "published" };
        let results_json = serde_json::to_value(&results).unwrap_or_default();

        // 2. Update status postingan di database PostgreSQL
        let _ = sqlx::query!(
            r#"
            UPDATE content_posts
            SET status = $1, published_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
            WHERE id = $2
            "#,
            final_status,
            post.id
        )
        .execute(pool)
        .await;

        // 3. Catat aktivitas ke immutable audit_logs
        let _ = sqlx::query!(
            r#"
            INSERT INTO audit_logs (organization_id, action, target_type, target_id, details)
            VALUES ($1, 'media.auto_publish', 'content_post', $2, json_build_object(
                'status', $3::text,
                'title', $4::text,
                'dispatch_results', $5::jsonb
            ))
            "#,
            post.organization_id,
            post.id,
            final_status,
            post.title,
            results_json
        )
        .execute(pool)
        .await;

        tracing::info!(
            "✅ [SCHEDULER] Postingan '{}' selesai diproses. Status akhir: '{}'",
            post.title,
            final_status
        );
    }

    Ok(total_count)
}

/// Daemon scheduler loop yang berjalan di background menggunakan Tokio
pub async fn start_scheduler(pool: PgPool) {
    tracing::info!("⏰ Background Scheduler Worker aktif. Memeriksa jadwal konten setiap 60 detik...");

    let mut interval = tokio::time::interval(Duration::from_secs(60));

    loop {
        interval.tick().await;

        if let Err(e) = execute_publish_cycle(&pool).await {
            tracing::warn!("⚠️ Siklus pemeriksaan scheduler mengalami error: {:?}", e);
        }
    }
}
