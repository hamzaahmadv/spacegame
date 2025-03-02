# Space Shooter Game

A polished p5.js space shooter game with custom-drawn sprites and vertical phone-like UI.

## Features

- Custom-drawn sprites and assets (no external imports)
- Responsive player ship controls with both keyboard and touch support
- Vertical phone-like UI optimized for mobile devices
- Diverse enemy types with unique movement patterns
- Power-up system with multiple effects
- Animated parallax star background
- Progressive difficulty waves
- Complete game state management (start/play/game over screens)
- Collision detection
- Score tracking with UI elements
- Performance optimization
- Visual feedback like screen shake on impacts
- Well-structured, thoroughly commented object-oriented code

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
1. Destroy enemy ships to earn points
2. Collect power-ups for special abilities:
   - **Yellow Star**: Rapid Fire - Increases your firing rate
   - **Blue Circle**: Shield - Protects you from one hit
   - **Purple Square**: Multi Shot - Fires three bullets at once
3. Survive as long as possible and aim for a high score
4. The game gets progressively harder as your score increases

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
- `bullet.js`: Projectile mechanics
- `powerup.js`: Power-up types and effects
- `star.js`: Parallax background effect

## Credits

Created with [p5.js](https://p5js.org/) - a JavaScript library for creative coding.

All game assets are drawn programmatically using p5.js drawing functions. 