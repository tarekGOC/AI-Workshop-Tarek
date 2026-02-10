use actix_web::{get, HttpResponse};
use serde::Serialize;

/// Health check response body.
#[derive(Serialize)]
pub struct HealthResponse {
    pub status: String,
    pub message: String,
}

/// Returns the current health status of the application.
#[get("/health")]
pub async fn health_check() -> HttpResponse {
    let response = HealthResponse {
        status: "healthy".to_string(),
        message: "Rust REST API application is running".to_string(),
    };

    HttpResponse::Ok().json(response)
}
