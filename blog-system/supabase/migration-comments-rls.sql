-- Enable RLS on comments table
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Anyone can view approved comments" ON comments;
DROP POLICY IF EXISTS "Users can insert their own comments" ON comments;
DROP POLICY IF EXISTS "Anonymous users can insert comments" ON comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON comments;
DROP POLICY IF EXISTS "Admins can update any comment" ON comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON comments;
DROP POLICY IF EXISTS "Admins can delete any comment" ON comments;

-- Policy 1: Anyone can view approved comments (public read)
CREATE POLICY "Anyone can view approved comments"
ON comments
FOR SELECT
USING (status = 'approved');

-- Policy 2: Authenticated users can insert comments with their user_id
CREATE POLICY "Authenticated users can insert comments"
ON comments
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy 3: Anonymous users can insert comments (without user_id)
CREATE POLICY "Anonymous users can insert comments"
ON comments
FOR INSERT
TO anon
WITH CHECK (
  user_id IS NULL 
  AND author_name IS NOT NULL 
  AND author_email IS NOT NULL
);

-- Policy 4: Users can update their own pending comments
CREATE POLICY "Users can update own comments"
ON comments
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id AND status = 'pending')
WITH CHECK (auth.uid() = user_id);

-- Policy 5: Admins and editors can view all comments
CREATE POLICY "Admins can view all comments"
ON comments
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'editor')
  )
);

-- Policy 6: Admins and editors can update any comment
CREATE POLICY "Admins can update any comment"
ON comments
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'editor')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'editor')
  )
);

-- Policy 7: Admins can delete any comment
CREATE POLICY "Admins can delete any comment"
ON comments
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Policy 8: Users can delete their own pending comments
CREATE POLICY "Users can delete own pending comments"
ON comments
FOR DELETE
TO authenticated
USING (auth.uid() = user_id AND status = 'pending');
