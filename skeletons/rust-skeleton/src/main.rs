/*
 * Rust REST API Application Entry Point
 *
 * This is a minimal Rust REST API application with no endpoints defined.
 * Use this as a starting point to add your own endpoints and functionality.
 */

use actix_web::{App, HttpServer, web};
use log::info;
use std::env;

mod handlers;
mod routes;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    env_logger::init_from_env(env_logger::Env::default().default_filter_or("info"));

    let port = env::var("PORT").unwrap_or_else(|_| "8080".to_string());
    let bind_addr = format!("0.0.0.0:{}", port);

    info!("🚀 Rust REST API server starting on port {}...", port);

    HttpServer::new(|| {
        App::new()
            .configure(routes::configure)
    })
    .bind(&bind_addr)?
    .run()
    .await
}
