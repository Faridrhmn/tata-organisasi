use async_trait::async_trait;
use serde::{Deserialize, Serialize};
use std::env;
use crate::error::AppError;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DispatchResult {
    pub platform: String,
    pub success: bool,
    pub external_post_id: Option<String>,
    pub error_message: Option<String>,
    pub dispatched_at: chrono::DateTime<chrono::Utc>,
}

#[async_trait]
pub trait SocialPlatformDispatcher: Send + Sync {
    async fn publish(
        &self,
        platform: &str,
        caption: &str,
        media_urls: &[String],
    ) -> Result<DispatchResult, AppError>;
}

/// Meta Graph API Dispatcher (Instagram & Facebook Pages)
pub struct MetaGraphApiDispatcher {
    pub access_token: Option<String>,
    pub fb_page_id: Option<String>,
    pub ig_user_id: Option<String>,
    pub http_client: reqwest::Client,
}

impl MetaGraphApiDispatcher {
    pub fn new() -> Self {
        Self {
            access_token: env::var("META_ACCESS_TOKEN").ok(),
            fb_page_id: env::var("META_FB_PAGE_ID").ok(),
            ig_user_id: env::var("META_IG_USER_ID").ok(),
            http_client: reqwest::Client::builder()
                .timeout(std::time::Duration::from_secs(30))
                .build()
                .unwrap_or_default(),
        }
    }

    async fn publish_to_instagram(
        &self,
        caption: &str,
        media_urls: &[String],
    ) -> Result<DispatchResult, AppError> {
        let now = chrono::Utc::now();

        // Jika token dan user ID tersedia di production, lakukan panggilan HTTP riil
        if let (Some(token), Some(ig_id)) = (&self.access_token, &self.ig_user_id) {
            tracing::info!("📡 [META-IG] Mengirim postingan ke Instagram Graph API (IG ID: {})...", ig_id);

            let image_url = media_urls.first().cloned().unwrap_or_else(|| {
                "https://alikhlas.org/assets/poster-kajian-default.png".to_string()
            });

            // 1. Buat Container Media
            let container_endpoint = format!("https://graph.facebook.com/v19.0/{}/media", ig_id);
            let container_res = self
                .http_client
                .post(&container_endpoint)
                .json(&serde_json::json!({
                    "image_url": image_url,
                    "caption": caption,
                    "access_token": token,
                }))
                .send()
                .await;

            match container_res {
                Ok(resp) if resp.status().is_success() => {
                    let resp_body: serde_json::Value = resp.json().await.unwrap_or_default();
                    if let Some(creation_id) = resp_body.get("id").and_then(|v| v.as_str()) {
                        // 2. Publish Container
                        let publish_endpoint = format!("https://graph.facebook.com/v19.0/{}/media_publish", ig_id);
                        let pub_res = self
                            .http_client
                            .post(&publish_endpoint)
                            .json(&serde_json::json!({
                                "creation_id": creation_id,
                                "access_token": token,
                            }))
                            .send()
                            .await;

                        match pub_res {
                            Ok(p_resp) if p_resp.status().is_success() => {
                                let p_body: serde_json::Value = p_resp.json().await.unwrap_or_default();
                                let ig_post_id = p_body.get("id").and_then(|v| v.as_str()).unwrap_or(creation_id);
                                return Ok(DispatchResult {
                                    platform: "instagram".to_string(),
                                    success: true,
                                    external_post_id: Some(ig_post_id.to_string()),
                                    error_message: None,
                                    dispatched_at: now,
                                });
                            }
                            Ok(p_resp) => {
                                let err_text = p_resp.text().await.unwrap_or_default();
                                return Ok(DispatchResult {
                                    platform: "instagram".to_string(),
                                    success: false,
                                    external_post_id: None,
                                    error_message: Some(format!("Meta IG Publish error: {}", err_text)),
                                    dispatched_at: now,
                                });
                            }
                            Err(e) => {
                                return Ok(DispatchResult {
                                    platform: "instagram".to_string(),
                                    success: false,
                                    external_post_id: None,
                                    error_message: Some(format!("Network error to Meta IG: {}", e)),
                                    dispatched_at: now,
                                });
                            }
                        }
                    }
                }
                Ok(resp) => {
                    let err_text = resp.text().await.unwrap_or_default();
                    return Ok(DispatchResult {
                        platform: "instagram".to_string(),
                        success: false,
                        external_post_id: None,
                        error_message: Some(format!("Meta IG Container error: {}", err_text)),
                        dispatched_at: now,
                    });
                }
                Err(e) => {
                    return Ok(DispatchResult {
                        platform: "instagram".to_string(),
                        success: false,
                        external_post_id: None,
                        error_message: Some(format!("Network error to Meta IG: {}", e)),
                        dispatched_at: now,
                    });
                }
            }
        }

        // Simulasi Development: Meta credentials belum diset
        tracing::info!(
            "🧪 [SIMULASI-DISPATCH] Meta IG Token belum diset. Mensimulasikan publikasi Instagram (Caption: {} karakter)",
            caption.len()
        );
        tokio::time::sleep(tokio::time::Duration::from_millis(150)).await;

        Ok(DispatchResult {
            platform: "instagram".to_string(),
            success: true,
            external_post_id: Some(format!("ig_{}", uuid::Uuid::new_v4())),
            error_message: None,
            dispatched_at: now,
        })
    }

