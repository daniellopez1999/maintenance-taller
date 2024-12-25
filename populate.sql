-- Create ENUM for Roles
CREATE TYPE role AS ENUM ('admin', 'moderator', 'user');

-- Create users_entity
CREATE TABLE users (
  user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
    role role DEFAULT 'user' NOT NULL,
  password VARCHAR(255),
  status VARCHAR(20) CHECK (status IN ('REGISTERING', 'REGISTERED', 'DISABLED')) DEFAULT 'REGISTERING',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_users_email ON users(email);
