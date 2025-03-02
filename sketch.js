// Space Shooter Game
// A complete p5.js space shooter with custom-drawn sprites and vertical phone-like UI

// Game state constants
const GAME_START = 0;
const GAME_PLAYING = 1;
const GAME_OVER = 2;

// Game variables
let gameState;
let score;
let highScore = 0;
let level;
let lives;
let gameTime;
let screenShake = 0;

// Game objects
let player;
let bullets = [];
let enemies = [];
let stars = [];
let powerUps = [];

// Game settings
const PLAYER_SIZE = 30;
const BULLET_SPEED = 10;
const ENEMY_SPAWN_RATE = 0.02; // Chance per frame
const POWERUP_SPAWN_RATE = 0.001; // Chance per frame
const MAX_ENEMIES = 15;

// UI settings
let gameWidth, gameHeight;
let uiHeight;
let uiPadding = 10;
let touchZoneSize;

// Touch controls
let leftTouchZone = false;
let rightTouchZone = false;
let shootTouchZone = false;

// Preload any assets (none needed as we're drawing everything)
function preload() {
  // No external assets to preload
}

// Setup function - called once at the beginning
function setup() {
  // Create canvas with a phone-like aspect ratio
  setupPhoneLayout();
  
  colorMode(RGB, 255);
  textAlign(CENTER, CENTER);
  resetGame();
  
  // Create stars for parallax background
  for (let i = 0; i < 200; i++) {
    stars.push(new Star());
  }
}

// Set up the phone-like layout
function setupPhoneLayout() {
  // Calculate dimensions for a phone-like aspect ratio (9:16)
  if (windowWidth / windowHeight > 9/16) {
    // Window is wider than 9:16
    gameHeight = windowHeight;
    gameWidth = windowHeight * 9/16;
  } else {
    // Window is narrower than 9:16
    gameWidth = windowWidth;
    gameHeight = windowWidth * 16/9;
  }
  
  // Create canvas
  createCanvas(gameWidth, gameHeight);
  
  // Set UI dimensions
  uiHeight = gameHeight * 0.1; // 10% of height for UI
  touchZoneSize = gameWidth / 3; // Divide screen into thirds for touch controls
}

// Reset game to initial state
function resetGame() {
  gameState = GAME_START;
  score = 0;
  level = 1;
  lives = 3;
  gameTime = 0;
  
  // Clear all game objects
  player = new Player();
  bullets = [];
  enemies = [];
  powerUps = [];
}

// Draw function - called every frame
function draw() {
  // Apply screen shake effect
  if (screenShake > 0) {
    translate(random(-screenShake, screenShake), random(-screenShake, screenShake));
    screenShake *= 0.9;
    if (screenShake < 0.5) screenShake = 0;
  }
  
  // Draw background
  background(10, 10, 30);
  
  // Update and draw stars (always visible in all game states)
  updateStars();
  
  // Handle different game states
  switch (gameState) {
    case GAME_START:
      drawStartScreen();
      break;
    case GAME_PLAYING:
      updateGame();
      drawGame();
      break;
    case GAME_OVER:
      drawGameOverScreen();
      break;
  }
}

// Update all stars for parallax background
function updateStars() {
  for (let star of stars) {
    star.update();
    star.display();
  }
}

