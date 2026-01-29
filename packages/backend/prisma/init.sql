-- Initialize database extensions

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pg_trgm for full-text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Set timezone to Vietnam
SET timezone = 'Asia/Ho_Chi_Minh';
