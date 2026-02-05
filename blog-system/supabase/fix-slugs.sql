-- Fix invalid slugs in posts table
-- This script will update posts with invalid slugs (empty, too short, or just numbers/hyphens)

-- Update posts with invalid slugs to use post-{id} format
UPDATE posts
SET slug = 'post-' || EXTRACT(EPOCH FROM created_at)::bigint
WHERE 
  slug IS NULL 
  OR slug = '' 
  OR LENGTH(slug) < 3
  OR slug ~ '^[-0-9]+$'  -- Only contains hyphens and numbers
  OR slug LIKE '-%';      -- Starts with hyphen

-- Show updated posts
SELECT id, title, slug, created_at
FROM posts
WHERE slug LIKE 'post-%'
ORDER BY created_at DESC;
