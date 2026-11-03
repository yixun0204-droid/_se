CREATE TABLE IF NOT EXISTS service_status (
  id SERIAL PRIMARY KEY,
  service_name VARCHAR(50) NOT NULL,
  checked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO service_status (service_name) VALUES
  ('node-service'),
  ('rust-service'),
  ('python-service');
