# Space Shooter Game - Leaderboard Setup

This document provides instructions for setting up the Supabase backend for the Space Shooter game leaderboard system.

## Supabase Setup

1. **Create a Supabase Account**
   - Go to [Supabase](https://supabase.com/) and sign up for an account if you don't have one
   - Create a new project

2. **Get Your Project Credentials**
   - After creating a project, go to Project Settings > API
   - Copy the "Project URL" and "anon/public" key
   - You'll need these to update the `leaderboard.js` file

3. **Create the Leaderboard Table**
   - In your Supabase project, go to the SQL Editor
   - Run the following SQL to create the leaderboard table:

```sql
CREATE TABLE leaderboard (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  score INTEGER NOT NULL,
  level INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index for faster sorting by score
CREATE INDEX idx_leaderboard_score ON leaderboard(score DESC);

-- Set up Row Level Security (RLS)
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows anyone to read the leaderboard
CREATE POLICY "Anyone can read leaderboard" 
  ON leaderboard 
  FOR SELECT 
  USING (true);

-- Create a policy that allows anyone to insert into the leaderboard
CREATE POLICY "Anyone can insert into leaderboard" 
  ON leaderboard 
  FOR INSERT 
  WITH CHECK (true);
```

4. **Update the Leaderboard.js File**
   - Open the `leaderboard.js` file in your game project
   - Replace the placeholder values with your actual Supabase credentials:

```javascript
// Replace these with your actual Supabase project URL and anon key
const SUPABASE_URL = 'https://your-supabase-project-url.supabase.co';
const SUPABASE_KEY = 'your-supabase-anon-key';
```

5. **Test the Leaderboard**
   - Play the game and submit a score to test if the leaderboard is working
   - Check your Supabase table to verify that the score was recorded

## Security Considerations

- The current setup allows anyone to submit scores without authentication
- For a production game, you might want to add additional security measures:
  - Add user authentication
  - Add server-side validation of scores
  - Implement rate limiting to prevent spam

## Troubleshooting

If you encounter issues with the leaderboard:

1. Check the browser console for error messages
2. Verify that your Supabase credentials are correct
3. Make sure the leaderboard table is created with the correct structure
4. Check that Row Level Security policies are properly configured

## Additional Customization

You can customize the leaderboard by:

- Adding additional fields to the leaderboard table (e.g., player name, date)
- Modifying the UI in the `drawLeaderboard` function in `leaderboard.js`
- Adding filters or sorting options to the leaderboard display
- Implementing different leaderboards for different game modes or time periods 