-- Fix foreign key constraint for prompts table
-- Run this in your Supabase SQL editor

-- First, drop the existing constraint
ALTER TABLE prompts DROP CONSTRAINT IF EXISTS fk_prompts_user;

-- Check if profiles table exists and what its ID column is called
-- If your profiles table uses 'id' column:
ALTER TABLE prompts 
ADD CONSTRAINT fk_prompts_user 
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Alternative: If you want to reference auth.users directly (not recommended but possible):
-- ALTER TABLE prompts 
-- ADD CONSTRAINT fk_prompts_user 
-- FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Also check if you have a profiles table set up correctly
-- If not, you might need to create it:
/*
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    username TEXT UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);
*/
