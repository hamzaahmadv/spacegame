// Smart Enemy classes
// Advanced AI enemies with more complex behaviors

// Dodger Enemy - actively avoids player bullets
class DodgerEnemy extends Enemy {
  constructor(x, y) {
    super(x, y);
    // Adjust speed for vertical phone layout
    this.maxSpeed = random(2, 3) * (width / 400);
    this.baseSpeed = random(1, 1.5) * (width / 400);
    this.color = color(0, 200, 150);
    // Scale size based on screen width
    this.size = PLAYER_SIZE * 0.8 * (width / 400);
    this.points = 250;
    this.dodgeDistance = 100 * (width / 400); // Distance at which to start dodging
    this.dodgeDirection = 0;
    this.dodging = false;
    this.dodgeCooldown = 0;
    this.rotationAngle = 0;
  }
  
  update() {
    // Base movement - move downward with slight horizontal drift
    this.vel.y = this.baseSpeed;
    this.vel.x = sin(frameCount * 0.05) * this.baseSpeed * 0.3;
    
    // Check for nearby bullets to dodge
    this.checkForBullets();
    
    // Apply dodge movement if active
    if (this.dodging) {
      this.vel.x = this.dodgeDirection * this.maxSpeed;
      this.dodgeCooldown--;
      
      if (this.dodgeCooldown <= 0) {
        this.dodging = false;
      }
    }
    
    // Update position
    this.pos.add(this.vel);
    
    // Keep within screen bounds
    if (this.pos.x < this.size / 2) {
      this.pos.x = this.size / 2;
      this.dodgeDirection = 1; // Reverse dodge direction if hitting edge
    } else if (this.pos.x > width - this.size / 2) {
      this.pos.x = width - this.size / 2;
      this.dodgeDirection = -1; // Reverse dodge direction if hitting edge
    }
    
    // Update rotation based on movement
    this.rotationAngle = atan2(this.vel.y, this.vel.x) + PI/2;
  }
  
  checkForBullets() {
    // Only dodge if not already dodging
    if (!this.dodging) {
      // Check all player bullets
      for (let bullet of bullets) {
        // Calculate distance to bullet
        let d = dist(this.pos.x, this.pos.y, bullet.pos.x, bullet.pos.y);
        
        // Only dodge bullets that are approaching
        if (d < this.dodgeDistance && bullet.pos.y > this.pos.y - this.size) {
          // Determine dodge direction (away from bullet)
          this.dodgeDirection = (bullet.pos.x > this.pos.x) ? -1 : 1;
          this.dodging = true;
          this.dodgeCooldown = 20; // Dodge for 20 frames
          break;
        }
      }
    }
  }
  
  display() {
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.rotationAngle);
    
    // Body
    fill(this.color);
    stroke(255);
    strokeWeight(2);
    
    // Draw streamlined ship
    beginShape();
    vertex(0, -this.size / 2);
    vertex(-this.size / 3, this.size / 6);
    vertex(-this.size / 5, this.size / 2);
    vertex(this.size / 5, this.size / 2);
    vertex(this.size / 3, this.size / 6);
    endShape(CLOSE);
    
    // Cockpit
    fill(0, 255, 200, 150);
    noStroke();
    ellipse(0, -this.size / 6, this.size / 3, this.size / 4);
    
    // Thrusters
    if (this.dodging) {
      // Bright thrusters when dodging
      fill(255, 150, 0, 200);
      let thrusterSize = this.size / 4 + sin(frameCount * 0.5) * this.size / 10;
      ellipse(-this.size / 6, this.size / 3, thrusterSize, thrusterSize);
      ellipse(this.size / 6, this.size / 3, thrusterSize, thrusterSize);
    } else {
      // Normal thrusters
      fill(255, 100, 0, 150);
      ellipse(-this.size / 6, this.size / 3, this.size / 6, this.size / 6);
      ellipse(this.size / 6, this.size / 3, this.size / 6, this.size / 6);
    }
    
