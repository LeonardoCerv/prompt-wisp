-- =====================================================
-- Prompt Wisp Database Schema
-- Run this script in Supabase SQL Editor
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. USERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    profile_picture TEXT,
    bio TEXT,
    collections TEXT[] DEFAULT '{}',
    prompts TEXT[] DEFAULT '{}',
    bought TEXT[] DEFAULT '{}',
    favorites TEXT[] DEFAULT '{}',
    payment_info_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. ORGANIZATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    about TEXT,
    cover_image TEXT,
    user_id UUID NOT NULL,
    organization_memberships TEXT[] DEFAULT '{}',
    prompts TEXT[] DEFAULT '{}',
    collections TEXT[] DEFAULT '{}',
    marketplace_listings TEXT[] DEFAULT '{}',
    payment_info_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. MEMBERSHIPS TABLE
-- =====================================================
CREATE TYPE membership_role AS ENUM ('owner', 'admin', 'member', 'viewer');

CREATE TABLE IF NOT EXISTS memberships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    organization_id UUID NOT NULL,
    role membership_role NOT NULL DEFAULT 'member',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    permissions TEXT[] DEFAULT '{}'
);

-- =====================================================
-- 4. PAYMENTS TABLE
-- =====================================================
CREATE TYPE payment_status AS ENUM ('active', 'canceled', 'trial', 'failed');
CREATE TYPE billing_cycle AS ENUM ('monthly', 'yearly');

CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL,
    plan TEXT NOT NULL,
    status payment_status NOT NULL DEFAULT 'trial',
    payment_method TEXT NOT NULL,
    billing_cycle billing_cycle NOT NULL DEFAULT 'monthly',
    last_payment_date TIMESTAMP WITH TIME ZONE,
    next_billing_date TIMESTAMP WITH TIME ZONE,
    revenue DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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
    prompts TEXT[] DEFAULT '{}',
    user_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    collaborators TEXT[] DEFAULT '{}',
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
    user_id UUID NOT NULL,
    images TEXT[] DEFAULT '{}',
    collaborators TEXT[] DEFAULT '{}',
    visibility visibility_type NOT NULL DEFAULT 'private',
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    collections TEXT[] DEFAULT '{}'
);

-- =====================================================
-- 7. MARKETPLACE TABLE
-- =====================================================
CREATE TYPE marketplace_status AS ENUM ('active', 'inactive', 'pending', 'rejected');

CREATE TABLE IF NOT EXISTS marketplace (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_id UUID NOT NULL,
    author_id UUID NOT NULL,
    about TEXT,
    comments TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    buyers TEXT[] DEFAULT '{}',
    status marketplace_status NOT NULL DEFAULT 'pending'
);

-- =====================================================
-- 8. COMMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    marketplace_id UUID NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5)
);

-- =====================================================
-- FOREIGN KEY CONSTRAINTS
-- =====================================================

-- Users table foreign keys
ALTER TABLE users 
ADD CONSTRAINT fk_users_payment_info 
FOREIGN KEY (payment_info_id) REFERENCES payments(id) ON DELETE SET NULL;

-- Organizations table foreign keys
ALTER TABLE organizations 
ADD CONSTRAINT fk_organizations_user 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE organizations 
ADD CONSTRAINT fk_organizations_payment_info 
FOREIGN KEY (payment_info_id) REFERENCES payments(id) ON DELETE SET NULL;

-- Memberships table foreign keys
ALTER TABLE memberships 
ADD CONSTRAINT fk_memberships_user 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE memberships 
ADD CONSTRAINT fk_memberships_organization 
FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE;

