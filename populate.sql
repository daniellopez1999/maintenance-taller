-- Create ENUM for Roles
CREATE TYPE role AS ENUM ('admin', 'moderator', 'user');

-- Create users_entity
CREATE TABLE users_entity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role role DEFAULT 'user' NOT NULL,
    password VARCHAR(255) NOT NULL,  
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
