use axum::{routing::get, Json, Router};
use serde::Serialize;
use sqlx::PgPool;
use std::net::SocketAddr;
use std::time::Duration;

#[derive(Serialize)]
struct HealthResponse {
    service: &'static str,
    runtime: &'static str,
    status: &'static str,
    db_connected: bool,
    server_time: Option<String>,
    service_status_count: Option<i64>,
}

#[derive(Serialize)]
struct RootResponse {
    message: &'static str,
    endpoints: Vec<&'static str>,
}

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt::init();

    let database_url = std::env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    let port: u16 = std::env::var("PORT")
        .unwrap_or_else(|_| "8080".to_string())
        .parse()
        .expect("PORT must be a number");

    let pool = PgPool::connect_lazy(&database_url).expect("Failed to create pool");
    tokio::time::sleep(Duration::from_secs(3)).await;

    let app = Router::new()
        .route("/", get(root))
        .route("/health", get(move || health(pool.clone())))
        .layer(tower_http::trace::TraceLayer::new_for_http());

    let addr = SocketAddr::from(([0, 0, 0, 0], port));
    tracing::info!("Rust service listening on {}", addr);
    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

async fn root() -> Json<RootResponse> {
    Json(RootResponse {
        message: "HW6 Rust API running behind Nginx reverse proxy",
        endpoints: vec!["/health"],
    })
}

async fn health(pool: PgPool) -> Json<HealthResponse> {
    match sqlx::query_scalar::<_, chrono::NaiveDateTime>("SELECT NOW()")
        .fetch_one(&pool)
        .await
    {
        Ok(now) => {
            let count: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM service_status")
                .fetch_one(&pool)
                .await
                .unwrap_or(0);
            Json(HealthResponse {
                service: "rust-service",
                runtime: "Rust + Axum + SQLx",
                status: "ok",
                db_connected: true,
                server_time: Some(now.to_string()),
                service_status_count: Some(count),
            })
        }
        Err(e) => {
            tracing::error!("DB error: {}", e);
            Json(HealthResponse {
                service: "rust-service",
                runtime: "Rust + Axum + SQLx",
                status: "error",
                db_connected: false,
                server_time: None,
                service_status_count: None,
            })
        }
    }
}