    pop();
  }
}

// Formation Enemy - part of a coordinated group
class FormationEnemy extends Enemy {
  constructor(x, y, formationIndex, formationSize) {
    super(x, y);
    // Formation properties
    this.formationIndex = formationIndex;
    this.formationSize = formationSize;
    this.formationOffset = (formationIndex - (formationSize - 1) / 2) * 40 * (width / 400);
    this.formationPhase = formationIndex * 0.5; // Phase offset for movement
    
    // Visual properties
    this.color = color(200, 100, 255);
    this.size = PLAYER_SIZE * 0.7 * (width / 400);
    this.points = 150;
    
    // Movement
    this.baseSpeed = 1.5 * (width / 400);
    this.waveAmplitude = 80 * (width / 400);
    this.waveFrequency = 0.02;
    
    // Attack
    this.canShoot = formationIndex % 2 === 0; // Only some formation members shoot
    this.shootCooldown = 0;
    this.shootRate = 120 + formationIndex * 10; // Staggered shooting
  }
  
  update() {
    // Formation wave movement
    let targetX = width / 2 + sin(frameCount * this.waveFrequency + this.formationPhase) * this.waveAmplitude;
    targetX += this.formationOffset;
    
    // Move toward target X position
    let dx = targetX - this.pos.x;
    this.vel.x = dx * 0.1;
    
    // Move downward at constant speed
    this.vel.y = this.baseSpeed;
    
    // Update position
    this.pos.add(this.vel);
    
    // Update shoot cooldown
    if (this.canShoot) {
      if (this.shootCooldown > 0) {
        this.shootCooldown--;
      } else {
        // Shoot if player is roughly below
        if (player && abs(player.pos.x - this.pos.x) < 100 * (width / 400)) {
          this.shoot();
          this.shootCooldown = this.shootRate;
        }
      }
    }
  }
  
  shoot() {
    // Create a bullet aimed at player
    if (player) {
      let direction = createVector(player.pos.x - this.pos.x, player.pos.y - this.pos.y);
      direction.normalize();
      
      let bullet = new EnemyBullet(this.pos.x, this.pos.y, 0, direction);
      enemies.push(bullet);
    }
  }
  
  display() {
    push();
    translate(this.pos.x, this.pos.y);
    
    // Body
    fill(this.color);
    stroke(255);
    strokeWeight(2);
    
    // Draw hexagonal ship
    beginShape();
    for (let i = 0; i < 6; i++) {
      let angle = i * TWO_PI / 6;
      let x = cos(angle) * this.size / 2;
      let y = sin(angle) * this.size / 2;
      vertex(x, y);
    }
    endShape(CLOSE);
    
    // Formation indicator
    noStroke();
    fill(255, 255, 255, 150);
    ellipse(0, 0, this.size * 0.3, this.size * 0.3);
    
    // Connection lines to adjacent formation members
    stroke(200, 100, 255, 100);
    strokeWeight(1);
    
    // Find adjacent formation members
    for (let enemy of enemies) {
      if (enemy instanceof FormationEnemy && enemy !== this) {
        // Check if adjacent in formation
        if (abs(enemy.formationIndex - this.formationIndex) === 1) {
          // Draw connection line
          let dx = enemy.pos.x - this.pos.x;
          let dy = enemy.pos.y - this.pos.y;
          line(0, 0, dx, dy);
        }
      }
    }
    
    // Weapon indicator if can shoot
    if (this.canShoot) {
      fill(255, 100, 100);
      ellipse(0, this.size * 0.3, this.size * 0.2, this.size * 0.2);
    }
    
    pop();
  }
}

