# Space Shooter Game

A polished p5.js space shooter game with custom-drawn sprites, vertical phone-like UI, and dynamic visual effects.

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