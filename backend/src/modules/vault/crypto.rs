use aes_gcm::{
    aead::{Aead, KeyInit, OsRng},
    Aes256Gcm, Nonce,
};
use crate::error::AppError;

pub struct VaultCrypto;

impl VaultCrypto {
    /// Encrypt plaintext using AES-256-GCM.
    /// Returns (ciphertext_hex, nonce_hex)
    pub fn encrypt(plaintext: &str, master_key_hex: &str) -> Result<(String, String), AppError> {
        let key_bytes = hex::decode(master_key_hex)
            .map_err(|e| AppError::Crypto(format!("Format VAULT_MASTER_KEY tidak valid: {}", e)))?;

        if key_bytes.len() != 32 {
            return Err(AppError::Crypto(
                "VAULT_MASTER_KEY harus tepat 32 bytes (64 karakter hex) untuk AES-256.".to_string(),
            ));
        }

        let cipher = Aes256Gcm::new_from_slice(&key_bytes)
            .map_err(|e| AppError::Crypto(format!("Inisialisasi cipher AES-256 gagal: {}", e)))?;

        // Generate random 96-bit (12-byte) nonce
        let nonce_bytes: [u8; 12] = rand::random();
        let nonce = Nonce::from_slice(&nonce_bytes);

        let ciphertext = cipher
            .encrypt(nonce, plaintext.as_bytes())
            .map_err(|e| AppError::Crypto(format!("Enkripsi data gagal: {}", e)))?;

        Ok((hex::encode(ciphertext), hex::encode(nonce_bytes)))
    }

    /// Decrypt ciphertext hex using AES-256-GCM and nonce hex.
    pub fn decrypt(
        ciphertext_hex: &str,
        nonce_hex: &str,
        master_key_hex: &str,
    ) -> Result<String, AppError> {
        let key_bytes = hex::decode(master_key_hex)
            .map_err(|e| AppError::Crypto(format!("Format VAULT_MASTER_KEY tidak valid: {}", e)))?;

        let ciphertext = hex::decode(ciphertext_hex)
            .map_err(|e| AppError::Crypto(format!("Ciphertext tidak valid: {}", e)))?;

        let nonce_bytes = hex::decode(nonce_hex)
            .map_err(|e| AppError::Crypto(format!("Nonce tidak valid: {}", e)))?;

        if nonce_bytes.len() != 12 {
            return Err(AppError::Crypto("Panjang nonce tidak valid untuk AES-GCM.".to_string()));
        }

        let cipher = Aes256Gcm::new_from_slice(&key_bytes)
            .map_err(|e| AppError::Crypto(format!("Inisialisasi cipher AES-256 gagal: {}", e)))?;

        let nonce = Nonce::from_slice(&nonce_bytes);

        let decrypted_bytes = cipher
            .decrypt(nonce, ciphertext.as_ref())
            .map_err(|_| AppError::Crypto("Gagal mendekripsi kredensial. Kunci enkripsi atau data rusak.".to_string()))?;

        String::from_utf8(decrypted_bytes)
            .map_err(|e| AppError::Crypto(format!("Kredensial bukan format UTF-8 yang valid: {}", e)))
    }
}

