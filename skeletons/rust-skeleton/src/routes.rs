use actix_web::web;

use crate::handlers;

/// Configure all application routes.
///
/// Add your routes here to register them with the application.
pub fn configure(cfg: &mut web::ServiceConfig) {
    cfg.service(handlers::health_check);

    // TODO: Add your routes here
    // Example:
    // cfg.service(
    //     web::scope("/api/v1")
    //         .route("/items", web::get().to(handlers::list_items))
    //         .route("/items", web::post().to(handlers::create_item))
    // );
}