// Kamikaze Enemy - accelerates toward player when close
class KamikazeEnemy extends Enemy {
  constructor(x, y) {
    super(x, y);
    // Movement properties
    this.maxSpeed = 2 * (width / 400);
    this.chargeSpeed = 8 * (width / 400);
    this.acceleration = 0.2 * (width / 400);
    this.chargeDistance = 150 * (width / 400); // Distance to start charging
    this.charging = false;
    
    // Visual properties
    this.color = color(255, 50, 0);
    this.size = PLAYER_SIZE * 0.9 * (width / 400);
    this.points = 300;
    this.rotationAngle = 0;
    this.pulseTimer = 0;
    this.chargeEffect = 0;
  }
  
  update() {
    // Update pulse animation
    this.pulseTimer = (this.pulseTimer + 0.1) % TWO_PI;
    
    // Check if player is within charge distance
    if (player && !this.charging) {
      let d = dist(this.pos.x, this.pos.y, player.pos.x, player.pos.y);
      if (d < this.chargeDistance) {
        this.charging = true;
        // Screen shake when enemy starts charging
        screenShake = 3;
      }
    }
    
    if (this.charging) {
      // Charge directly at player
      if (player) {
        let direction = createVector(player.pos.x - this.pos.x, player.pos.y - this.pos.y);
        direction.normalize();
        direction.mult(this.acceleration * 2);
        
        this.vel.add(direction);
        this.vel.limit(this.chargeSpeed);
        
        // Increase charge effect
        this.chargeEffect = min(1, this.chargeEffect + 0.05);
      }
    } else {
      // Normal movement - downward with slight tracking
      this.vel.y = this.maxSpeed * 0.8;
      
      if (player) {
        // Slight horizontal movement toward player
        if (player.pos.x < this.pos.x) {
          this.vel.x = -this.maxSpeed * 0.3;
        } else {
          this.vel.x = this.maxSpeed * 0.3;
        }
      }
    }
    
    // Update position
    this.pos.add(this.vel);
    
    // Calculate rotation angle based on velocity
    this.rotationAngle = atan2(this.vel.y, this.vel.x) + PI/2;
  }
  
  display() {
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.rotationAngle);
    
    // Charge effect
    if (this.charging) {
      // Flame trail
      noStroke();
      for (let i = 0; i < 5; i++) {
        let trailSize = this.size * (0.8 - i * 0.15) * this.chargeEffect;
        let alpha = 200 * (1 - i * 0.2) * this.chargeEffect;
        fill(255, 100 + i * 30, 0, alpha);
        ellipse(0, this.size * (0.5 + i * 0.2), trailSize, trailSize * 1.5);
      }
    }
    
    // Body
    fill(this.color);
    stroke(255);
    strokeWeight(2);
    
    // Draw triangular ship
    beginShape();
    vertex(0, -this.size / 2);
    vertex(-this.size / 2, this.size / 2);
    vertex(this.size / 2, this.size / 2);
    endShape(CLOSE);
    
    // Pulsing core when not charging
    if (!this.charging) {
      let pulseSize = this.size * 0.3 * (0.8 + sin(this.pulseTimer) * 0.2);
      noStroke();
      fill(255, 150, 0, 150);
      ellipse(0, 0, pulseSize, pulseSize);
    } else {
      // Bright core when charging
      noStroke();
      fill(255, 255, 0, 200);
      ellipse(0, 0, this.size * 0.4, this.size * 0.4);
    }
    
    pop();
  }
  
  // Override collision to cause more damage when charging
  hits(player) {
    let d = dist(this.pos.x, this.pos.y, player.pos.x, player.pos.y);
    let hit = d < this.getCollisionRadius() + player.getCollisionRadius();
    
    // If charging and hits player, cause screen shake
    if (hit && this.charging) {
      screenShake = 15;
    }
    
    return hit;
  }
}

// Create a formation of enemies
function createFormation(y, size) {
  for (let i = 0; i < size; i++) {
    // Calculate x position based on formation size
    let x = width / 2 + (i - (size - 1) / 2) * 40 * (width / 400);
    enemies.push(new FormationEnemy(x, y, i, size));
  }
} 