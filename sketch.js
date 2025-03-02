// Space Shooter Game
// A complete p5.js space shooter with custom-drawn sprites and vertical phone-like UI

// Debug mode
const DEBUG_MODE = false; // Set to false to disable debug information

// Game state constants
const GAME_START = 0;
const GAME_PLAYING = 1;
const GAME_OVER = 2;
const GAME_BOSS_INTRO = 3; // New state for boss introduction
const LEADERBOARD_SUBMIT = 4;
const LEADERBOARD_VIEW = 5;

// Game variables
let gameState = GAME_START; // Initialize game state directly
let score = 0;
let highScore = 0;
let level = 1;
let lives = 1; // Now will be set to 1
let gameTime = 0;
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
let visualEffects = []; // For explosions and particle effects
let textEffects = []; // For floating text messages

// Game settings
const PLAYER_SIZE = 30;
const BULLET_SPEED = 10;
const ENEMY_SPAWN_RATE = 0.02; // Chance per frame
const POWERUP_SPAWN_RATE = 0.001; // Chance per frame
const MAX_ENEMIES = 15;
const BOSS_LEVELS = [10, 20, 30, 40, 50]; // Bosses appear every 10 levels

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
  console.log("Preload function called");
}

// Setup function - called once at the beginning
function setup() {
  console.log("Setting up game...");
  
  try {
    // Create canvas with a phone-like aspect ratio
    setupPhoneLayout();
    
    console.log(`Canvas created with dimensions: ${gameWidth} x ${gameHeight}`);
    
    colorMode(RGB, 255);
    textAlign(CENTER, CENTER);
    
    // Initialize game state and objects
    resetGame();
    
    // Create stars for parallax background
    for (let i = 0; i < 200; i++) {
      stars.push(new Star());
    }
    
    // Set initial background color
    updateBackgroundColor(1);
    
    console.log("Game setup complete");
    
    // Debug info
    if (DEBUG_MODE) {
      console.log("DEBUG MODE ENABLED");
      console.log("Window dimensions:", windowWidth, "x", windowHeight);
      console.log("Game dimensions:", gameWidth, "x", gameHeight);
      console.log("Canvas element:", document.querySelector('canvas'));
      console.log("Game container:", document.getElementById('game-container'));
      console.log("Game state:", gameState);
      console.log("Player object:", player);
    }
    
    // Initialize leaderboard functionality
    if (typeof initLeaderboard === 'function') {
      console.log("Initializing leaderboard...");
      initLeaderboard();
    } else {
      console.warn("Leaderboard functionality not available");
    }
  } catch (error) {
    console.error("Error during game setup:", error);
    // Try to display error on screen
    if (typeof createCanvas === 'function') {
      createCanvas(400, 400);
      background(0);
      fill(255, 0, 0);
      textSize(20);
      textAlign(CENTER, CENTER);
      text("Error setting up game:", width/2, height/2 - 20);
      text(error.message, width/2, height/2 + 20);
    }
    
    // Show error in the error message div if it exists
    if (typeof showErrorMessage === 'function') {
      showErrorMessage("Error setting up game: " + error.message);
    }
  }
}

// Set up the phone-like layout
function setupPhoneLayout() {
  console.log("Setting up phone layout...");
  
  // Calculate dimensions for a phone-like aspect ratio (9:16)
  if (windowWidth / windowHeight > 9/16) {
    // Window is wider than 9:16
    gameHeight = windowHeight * 0.95; // Use 95% of window height
    gameWidth = gameHeight * 9/16;
  } else {
    // Window is narrower than 9:16
    gameWidth = windowWidth * 0.95; // Use 95% of window width
    gameHeight = gameWidth * 16/9;
  }
  
  console.log(`Calculated dimensions: ${gameWidth} x ${gameHeight}`);
  
  // Create canvas and place it in the game-container
  let canvas = createCanvas(gameWidth, gameHeight);
  canvas.parent('game-container');
  
  // Ensure canvas is visible with proper styling
  let canvasElement = document.querySelector('canvas');
  if (canvasElement) {
    canvasElement.style.display = 'block';
    canvasElement.style.visibility = 'visible';
    canvasElement.style.margin = '0 auto';
    console.log('Canvas styling applied');
  } else {
    console.error('Canvas element not found after creation');
  }
  
  // Set UI dimensions
  uiHeight = gameHeight * 0.06; // Further reduced from 7% to 6% of height for UI
  touchZoneSize = gameWidth / 3; // Divide screen into thirds for touch controls
  
  console.log("Phone layout setup complete");
}

