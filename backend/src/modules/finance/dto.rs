use chrono::{DateTime, NaiveDate, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Deserialize)]
pub struct CreateAccountRequest {
    pub name: String,
    pub account_number: Option<String>,
    pub initial_balance: Option<i64>,
}

#[derive(Debug, Serialize)]
pub struct AccountResponse {
    pub id: Uuid,
    pub name: String,
    pub account_number: Option<String>,
    pub currency: String,
    pub initial_balance: i64,
    pub current_balance: i64,
    pub is_active: bool,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Serialize)]
pub struct CategoryResponse {
    pub id: Uuid,
    pub name: String,
    pub r#type: String, // 'income' or 'expense'
    pub icon: Option<String>,
    pub color: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct CreateTransactionRequest {
    pub account_id: Uuid,
    pub category_id: Uuid,
    pub r#type: String, // 'income' or 'expense'
    pub amount: i64,
    pub transaction_date: Option<NaiveDate>,
    pub description: String,
    pub receipt_url: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct TransactionResponse {
    pub id: Uuid,
    pub account_id: Uuid,
    pub account_name: String,
    pub category_id: Uuid,
    pub category_name: String,
    pub category_color: Option<String>,
    pub r#type: String,
    pub amount: i64,
    pub transaction_date: NaiveDate,
    pub description: String,
    pub receipt_url: Option<String>,
    pub status: String,
    pub created_by_name: Option<String>,
    pub void_reason: Option<String>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Serialize)]
pub struct FinanceSummaryResponse {
    pub total_balance: i64,
    pub total_income_this_month: i64,
    pub total_expense_this_month: i64,
    pub net_cashflow_this_month: i64,
    pub accounts: Vec<AccountResponse>,
}

#[derive(Debug, Deserialize)]
pub struct VoidTransactionRequest {
    pub reason: String,
}

