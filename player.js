// Player class
// Handles player ship movement, shooting, and power-ups

class Player {
  constructor() {
    // Position and movement
    this.pos = createVector(width / 2, height * 0.8); // Position player lower in the screen
    this.vel = createVector(0, 0);
    this.acc = createVector(0, 0);
    this.size = PLAYER_SIZE;
    this.maxSpeed = 7;
    this.friction = 0.9;
    
    // Touch control movement
    this.touchDirectionX = 0;
    this.touchDirectionY = 0;
    
    // Shooting
    this.cooldown = 0;
    this.cooldownTime = 15; // Frames between shots
    
    // Visual
    this.color = color(100, 200, 255);
    this.thrusterAnimation = 0;
    this.engineGlow = 0;
    
    // State
    this.invulnerable = false;
    this.invulnerableTimer = 0;
    this.invulnerableDuration = 90; // 1.5 seconds at 60fps
    
    // Power-ups
    this.powerUpActive = false;
    this.powerUpType = null;
    this.powerUpTimer = 0;
    this.powerUpDuration = 300; // 5 seconds at 60fps
  }
  
  // Update player state
  update() {
    // Handle input
    this.handleInput();
    
    // Apply physics
    if (isMobileDevice()) {
      // Direct movement for touch controls
      this.vel.x = this.touchDirectionX * this.maxSpeed;
      this.vel.y = this.touchDirectionY * this.maxSpeed;
    } else {
      // Physics-based movement for keyboard
      this.vel.add(this.acc);
      this.vel.mult(this.friction);
      this.vel.limit(this.maxSpeed);
    }
    
    this.pos.add(this.vel);
    this.acc.mult(0);
    
    // Keep player on screen
    this.pos.x = constrain(this.pos.x, this.size / 2, width - this.size / 2);
    this.pos.y = constrain(this.pos.y, uiHeight + this.size / 2, height - this.size / 2);
    
    // Update cooldown
    if (this.cooldown > 0) {
      this.cooldown--;
    }
    
    // Update invulnerability
    if (this.invulnerable) {
      this.invulnerableTimer--;
      if (this.invulnerableTimer <= 0) {
        this.invulnerable = false;
      }
    }
    
    // Update power-up timer
    if (this.powerUpActive) {
      this.powerUpTimer--;
      if (this.powerUpTimer <= 0) {
        this.powerUpActive = false;
        this.powerUpType = null;
        this.cooldownTime = 15; // Reset to default
      }
    }
    
    // Animate thruster
    this.thrusterAnimation = (this.thrusterAnimation + 0.4) % 6;
    
    // Engine glow animation
    this.engineGlow = (this.engineGlow + 0.05) % TWO_PI;
  }
  
