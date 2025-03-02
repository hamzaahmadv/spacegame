# Space Shooter Game - Leaderboard Setup

This document provides comprehensive instructions for setting up the Supabase backend for the Space Shooter game leaderboard system.

## 1. Create a Supabase Account

1. Go to [Supabase](https://supabase.com/) and sign up for a free account
2. Create a new project with a name of your choice (e.g., "Space Shooter Game")
3. Wait for your database to be provisioned (this may take a few minutes)

## 2. Get Your Project Credentials

1. In your Supabase dashboard, go to Project Settings > API
2. Copy the "Project URL" and "anon/public" key
3. You'll need these to update the `leaderboard.js` file

## 3. Create the Leaderboard Table

### Option 1: Using the Table Editor (Recommended for beginners)

1. In your Supabase dashboard, go to the "Table Editor" section
2. Click "Create a new table"
3. Set the table name to `leaderboard`
4. Add the following columns:
   - `id` (type: uuid, primary key, default: `uuid_generate_v4()`)
   - `email` (type: text, not null)
   - `score` (type: integer, not null)
   - `level` (type: integer, not null, default: 1)
   - `created_at` (type: timestamp with time zone, not null, default: `now()`)
5. Click "Save" to create the table

### Option 2: Using SQL Editor

1. In your Supabase dashboard, go to the "SQL Editor" section
2. Create a new query and paste the following SQL:

```sql
CREATE TABLE leaderboard (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  score INTEGER NOT NULL,
  level INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index for faster sorting by score
CREATE INDEX idx_leaderboard_score ON leaderboard(score DESC);
```

3. Run the query to create the table

## 4. Set Up Row-Level Security (RLS)

1. Go to the "Authentication" section in your Supabase dashboard
2. Click on "Policies" and select the `leaderboard` table
3. Enable Row Level Security (RLS) by toggling the switch
4. Add the following policies:

### Read Policy (for viewing the leaderboard)

1. Click "Add Policy"
2. Select "Create a policy from scratch"
3. Policy name: `Anyone can read leaderboard`
4. For operation: SELECT
5. Policy definition: `true` (allows anyone to read the leaderboard)
6. Click "Save Policy"

### Insert Policy (for submitting scores)

1. Click "Add Policy"
2. Select "Create a policy from scratch"
3. Policy name: `Anyone can insert into leaderboard`
4. For operation: INSERT
5. Policy definition: `true` (allows anyone to submit scores)
6. Click "Save Policy"

## 5. Create a Stored Procedure (Optional but Recommended)

This procedure will allow the game to create the leaderboard table if it doesn't exist:

1. Go to the "SQL Editor" section in your Supabase dashboard
2. Create a new query and paste the following SQL:

```sql
-- Create a stored procedure to create the table if it doesn't exist
CREATE OR REPLACE FUNCTION create_leaderboard_table_if_not_exists()
RETURNS void AS $$
BEGIN
  -- Check if the table exists
  IF NOT EXISTS (
    SELECT FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'leaderboard'
  ) THEN
    -- Create the table
    CREATE TABLE public.leaderboard (
      id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
      email text NOT NULL,
      score integer NOT NULL,
      level integer NOT NULL DEFAULT 1,
      created_at timestamp with time zone NOT NULL DEFAULT now()
    );
    
    -- Create the index
    CREATE INDEX idx_leaderboard_score ON leaderboard(score DESC);
    
    -- Enable RLS
    ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;
    
    -- Create the read policy
    CREATE POLICY "Anyone can read leaderboard" 
      ON public.leaderboard 
      FOR SELECT 
      USING (true);
    
    -- Create the insert policy
    CREATE POLICY "Anyone can insert into leaderboard" 
      ON public.leaderboard 
      FOR INSERT 
      WITH CHECK (true);
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

3. Run the query to create the stored procedure

## 6. Update the Game Configuration

1. Open the `leaderboard.js` file in your game code
2. Update the Supabase configuration with your project URL and anon key:

```javascript
// Replace these with your actual Supabase project URL and anon key
const SUPABASE_URL = 'https://your-project-id.supabase.co';
const SUPABASE_KEY = 'your-anon-key';
```

## 7. Test the Leaderboard

1. Play the game and submit a score when you lose
2. Check the Supabase dashboard to verify that the score was recorded in the `leaderboard` table
3. View the leaderboard in the game to see your score

## Troubleshooting

If you encounter issues with the leaderboard:

1. Check the browser console for error messages (F12 in most browsers)
2. Verify that your Supabase URL and key are correct
3. Make sure the `leaderboard` table exists and has the correct structure
4. Check that Row Level Security (RLS) is properly configured
5. Try clearing your browser cache and reloading the game
6. Look for errors in the Network tab of your browser's developer tools

### Common Issues and Solutions

- **CORS errors**: Make sure your Supabase project allows requests from your game's domain
- **RLS errors**: Verify that your RLS policies are correctly set up
- **Connection errors**: Check your internet connection and Supabase service status
- **Table not found**: Ensure the table name is exactly `leaderboard` (case-sensitive)

## Advanced Configuration

For additional security and features:

### Prevent Duplicate Submissions

```sql
-- Add a unique constraint to prevent multiple submissions with the same email
ALTER TABLE leaderboard ADD CONSTRAINT unique_email UNIQUE (email);
```

### Show Only Top Scores Per Player

```sql
-- Create a view to show only the top score per email
CREATE VIEW top_scores AS
SELECT DISTINCT ON (email) *
FROM leaderboard
ORDER BY email, score DESC;
```

### Add Rate Limiting

Consider implementing rate limiting to prevent spam submissions. This would require additional server-side logic.

## Data Privacy Considerations

The game masks email addresses on the leaderboard for privacy. If you're deploying this game publicly, consider:

1. Adding a privacy policy explaining how email addresses are used
2. Implementing a proper authentication system
3. Allowing users to delete their scores and data
4. Regularly purging old data to comply with data protection regulations

## Further Customization

You can customize the leaderboard by:

- Adding additional fields to the leaderboard table (e.g., player name, avatar)
- Modifying the UI in the `drawLeaderboard` function in `leaderboard.js`
- Adding filters or sorting options to the leaderboard display
- Implementing different leaderboards for different game modes or time periods 