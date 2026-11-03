import express from "express";
import pg from "pg";

const app = express();
const port = process.env.PORT || 3000;

const pool = new pg.Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

app.get("/health", async (req, res) => {
  try {
    const dbRes = await pool.query("SELECT NOW() as time, COUNT(*) as count FROM service_status");
    res.json({
      service: "node-service",
      runtime: "Node.js + Express",
      status: "ok",
      db_connected: true,
      server_time: dbRes.rows[0].time,
      service_status_count: dbRes.rows[0].count,
    });
  } catch (err) {
    res.status(500).json({
      service: "node-service",
      runtime: "Node.js + Express",
      status: "error",
      db_connected: false,
      error: err.message,
    });
  }
});

app.get("/", (req, res) => {
  res.json({
    message: "HW6 Node.js API running behind Nginx reverse proxy",
    endpoints: ["/health"],
  });
});

app.listen(port, () => {
  console.log(`Node service listening on port ${port}`);
});
