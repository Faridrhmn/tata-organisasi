use axum::{
    extract::{Path, Query, State},
    Json,
};
use chrono::{Datelike, Local, NaiveDate};
use serde::Deserialize;
use sqlx::PgPool;
use uuid::Uuid;
use crate::error::AppError;
use crate::extractors::CurrentOrganization;
use crate::modules::organization::permissions::PermissionService;
use super::dto::{
    AccountResponse, CategoryResponse, CreateAccountRequest, CreateTransactionRequest,
    FinanceSummaryResponse, TransactionResponse, VoidTransactionRequest,
};

#[derive(Debug, Deserialize)]
pub struct TransactionFilterQuery {
    pub account_id: Option<Uuid>,
    pub category_id: Option<Uuid>,
    pub r#type: Option<String>,
    pub start_date: Option<NaiveDate>,
    pub end_date: Option<NaiveDate>,
    pub limit: Option<i64>,
    pub offset: Option<i64>,
}

/// Handler: GET /api/v1/finance/summary (Overview of Organization Cashflow)
pub async fn get_summary(
    State(pool): State<PgPool>,
    current_org: CurrentOrganization,
) -> Result<Json<FinanceSummaryResponse>, AppError> {
    PermissionService::verify_permission(&pool, &current_org.role, "finance.view").await?;

    // 1. Ambil semua akun kas & total saldo
    let accounts = sqlx::query_as!(
        AccountResponse,
        r#"
        SELECT id, name, account_number, currency, initial_balance, current_balance, is_active, created_at
        FROM financial_accounts
        WHERE organization_id = $1 AND is_active = TRUE
        ORDER BY created_at ASC
        "#,
        current_org.organization_id
    )
    .fetch_all(&pool)
    .await?;

    let total_balance: i64 = accounts.iter().map(|a| a.current_balance).sum();

    // 2. Agregasi pemasukan dan pengeluaran bulan berjalan
    let now = Local::now();
    let start_of_month = NaiveDate::from_ymd_opt(now.year(), now.month(), 1)
        .unwrap_or_else(|| NaiveDate::from_ymd_opt(2026, 1, 1).unwrap());

    let income_row = sqlx::query!(
        r#"
        SELECT COALESCE(SUM(amount), 0)::BIGINT as "total!"
        FROM transactions
        WHERE organization_id = $1 
          AND type = 'income' 
          AND status = 'completed'
          AND transaction_date >= $2
        "#,
        current_org.organization_id,
        start_of_month
    )
    .fetch_one(&pool)
    .await?;

    let expense_row = sqlx::query!(
        r#"
        SELECT COALESCE(SUM(amount), 0)::BIGINT as "total!"
        FROM transactions
        WHERE organization_id = $1 
          AND type = 'expense' 
          AND status = 'completed'
          AND transaction_date >= $2
        "#,
        current_org.organization_id,
        start_of_month
    )
    .fetch_one(&pool)
    .await?;

    let total_income_this_month = income_row.total;
    let total_expense_this_month = expense_row.total;
    let net_cashflow_this_month = total_income_this_month - total_expense_this_month;

    Ok(Json(FinanceSummaryResponse {
        total_balance,
        total_income_this_month,
        total_expense_this_month,
        net_cashflow_this_month,
        accounts,
    }))
}

/// Handler: GET /api/v1/finance/accounts (List Financial Accounts)
pub async fn list_accounts(
    State(pool): State<PgPool>,
    current_org: CurrentOrganization,
) -> Result<Json<Vec<AccountResponse>>, AppError> {
    PermissionService::verify_permission(&pool, &current_org.role, "finance.view").await?;

    let accounts = sqlx::query_as!(
        AccountResponse,
        r#"
        SELECT id, name, account_number, currency, initial_balance, current_balance, is_active, created_at
        FROM financial_accounts
        WHERE organization_id = $1
        ORDER BY created_at ASC
        "#,
        current_org.organization_id
    )
    .fetch_all(&pool)
    .await?;

    Ok(Json(accounts))
}

