-- Add author_name and author_email fields to comments table
-- This allows anonymous users to comment without creating an account

ALTER TABLE comments 
ADD COLUMN IF NOT EXISTS author_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS author_email VARCHAR(255);

-- Add comment to explain the fields
COMMENT ON COLUMN comments.author_name IS 'Name of the comment author (for anonymous users)';
COMMENT ON COLUMN comments.author_email IS 'Email of the comment author (for anonymous users)';

-- Update existing comments to use profile username if author_name is null
UPDATE comments 
SET author_name = profiles.username
FROM profiles
WHERE comments.user_id = profiles.id 
AND comments.author_name IS NULL;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_comments_status ON comments(status);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);
