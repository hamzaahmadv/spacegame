# Space Shooter Game with Leaderboard

A complete p5.js space shooter game with custom-drawn sprites, vertical phone-like UI, and a global leaderboard powered by Supabase.

## Features

- Custom-drawn sprites and assets with enhanced visual effects
- Responsive player ship controls with both keyboard and touch support
- Vertical phone-like UI optimized for mobile devices
- Dynamic background and star colors that change with level progression
- Diverse enemy types with unique movement patterns
- Power-up system with multiple effects and visual feedback
- Animated parallax star background
- Progressive difficulty waves
- Complete game state management with smooth transitions
- Challenging one-life gameplay
- Bullet trail effects and pulsing animations
- Score tracking with high score system
- Performance optimization
- Visual feedback like screen shake on impacts
- Well-structured, thoroughly commented object-oriented code
- Global leaderboard to track high scores

## Setup Instructions

### 1. Setting up Supabase for the Leaderboard

1. **Create a Supabase Account**:
   - Go to [Supabase](https://supabase.com/) and sign up for a free account
   - Create a new project

2. **Create the Leaderboard Table**:
   - In your Supabase dashboard, go to the SQL Editor
   - Run the following SQL to create the leaderboard table:

   ```sql
   CREATE TABLE leaderboard (
     id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
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
     ON leaderboard FOR SELECT USING (true);

   -- Create a policy that allows anyone to insert into the leaderboard
   CREATE POLICY "Anyone can insert into leaderboard" 
     ON leaderboard FOR INSERT WITH CHECK (true);
   ```

3. **Get Your API Keys**:
   - In your Supabase dashboard, go to Project Settings > API
   - Copy the "URL" and "anon/public" key
   - Update the `SUPABASE_URL` and `SUPABASE_KEY` variables in the `leaderboard.js` file

### 2. Running the Game

1. **Local Development**:
   - Clone this repository
   - Open `index.html` in your browser to play the game
   - For best results, use a modern browser like Chrome, Firefox, or Edge

2. **Hosting the Game**:
   - You can host this game on any static web hosting service like GitHub Pages, Netlify, or Vercel
   - No server-side code is required as all backend functionality is handled by Supabase

## Game Controls

### Desktop:
- **Arrow Keys** or **WASD**: Move the ship
- **Space**: Shoot
- **Enter**: Start game / Skip cutscenes

### Mobile:
- **Tap left side**: Move left
- **Tap right side**: Move right
- **Tap center**: Shoot

## Troubleshooting

If you encounter issues with the leaderboard functionality:

1. **Check Browser Console**: Open your browser's developer tools (F12) and check for any errors in the console
2. **Verify Supabase Connection**: Make sure your Supabase URL and API key are correct
3. **Check Table Structure**: Ensure your leaderboard table has the correct structure as defined in the setup instructions
4. **CORS Issues**: If you're hosting the game, make sure your Supabase project allows requests from your domain

## Credits

- Game developed using [p5.js](https://p5js.org/)
- Backend powered by [Supabase](https://supabase.com/)
- All game assets and artwork created programmatically within the game

## How to Play

### Desktop Controls
- **WASD** or **Arrow Keys**: Move the player ship
- **Space**: Shoot
- **Enter**: Start game / Restart after game over

### Mobile Controls
- **Tap Left Side**: Move left
- **Tap Right Side**: Move right
- **Tap Center**: Shoot
- **Tap Screen**: Start game / Restart after game over

### Gameplay
1. You have only ONE life - be careful!
2. Destroy enemy ships to earn points
3. Collect power-ups for special abilities:
   - **Yellow Star**: Rapid Fire - Increases your firing rate
   - **Blue Circle**: Shield - Protects you from one hit
   - **Purple Square**: Multi Shot - Fires three bullets at once
4. Survive as long as possible and aim for a high score
5. The game gets progressively harder as your score increases
6. The background and stars change color as you advance through levels

## Visual Effects

- Dynamic star colors that change with each level
- Changing background colors for different level themes
- Enhanced bullet trails and pulsing effects
- Engine glow and thruster animations
- Shield particle effects
- Smooth game over transitions
- Screen shake on impacts

## Running the Game

### Option 1: Run Locally
1. Clone or download this repository
2. Open the `index.html` file in a modern web browser

### Option 2: Run in p5.js Web Editor
1. Go to the [p5.js Web Editor](https://editor.p5js.org/)
2. Create a new project
3. Copy the contents of each file into the corresponding files in the editor
4. Click the "Play" button to run the game

## Mobile Optimization

This game has been optimized for mobile devices with:
- Vertical phone-like UI with 9:16 aspect ratio
- Touch controls for movement and shooting
- Responsive design that scales based on screen size
- Mobile-friendly meta tags to prevent unwanted browser behaviors
- Performance optimizations for smoother gameplay on mobile devices

## Code Structure

- `sketch.js`: Main game loop and state management
- `player.js`: Player ship controls and rendering
- `enemy.js`: Enemy types with different behaviors
- `bullet.js`: Projectile mechanics and visual effects
- `powerup.js`: Power-up types and effects
- `star.js`: Parallax background effect with dynamic colors

## Credits

Created with [p5.js](https://p5js.org/) - a JavaScript library for creative coding.

All game assets are drawn programmatically using p5.js drawing functions. 