/// Handler: POST /api/v1/finance/accounts (Create Financial Account)
pub async fn create_account(
    State(pool): State<PgPool>,
    current_org: CurrentOrganization,
    Json(payload): Json<CreateAccountRequest>,
) -> Result<Json<AccountResponse>, AppError> {
    PermissionService::verify_permission(&pool, &current_org.role, "finance.create").await?;

    let name = payload.name.trim();
    if name.is_empty() {
        return Err(AppError::BadRequest("Nama rekening / kas wajib diisi.".to_string()));
    }

    let initial = payload.initial_balance.unwrap_or(0);

    let account = sqlx::query_as!(
        AccountResponse,
        r#"
        INSERT INTO financial_accounts (organization_id, name, account_number, initial_balance, current_balance)
        VALUES ($1, $2, $3, $4, $4)
        RETURNING id, name, account_number, currency, initial_balance, current_balance, is_active, created_at
        "#,
        current_org.organization_id,
        name,
        payload.account_number,
        initial
    )
    .fetch_one(&pool)
    .await?;

    let _ = sqlx::query!(
        r#"
        INSERT INTO audit_logs (organization_id, user_id, action, target_type, target_id, details)
        VALUES ($1, $2, 'finance.create_account', 'financial_account', $3, json_build_object('name', $4::text, 'initial_balance', $5::bigint))
        "#,
        current_org.organization_id,
        current_org.user_id,
        account.id,
        name,
        initial
    )
    .execute(&pool)
    .await;

    Ok(Json(account))
}

/// Handler: GET /api/v1/finance/categories (List Categories)
pub async fn list_categories(
    State(pool): State<PgPool>,
    current_org: CurrentOrganization,
) -> Result<Json<Vec<CategoryResponse>>, AppError> {
    PermissionService::verify_permission(&pool, &current_org.role, "finance.view").await?;

    let categories = sqlx::query_as!(
        CategoryResponse,
        r#"
        SELECT id, name, type, icon, color
        FROM transaction_categories
        WHERE (organization_id = $1 OR organization_id IS NULL) AND is_active = TRUE
        ORDER BY type ASC, name ASC
        "#,
        current_org.organization_id
    )
    .fetch_all(&pool)
    .await?;

    Ok(Json(categories))
}

/// Handler: GET /api/v1/finance/transactions (List Filtered Transactions)
pub async fn list_transactions(
    State(pool): State<PgPool>,
    current_org: CurrentOrganization,
    Query(filter): Query<TransactionFilterQuery>,
) -> Result<Json<Vec<TransactionResponse>>, AppError> {
    PermissionService::verify_permission(&pool, &current_org.role, "finance.view").await?;

    let limit = filter.limit.unwrap_or(50).min(100);
    let offset = filter.offset.unwrap_or(0);

    let rows = sqlx::query_as!(
        TransactionResponse,
        r#"
        SELECT 
            t.id,
            t.account_id,
            fa.name as account_name,
            t.category_id,
            tc.name as category_name,
            tc.color as category_color,
            t.type,
            t.amount,
            t.transaction_date,
            t.description,
            t.receipt_url,
            t.status,
            u.full_name as created_by_name,
            t.void_reason,
            t.created_at
        FROM transactions t
        JOIN financial_accounts fa ON fa.id = t.account_id
        JOIN transaction_categories tc ON tc.id = t.category_id
        LEFT JOIN users u ON u.id = t.created_by
        WHERE t.organization_id = $1
          AND ($2::uuid IS NULL OR t.account_id = $2)
          AND ($3::uuid IS NULL OR t.category_id = $3)
          AND ($4::varchar IS NULL OR t.type = $4)
          AND ($5::date IS NULL OR t.transaction_date >= $5)
          AND ($6::date IS NULL OR t.transaction_date <= $6)
        ORDER BY t.transaction_date DESC, t.created_at DESC
        LIMIT $7 OFFSET $8
        "#,
        current_org.organization_id,
        filter.account_id,
        filter.category_id,
        filter.r#type,
        filter.start_date,
        filter.end_date,
        limit,
        offset
    )
    .fetch_all(&pool)
    .await?;

    Ok(Json(rows))
}