// Update game logic
function updateGame() {
  gameTime++;
  
  // Update player
  player.update();
  
  // Update bullets
  for (let i = bullets.length - 1; i >= 0; i--) {
    bullets[i].update();
    
    // Remove bullets that are off-screen
    if (bullets[i].isOffScreen()) {
      bullets.splice(i, 1);
      continue;
    }
    
    // Check for collisions with enemies
    for (let j = enemies.length - 1; j >= 0; j--) {
      if (bullets[i] && bullets[i].hits(enemies[j])) {
        // Add score based on enemy type
        score += enemies[j].points;
        
        // Chance to spawn power-up
        if (random() < 0.1) {
          powerUps.push(new PowerUp(enemies[j].pos.x, enemies[j].pos.y));
        }
        
        // Remove the enemy and bullet
        enemies.splice(j, 1);
        bullets.splice(i, 1);
        break;
      }
    }
  }
  
  // Update enemies
  for (let i = enemies.length - 1; i >= 0; i--) {
    enemies[i].update();
    
    // Check if enemy is off-screen
    if (enemies[i].isOffScreen()) {
      enemies.splice(i, 1);
      continue;
    }
    
    // Check for collision with player
    if (enemies[i].hits(player) && player.isVulnerable()) {
      // Player takes damage
      lives--;
      player.setInvulnerable();
      
      // Screen shake effect
      screenShake = 10;
      
      // Remove the enemy
      enemies.splice(i, 1);
      
      // Check for game over
      if (lives <= 0) {
        gameState = GAME_OVER;
        if (score > highScore) {
          highScore = score;
        }
      }
    }
  }
  
  // Update power-ups
  for (let i = powerUps.length - 1; i >= 0; i--) {
    powerUps[i].update();
    
    // Check if power-up is off-screen
    if (powerUps[i].isOffScreen()) {
      powerUps.splice(i, 1);
      continue;
    }
    
    // Check for collision with player
    if (powerUps[i].hits(player)) {
      // Apply power-up effect
      player.applyPowerUp(powerUps[i].type);
      
      // Remove the power-up
      powerUps.splice(i, 1);
    }
  }
  
  // Spawn enemies based on level and time
  if (enemies.length < MAX_ENEMIES && random() < ENEMY_SPAWN_RATE * (1 + level * 0.1)) {
    spawnEnemy();
  }
  
  // Spawn power-ups occasionally
  if (random() < POWERUP_SPAWN_RATE) {
    let x = random(width);
    let y = -20;
    powerUps.push(new PowerUp(x, y));
  }
  
  // Increase level every 1000 points
  if (score >= level * 1000) {
    level++;
    // Visual feedback for level up
    screenShake = 5;
  }
}

// Draw the game elements
function drawGame() {
  // Draw player
  player.display();
  
  // Draw bullets
  for (let bullet of bullets) {
    bullet.display();
  }
  
  // Draw enemies
  for (let enemy of enemies) {
    enemy.display();
  }
  
  // Draw power-ups
  for (let powerUp of powerUps) {
    powerUp.display();
  }
  
  // Draw UI
  drawGameUI();
  
  // Draw touch controls
  if (isMobileDevice()) {
    drawTouchControls();
  }
}

// Draw the game UI during gameplay
function drawGameUI() {
  // Draw top UI bar
  fill(0, 0, 30, 200);
  noStroke();
  rect(0, 0, width, uiHeight);
  
  // Draw score and level
  fill(255);
  textSize(uiHeight * 0.5);
  textAlign(LEFT);
  text(`Score: ${score}`, uiPadding, uiHeight/2);
  
  // Draw lives in the center
  textAlign(CENTER);
  text(`Lives: ${lives}`, width/2, uiHeight/2);
  
  // Draw level on the right
  textAlign(RIGHT);
  text(`Level: ${level}`, width - uiPadding, uiHeight/2);
  
  // Draw player power-up status if active
  if (player.powerUpActive) {
    // Draw bottom UI bar for power-up
    fill(0, 0, 30, 200);
    rect(0, height - uiHeight, width, uiHeight);
    
    let powerUpText = "";
    switch (player.powerUpType) {
      case 'rapidFire':
        powerUpText = "Rapid Fire";
        fill(255, 200, 0);
        break;
      case 'shield':
        powerUpText = "Shield";
        fill(0, 200, 255);
        break;
      case 'multiShot':
        powerUpText = "Multi Shot";
        fill(200, 0, 255);
        break;
    }
    
    textAlign(CENTER);
    text(powerUpText, width/2, height - uiHeight/2);
    
    // Draw power-up timer bar
    let barWidth = width * 0.6;
    let barHeight = uiHeight * 0.3;
    let remainingTime = player.powerUpTimer / player.powerUpDuration;
    
    // Bar background
    fill(100);
    rect(width/2 - barWidth/2, height - uiHeight/2 + barHeight, barWidth, barHeight, 5);
    
    // Bar fill
    fill(255);
    rect(width/2 - barWidth/2, height - uiHeight/2 + barHeight, barWidth * remainingTime, barHeight, 5);
  }
  
  textAlign(CENTER, CENTER);
}

// Draw touch controls for mobile devices
function drawTouchControls() {
  // Only show touch controls during gameplay
  if (gameState !== GAME_PLAYING) return;
  
  // Draw semi-transparent control areas at the bottom
  noStroke();
  fill(255, 50);
  
  // Left control zone
  if (leftTouchZone) fill(255, 100);
  else fill(255, 30);
  rect(0, height - uiHeight * 3, touchZoneSize, uiHeight * 3);
  
  // Right control zone
  if (rightTouchZone) fill(255, 100);
  else fill(255, 30);
  rect(touchZoneSize * 2, height - uiHeight * 3, touchZoneSize, uiHeight * 3);
  
  // Shoot control zone
  if (shootTouchZone) fill(255, 100);
  else fill(255, 30);
  rect(touchZoneSize, height - uiHeight * 3, touchZoneSize, uiHeight * 3);
  
  // Draw control icons
  fill(255);
  textSize(20);
  text("←", touchZoneSize/2, height - uiHeight * 1.5);
  text("→", touchZoneSize * 2.5, height - uiHeight * 1.5);
  text("FIRE", touchZoneSize * 1.5, height - uiHeight * 1.5);
}