-- Collections table foreign keys
ALTER TABLE collections 
ADD CONSTRAINT fk_collections_user 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Prompts table foreign keys
ALTER TABLE prompts 
ADD CONSTRAINT fk_prompts_user 
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Comments table foreign keys
ALTER TABLE comments 
ADD CONSTRAINT fk_comments_user 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE comments 
ADD CONSTRAINT fk_comments_marketplace 
FOREIGN KEY (marketplace_id) REFERENCES marketplace(id) ON DELETE CASCADE;

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- Organizations indexes
CREATE INDEX IF NOT EXISTS idx_organizations_user_id ON organizations(user_id);
CREATE INDEX IF NOT EXISTS idx_organizations_name ON organizations(name);
CREATE INDEX IF NOT EXISTS idx_organizations_created_at ON organizations(created_at);

-- Memberships indexes
CREATE INDEX IF NOT EXISTS idx_memberships_user_id ON memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_memberships_organization_id ON memberships(organization_id);
CREATE INDEX IF NOT EXISTS idx_memberships_role ON memberships(role);
CREATE UNIQUE INDEX IF NOT EXISTS idx_memberships_user_org_unique ON memberships(user_id, organization_id);

-- Payments indexes
CREATE INDEX IF NOT EXISTS idx_payments_owner_id ON payments(owner_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_next_billing_date ON payments(next_billing_date);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);

-- Collections indexes
CREATE INDEX IF NOT EXISTS idx_collections_user_id ON collections(user_id);
CREATE INDEX IF NOT EXISTS idx_collections_visibility ON collections(visibility);
CREATE INDEX IF NOT EXISTS idx_collections_deleted ON collections(deleted);
CREATE INDEX IF NOT EXISTS idx_collections_created_at ON collections(created_at);
CREATE INDEX IF NOT EXISTS idx_collections_tags ON collections USING GIN(tags);

-- Prompts indexes
CREATE INDEX IF NOT EXISTS idx_prompts_user_id ON prompts(user_id);
CREATE INDEX IF NOT EXISTS idx_prompts_visibility ON prompts(visibility);
CREATE INDEX IF NOT EXISTS idx_prompts_deleted ON prompts(deleted);
CREATE INDEX IF NOT EXISTS idx_prompts_created_at ON prompts(created_at);
CREATE INDEX IF NOT EXISTS idx_prompts_tags ON prompts USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_prompts_collaborators ON prompts USING GIN(collaborators);
CREATE INDEX IF NOT EXISTS idx_prompts_collections ON prompts USING GIN(collections);

-- Marketplace indexes
CREATE INDEX IF NOT EXISTS idx_marketplace_content_id ON marketplace(content_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_author_id ON marketplace(author_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_status ON marketplace(status);
CREATE INDEX IF NOT EXISTS idx_marketplace_price ON marketplace(price);
CREATE INDEX IF NOT EXISTS idx_marketplace_created_at ON marketplace(created_at);

-- Comments indexes
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_marketplace_id ON comments(marketplace_id);
CREATE INDEX IF NOT EXISTS idx_comments_rating ON comments(rating);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at);

-- =====================================================
-- FULL-TEXT SEARCH INDEXES
-- =====================================================

-- Full-text search for prompts
CREATE INDEX IF NOT EXISTS idx_prompts_fts ON prompts USING GIN(
    to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, '') || ' ' || coalesce(content, ''))
);

-- Full-text search for collections
CREATE INDEX IF NOT EXISTS idx_collections_fts ON collections USING GIN(
    to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, ''))
);

-- Full-text search for marketplace
CREATE INDEX IF NOT EXISTS idx_marketplace_fts ON marketplace USING GIN(
    to_tsvector('english', coalesce(about, ''))
);

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to tables with updated_at column
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_collections_updated_at BEFORE UPDATE ON collections
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prompts_updated_at BEFORE UPDATE ON prompts
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_marketplace_updated_at BEFORE UPDATE ON marketplace
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile" ON users
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
FOR UPDATE USING (auth.uid() = id);

-- Collections policies
CREATE POLICY "Users can view public collections" ON collections
FOR SELECT USING (visibility = 'public' AND deleted = false);