/// Handler: POST /api/v1/finance/transactions (Record New Transaction)
pub async fn create_transaction(
    State(pool): State<PgPool>,
    current_org: CurrentOrganization,
    Json(payload): Json<CreateTransactionRequest>,
) -> Result<Json<TransactionResponse>, AppError> {
    PermissionService::verify_permission(&pool, &current_org.role, "finance.create").await?;

    if payload.amount <= 0 {
        return Err(AppError::BadRequest("Nominal transaksi harus lebih besar dari 0.".to_string()));
    }

    let tx_type = payload.r#type.to_lowercase();
    if tx_type != "income" && tx_type != "expense" {
        return Err(AppError::BadRequest("Tipe transaksi harus 'income' atau 'expense'.".to_string()));
    }

    let desc = payload.description.trim();
    if desc.is_empty() {
        return Err(AppError::BadRequest("Deskripsi / keterangan transaksi wajib diisi.".to_string()));
    }

    let date = payload.transaction_date.unwrap_or_else(|| Local::now().date_naive());

    // 1. Verifikasi akun kas milik organisasi
    let account = sqlx::query!(
        "SELECT id, name FROM financial_accounts WHERE id = $1 AND organization_id = $2 AND is_active = TRUE",
        payload.account_id,
        current_org.organization_id
    )
    .fetch_optional(&pool)
    .await?
    .ok_or_else(|| AppError::BadRequest("Rekening kas tidak ditemukan atau tidak aktif.".to_string()))?;

    // 2. Verifikasi kategori
    let category = sqlx::query!(
        "SELECT id, name, color FROM transaction_categories WHERE id = $1 AND (organization_id = $2 OR organization_id IS NULL)",
        payload.category_id,
        current_org.organization_id
    )
    .fetch_optional(&pool)
    .await?
    .ok_or_else(|| AppError::BadRequest("Kategori transaksi tidak valid.".to_string()))?;

    // 3. Insert transaksi (trigger trg_update_account_balance akan meng-update saldo secara atomic)
    let new_tx = sqlx::query_as!(
        TransactionResponse,
        r#"
        WITH inserted AS (
            INSERT INTO transactions (
                organization_id, account_id, category_id, type, amount,
                transaction_date, description, receipt_url, status, created_by
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'completed', $9)
            RETURNING *
        )
        SELECT 
            i.id,
            i.account_id,
            fa.name as account_name,
            i.category_id,
            tc.name as category_name,
            tc.color as category_color,
            i.type,
            i.amount,
            i.transaction_date,
            i.description,
            i.receipt_url,
            i.status,
            u.full_name as created_by_name,
            i.void_reason,
            i.created_at
        FROM inserted i
        JOIN financial_accounts fa ON fa.id = i.account_id
        JOIN transaction_categories tc ON tc.id = i.category_id
        LEFT JOIN users u ON u.id = i.created_by
        "#,
        current_org.organization_id,
        account.id,
        category.id,
        tx_type,
        payload.amount,
        date,
        desc,
        payload.receipt_url,
        current_org.user_id
    )
    .fetch_one(&pool)
    .await?;

    // Catat Audit Log
    let _ = sqlx::query!(
        r#"
        INSERT INTO audit_logs (organization_id, user_id, action, target_type, target_id, details)
        VALUES ($1, $2, 'finance.create_transaction', 'transaction', $3, json_build_object('type', $4::text, 'amount', $5::bigint, 'desc', $6::text))
        "#,
        current_org.organization_id,
        current_org.user_id,
        new_tx.id,
        tx_type,
        payload.amount,
        desc
    )
    .execute(&pool)
    .await;

    Ok(Json(new_tx))
}

/// Handler: POST /api/v1/finance/transactions/:id/void (Void / Reversal Transaction)
pub async fn void_transaction(
    State(pool): State<PgPool>,
    current_org: CurrentOrganization,
    Path(tx_id): Path<Uuid>,
    Json(payload): Json<VoidTransactionRequest>,
) -> Result<Json<serde_json::Value>, AppError> {
    PermissionService::verify_permission(&pool, &current_org.role, "finance.approve").await?;

    let reason = payload.reason.trim();
    if reason.is_empty() {
        return Err(AppError::BadRequest("Alasan pembatalan (void reason) wajib diisi.".to_string()));
    }

    let existing = sqlx::query!(
        "SELECT id, status FROM transactions WHERE id = $1 AND organization_id = $2",
        tx_id,
        current_org.organization_id
    )
    .fetch_optional(&pool)
    .await?
    .ok_or_else(|| AppError::NotFound("Transaksi tidak ditemukan.".to_string()))?;

    if existing.status == "void" {
        return Err(AppError::BadRequest("Transaksi ini sudah dibatalkan sebelumnya.".to_string()));
    }

    // Update status to 'void' (trigger trg_update_account_balance akan mengembalikan saldo secara otomatis)
    sqlx::query!(
        r#"
        UPDATE transactions
        SET status = 'void', void_reason = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2 AND organization_id = $3
        "#,
        reason,
        tx_id,
        current_org.organization_id
    )
    .execute(&pool)
    .await?;

    let _ = sqlx::query!(
        r#"
        INSERT INTO audit_logs (organization_id, user_id, action, target_type, target_id, details)
        VALUES ($1, $2, 'finance.void_transaction', 'transaction', $3, json_build_object('reason', $4::text))
        "#,
        current_org.organization_id,
        current_org.user_id,
        tx_id,
        reason
    )
    .execute(&pool)
    .await;

    Ok(Json(serde_json::json!({
        "success": true,
        "message": "Transaksi berhasil dibatalkan dan saldo kas telah disesuaikan."
    })))
}

