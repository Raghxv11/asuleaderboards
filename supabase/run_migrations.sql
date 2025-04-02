-- Run all migrations in sequence

-- Add image_urls column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS image_urls TEXT[] DEFAULT '{}';

-- Populate image_urls with existing image_url for each record (if image_url exists)
UPDATE profiles 
SET image_urls = ARRAY[image_url] 
WHERE image_url IS NOT NULL AND (image_urls IS NULL OR array_length(image_urls, 1) IS NULL);

-- Drop the existing function first
DROP FUNCTION IF EXISTS get_leaderboard();

-- Update leaderboard function to include image_urls
CREATE OR REPLACE FUNCTION get_leaderboard()
RETURNS TABLE (
  id TEXT,
  name TEXT,
  image_url TEXT,
  image_urls TEXT[],
  bio TEXT,
  swipe_right_percentage NUMERIC,
  total_votes BIGINT,
  rank BIGINT
) AS $$
BEGIN
  RETURN QUERY
  WITH swipe_stats AS (
    SELECT
      profile_id,
      COUNT(*) FILTER (WHERE is_right_swipe = TRUE) AS right_swipes,
      COUNT(*) AS total_swipes
    FROM swipes
    GROUP BY profile_id
  )
  SELECT
    p.id::TEXT,
    p.name,
    p.image_url::TEXT,
    COALESCE(p.image_urls, ARRAY[p.image_url])::TEXT[],
    COALESCE(p.bio, '')::TEXT,
    CASE
      WHEN ss.total_swipes > 0 THEN (ss.right_swipes::NUMERIC / ss.total_swipes::NUMERIC) * 100
      ELSE 0
    END AS swipe_right_percentage,
    COALESCE(ss.total_swipes, 0) AS total_votes,
    ROW_NUMBER() OVER (
      ORDER BY
        CASE WHEN ss.total_swipes > 0 THEN (ss.right_swipes::NUMERIC / ss.total_swipes::NUMERIC) ELSE 0 END DESC,
        ss.total_swipes DESC
    ) AS rank
  FROM profiles p
  LEFT JOIN swipe_stats ss ON p.id = ss.profile_id
  ORDER BY swipe_right_percentage DESC, total_votes DESC;
END;
$$ LANGUAGE plpgsql;

-- Drop the policies that depend on voter_id column
DROP POLICY IF EXISTS "Users can create their own swipes" ON swipes;
DROP POLICY IF EXISTS "select_swipe_policy" ON swipes;
DROP POLICY IF EXISTS "delete_swipe_policy" ON swipes;

-- Drop the foreign key constraint
ALTER TABLE IF EXISTS swipes DROP CONSTRAINT IF EXISTS swipes_voter_id_fkey;

-- Modify voter_id in swipes table to accept TEXT instead of UUID to support anonymous IDs
ALTER TABLE IF EXISTS swipes ALTER COLUMN voter_id TYPE TEXT;

-- Recreate the policies after column type change
CREATE POLICY "Users can create their own swipes" ON swipes
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);  -- Allow anyone to create swipes, both authenticated and anonymous users

CREATE POLICY "select_swipe_policy" ON swipes
  FOR SELECT
  TO authenticated, anon
  USING (true);  -- Allow anyone to view swipes, both authenticated and anonymous users

CREATE POLICY "delete_swipe_policy" ON swipes
  FOR DELETE
  TO authenticated, anon
  USING (true);  -- Allow anyone to delete swipes, both authenticated and anonymous users 