CREATE POLICY "Users can view their own collections" ON collections
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view collections they collaborate on" ON collections
FOR SELECT USING (auth.uid()::text = ANY(collaborators));

CREATE POLICY "Users can manage their own collections" ON collections
FOR ALL USING (auth.uid() = user_id);

-- Prompts policies (CRUD)
-- Allow public viewing of public prompts
CREATE POLICY "Public prompts are viewable by everyone" ON prompts
FOR SELECT USING (visibility = 'public' AND deleted = false);

-- Allow authenticated users to view their own prompts (via users_prompts)
CREATE POLICY "Users can view their own prompts" ON prompts
FOR SELECT TO authenticated USING (
  auth.uid() IN (
    SELECT user_id FROM users_prompts WHERE prompt_id = id
  )
);

-- Allow authenticated users to create prompts
CREATE POLICY "Allow authenticated users to create prompts" ON prompts
FOR INSERT TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to create prompts" ON users_prompts
FOR INSERT TO authenticated
WITH CHECK (true);

-- Allow owners to update their prompts
CREATE POLICY "Users can update their own prompts" ON prompts
FOR UPDATE TO authenticated USING (
  auth.uid() IN (
    SELECT user_id FROM users_prompts WHERE prompt_id = id AND user_role = 'owner'
  )
);

-- Allow owners to delete their prompts
CREATE POLICY "Users can delete their own prompts" ON prompts
FOR DELETE TO authenticated USING (
  auth.uid() IN (
    SELECT user_id FROM users_prompts WHERE prompt_id = id AND user_role = 'owner'
  )
);

-- Optionally, allow collaborators to update prompts
CREATE POLICY "Collaborators can update prompts" ON prompts
FOR UPDATE TO authenticated USING (
  auth.uid() IN (
    SELECT user_id FROM users_prompts WHERE prompt_id = id AND user_role = 'collaborator'
  )
);

-- Optionally, allow collaborators to view prompts
CREATE POLICY "Collaborators can view prompts" ON prompts
FOR SELECT TO authenticated USING (
  auth.uid() IN (
    SELECT user_id FROM users_prompts WHERE prompt_id = id AND user_role = 'collaborator'
  )
);

-- Marketplace policies
CREATE POLICY "Users can view active marketplace items" ON marketplace
FOR SELECT USING (status = 'active');

CREATE POLICY "Users can manage their own marketplace items" ON marketplace
FOR ALL USING (auth.uid() = author_id);

-- Comments policies
CREATE POLICY "Users can view all comments" ON comments
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can create comments" ON comments
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" ON comments
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" ON comments
FOR DELETE USING (auth.uid() = user_id);

-- Organizations policies
CREATE POLICY "Users can view all organizations" ON organizations
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can manage their own organizations" ON organizations
FOR ALL USING (auth.uid() = user_id);

-- Memberships policies
CREATE POLICY "Users can view memberships of organizations they belong to" ON memberships
FOR SELECT USING (
    auth.uid() = user_id OR 
    organization_id IN (
        SELECT organization_id FROM memberships WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Organization owners can manage memberships" ON memberships
FOR ALL USING (
    organization_id IN (
        SELECT id FROM organizations WHERE user_id = auth.uid()
    )
);

-- Payments policies
CREATE POLICY "Users can view their own payment info" ON payments
FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Users can manage their own payment info" ON payments
FOR ALL USING (auth.uid() = owner_id);

-- =====================================================
-- SAMPLE DATA (OPTIONAL - REMOVE IF NOT NEEDED)
-- =====================================================

-- Insert sample user (you can remove this)
-- INSERT INTO users (name, username, email, bio) VALUES 
-- ('John Doe', 'johndoe', 'john@example.com', 'Sample user for testing');

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE 'Database schema created successfully!';
    RAISE NOTICE 'Tables created: users, organizations, memberships, payments, collections, prompts, marketplace, comments';
    RAISE NOTICE 'All foreign keys, indexes, and RLS policies have been applied.';
END $$;
