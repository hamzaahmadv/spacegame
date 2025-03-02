// Boss Enemy classes
// Special boss enemies that appear after completing certain levels

class Boss extends Enemy {
  constructor(x, y, level) {
    super(x, y);
    // Base boss properties
    this.level = level;
    this.maxHealth = 10 + (level * 5); // Health scales with level
    this.health = this.maxHealth;
    this.size = PLAYER_SIZE * 2.5 * (width / 400); // Bosses are much larger
    this.points = 1000 * level; // Points scale with level
    this.color = color(255, 50, 50);
    
    // Movement
    this.maxSpeed = 1.5 * (width / 400);
    this.phaseTimer = 0;
    this.currentPhase = 0;
    this.phaseDuration = 300; // 5 seconds per attack phase
    
    // Attack patterns
    this.attackCooldown = 0;
    this.attackRate = 60; // 1 second between attacks
    
    // Visual effects
    this.shieldPulse = 0;
    this.hitFlash = 0;
    
    // Entry animation
    this.entering = true;
    this.entryProgress = 0;
  }
  
  update() {
    // Entry animation
    if (this.entering) {
      this.entryProgress += 0.01;
      this.pos.y = map(this.entryProgress, 0, 1, -this.size, height * 0.2);
      
      if (this.entryProgress >= 1) {
        this.entering = false;
      }
      return;
    }
    
    // Update phase timer
    this.phaseTimer++;
    if (this.phaseTimer >= this.phaseDuration) {
      this.phaseTimer = 0;
      this.currentPhase = (this.currentPhase + 1) % 3; // Cycle through 3 attack phases
    }
    
    // Update attack cooldown
    if (this.attackCooldown > 0) {
      this.attackCooldown--;
    }
    
    // Update hit flash effect
    if (this.hitFlash > 0) {
      this.hitFlash--;
    }
    
    // Update shield pulse animation
    this.shieldPulse = (this.shieldPulse + 0.05) % TWO_PI;
    
    // Boss behavior depends on the current phase
    this.updatePhase();
  }
  
  // Override in subclasses for specific phase behaviors
  updatePhase() {
    // Default phase behavior
    switch (this.currentPhase) {
      case 0: // Move side to side
        this.moveSideToSide();
        break;
      case 1: // Chase player
        this.chasePlayer();
        break;
      case 2: // Hold position and attack
        this.holdPosition();
        break;
    }
    
    // Attack if cooldown is ready
    if (this.attackCooldown <= 0) {
      this.attack();
      this.attackCooldown = this.attackRate;
    }
  }
  
  // Movement patterns
  moveSideToSide() {
    // Move horizontally in a sine wave pattern
    this.vel.x = sin(frameCount * 0.02) * this.maxSpeed * 2;
    this.vel.y = sin(frameCount * 0.01) * this.maxSpeed * 0.5;
    this.pos.add(this.vel);
    
    // Keep within screen bounds
    this.pos.x = constrain(this.pos.x, this.size / 2, width - this.size / 2);
    this.pos.y = constrain(this.pos.y, this.size / 2, height * 0.4);
  }
  
  chasePlayer() {
    // Move toward player, but stay in top half of screen
    if (player) {
      let targetX = player.pos.x;
      let targetY = min(player.pos.y, height * 0.4);
      
      let direction = createVector(targetX - this.pos.x, targetY - this.pos.y);
      direction.normalize();
      direction.mult(this.maxSpeed);
      
      this.vel = direction;
      this.pos.add(this.vel);
    }
  }
  
  holdPosition() {
    // Stay relatively still, with slight movement
    this.vel.x = sin(frameCount * 0.05) * this.maxSpeed * 0.5;
    this.vel.y = cos(frameCount * 0.05) * this.maxSpeed * 0.3;
    this.pos.add(this.vel);
    
    // Keep within screen bounds
    this.pos.x = constrain(this.pos.x, this.size / 2, width - this.size / 2);
    this.pos.y = constrain(this.pos.y, this.size / 2, height * 0.3);
  }
  
  // Attack pattern - override in subclasses
  attack() {
    // Default attack: shoot bullets in a pattern
    if (this.currentPhase === 0) {
      // Spread shot
      for (let i = -2; i <= 2; i++) {
        let bullet = new EnemyBullet(this.pos.x, this.pos.y, i * 0.2);
        enemies.push(bullet);
      }
    } else if (this.currentPhase === 1) {
      // Aimed shot
      if (player) {
        let direction = createVector(player.pos.x - this.pos.x, player.pos.y - this.pos.y);
        direction.normalize();
        
        let bullet = new EnemyBullet(this.pos.x, this.pos.y, 0, direction);
        enemies.push(bullet);
      }
    } else {
      // Circle shot
      for (let i = 0; i < 8; i++) {
        let angle = i * TWO_PI / 8;
        let direction = createVector(cos(angle), sin(angle));
        let bullet = new EnemyBullet(this.pos.x, this.pos.y, 0, direction);
        enemies.push(bullet);
      }
    }
  }
  