// Reset game to initial state
function resetGame() {
  console.log("Resetting game...");
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
  try {
    player = new Player();
    bullets = [];
    enemies = [];
    powerUps = [];
    visualEffects = [];
    textEffects = [];
    
    // Reset background color
    updateBackgroundColor(1);
    
    console.log("Game reset complete, game state:", gameState);
  } catch (error) {
    console.error("Error during game reset:", error);
    // Try to recover by setting a basic player object
    if (!player) {
      console.log("Creating fallback player object");
      player = {
        pos: createVector(width / 2, height * 0.8),
        vel: createVector(0, 0),
        size: PLAYER_SIZE,
        display: function() {
          fill(100, 200, 255);
          ellipse(this.pos.x, this.pos.y, this.size, this.size);
        },
        update: function() {
          // Basic update function
        },
        shoot: function() {
          // Basic shoot function
        }
      };
    }
  }
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
  try {
    // Apply screen shake effect
    if (screenShake > 0) {
      translate(random(-screenShake, screenShake), random(-screenShake, screenShake));
      screenShake *= 0.9;
      if (screenShake < 0.5) screenShake = 0;
    }
    
    // Draw background
    background(bgColor || color(10, 10, 30)); // Fallback color if bgColor is not set
    
    // Update and draw stars (always visible in all game states)
    updateStars();
    
    // Draw debug info if enabled
    if (DEBUG_MODE) {
      drawDebugInfo();
    }
    
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
      case LEADERBOARD_SUBMIT:
        // The leaderboard input form is handled by HTML/CSS
        // Just draw the game in the background
        drawGame();
        break;
      case LEADERBOARD_VIEW:
        drawLeaderboardScreen();
        break;
      default:
        console.error("Unknown game state:", gameState);
        // Reset to start screen if we somehow get an invalid state
        gameState = GAME_START;
        break;
    }
    
    // Draw boss warning if active (appears in any state)
    if (bossWarningTimer > 0) {
      drawBossWarning();
    }
  } catch (error) {
    console.error("Error in draw function:", error);
    // Try to recover by resetting the game
    try {
      resetGame();
    } catch (resetError) {
      console.error("Failed to recover from error:", resetError);
      noLoop(); // Stop the game loop if we can't recover
      
      // Show error message
      if (typeof showErrorMessage === 'function') {
        showErrorMessage("Game crashed: " + error.message);
      } else {
        background(0);
        fill(255, 0, 0);
        textSize(20);
        textAlign(CENTER, CENTER);
        text("Game crashed:", width/2, height/2 - 20);
        text(error.message, width/2, height/2 + 20);
        text("Please reload the page", width/2, height/2 + 60);
      }
    }
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
  
  // Show leaderboard input after a delay
  if (gameOverTimer === 120) {
    // Check if the showLeaderboardInput function exists
    if (typeof showLeaderboardInput === 'function') {
      console.log('Showing leaderboard input form');
      showLeaderboardInput();
    } else {
      console.warn('Leaderboard functionality not available');
    }
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
    } else {
      // Regular level up - show level up message
      let levelUpMsg = {
        text: "LEVEL " + level,
        pos: createVector(width/2, height/2),
        size: gameWidth * 0.08,
        alpha: 255,
        color: color(100, 255, 100),
        life: 90
      };
      
      textEffects.push(levelUpMsg);
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
            
            // Create large explosion at boss position
            createExplosion(
              enemies[j].pos.x, 
              enemies[j].pos.y, 
              enemies[j].size, 
              color(255, 150, 0)
            );
            
            // Remove the boss
            enemies.splice(j, 1);
            
            // Mark boss as defeated
            bossActive = false;
            bossDefeated = true;
            
            // Increment level after defeating a boss
            level++;
            
            // Visual feedback for boss defeat
            screenShake = 20;
            
            // Create victory effect
            createVictoryEffect();
          } else {
            // Boss took damage but not defeated - create small hit effect
            createExplosion(
              bullets[i].pos.x, 
              bullets[i].pos.y, 
              20, 
              color(255, 200, 100)
            );
          }
        } else {
          // Regular enemy hit
          // Add score based on enemy type
          score += enemies[j].points;
          
          // Create explosion at enemy position
          createExplosion(
            enemies[j].pos.x, 
            enemies[j].pos.y, 
            enemies[j].size * 0.8, 
            color(255, 100, 50)
          );
          
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
  
  // Update visual effects
  updateVisualEffects();
  
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
  
  // Draw visual effects
  drawVisualEffects();
  
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
      if (level === 10) {
        bossName = "CRIMSON DESTROYER";
      } else if (level === 20) {
        bossName = "SCARLET MOTHERSHIP";
      } else if (level === 30) {
        bossName = "RUBY DREADNOUGHT";
      } else if (level === 40) {
        bossName = "BLOOD HIVEMIND";
      } else if (level === 50) {
        bossName = "OMEGA PHOENIX";
      } else {
        bossName = "ELITE WARSHIP";
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
  
  // View leaderboard button - only if the function exists
  if (typeof showLeaderboard === 'function') {
    drawButton("VIEW LEADERBOARD", width/2, height * 5/6, function() {
      showLeaderboard();
    });
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
    
    // View leaderboard button (only show after the input form has been shown and dismissed)
    if (gameOverTimer > 150 && typeof showLeaderboard === 'function') {
      // Draw a button to view the leaderboard
      drawButton("VIEW LEADERBOARD", width/2, height * 2/3 + 90, function() {
        showLeaderboard();
      });
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
  console.log("Key pressed:", keyCode, "Game state:", gameState);
  
  // Skip keyboard handling if in leaderboard input mode
  if (gameState === LEADERBOARD_SUBMIT) {
    // Only handle ESC key to cancel submission
    if (keyCode === ESCAPE) {
      document.getElementById('leaderboardInput').style.display = 'none';
      gameState = GAME_OVER;
      loop();
      return false;
    }
    return true; // Let the browser handle other keys for input
  }
  
  // Handle leaderboard navigation
  if (gameState === LEADERBOARD_VIEW) {
    if (keyCode === LEFT_ARROW && leaderboardPage > 0) {
      leaderboardPage--;
      return false;
    } else if (keyCode === RIGHT_ARROW && 
              (leaderboardPage + 1) * leaderboardEntriesPerPage < leaderboardData.length) {
      leaderboardPage++;
      return false;
    } else if (keyCode === ESCAPE) {
      gameState = GAME_OVER;
      return false;
    }
  }
  
  // Game controls
  if (keyCode === 32) { // Space bar
    console.log("Space bar pressed, game state:", gameState);
    if (gameState === GAME_PLAYING) {
      // Shoot
      player.shoot();
    } else if (gameState === GAME_START) {
      // Start game
      console.log("Starting game from GAME_START state");
      gameState = GAME_PLAYING;
      return false;
    } else if (gameState === GAME_OVER && gameOverTimer > 90) {
      // Restart game
      resetGame();
      gameState = GAME_PLAYING;
      return false;
    }
  } else if (keyCode === ENTER) {
    console.log("Enter key pressed, game state:", gameState);
    if (gameState === GAME_START) {
      // Start game
      console.log("Starting game from GAME_START state");
      gameState = GAME_PLAYING;
      return false;
    } else if (gameState === GAME_OVER && gameOverTimer > 90) {
      // Restart game
      resetGame();
      gameState = GAME_PLAYING;
      return false;
    }
  } else if (keyCode === ESCAPE) {
    if (gameState === LEADERBOARD_VIEW) {
      gameState = GAME_OVER;
      return false;
    }
  }
  
  // Prevent default behavior for game keys
  if (keyCode === UP_ARROW || keyCode === DOWN_ARROW || 
      keyCode === LEFT_ARROW || keyCode === RIGHT_ARROW || 
      keyCode === 32 || keyCode === ENTER || keyCode === ESCAPE) {
    return false;
  }
  
  return true;
}

// Handle touch input for mobile devices
function touchStarted() {
  console.log("Touch started, game state:", gameState, "Touch position:", mouseX, mouseY);
  
  // Start game from start screen
  if (gameState === GAME_START) {
    console.log("Touch detected on start screen, starting game");
    gameState = GAME_PLAYING;
    return false;
  }
  
  // Restart game from game over screen
  if (gameState === GAME_OVER && gameOverTimer > 90) {
    console.log("Touch detected on game over screen, restarting game");
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
  
  // Handle leaderboard clicks
  if (gameState === LEADERBOARD_VIEW) {
    handleLeaderboardClicks();
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
  
  return false; // Prevent default behavior
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
  // Recalculate game dimensions and resize canvas
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
  if (level === 10) {
    bossName = "CRIMSON DESTROYER";
    bossDescription = "Heavily armed battle cruiser with advanced weaponry";
  } else if (level === 20) {
    bossName = "SCARLET MOTHERSHIP";
    bossDescription = "Command vessel with teleportation and shield technology";
  } else if (level === 30) {
    bossName = "RUBY DREADNOUGHT";
    bossDescription = "Massive warship with devastating firepower and armor";
  } else if (level === 40) {
    bossName = "BLOOD HIVEMIND";
    bossDescription = "Swarm intelligence with regenerative abilities and drones";
  } else if (level === 50) {
    bossName = "OMEGA PHOENIX";
    bossDescription = "The ultimate challenge - a ship reborn from cosmic fire";
  } else {
    // For any other boss level
    bossName = "ELITE WARSHIP";
    bossDescription = "A powerful enemy vessel with unknown capabilities";
  }
  
  // Warning text with glow effect
  fill(255, 50, 50, bossIntroAlpha);
  textSize(gameWidth * 0.08);
  text("WARNING!", width/2, height/3 - 50);
  
  // Add glow effect to warning text
  drawingContext.shadowBlur = 20;
  drawingContext.shadowColor = color(255, 0, 0, bossIntroAlpha * 0.7);
  
  // Boss name with pulsing effect
  let pulseAmount = sin(frameCount * 0.1) * 0.2 + 0.8;
  fill(255, 50, 50, bossIntroAlpha * pulseAmount);
  textSize(gameWidth * 0.12);
  text("BOSS: " + bossName, width/2, height/2);
  
  // Reset shadow for other text
  drawingContext.shadowBlur = 0;
  
  // Boss description
  fill(200, 200, 255, bossIntroAlpha);
  textSize(gameWidth * 0.04);
  text(bossDescription, width/2, height/2 + 50);
  
  // Get ready text with pulsing
  if (bossIntroTimer > 120) {
    let readyPulse = sin(frameCount * 0.2) * 0.2 + 0.8;
    fill(255, 255, 255, bossIntroAlpha * readyPulse);
    textSize(gameWidth * 0.06);
    text("GET READY!", width/2, height * 2/3);
  }
}

// Draw boss warning (appears briefly before boss intro)
function drawBossWarning() {
  // Semi-transparent red overlay that pulses
  let overlayPulse = sin(frameCount * 0.1) * 0.05 + 0.05;
  fill(255, 0, 0, overlayPulse * bossWarningAlpha);
  rect(0, 0, width, height);
  
  // Pulsing warning text at top of screen
  let pulseAmount = sin(frameCount * 0.2) * 0.3 + 0.7;
  
  // Add glow effect to warning text
  drawingContext.shadowBlur = 15;
  drawingContext.shadowColor = color(255, 0, 0, bossWarningAlpha * 0.7);
  
  fill(255, 50, 50, bossWarningAlpha * pulseAmount);
  textSize(gameWidth * 0.06);
  text("BOSS APPROACHING", width/2, height * 0.15);
  
  // Add warning icon
  if (bossWarningTimer % 30 < 15) { // Blinking effect
    fill(255, 50, 50, bossWarningAlpha);
    triangle(
      width/2 - 20, height * 0.22,
      width/2 + 20, height * 0.22,
      width/2, height * 0.22 - 35
    );
    fill(255, 255, 255, bossWarningAlpha);
    textSize(gameWidth * 0.04);
    text("!", width/2, height * 0.22 - 15);
  }
  
  // Reset shadow
  drawingContext.shadowBlur = 0;
  
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
  if (level === 10) {
    // Level 10: Crimson Destroyer
    let boss = new DestroyerBoss(x, y, level);
    boss.color = color(220, 30, 30); // Bright red
    enemies.push(boss);
  } else if (level === 20) {
    // Level 20: Scarlet Mothership
    let boss = new MothershipBoss(x, y, level);
    boss.color = color(200, 20, 60); // Crimson
    enemies.push(boss);
  } else if (level === 30) {
    // Level 30: Ruby Dreadnought - using DestroyerBoss with enhanced properties
    let boss = new DestroyerBoss(x, y, level);
    boss.color = color(180, 0, 30); // Deep red
    boss.size *= 1.2; // Larger
    boss.maxHealth *= 1.5; // More health
    boss.health = boss.maxHealth;
    enemies.push(boss);
  } else if (level === 40) {
    // Level 40: Blood Hivemind - using MothershipBoss with enhanced properties
    let boss = new MothershipBoss(x, y, level);
    boss.color = color(150, 0, 0); // Dark red
    boss.orbitPoints = 6; // More orbit points
    boss.attackRate *= 0.8; // Faster attacks
    enemies.push(boss);
  } else if (level === 50) {
    // Level 50: Omega Phoenix - ultimate boss
    let boss = new DestroyerBoss(x, y, level);
    boss.color = color(255, 30, 0); // Fiery red
    boss.size *= 1.5; // Much larger
    boss.maxHealth *= 2; // Much more health
    boss.health = boss.maxHealth;
    boss.attackRate *= 0.7; // Much faster attacks
    enemies.push(boss);
  } else {
    // For any other boss level, scale based on level
    if (level % 20 === 0) {
      // Every 20 levels use Mothership variant
      let boss = new MothershipBoss(x, y, level);
      boss.color = color(200 - (level % 100), 20, 40 + (level % 50));
      enemies.push(boss);
    } else {
      // Otherwise use Destroyer variant
      let boss = new DestroyerBoss(x, y, level);
      boss.color = color(220 - (level % 100), 30 + (level % 30), 30);
      enemies.push(boss);
    }
  }
  
  // Screen shake effect for boss entrance
  screenShake = 15;
  
  // Add dramatic sound effect (if sound was implemented)
  // playSound("boss_appear");
}

// Create victory effect when boss is defeated
function createVictoryEffect() {
  // Create multiple explosions around the screen for victory effect
  for (let i = 0; i < 20; i++) {
    setTimeout(() => {
      // Only create effect if game is still in playing state
      if (gameState === GAME_PLAYING) {
        // Random position for explosion
        let x = random(width * 0.1, width * 0.9);
        let y = random(height * 0.1, height * 0.6);
        
        // Create temporary explosion
        let explosion = {
          pos: createVector(x, y),
          size: random(30, 80),
          alpha: 255,
          color: color(255, random(100, 200), 0),
          life: 30
        };
        
        // Add to temporary effects array (we'll need to create this)
        visualEffects.push(explosion);
        
        // Add screen shake
        screenShake = max(screenShake, 5);
      }
    }, i * 100); // Stagger explosions over time
  }
  
  // Show "BOSS DEFEATED" message
  let bossDefeatedMsg = {
    text: "BOSS DEFEATED!",
    pos: createVector(width/2, height/2),
    size: gameWidth * 0.08,
    alpha: 255,
    color: color(255, 200, 0),
    life: 120
  };
  
  textEffects.push(bossDefeatedMsg);
  
  // Show level up message
  let levelUpMsg = {
    text: "LEVEL UP!",
    pos: createVector(width/2, height/2 + 50),
    size: gameWidth * 0.06,
    alpha: 255,
    color: color(100, 255, 100),
    life: 120
  };
  
  textEffects.push(levelUpMsg);
}

// Update visual effects
function updateVisualEffects() {
  // Update explosions and other visual effects
  for (let i = visualEffects.length - 1; i >= 0; i--) {
    // Reduce life and alpha
    visualEffects[i].life--;
    visualEffects[i].alpha = map(visualEffects[i].life, 0, 30, 0, 255);
    
    // Remove expired effects
    if (visualEffects[i].life <= 0) {
      visualEffects.splice(i, 1);
    }
  }
  
  // Update text effects
  for (let i = textEffects.length - 1; i >= 0; i--) {
    // Reduce life and alpha
    textEffects[i].life--;
    textEffects[i].alpha = map(textEffects[i].life, 0, 120, 0, 255);
    
    // Float text upward
    textEffects[i].pos.y -= 0.5;
    
    // Remove expired effects
    if (textEffects[i].life <= 0) {
      textEffects.splice(i, 1);
    }
  }
}

// Draw visual effects
function drawVisualEffects() {
  // Draw explosions and other visual effects
  for (let effect of visualEffects) {
    noStroke();
    
    // Outer glow
    let outerColor = color(effect.color.levels[0], effect.color.levels[1], effect.color.levels[2], effect.alpha * 0.5);
    fill(outerColor);
    ellipse(effect.pos.x, effect.pos.y, effect.size * 1.5, effect.size * 1.5);
    
    // Inner explosion
    let innerColor = color(effect.color.levels[0], effect.color.levels[1], effect.color.levels[2], effect.alpha);
    fill(innerColor);
    ellipse(effect.pos.x, effect.pos.y, effect.size, effect.size);
    
    // Core
    fill(255, 255, 255, effect.alpha);
    ellipse(effect.pos.x, effect.pos.y, effect.size * 0.5, effect.size * 0.5);
  }
  
  // Draw text effects
  for (let effect of textEffects) {
    // Add glow effect
    drawingContext.shadowBlur = 10;
    drawingContext.shadowColor = color(effect.color.levels[0], effect.color.levels[1], effect.color.levels[2], effect.alpha * 0.7);
    
    // Draw text
    fill(effect.color.levels[0], effect.color.levels[1], effect.color.levels[2], effect.alpha);
    textSize(effect.size);
    text(effect.text, effect.pos.x, effect.pos.y);
    
    // Reset shadow
    drawingContext.shadowBlur = 0;
  }
}

// Create explosion effect at the given position
function createExplosion(x, y, size, color) {
  // Default values if not provided
  size = size || 30;
  color = color || color(255, 100, 0);
  
  // Create explosion effect
  let explosion = {
    pos: createVector(x, y),
    size: size,
    alpha: 255,
    color: color,
    life: 30
  };
  
  visualEffects.push(explosion);
  
  // Create smaller particle effects
  for (let i = 0; i < 5; i++) {
    let particle = {
      pos: createVector(
        x + random(-size/2, size/2),
        y + random(-size/2, size/2)
      ),
      size: size * random(0.2, 0.5),
      alpha: 255,
      color: color,
      life: random(15, 25)
    };
    
    visualEffects.push(particle);
  }
}

// Handle mouse clicks
function mousePressed() {
  console.log("Mouse pressed, game state:", gameState);
  
  // Start game from start screen
  if (gameState === GAME_START) {
    console.log("Mouse click detected on start screen, starting game");
    gameState = GAME_PLAYING;
    return false;
  }
  
  // Restart game from game over screen
  if (gameState === GAME_OVER && gameOverTimer > 90) {
    console.log("Mouse click detected on game over screen, restarting game");
    resetGame();
    gameState = GAME_PLAYING;
    return false;
  }
  
  // Handle clicks on the leaderboard screen
  if (gameState === LEADERBOARD_VIEW) {
    // The actual click handling is done in the drawButton function
    return false;
  }
  
  return false; // Prevent default behavior
}

// Draw a clickable button
function drawButton(buttonText, x, y, callback) {
  // Button dimensions
  let buttonWidth = gameWidth * 0.6;
  let buttonHeight = gameHeight * 0.06;
  
  // Check if mouse is over button
  let isHovering = mouseX > x - buttonWidth/2 && 
                   mouseX < x + buttonWidth/2 && 
                   mouseY > y - buttonHeight/2 && 
                   mouseY < y + buttonHeight/2;
  
  // Draw button background with hover effect
  noStroke();
  if (isHovering) {
    fill(80, 120, 255, 220); // Brighter when hovering
  } else {
    fill(60, 100, 200, 180);
  }
  rect(x - buttonWidth/2, y - buttonHeight/2, buttonWidth, buttonHeight, 10);
  
  // Draw button text
  fill(255);
  textSize(buttonHeight * 0.6);
  textAlign(CENTER, CENTER);
  // Make sure we're using a string
  text(String(buttonText), x, y);
  
  // Handle click
  if (isHovering && mouseIsPressed) {
    // Call the callback after a short delay to prevent double-clicks
    setTimeout(callback, 100);
  }
  
  return isHovering; // Return whether the mouse is hovering for additional logic
}

// Draw debug information
function drawDebugInfo() {
  push();
  fill(255, 255, 0);
  textAlign(LEFT, TOP);
  textSize(12);
  text(`FPS: ${Math.round(frameRate())}`, 10, 10);
  text(`Canvas: ${width} x ${height}`, 10, 25);
  text(`Game State: ${gameState}`, 10, 40);
  text(`Player: ${player ? 'Active' : 'Not created'}`, 10, 55);
  pop();
}

// Draw the leaderboard screen
function drawLeaderboardScreen() {
  // Draw the leaderboard screen if the function exists
  if (typeof drawLeaderboard === 'function') {
    drawLeaderboard();
  } else {
    // Fallback to game over screen if leaderboard functionality is not available
    gameState = GAME_OVER;
    drawGameOverScreen();
  }
} 