    async fn publish_to_facebook(
        &self,
        caption: &str,
        media_urls: &[String],
    ) -> Result<DispatchResult, AppError> {
        let now = chrono::Utc::now();

        if let (Some(token), Some(page_id)) = (&self.access_token, &self.fb_page_id) {
            tracing::info!("📡 [META-FB] Mengirim postingan ke Facebook Page (Page ID: {})...", page_id);

            let endpoint = format!("https://graph.facebook.com/v19.0/{}/feed", page_id);
            let mut payload = serde_json::json!({
                "message": caption,
                "access_token": token,
            });

            if let Some(first_url) = media_urls.first() {
                payload["link"] = serde_json::Value::String(first_url.clone());
            }

            match self.http_client.post(&endpoint).json(&payload).send().await {
                Ok(resp) if resp.status().is_success() => {
                    let body: serde_json::Value = resp.json().await.unwrap_or_default();
                    let post_id = body.get("id").and_then(|v| v.as_str()).unwrap_or("fb_success");
                    return Ok(DispatchResult {
                        platform: "facebook".to_string(),
                        success: true,
                        external_post_id: Some(post_id.to_string()),
                        error_message: None,
                        dispatched_at: now,
                    });
                }
                Ok(resp) => {
                    let err_text = resp.text().await.unwrap_or_default();
                    return Ok(DispatchResult {
                        platform: "facebook".to_string(),
                        success: false,
                        external_post_id: None,
                        error_message: Some(format!("Facebook Page API error: {}", err_text)),
                        dispatched_at: now,
                    });
                }
                Err(e) => {
                    return Ok(DispatchResult {
                        platform: "facebook".to_string(),
                        success: false,
                        external_post_id: None,
                        error_message: Some(format!("Network error to Facebook: {}", e)),
                        dispatched_at: now,
                    });
                }
            }
        }

        // Simulasi Development
        tracing::info!(
            "🧪 [SIMULASI-DISPATCH] Meta FB Token belum diset. Mensimulasikan publikasi Facebook Page (Caption: {} karakter)",
            caption.len()
        );
        tokio::time::sleep(tokio::time::Duration::from_millis(150)).await;

        Ok(DispatchResult {
            platform: "facebook".to_string(),
            success: true,
            external_post_id: Some(format!("fb_{}", uuid::Uuid::new_v4())),
            error_message: None,
            dispatched_at: now,
        })
    }
}

/// WhatsApp Cloud API Dispatcher
pub struct WhatsAppCloudDispatcher {
    pub access_token: Option<String>,
    pub phone_number_id: Option<String>,
    pub recipient_group: Option<String>,
    pub http_client: reqwest::Client,
}

impl WhatsAppCloudDispatcher {
    pub fn new() -> Self {
        Self {
            access_token: env::var("WA_ACCESS_TOKEN").ok(),
            phone_number_id: env::var("WA_PHONE_NUMBER_ID").ok(),
            recipient_group: env::var("WA_BROADCAST_RECIPIENT").ok(),
            http_client: reqwest::Client::builder()
                .timeout(std::time::Duration::from_secs(30))
                .build()
                .unwrap_or_default(),
        }
    }