  // Handle keyboard input
  handleInput() {
    // Reset acceleration
    this.acc.mult(0);
    
    // WASD or Arrow keys
    if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) { // Left or A
      this.acc.x -= 0.5;
    }
    if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) { // Right or D
      this.acc.x += 0.5;
    }
    if (keyIsDown(UP_ARROW) || keyIsDown(87)) { // Up or W
      this.acc.y -= 0.5;
    }
    if (keyIsDown(DOWN_ARROW) || keyIsDown(83)) { // Down or S
      this.acc.y += 0.5;
    }
    
    // Auto-fire if space is held down
    if (keyIsDown(32) && this.cooldown <= 0) { // Space
      this.shoot();
    }
  }
  
  // Set movement direction for touch controls
  setMovement(x, y) {
    this.touchDirectionX = x;
    this.touchDirectionY = y;
  }
  
  // Draw the player ship
  display() {
    push();
    translate(this.pos.x, this.pos.y);
    
    // Draw engine glow
    this.drawEngineGlow();
    
    // Draw thruster flame
    this.drawThruster();
    
    // Draw ship body
    if (this.invulnerable) {
      // Blink when invulnerable
      if (frameCount % 6 < 3) {
        this.drawShip();
      }
      // Draw shield flash effect when invulnerable
      this.drawInvulnerableShield();
    } else {
      this.drawShip();
    }
    
    // Draw shield if active
    if (this.powerUpActive && this.powerUpType === 'shield') {
      this.drawShield();
    }
    
    pop();
  }
  
  // Draw engine glow effect
  drawEngineGlow() {
    // Only show engine glow when moving
    if (this.vel.mag() > 0.2) {
      let glowSize = this.size * (0.8 + sin(this.engineGlow) * 0.2);
      let glowAlpha = 100 + sin(this.engineGlow) * 20;
      
      noStroke();
      fill(50, 100, 255, glowAlpha);
      ellipse(0, this.size / 4, glowSize, glowSize * 0.7);
    }
  }
  
  // Draw the ship body
  drawShip() {
    // Main body
    fill(this.color);
    stroke(255);
    strokeWeight(2);
    
    // Ship body
    beginShape();
    vertex(0, -this.size / 2);
    vertex(-this.size / 3, this.size / 4);
    vertex(-this.size / 5, this.size / 6);
    vertex(-this.size / 5, this.size / 2);
    vertex(this.size / 5, this.size / 2);
    vertex(this.size / 5, this.size / 6);
    vertex(this.size / 3, this.size / 4);
    endShape(CLOSE);
    
    // Cockpit
    fill(50, 150, 255, 200);
    noStroke();
    ellipse(0, -this.size / 6, this.size / 3, this.size / 4);
    
    // Wing details
    stroke(255);
    strokeWeight(1);
    line(-this.size / 3, this.size / 4, -this.size / 5, -this.size / 6);
    line(this.size / 3, this.size / 4, this.size / 5, -this.size / 6);
    
    // Add some details to make the ship look more polished
    // Wing lights
    noStroke();
    fill(255, 100, 100, 200);
    ellipse(-this.size / 3, this.size / 4, this.size / 10, this.size / 10);
    ellipse(this.size / 3, this.size / 4, this.size / 10, this.size / 10);
    
    // Cockpit highlight
    fill(255, 255, 255, 100);
    ellipse(-this.size / 12, -this.size / 6 - this.size / 12, this.size / 10, this.size / 10);
  }
  
  // Draw thruster flame animation
  drawThruster() {
    // Only show thruster when moving
    if (this.vel.mag() > 0.5) {
      noStroke();
      
      // Outer flame
      fill(255, 100, 0, 150);
      beginShape();
      vertex(-this.size / 5, this.size / 2);
      vertex(0, this.size / 2 + 10 + sin(this.thrusterAnimation) * 5);
      vertex(this.size / 5, this.size / 2);
      endShape(CLOSE);
      
      // Inner flame
      fill(255, 200, 0, 200);
      beginShape();
      vertex(-this.size / 10, this.size / 2);
      vertex(0, this.size / 2 + 5 + sin(this.thrusterAnimation + 1) * 3);
      vertex(this.size / 10, this.size / 2);
      endShape(CLOSE);
      
      // Thruster base
      fill(200, 200, 200);
      rect(-this.size / 6, this.size / 2 - 2, this.size / 3, 4, 2);
    }
  }
  
  // Draw shield effect
  drawShield() {
    noFill();
    stroke(0, 200, 255, 150 + sin(frameCount * 0.1) * 50);
    strokeWeight(3);
    ellipse(0, 0, this.size * 1.5, this.size * 1.5);
    
    // Inner glow
    stroke(0, 200, 255, 50);
    strokeWeight(8);
    ellipse(0, 0, this.size * 1.3, this.size * 1.3);
    
    // Shield particles
    noStroke();
    fill(0, 200, 255, 150);
    for (let i = 0; i < 8; i++) {
      let angle = frameCount * 0.05 + i * PI / 4;
      let x = cos(angle) * this.size * 0.7;
      let y = sin(angle) * this.size * 0.7;
      let particleSize = 2 + sin(frameCount * 0.1 + i) * 1;
      ellipse(x, y, particleSize, particleSize);
    }
  }
  
  // Draw invulnerability shield flash effect
  drawInvulnerableShield() {
    noFill();
    let flashIntensity = map(this.invulnerableTimer, 0, this.invulnerableDuration, 0, 255);
    stroke(255, 255, 255, flashIntensity);
    strokeWeight(2);
    
    // Draw ripple effect
    let rippleSize = map(this.invulnerableTimer, 0, this.invulnerableDuration, this.size * 2, this.size);
    ellipse(0, 0, rippleSize, rippleSize);
    
    // Second ripple
    stroke(255, 255, 255, flashIntensity * 0.5);
    ellipse(0, 0, rippleSize * 1.2, rippleSize * 1.2);
  }
  
  // Fire a bullet
  shoot() {
    // Don't shoot if on cooldown
    if (this.cooldown > 0) return;
    
    // Create bullet(s) based on power-up status
    if (this.powerUpActive && this.powerUpType === 'multiShot') {
      // Triple shot
      bullets.push(new Bullet(this.pos.x, this.pos.y, 0));
      bullets.push(new Bullet(this.pos.x, this.pos.y, -0.3));
      bullets.push(new Bullet(this.pos.x, this.pos.y, 0.3));
    } else {
      // Single shot
      bullets.push(new Bullet(this.pos.x, this.pos.y, 0));
    }
    
    // Reset cooldown
    this.cooldown = this.cooldownTime;
  }
  
  // Set player invulnerable after taking damage
  setInvulnerable() {
    this.invulnerable = true;
    this.invulnerableTimer = this.invulnerableDuration;
  }
  
  // Check if player is vulnerable to damage
  isVulnerable() {
    return !this.invulnerable && !(this.powerUpActive && this.powerUpType === 'shield');
  }
  
  // Apply power-up effect
  applyPowerUp(type) {
    this.powerUpActive = true;
    this.powerUpType = type;
    this.powerUpTimer = this.powerUpDuration;
    
    // Apply specific power-up effects
    switch (type) {
      case 'rapidFire':
        this.cooldownTime = 5; // Faster firing rate
        break;
      case 'shield':
        // Shield effect is visual and handled in isVulnerable()
        break;
      case 'multiShot':
        // Multi-shot is handled in shoot()
        break;
    }
  }
  
  // Get collision radius for hit detection
  getCollisionRadius() {
    // If shield is active, use larger radius
    if (this.powerUpActive && this.powerUpType === 'shield') {
      return this.size * 0.75;
    }
    return this.size / 2;
  }
} 