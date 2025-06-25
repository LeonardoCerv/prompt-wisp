-- =====================================================
-- Supabase Storage Setup for Image Uploads
-- Run this script in Supabase SQL Editor or Dashboard
-- =====================================================

-- Create storage bucket for images (if not exists)
-- Note: This needs to be run in Supabase Dashboard -> Storage -> Create Bucket
-- Bucket name: 'images'
-- Public: true
-- File size limit: 5MB
-- Allowed mime types: image/jpeg, image/png, image/gif, image/webp

-- Create RLS policies for the images bucket
-- These policies need to be set in Supabase Dashboard -> Storage -> images bucket -> Policies

-- Policy 1: Allow authenticated users to upload
-- Name: "Authenticated users can upload images"
-- Operation: INSERT
-- Target roles: authenticated
-- Policy definition: 
-- (bucket_id = 'images' AND auth.role() = 'authenticated')

-- Policy 2: Allow public read access
-- Name: "Public can view images"
-- Operation: SELECT
-- Target roles: public
-- Policy definition: 
-- (bucket_id = 'images')

-- Policy 3: Allow users to delete their own uploads (optional)
-- Name: "Users can delete their own images"
-- Operation: DELETE
-- Target roles: authenticated
-- Policy definition: 
-- (bucket_id = 'images' AND auth.role() = 'authenticated')