// Draw the start screen
function drawStartScreen() {
  fill(255);
  textSize(gameWidth * 0.1);
  text("SPACE SHOOTER", width/2, height/3);
  
  textSize(gameWidth * 0.05);
  if (isMobileDevice()) {
    text("Tap left/right sides to move", width/2, height/2);
    text("Tap center to shoot", width/2, height/2 + 40);
  } else {
    text("Use WASD or Arrow Keys to move", width/2, height/2);
    text("Space to shoot", width/2, height/2 + 40);
  }
  
  textSize(gameWidth * 0.06);
  text("Press ENTER or Tap to start", width/2, height * 2/3);
  
  // Draw high score if exists
  if (highScore > 0) {
    textSize(gameWidth * 0.04);
    text(`High Score: ${highScore}`, width/2, height * 3/4);
  }
}

// Draw the game over screen
function drawGameOverScreen() {
  fill(255);
  textSize(gameWidth * 0.1);
  text("GAME OVER", width/2, height/3);
  
  textSize(gameWidth * 0.06);
  text(`Final Score: ${score}`, width/2, height/2);
  
  if (score === highScore) {
    textSize(gameWidth * 0.05);
    fill(255, 255, 0);
    text("NEW HIGH SCORE!", width/2, height/2 + 40);
  }
  
  fill(255);
  textSize(gameWidth * 0.06);
  if (isMobileDevice()) {
    text("Tap to play again", width/2, height * 2/3);
  } else {
    text("Press ENTER to play again", width/2, height * 2/3);
  }
}

// Spawn an enemy based on current level
function spawnEnemy() {
  let x = random(width);
  let y = -20;
  
  // Different enemy types based on level and randomness
  let enemyType = floor(random(min(level, 3)));
  
  switch (enemyType) {
    case 0:
      enemies.push(new BasicEnemy(x, y));
      break;
    case 1:
      enemies.push(new ZigzagEnemy(x, y));
      break;
    case 2:
      enemies.push(new HunterEnemy(x, y));
      break;
  }
}

// Handle keyboard input
function keyPressed() {
  // Game controls
  if (keyCode === 32) { // Space bar
    if (gameState === GAME_PLAYING) {
      player.shoot();
    }
  }
  
  // Game state transitions
  if (keyCode === ENTER) {
    if (gameState === GAME_START || gameState === GAME_OVER) {
      resetGame();
      gameState = GAME_PLAYING;
    }
  }
  
  // Prevent default behavior for game keys
  if ([32, 37, 38, 39, 40, 65, 68, 83, 87].includes(keyCode)) {
    return false;
  }
}

// Handle touch input for mobile devices
function touchStarted() {
  // Start game from start or game over screens
  if (gameState === GAME_START || gameState === GAME_OVER) {
    resetGame();
    gameState = GAME_PLAYING;
    return false;
  }
  
  // Handle touch controls during gameplay
  if (gameState === GAME_PLAYING) {
    // Check which zone was touched
    if (mouseX < touchZoneSize) {
      leftTouchZone = true;
      player.setMovement(-1, 0);
    } else if (mouseX > touchZoneSize * 2) {
      rightTouchZone = true;
      player.setMovement(1, 0);
    } else {
      shootTouchZone = true;
      player.shoot();
    }
    return false;
  }
}

function touchEnded() {
  // Reset touch zones
  if (mouseX < touchZoneSize) {
    leftTouchZone = false;
    if (!rightTouchZone) player.setMovement(0, 0);
  } else if (mouseX > touchZoneSize * 2) {
    rightTouchZone = false;
    if (!leftTouchZone) player.setMovement(0, 0);
  } else {
    shootTouchZone = false;
  }
  return false;
}

// Check if the device is likely a mobile device
function isMobileDevice() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
         (window.innerWidth <= 800 && window.innerHeight <= 900);
}

// Handle window resizing
function windowResized() {
  setupPhoneLayout();
  
  // Adjust player position if needed
  if (player) {
    player.pos.x = constrain(player.pos.x, 0, width);
    player.pos.y = constrain(player.pos.y, 0, height);
  }
} 