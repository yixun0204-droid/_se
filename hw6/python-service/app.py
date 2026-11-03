import os
from datetime import datetime

import psycopg
from fastapi import FastAPI
from fastapi.responses import JSONResponse

app = FastAPI(title="HW6 Python Service")

DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_NAME = os.getenv("DB_NAME")


@app.get("/")
def root():
    return {
        "message": "HW6 Python API running behind Nginx reverse proxy",
        "endpoints": ["/health"],
    }


@app.get("/health")
def health():
    conn_str = f"host={DB_HOST} port={DB_PORT} dbname={DB_NAME} user={DB_USER} password={DB_PASSWORD}"
    try:
        with psycopg.connect(conn_str) as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT NOW()")
                now = cur.fetchone()[0]
                cur.execute("SELECT COUNT(*) FROM service_status")
                count = cur.fetchone()[0]
        return {
            "service": "python-service",
            "runtime": "Python + FastAPI",
            "status": "ok",
            "db_connected": True,
            "server_time": now.isoformat(),
            "service_status_count": count,
        }
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={
                "service": "python-service",
                "runtime": "Python + FastAPI",
                "status": "error",
                "db_connected": False,
                "error": str(e),
            },
        )