    async fn send_whatsapp_message(&self, caption: &str) -> Result<DispatchResult, AppError> {
        let now = chrono::Utc::now();

        if let (Some(token), Some(phone_id)) = (&self.access_token, &self.phone_number_id) {
            let recipient = self.recipient_group.clone().unwrap_or_else(|| "status".to_string());
            tracing::info!("📡 [WHATSAPP] Mengirim pesan siaran ke {} via Cloud API...", recipient);

            let endpoint = format!("https://graph.facebook.com/v19.0/{}/messages", phone_id);
            let payload = serde_json::json!({
                "messaging_product": "whatsapp",
                "to": recipient,
                "type": "text",
                "text": { "body": caption }
            });

            match self
                .http_client
                .post(&endpoint)
                .bearer_auth(token)
                .json(&payload)
                .send()
                .await
            {
                Ok(resp) if resp.status().is_success() => {
                    let body: serde_json::Value = resp.json().await.unwrap_or_default();
                    let msg_id = body
                        .get("messages")
                        .and_then(|m| m.get(0))
                        .and_then(|m0| m0.get("id"))
                        .and_then(|id| id.as_str())
                        .unwrap_or("wa_sent");

                    return Ok(DispatchResult {
                        platform: "whatsapp".to_string(),
                        success: true,
                        external_post_id: Some(msg_id.to_string()),
                        error_message: None,
                        dispatched_at: now,
                    });
                }
                Ok(resp) => {
                    let err_text = resp.text().await.unwrap_or_default();
                    return Ok(DispatchResult {
                        platform: "whatsapp".to_string(),
                        success: false,
                        external_post_id: None,
                        error_message: Some(format!("WhatsApp Cloud API error: {}", err_text)),
                        dispatched_at: now,
                    });
                }
                Err(e) => {
                    return Ok(DispatchResult {
                        platform: "whatsapp".to_string(),
                        success: false,
                        external_post_id: None,
                        error_message: Some(format!("Network error to WhatsApp: {}", e)),
                        dispatched_at: now,
                    });
                }
            }
        }

        // Simulasi Development
        tracing::info!(
            "🧪 [SIMULASI-DISPATCH] WA Token belum diset. Mensimulasikan broadcast WhatsApp Status (Caption: {} karakter)",
            caption.len()
        );
        tokio::time::sleep(tokio::time::Duration::from_millis(150)).await;

        Ok(DispatchResult {
            platform: "whatsapp".to_string(),
            success: true,
            external_post_id: Some(format!("wa_{}", uuid::Uuid::new_v4())),
            error_message: None,
            dispatched_at: now,
        })
    }
}

/// Unified Multi-Platform Social Dispatcher Engine
pub struct SocialDispatcherEngine {
    meta_dispatcher: MetaGraphApiDispatcher,
    whatsapp_dispatcher: WhatsAppCloudDispatcher,
}

impl SocialDispatcherEngine {
    pub fn new() -> Self {
        Self {
            meta_dispatcher: MetaGraphApiDispatcher::new(),
            whatsapp_dispatcher: WhatsAppCloudDispatcher::new(),
        }
    }

    pub async fn dispatch_platform(
        &self,
        platform: &str,
        caption: &str,
        media_urls: &[String],
    ) -> Result<DispatchResult, AppError> {
        match platform.to_lowercase().as_str() {
            "instagram" => self.meta_dispatcher.publish_to_instagram(caption, media_urls).await,
            "facebook" => self.meta_dispatcher.publish_to_facebook(caption, media_urls).await,
            "whatsapp" => self.whatsapp_dispatcher.send_whatsapp_message(caption).await,
            other => Ok(DispatchResult {
                platform: other.to_string(),
                success: false,
                external_post_id: None,
                error_message: Some(format!("Platform '{}' belum didukung oleh dispatcher.", other)),
                dispatched_at: chrono::Utc::now(),
            }),
        }
    }
}

#[async_trait]
impl SocialPlatformDispatcher for SocialDispatcherEngine {
    async fn publish(
        &self,
        platform: &str,
        caption: &str,
        media_urls: &[String],
    ) -> Result<DispatchResult, AppError> {
        self.dispatch_platform(platform, caption, media_urls).await
    }
}
