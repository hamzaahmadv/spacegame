// Space Shooter Game
// A complete p5.js space shooter with custom-drawn sprites and vertical phone-like UI

// Game state constants
const GAME_START = 0;
const GAME_PLAYING = 1;
const GAME_OVER = 2;
const GAME_BOSS_INTRO = 3; // New state for boss introduction

// Game variables
let gameState;
let score;
let highScore = 0;
let level;
let lives; // Now will be set to 1
let gameTime;
let screenShake = 0;
let prevLevel = 1; // Track level changes
let gameOverTimer = 0; // Timer for game over animation
let gameOverAlpha = 0; // Opacity for game over fade

// Boss-related variables
let bossActive = false;
let bossIntroTimer = 0;
let bossIntroAlpha = 0;
let bossLevel = 0;
let bossWarningTimer = 0;
let bossWarningAlpha = 0;
let bossDefeated = false;

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
const BOSS_LEVELS = [5, 10, 15, 20, 25]; // Levels where bosses appear

// UI settings
let gameWidth, gameHeight;
let uiHeight;
let uiPadding = 10;
let touchZoneSize;

// Background settings
let bgColor;

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
  
  // Set initial background color
  updateBackgroundColor(1);
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
  uiHeight = gameHeight * 0.06; // Further reduced from 7% to 6% of height for UI
  touchZoneSize = gameWidth / 3; // Divide screen into thirds for touch controls
}

// Reset game to initial state
function resetGame() {
  gameState = GAME_START;
  score = 0;
  level = 1;
  prevLevel = 1;
  lives = 1; // Changed from 3 to 1
  gameTime = 0;
  gameOverTimer = 0;
  gameOverAlpha = 0;
  
  // Reset boss-related variables
  bossActive = false;
  bossIntroTimer = 0;
  bossIntroAlpha = 0;
  bossLevel = 0;
  bossWarningTimer = 0;
  bossWarningAlpha = 0;
  bossDefeated = false;
  
  // Clear all game objects
  player = new Player();
  bullets = [];
  enemies = [];
  powerUps = [];
  
  // Reset background color
  updateBackgroundColor(1);
}

// Update background color based on level
function updateBackgroundColor(level) {
  // Different background colors for each level theme
  let theme = (level - 1) % 5;
  
  switch(theme) {
    case 0: // Level 1: Deep blue
      bgColor = color(10, 10, 30);
      break;
    case 1: // Level 2: Purple nebula
      bgColor = color(20, 5, 35);
      break;
    case 2: // Level 3: Green nebula
      bgColor = color(5, 25, 20);
      break;
    case 3: // Level 4: Red nebula
      bgColor = color(30, 5, 15);
      break;
    case 4: // Level 5+: Cosmic
      bgColor = color(15, 15, 25);
      break;
  }
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
  background(bgColor);
  
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
      updateGameOver();
      drawGameOverScreen();
      break;
    case GAME_BOSS_INTRO:
      updateBossIntro();
      drawBossIntro();
      break;
  }
  
  // Draw boss warning if active (appears in any state)
  if (bossWarningTimer > 0) {
    drawBossWarning();
  }
}

// Update all stars for parallax background
function updateStars() {
  for (let star of stars) {
    star.update();
    star.display();
  }
}

// Update game over animation
function updateGameOver() {
  gameOverTimer++;
  
  // Fade in effect for game over screen
  if (gameOverTimer < 60) {
    gameOverAlpha = min(255, gameOverAlpha + 5);
  }
  
  // Continue updating stars with reduced speed for background effect
  for (let star of stars) {
    star.speed *= 0.99;
  }
}