  // Take damage and check if destroyed
  takeDamage(amount) {
    this.health -= amount;
    this.hitFlash = 10; // Visual feedback
    
    // Screen shake effect
    screenShake = 5;
    
    // Check if destroyed
    if (this.health <= 0) {
      return true;
    }
    return false;
  }
  
  display() {
    push();
    translate(this.pos.x, this.pos.y);
    
    // Hit flash effect
    if (this.hitFlash > 0) {
      stroke(255, 255, 255, this.hitFlash * 25);
      strokeWeight(4);
    } else {
      stroke(255);
      strokeWeight(2);
    }
    
    // Draw boss body - override in subclasses for specific appearances
    this.drawBody();
    
    // Draw health bar
    this.drawHealthBar();
    
    pop();
  }
  
  drawBody() {
    // Default boss appearance
    fill(this.color);
    
    // Main body
    ellipse(0, 0, this.size, this.size);
    
    // Shield effect
    noFill();
    stroke(255, 100, 100, 100 + sin(this.shieldPulse) * 50);
    strokeWeight(3);
    ellipse(0, 0, this.size * 1.1, this.size * 1.1);
  }
  
  drawHealthBar() {
    // Health bar above boss
    let barWidth = this.size * 1.2;
    let barHeight = this.size * 0.1;
    let healthPercent = this.health / this.maxHealth;
    
    // Bar background
    noStroke();
    fill(100, 100, 100, 150);
    rect(-barWidth / 2, -this.size * 0.7, barWidth, barHeight, barHeight / 2);
    
    // Health fill
    if (healthPercent > 0.6) {
      fill(100, 255, 100); // Green
    } else if (healthPercent > 0.3) {
      fill(255, 255, 100); // Yellow
    } else {
      fill(255, 100, 100); // Red
    }
    
    rect(-barWidth / 2, -this.size * 0.7, barWidth * healthPercent, barHeight, barHeight / 2);
  }
  
  // Override collision radius for more accurate hit detection
  getCollisionRadius() {
    return this.size * 0.4;
  }
  
  // Check if boss is off screen - bosses have different rules
  isOffScreen() {
    return (
      this.pos.x < -this.size * 2 ||
      this.pos.x > width + this.size * 2 ||
      this.pos.y > height + this.size * 2 ||
      this.pos.y < -this.size * 2
    );
  }
}

// Level 5 Boss: Destroyer
class DestroyerBoss extends Boss {
  constructor(x, y, level) {
    super(x, y, level);
    this.color = color(255, 50, 50);
    this.attackRate = 50; // Slightly faster attacks
    
    // Unique properties
    this.rotationAngle = 0;
    this.laserCharging = false;
    this.laserCharge = 0;
    this.laserWidth = 0;
  }
  
  updatePhase() {
    // Override phase behavior for this boss
    switch (this.currentPhase) {
      case 0: // Side to side with spread shots
        this.moveSideToSide();
        break;
      case 1: // Charge laser attack
        this.chargeLaser();
        break;
      case 2: // Summon minions
        this.holdPosition();
        break;
    }
    
    // Attack if cooldown is ready
    if (this.attackCooldown <= 0 && !this.laserCharging) {
      this.attack();
      this.attackCooldown = this.attackRate;
    }
    
    // Rotate constantly
    this.rotationAngle += 0.01;
  }
  
  chargeLaser() {
    // Hold position during laser charge
    this.holdPosition();
    
    // Charge laser
    if (!this.laserCharging && random() < 0.01) {
      this.laserCharging = true;
      this.laserCharge = 0;
    }
    
    if (this.laserCharging) {
      this.laserCharge += 0.02;
      
      // Fire laser when fully charged
      if (this.laserCharge >= 1) {
        this.fireLaser();
        this.laserCharging = false;
        this.attackCooldown = this.attackRate * 2; // Longer cooldown after laser
      }
    }
  }
  
  fireLaser() {
    // Create a wide laser beam that sweeps across the screen
    this.laserWidth = this.size * 0.3;
    
    // Screen shake effect
    screenShake = 15;
    
    // Check if player is hit by laser
    if (player) {
      // Laser extends from boss to bottom of screen
      let laserLeft = this.pos.x - this.laserWidth / 2;
      let laserRight = this.pos.x + this.laserWidth / 2;
      
      if (player.pos.x > laserLeft && player.pos.x < laserRight && player.pos.y > this.pos.y) {
        // Player is hit by laser
        if (player.isVulnerable()) {
          lives--;
          screenShake = 20;
          
          if (lives <= 0) {
            gameState = GAME_OVER;
            if (score > highScore) {
              highScore = score;
            }
          } else {
            player.setInvulnerable();
          }
        }
      }
    }
  }
  
