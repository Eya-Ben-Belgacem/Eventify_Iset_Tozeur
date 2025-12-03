-- Supabase RLS Policies for Storage (Simple Version)
-- Run these queries in your Supabase SQL Editor

-- ========================================
-- BUCKET: event-images - ALLOW PUBLIC UPLOADS
-- ========================================

-- Drop existing policies
DROP POLICY IF EXISTS "Allow authenticated event image uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read event images" ON storage.objects;
DROP POLICY IF EXISTS "Allow delete own event images" ON storage.objects;

-- Policy: Allow ANYONE to upload event images (PUBLIC)
CREATE POLICY "Allow public event image uploads"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'event-images');

-- Policy: Allow ANYONE to read event images (PUBLIC)
CREATE POLICY "Allow public read event images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'event-images');

-- Policy: Allow ANYONE to delete event images (for cleanup)
CREATE POLICY "Allow public delete event images"
ON storage.objects
FOR DELETE
USING (bucket_id = 'event-images');

-- ========================================
-- BUCKET: profiles - ALLOW PUBLIC UPLOADS
-- ========================================

-- Drop existing policies
DROP POLICY IF EXISTS "Allow authenticated profile image uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read profile images" ON storage.objects;
DROP POLICY IF EXISTS "Allow delete own profile images" ON storage.objects;

-- Policy: Allow ANYONE to upload profile images (PUBLIC)
CREATE POLICY "Allow public profile image uploads"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'profiles');

-- Policy: Allow ANYONE to read profile images (PUBLIC)
CREATE POLICY "Allow public read profile images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'profiles');

-- Policy: Allow ANYONE to delete profile images (for cleanup)
CREATE POLICY "Allow public delete profile images"
ON storage.objects
FOR DELETE
USING (bucket_id = 'profiles');

-- ========================================
-- If the above fails due to permissions, 
-- you can also just DISABLE RLS entirely:
-- ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;
-- ========================================
