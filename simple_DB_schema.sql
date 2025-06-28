-- =====================================================
-- Prompt Wisp Database Schema
-- Run this script in Supabase SQL Editor
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. USERS TABLE
-- =====================================================
CREATE TYPE user_role AS ENUM ('owner', 'buyer', 'collaborator');

CREATE TABLE IF NOT EXISTS users_prompts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    prompt_id UUID NOT NULL,
    favorite BOOLEAN NOT NULL DEFAULT FALSE,
    user_role user_role NOT NULL DEFAULT 'collaborator'
);

CREATE TABLE IF NOT EXISTS users_collections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    collection_id UUID NOT NULL,
    favorite BOOLEAN NOT NULL DEFAULT FALSE,
    user_role user_role NOT NULL DEFAULT 'collaborator'
);

-- =====================================================
-- 5. COLLECTIONS TABLE
-- =====================================================
CREATE TYPE visibility_type AS ENUM ('public', 'private', 'unlisted');

CREATE TABLE IF NOT EXISTS collections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    images TEXT[] DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    visibility visibility_type NOT NULL DEFAULT 'private',
    deleted BOOLEAN NOT NULL DEFAULT FALSE
);

-- =====================================================
-- 6. PROMPTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS prompts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    description TEXT,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    images TEXT[] DEFAULT '{}',
    visibility visibility_type NOT NULL DEFAULT 'private',
    deleted BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS collection_prompts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    collection_id UUID NOT NULL,
    prompt_id UUID NOT NULL
);

-- =====================================================
-- FOREIGN KEY CONSTRAINTS
-- =====================================================
-- users_prompts foreign keys
ALTER TABLE users_prompts 
ADD CONSTRAINT fk_users_prompts_user 
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE users_prompts 
ADD CONSTRAINT fk_users_prompts_prompt
FOREIGN KEY (prompt_id) REFERENCES prompts(id) ON DELETE CASCADE;

-- users_collections foreign keys
ALTER TABLE users_collections
ADD CONSTRAINT fk_users_collections_user 
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE users_collections
ADD CONSTRAINT fk_users_collections_collection
FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE CASCADE;

-- collection_prompts foreign keys
ALTER TABLE collection_prompts
ADD CONSTRAINT fk_collection_prompts_collection
FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE CASCADE;

ALTER TABLE collection_prompts
ADD CONSTRAINT fk_collection_prompts_prompt
FOREIGN KEY (prompt_id) REFERENCES prompts(id) ON DELETE CASCADE;

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_users_prompts_user_id ON users_prompts(user_id);
CREATE INDEX IF NOT EXISTS idx_users_prompts_prompt_id ON users_prompts(prompt_id);
CREATE INDEX IF NOT EXISTS idx_users_collections_user_id ON users_collections(user_id);
CREATE INDEX IF NOT EXISTS idx_users_collections_collection_id ON users_collections(collection_id);
CREATE INDEX IF NOT EXISTS idx_collections_visibility ON collections(visibility);
CREATE INDEX IF NOT EXISTS idx_collections_deleted ON collections(deleted);
CREATE INDEX IF NOT EXISTS idx_collections_created_at ON collections(created_at);
CREATE INDEX IF NOT EXISTS idx_collections_tags ON collections USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_prompts_visibility ON prompts(visibility);
CREATE INDEX IF NOT EXISTS idx_prompts_deleted ON prompts(deleted);
CREATE INDEX IF NOT EXISTS idx_prompts_created_at ON prompts(created_at);
CREATE INDEX IF NOT EXISTS idx_prompts_tags ON prompts USING GIN(tags);

-- =====================================================
-- FULL-TEXT SEARCH INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_prompts_fts ON prompts USING GIN(
    to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, '') || ' ' || coalesce(content, ''))
);
CREATE INDEX IF NOT EXISTS idx_collections_fts ON collections USING GIN(
    to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, ''))
);

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_collections_updated_at BEFORE UPDATE ON collections
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prompts_updated_at BEFORE UPDATE ON prompts
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE users_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE users_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_prompts ENABLE ROW LEVEL SECURITY;

-- Collections policies
CREATE POLICY "Users can view public collections" ON collections
FOR SELECT USING (visibility = 'public' AND deleted = false);

-- Prompts policies
CREATE POLICY "Users can view public prompts" ON prompts
FOR SELECT USING (visibility = 'public' AND deleted = false);

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE 'Database schema created successfully!';
    RAISE NOTICE 'Tables created: users_prompts, users_collections, collections, prompts, collection_prompts';
    RAISE NOTICE 'All foreign keys, indexes, and RLS policies have been applied.';
END $$;