  attack() {
    // Different attack patterns based on phase
    switch (this.currentPhase) {
      case 0:
        // Spread shot
        for (let i = -3; i <= 3; i++) {
          let bullet = new EnemyBullet(this.pos.x, this.pos.y, i * 0.15);
          enemies.push(bullet);
        }
        break;
      case 2:
        // Summon minions
        for (let i = 0; i < 2; i++) {
          let x = this.pos.x + random(-this.size, this.size);
          let y = this.pos.y + this.size / 2;
          enemies.push(new BasicEnemy(x, y));
        }
        
        // Also fire aimed shots
        if (player) {
          let direction = createVector(player.pos.x - this.pos.x, player.pos.y - this.pos.y);
          direction.normalize();
          
          let bullet = new EnemyBullet(this.pos.x, this.pos.y, 0, direction);
          enemies.push(bullet);
        }
        break;
    }
  }
  
  drawBody() {
    push();
    rotate(this.rotationAngle);
    
    // Main body
    fill(this.color);
    beginShape();
    for (let i = 0; i < 6; i++) {
      let angle = i * TWO_PI / 6;
      let x = cos(angle) * this.size / 2;
      let y = sin(angle) * this.size / 2;
      vertex(x, y);
    }
    endShape(CLOSE);
    
    // Inner core
    fill(255, 100, 100);
    ellipse(0, 0, this.size * 0.6, this.size * 0.6);
    
    // Weapon ports
    fill(200, 200, 200);
    for (let i = 0; i < 3; i++) {
      let angle = i * TWO_PI / 3;
      let x = cos(angle) * this.size * 0.4;
      let y = sin(angle) * this.size * 0.4;
      ellipse(x, y, this.size * 0.2, this.size * 0.2);
    }
    
    // Laser charging effect
    if (this.laserCharging) {
      let chargeSize = this.size * 0.3 * this.laserCharge;
      fill(255, 50, 50, 200);
      ellipse(0, 0, chargeSize, chargeSize);
      
      // Outer glow
      noFill();
      stroke(255, 50, 50, 100);
      strokeWeight(5 * this.laserCharge);
      ellipse(0, 0, this.size * 0.7, this.size * 0.7);
    }
    
    pop();
    
    // Draw laser beam if firing
    if (this.laserWidth > 0) {
      noStroke();
      fill(255, 50, 50, 200);
      rect(this.pos.x - this.laserWidth / 2, this.pos.y, this.laserWidth, height - this.pos.y);
      
      // Laser fades out
      this.laserWidth *= 0.9;
      if (this.laserWidth < 1) this.laserWidth = 0;
    }
    
    // Shield effect
    noFill();
    stroke(255, 100, 100, 100 + sin(this.shieldPulse) * 50);
    strokeWeight(3);
    ellipse(0, 0, this.size * 1.1, this.size * 1.1);
  }
}

// Level 10 Boss: Mothership
class MothershipBoss extends Boss {
  constructor(x, y, level) {
    super(x, y, level);
    this.color = color(100, 50, 255);
    this.size = PLAYER_SIZE * 3 * (width / 400); // Even larger
    this.attackRate = 40; // Faster attacks
    
    // Unique properties
    this.orbitAngle = 0;
    this.orbitSpeed = 0.02;
    this.orbitDistance = this.size * 0.7;
    this.orbitPoints = 4; // Number of orbiting weapons
    
    // Teleport ability
    this.canTeleport = true;
    this.teleportCooldown = 0;
    this.teleportRate = 180; // 3 seconds
    this.teleportFlash = 0;
  }
  
  updatePhase() {
    // Update orbit animation
    this.orbitAngle += this.orbitSpeed;
    
    // Update teleport cooldown
    if (this.teleportCooldown > 0) {
      this.teleportCooldown--;
    }
    
    // Update teleport flash effect
    if (this.teleportFlash > 0) {
      this.teleportFlash--;
    }
    
    // Override phase behavior for this boss
    switch (this.currentPhase) {
      case 0: // Slow movement with orbital attacks
        this.moveSideToSide();
        break;
      case 1: // Teleport and chase
        this.teleportPhase();
        break;
      case 2: // Rapid fire from orbit points
        this.holdPosition();
        break;
    }
    
    // Attack if cooldown is ready
    if (this.attackCooldown <= 0) {
      this.attack();
      this.attackCooldown = this.attackRate;
    }
  }
  
  teleportPhase() {
    // Occasionally teleport to a new position
    if (this.teleportCooldown <= 0 && random() < 0.02) {
      // Teleport to a random position in the top half of the screen
      this.pos.x = random(this.size, width - this.size);
      this.pos.y = random(this.size, height * 0.4);
      
      // Visual effect
      this.teleportFlash = 20;
      this.teleportCooldown = this.teleportRate;
      
      // Screen shake
      screenShake = 5;
    }
    
    // Otherwise move normally
    this.chasePlayer();
  }
  
