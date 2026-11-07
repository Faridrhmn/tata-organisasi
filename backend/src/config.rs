use std::env;

#[derive(Clone, Debug)]
pub struct AppConfig {
    pub server_host: String,
    pub server_port: u16,
    pub database_url: String,
    pub database_max_connections: u32,
    pub jwt_secret: String,
    pub jwt_expiration_hours: i64,
    pub vault_master_key: String,
    pub cors_allowed_origins: Vec<String>,
}

impl AppConfig {
    pub fn from_env() -> Self {
        dotenvy::dotenv().ok();

        let server_host = env::var("SERVER_HOST").unwrap_or_else(|_| "0.0.0.0".to_string());
        let server_port = env::var("SERVER_PORT")
            .unwrap_or_else(|_| "3000".to_string())
            .parse::<u16>()
            .expect("SERVER_PORT must be a valid number");

        let database_url = env::var("DATABASE_URL")
            .expect("DATABASE_URL environment variable must be set");

        let database_max_connections = env::var("DATABASE_MAX_CONNECTIONS")
            .unwrap_or_else(|_| "20".to_string())
            .parse::<u32>()
            .unwrap_or(20);

        let jwt_secret = env::var("JWT_SECRET")
            .expect("JWT_SECRET environment variable must be set (min 32 chars)");

        let jwt_expiration_hours = env::var("JWT_EXPIRATION_HOURS")
            .unwrap_or_else(|_| "24".to_string())
            .parse::<i64>()
            .unwrap_or(24);

        let vault_master_key = env::var("VAULT_MASTER_KEY")
            .expect("VAULT_MASTER_KEY environment variable must be set for credential encryption");

        let cors_raw = env::var("CORS_ALLOWED_ORIGINS").unwrap_or_else(|_| "http://localhost:5173".to_string());
        let cors_allowed_origins = cors_raw
            .split(',')
            .map(|s| s.trim().to_string())
            .filter(|s| !s.is_empty())
            .collect();

        Self {
            server_host,
            server_port,
            database_url,
            database_max_connections,
            jwt_secret,
            jwt_expiration_hours,
            vault_master_key,
            cors_allowed_origins,
        }
    }
}