// Update game logic
function updateGame() {
  gameTime++;
  
  // Check for level change
  if (level !== prevLevel) {
    // Update background and stars when level changes
    updateBackgroundColor(level);
    
    // Update star colors
    for (let star of stars) {
      star.updateColor(level);
    }
    
    // Check if this is a boss level
    if (BOSS_LEVELS.includes(level) && !bossDefeated) {
      // Start boss warning
      bossWarningTimer = 180; // 3 seconds
      bossWarningAlpha = 0;
      
      // Schedule boss intro
      setTimeout(() => {
        if (gameState === GAME_PLAYING) {
          gameState = GAME_BOSS_INTRO;
          bossIntroTimer = 0;
          bossIntroAlpha = 0;
        }
      }, 3000); // 3 seconds after warning
    }
    
    prevLevel = level;
  }
  
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
        // Check if enemy is a boss
        if (enemies[j] instanceof Boss) {
          // Apply damage to boss
          if (enemies[j].takeDamage(1)) {
            // Boss is defeated
            score += enemies[j].points;
            
            // Spawn multiple power-ups
            for (let k = 0; k < 3; k++) {
              powerUps.push(new PowerUp(
                enemies[j].pos.x + random(-50, 50),
                enemies[j].pos.y + random(-50, 50)
              ));
            }
            
            // Remove the boss
            enemies.splice(j, 1);
            
            // Mark boss as defeated
            bossActive = false;
            bossDefeated = true;
            
            // Screen shake effect
            screenShake = 20;
          }
        } else {
          // Regular enemy hit
          // Add score based on enemy type
          score += enemies[j].points;
          
          // Chance to spawn power-up
          if (random() < 0.1) {
            powerUps.push(new PowerUp(enemies[j].pos.x, enemies[j].pos.y));
          }
          
          // Remove the enemy
          enemies.splice(j, 1);
        }
        
        // Remove the bullet in either case
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
      // Don't remove bosses if they're just temporarily off-screen
      if (enemies[i] instanceof Boss && enemies[i].entering) {
        continue;
      }
      
      enemies.splice(i, 1);
      continue;
    }
    
    // Check for collision with player
    if (enemies[i].hits(player) && player.isVulnerable()) {
      // Player takes damage - now game over immediately since only 1 life
      lives--;
      
      // Screen shake effect
      screenShake = 15; // Increased for more dramatic effect
      
      // Remove the enemy if it's not a boss
      if (!(enemies[i] instanceof Boss)) {
        enemies.splice(i, 1);
      }
      
      // Game over
      gameState = GAME_OVER;
      if (score > highScore) {
        highScore = score;
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
  
  // Only spawn regular enemies if no boss is active
  if (!bossActive) {
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
      // Reset boss defeated flag for the new level
      bossDefeated = false;
      // Visual feedback for level up
      screenShake = 5;
    }
  } else {
    // Check if all bosses are defeated
    let bossFound = false;
    for (let enemy of enemies) {
      if (enemy instanceof Boss) {
        bossFound = true;
        break;
      }
    }
    
    // If no bosses found but boss is still active, mark as defeated
    if (!bossFound && bossActive) {
      bossActive = false;
      bossDefeated = true;
    }
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
  // Draw top UI bar - smaller and more transparent
  fill(0, 0, 30, 160);
  noStroke();
  rect(0, 0, width, uiHeight);
  
  // Draw score and level - smaller text
  fill(255);
  textSize(uiHeight * 0.6);
  
  // Score on the left
  textAlign(LEFT);
  text(`${score}`, uiPadding, uiHeight/2);
  
  // Level in the center
  textAlign(CENTER);
  text(`LEVEL ${level}`, width/2, uiHeight/2);
  
  // High score on the right (if exists)
  if (highScore > 0) {
    textAlign(RIGHT);
    text(`BEST: ${highScore}`, width - uiPadding, uiHeight/2);
  }
  
  // Draw boss health bar if a boss is active
  if (bossActive) {
    // Find the boss in the enemies array
    let boss = null;
    for (let enemy of enemies) {
      if (enemy instanceof Boss) {
        boss = enemy;
        break;
      }
    }
    
    if (boss) {
      // Draw bottom UI bar for boss health
      fill(0, 0, 30, 160);
      rect(0, height - uiHeight, width, uiHeight);
      
      // Draw boss name
      textAlign(LEFT);
      textSize(uiHeight * 0.6);
      fill(255, 100, 100);
      
      let bossName = "";
      if (level === 5) {
        bossName = "DESTROYER";
      } else if (level === 10) {
        bossName = "MOTHERSHIP";
      } else if (level === 15) {
        bossName = "DREADNOUGHT";
      } else if (level === 20) {
        bossName = "HIVEMIND";
      } else if (level === 25) {
        bossName = "OMEGA";
      }
      
      text(bossName, uiPadding, height - uiHeight/2);
      
      // Draw boss health bar
      let barWidth = width * 0.6;
      let barHeight = uiHeight * 0.4;
      let healthPercent = boss.health / boss.maxHealth;
      
      // Bar background
      fill(50, 50, 50, 200);
      rect(width/2 - barWidth/2, height - uiHeight/2 - barHeight/2, barWidth, barHeight, 5);
      
      // Health bar fill with color based on health percentage
      if (healthPercent > 0.6) {
        fill(255, 100, 100); // Red for boss
      } else if (healthPercent > 0.3) {
        fill(255, 150, 50); // Orange
      } else {
        fill(255, 200, 50); // Yellow when low health
      }
      
      rect(width/2 - barWidth/2, height - uiHeight/2 - barHeight/2, barWidth * healthPercent, barHeight, 5);
      
      // Health percentage text
      textAlign(CENTER);
      textSize(uiHeight * 0.4);
      fill(255);
      text(`${floor(healthPercent * 100)}%`, width/2, height - uiHeight/2);
    }
  }
  
  // Draw player power-up status if active
  if (player.powerUpActive) {
    // Draw bottom UI bar for power-up - smaller and more transparent
    if (!bossActive) {
      fill(0, 0, 30, 160);
      rect(0, height - uiHeight, width, uiHeight);
    }
    
    let powerUpText = "";
    let powerUpColor;
    switch (player.powerUpType) {
      case 'rapidFire':
        powerUpText = "RAPID FIRE";
        powerUpColor = color(255, 200, 0);
        break;
      case 'shield':
        powerUpText = "SHIELD";
        powerUpColor = color(0, 200, 255);
        break;
      case 'multiShot':
        powerUpText = "MULTI SHOT";
        powerUpColor = color(200, 0, 255);
        break;
    }
    
    // Draw power-up timer bar with colored fill
    let barWidth = width * 0.25;
    let barHeight = uiHeight * 0.3;
    let remainingTime = player.powerUpTimer / player.powerUpDuration;
    
    // Position power-up bar on the right side if boss is active
    let barX = bossActive ? width - barWidth - uiPadding : width/2 - barWidth/2;
    
    // Bar background
    fill(50, 50, 50, 200);
    rect(barX, height - uiHeight/2, barWidth, barHeight, 5);
    
    // Bar fill with power-up color
    fill(powerUpColor);
    rect(barX, height - uiHeight/2, barWidth * remainingTime, barHeight, 5);
    
    // Power-up text
    textAlign(RIGHT);
    textSize(uiHeight * 0.5);
    fill(255);
    text(powerUpText, width - uiPadding, height - uiHeight/2 - barHeight);
  }
  
  textAlign(CENTER, CENTER);
}

// Draw touch controls for mobile devices
function drawTouchControls() {
  // Only show touch controls during gameplay
  if (gameState !== GAME_PLAYING) return;
  
  // Draw semi-transparent control areas at the bottom
  noStroke();
  
  // Left control zone
  if (leftTouchZone) fill(255, 80);
  else fill(255, 20);
  rect(0, height - uiHeight * 3, touchZoneSize, uiHeight * 3);
  
  // Right control zone
  if (rightTouchZone) fill(255, 80);
  else fill(255, 20);
  rect(touchZoneSize * 2, height - uiHeight * 3, touchZoneSize, uiHeight * 3);
  
  // Shoot control zone
  if (shootTouchZone) fill(255, 80);
  else fill(255, 20);
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
  // Title with glow effect
  let titleSize = gameWidth * 0.1;
  textSize(titleSize);
  
  // Glow effect
  fill(100, 150, 255, 50);
  text("SPACE SHOOTER", width/2 + 2, height/3 + 2);
  
  // Main title
  fill(255);
  text("SPACE SHOOTER", width/2, height/3);
  
  // Instructions
  textSize(gameWidth * 0.04);
  fill(200, 200, 255);
  
  if (isMobileDevice()) {
    text("Tap left/right sides to move", width/2, height/2);
    text("Tap center to shoot", width/2, height/2 + 40);
  } else {
    text("Use WASD or Arrow Keys to move", width/2, height/2);
    text("Space to shoot", width/2, height/2 + 40);
  }
  
  // One life warning
  fill(255, 100, 100);
  textSize(gameWidth * 0.05);
  text("ONE LIFE ONLY!", width/2, height/2 + 90);
  
  // Start prompt with pulsing effect
  let pulseAmount = sin(frameCount * 0.05) * 0.2 + 0.8;
  fill(255, 255, 255, 255 * pulseAmount);
  textSize(gameWidth * 0.06);
  text("Press ENTER or Tap to start", width/2, height * 2/3);
  
  // Draw high score if exists
  if (highScore > 0) {
    textSize(gameWidth * 0.04);
    fill(255, 255, 100);
    text(`High Score: ${highScore}`, width/2, height * 3/4);
  }
}

// Draw the game over screen
function drawGameOverScreen() {
  // Fade in effect
  fill(0, 0, 0, min(150, gameOverAlpha * 0.6));
  rect(0, 0, width, height);
  
  // Game over text with glow
  fill(255, 50, 50, min(255, gameOverAlpha));
  textSize(gameWidth * 0.12);
  text("GAME OVER", width/2, height/3);
  
  if (gameOverTimer > 30) {
    // Final score
    fill(255, 255, 255, min(255, (gameOverTimer - 30) * 8));
    textSize(gameWidth * 0.06);
    text(`Final Score: ${score}`, width/2, height/2);
    
    // Level reached
    fill(200, 200, 255, min(255, (gameOverTimer - 40) * 8));
    textSize(gameWidth * 0.04);
    text(`You reached Level ${level}`, width/2, height/2 + 40);
  }
  
  if (gameOverTimer > 60) {
    // New high score notification
    if (score === highScore && highScore > 0) {
      let pulseAmount = sin(frameCount * 0.1) * 0.2 + 0.8;
      fill(255, 255, 0, min(255, (gameOverTimer - 60) * 5) * pulseAmount);
      textSize(gameWidth * 0.05);
      text("NEW HIGH SCORE!", width/2, height/2 + 90);
    }
    
    // Play again prompt with pulsing effect
    let pulseAmount = sin(frameCount * 0.05) * 0.2 + 0.8;
    fill(255, 255, 255, min(255, (gameOverTimer - 80) * 10) * pulseAmount);
    textSize(gameWidth * 0.06);
    if (isMobileDevice()) {
      text("Tap to play again", width/2, height * 2/3 + 30);
    } else {
      text("Press ENTER to play again", width/2, height * 2/3 + 30);
    }
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
    } else if (gameState === GAME_BOSS_INTRO) {
      // Skip boss intro
      gameState = GAME_PLAYING;
      spawnBoss();
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
  if (gameState === GAME_START || (gameState === GAME_OVER && gameOverTimer > 90)) {
    resetGame();
    gameState = GAME_PLAYING;
    return false;
  }
  
  // Skip boss intro
  if (gameState === GAME_BOSS_INTRO) {
    gameState = GAME_PLAYING;
    spawnBoss();
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

// Update boss intro animation
function updateBossIntro() {
  bossIntroTimer++;
  
  // Fade in effect for boss intro screen
  if (bossIntroTimer < 60) {
    bossIntroAlpha = min(255, bossIntroAlpha + 5);
  } else if (bossIntroTimer > 180) {
    // Fade out and transition to gameplay
    bossIntroAlpha = max(0, bossIntroAlpha - 10);
    
    if (bossIntroAlpha <= 0) {
      gameState = GAME_PLAYING;
      
      // Spawn the boss
      spawnBoss();
    }
  }
  
  // Continue updating stars with reduced speed for background effect
  for (let star of stars) {
    star.speed *= 0.99;
  }
}

// Draw boss intro screen
function drawBossIntro() {
  // Draw game in background
  drawGame();
  
  // Overlay with semi-transparent background
  fill(0, 0, 0, bossIntroAlpha * 0.7);
  rect(0, 0, width, height);
  
  // Boss warning text with glow
  let bossName = "";
  let bossDescription = "";
  
  // Set boss name and description based on level
  if (level === 5) {
    bossName = "DESTROYER";
    bossDescription = "A heavily armed battle cruiser";
  } else if (level === 10) {
    bossName = "MOTHERSHIP";
    bossDescription = "Command vessel with teleportation technology";
  } else if (level === 15) {
    bossName = "DREADNOUGHT";
    bossDescription = "Massive warship with devastating firepower";
  } else if (level === 20) {
    bossName = "HIVEMIND";
    bossDescription = "Swarm intelligence with regenerative abilities";
  } else if (level === 25) {
    bossName = "OMEGA";
    bossDescription = "The final challenge";
  }
  
  // Warning text
  fill(255, 50, 50, bossIntroAlpha);
  textSize(gameWidth * 0.08);
  text("WARNING!", width/2, height/3 - 50);
  
  // Boss name with pulsing effect
  let pulseAmount = sin(frameCount * 0.1) * 0.2 + 0.8;
  fill(255, 200, 50, bossIntroAlpha * pulseAmount);
  textSize(gameWidth * 0.12);
  text("BOSS: " + bossName, width/2, height/2);
  
  // Boss description
  fill(200, 200, 255, bossIntroAlpha);
  textSize(gameWidth * 0.04);
  text(bossDescription, width/2, height/2 + 50);
  
  // Get ready text
  if (bossIntroTimer > 120) {
    fill(255, 255, 255, bossIntroAlpha);
    textSize(gameWidth * 0.06);
    text("GET READY!", width/2, height * 2/3);
  }
}

// Draw boss warning (appears briefly before boss intro)
function drawBossWarning() {
  // Pulsing warning text at top of screen
  let pulseAmount = sin(frameCount * 0.2) * 0.3 + 0.7;
  fill(255, 50, 50, bossWarningAlpha * pulseAmount);
  textSize(gameWidth * 0.05);
  text("BOSS APPROACHING", width/2, height * 0.15);
  
  // Update warning alpha
  if (bossWarningTimer < 60) {
    bossWarningAlpha = min(255, bossWarningAlpha + 8);
  } else {
    bossWarningAlpha = max(0, bossWarningAlpha - 8);
  }
  
  // Update timer
  bossWarningTimer--;
}

// Spawn a boss based on current level
function spawnBoss() {
  let x = width / 2;
  let y = -50;
  
  // Clear any remaining enemies
  enemies = [];
  
  // Set boss active flag
  bossActive = true;
  bossLevel = level;
  
  // Create the appropriate boss based on level
  if (level === 5) {
    enemies.push(new DestroyerBoss(x, y, level));
  } else if (level === 10) {
    enemies.push(new MothershipBoss(x, y, level));
  } else if (level === 15) {
    // For future bosses, we'll use DestroyerBoss as a fallback
    enemies.push(new DestroyerBoss(x, y, level));
  } else if (level === 20) {
    enemies.push(new MothershipBoss(x, y, level));
  } else if (level === 25) {
    enemies.push(new DestroyerBoss(x, y, level));
  }
  
  // Screen shake effect for boss entrance
  screenShake = 10;
} 