  attack() {
    // Different attack patterns based on phase
    switch (this.currentPhase) {
      case 0:
        // Attack from orbit points
        for (let i = 0; i < this.orbitPoints; i++) {
          let angle = this.orbitAngle + (i * TWO_PI / this.orbitPoints);
          let orbitX = this.pos.x + cos(angle) * this.orbitDistance;
          let orbitY = this.pos.y + sin(angle) * this.orbitDistance;
          
          // Fire in the direction of orbit rotation
          let direction = createVector(cos(angle + PI/2), sin(angle + PI/2));
          let bullet = new EnemyBullet(orbitX, orbitY, 0, direction);
          enemies.push(bullet);
        }
        break;
      case 1:
        // Teleport attack - burst of bullets in all directions
        if (this.teleportFlash > 0) {
          for (let i = 0; i < 12; i++) {
            let angle = i * TWO_PI / 12;
            let direction = createVector(cos(angle), sin(angle));
            let bullet = new EnemyBullet(this.pos.x, this.pos.y, 0, direction);
            enemies.push(bullet);
          }
        }
        break;
      case 2:
        // Rapid fire from all orbit points toward player
        if (player) {
          for (let i = 0; i < this.orbitPoints; i++) {
            let angle = this.orbitAngle + (i * TWO_PI / this.orbitPoints);
            let orbitX = this.pos.x + cos(angle) * this.orbitDistance;
            let orbitY = this.pos.y + sin(angle) * this.orbitDistance;
            
            let direction = createVector(player.pos.x - orbitX, player.pos.y - orbitY);
            direction.normalize();
            
            let bullet = new EnemyBullet(orbitX, orbitY, 0, direction);
            enemies.push(bullet);
          }
        }
        break;
    }
  }
  
  drawBody() {
    // Main body
    fill(this.color);
    ellipse(0, 0, this.size, this.size);
    
    // Teleport flash effect
    if (this.teleportFlash > 0) {
      noFill();
      stroke(255, 255, 255, this.teleportFlash * 12);
      strokeWeight(this.teleportFlash / 2);
      ellipse(0, 0, this.size * 1.5, this.size * 1.5);
    }
    
    // Core
    fill(150, 100, 255);
    ellipse(0, 0, this.size * 0.6, this.size * 0.6);
    
    // Draw orbiting weapon points
    for (let i = 0; i < this.orbitPoints; i++) {
      let angle = this.orbitAngle + (i * TWO_PI / this.orbitPoints);
      let orbitX = cos(angle) * this.orbitDistance;
      let orbitY = sin(angle) * this.orbitDistance;
      
      // Weapon pod
      fill(200, 200, 255);
      ellipse(orbitX, orbitY, this.size * 0.25, this.size * 0.25);
      
      // Energy connection to core
      stroke(150, 100, 255, 150);
      strokeWeight(3);
      line(0, 0, orbitX, orbitY);
    }
    
    // Shield effect
    noFill();
    stroke(150, 100, 255, 100 + sin(this.shieldPulse) * 50);
    strokeWeight(3);
    ellipse(0, 0, this.size * 1.1, this.size * 1.1);
  }
}

// Enemy Bullet class
class EnemyBullet extends Enemy {
  constructor(x, y, angleOffset = 0, direction = null) {
    super(x, y);
    
    // Set direction based on parameters or default downward
    if (direction) {
      this.vel = direction.copy();
    } else {
      this.vel = createVector(sin(angleOffset), 1);
    }
    
    // Scale speed based on screen width
    this.vel.mult(3 * (width / 400));
    
    // Visual properties
    this.size = 10 * (width / 400);
    this.color = color(255, 100, 50);
    this.points = 0; // No points for destroying bullets
    this.pulsePhase = random(TWO_PI);
    this.age = 0;
  }
  
  update() {
    // Move bullet
    this.pos.add(this.vel);
    
    // Update age for animation
    this.age++;
  }
  
  display() {
    push();
    translate(this.pos.x, this.pos.y);
    
    // Pulse animation
    let pulse = sin(this.age * 0.2 + this.pulsePhase) * 0.2 + 1;
    
    // Glow
    noStroke();
    fill(255, 100, 50, 100);
    ellipse(0, 0, this.size * 1.5 * pulse, this.size * 1.5 * pulse);
    
    // Core
    fill(this.color);
    ellipse(0, 0, this.size * pulse, this.size * pulse);
    
    pop();
  }
  
  // Override collision radius for more accurate hit detection
  getCollisionRadius() {
    return this.size * 0.4;
  }
} 