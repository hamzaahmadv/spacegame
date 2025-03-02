// Enemy classes
// Different enemy types with unique movement patterns and behaviors

// Base Enemy class
class Enemy {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = createVector(0, 0);
    this.acc = createVector(0, 0);
    this.size = 30;
    this.health = 1;
    this.points = 100;
    this.color = color(255, 50, 50); // Brighter red
    this.animationOffset = random(TWO_PI);
  }
  
  // Update position (to be overridden by subclasses)
  update() {
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.acc.mult(0);
  }
  
  // Draw the enemy (to be overridden by subclasses)
  display() {
    push();
    translate(this.pos.x, this.pos.y);
    
    // Default enemy appearance
    fill(this.color);
    stroke(255);
    strokeWeight(2);
    ellipse(0, 0, this.size, this.size);
    
    pop();
  }
  
  // Check if enemy is off screen
  isOffScreen() {
    return (
      this.pos.x < -this.size ||
      this.pos.x > width + this.size ||
      this.pos.y > height + this.size
    );
  }
  
  // Check collision with player
  hits(player) {
    let d = dist(this.pos.x, this.pos.y, player.pos.x, player.pos.y);
    return d < this.getCollisionRadius() + player.getCollisionRadius();
  }
  
  // Get collision radius for hit detection
  getCollisionRadius() {
    return this.size / 2;
  }
}

// Basic Enemy - moves straight down with slight wobble
class BasicEnemy extends Enemy {
  constructor(x, y) {
    super(x, y);
    // Adjust speed for vertical phone layout
    this.vel = createVector(0, random(1.5, 3) * (width / 400)); // Scale speed based on screen width
    this.wobbleAmount = random(0.5, 1.5) * (width / 400);
    this.wobbleSpeed = random(0.05, 0.1);
    this.color = color(255, 60, 60); // Brighter red
    this.points = 100;
    // Scale size based on screen width
    this.size = PLAYER_SIZE * 0.9 * (width / 400);
  }
  
  update() {
    // Add wobble to movement
    this.vel.x = sin(frameCount * this.wobbleSpeed + this.animationOffset) * this.wobbleAmount;
    
    // Update position
    super.update();
  }
  
  display() {
    push();
    translate(this.pos.x, this.pos.y);
    
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
    
    // Engine glow
    noStroke();
    fill(255, 100, 0, 150);
    ellipse(-this.size / 4, this.size / 3, this.size / 3, this.size / 5);
    ellipse(this.size / 4, this.size / 3, this.size / 3, this.size / 5);
    
    // Cockpit - make it more menacing with red glow
    fill(255, 0, 0, 200);
    ellipse(0, 0, this.size / 2, this.size / 2);
    
    // Add danger markings
    stroke(255, 255, 0);
    strokeWeight(1);
    line(-this.size / 4, -this.size / 6, this.size / 4, -this.size / 6);
    
    pop();
  }
}

// Zigzag Enemy - moves in a zigzag pattern
class ZigzagEnemy extends Enemy {
  constructor(x, y) {
    super(x, y);
    // Adjust speed for vertical phone layout
    this.baseSpeed = random(2, 3) * (width / 400);
    this.zigzagTimer = 0;
    this.zigzagPeriod = random(30, 60);
    this.zigzagDirection = random() > 0.5 ? 1 : -1;
    this.color = color(255, 120, 0); // Orange color
    // Scale size based on screen width
    this.size = PLAYER_SIZE * 0.8 * (width / 400);
    this.points = 150;
  }
  
  update() {
    // Zigzag movement pattern
    this.zigzagTimer++;
    if (this.zigzagTimer > this.zigzagPeriod) {
      this.zigzagDirection *= -1;
      this.zigzagTimer = 0;
    }
    
    // Set velocity based on zigzag pattern
    this.vel.x = this.zigzagDirection * this.baseSpeed;
    this.vel.y = this.baseSpeed * 0.8;
    
    // Update position
    super.update();
    
    // Keep within screen bounds horizontally
    if (this.pos.x < this.size / 2) {
      this.pos.x = this.size / 2;
      this.zigzagDirection = 1;
    } else if (this.pos.x > width - this.size / 2) {
      this.pos.x = width - this.size / 2;
      this.zigzagDirection = -1;
    }
  }
  
  display() {
    push();
    translate(this.pos.x, this.pos.y);
    rotate(sin(frameCount * 0.1) * 0.2); // Slight rocking motion
    
    // Body
    fill(this.color);
    stroke(255);
    strokeWeight(2);
    
    // Draw diamond-shaped ship
    beginShape();
    vertex(0, -this.size / 2);
    vertex(-this.size / 2, 0);
    vertex(0, this.size / 2);
    vertex(this.size / 2, 0);
    endShape(CLOSE);
    
    // Wing details
    line(-this.size / 2, 0, -this.size / 3, -this.size / 3);
    line(-this.size / 2, 0, -this.size / 3, this.size / 3);
    line(this.size / 2, 0, this.size / 3, -this.size / 3);
    line(this.size / 2, 0, this.size / 3, this.size / 3);
    
    // Cockpit - make it more menacing with orange/red glow
    noStroke();
    fill(255, 80, 0, 200);
    ellipse(0, 0, this.size / 2, this.size / 2);
    
    // Engine glow
    fill(255, 150, 0, 100 + sin(frameCount * 0.2) * 50);
    ellipse(-this.size / 3, 0, this.size / 4, this.size / 4);
    ellipse(this.size / 3, 0, this.size / 4, this.size / 4);
    
    // Add danger markings
    stroke(255, 255, 0);
    strokeWeight(1);
    line(-this.size / 4, 0, this.size / 4, 0);
    
    pop();
  }
}

// Hunter Enemy - follows the player
class HunterEnemy extends Enemy {
  constructor(x, y) {
    super(x, y);
    // Adjust speed for vertical phone layout
    this.maxSpeed = random(1.5, 2.5) * (width / 400);
    this.acceleration = 0.1 * (width / 400);
    this.color = color(200, 0, 0); // Deep red color
    // Scale size based on screen width
    this.size = PLAYER_SIZE * 1.1 * (width / 400);
    this.rotationAngle = 0;
    this.points = 200;
    this.pulseTimer = 0;
  }
  
  update() {
    // Target the player
    if (player) {
      let targetDirection = createVector(player.pos.x - this.pos.x, player.pos.y - this.pos.y);
      targetDirection.normalize();
      targetDirection.mult(this.acceleration);
      
      this.acc.add(targetDirection);
    }
    
    // Limit speed
    this.vel.add(this.acc);
    this.vel.limit(this.maxSpeed);
    this.pos.add(this.vel);
    this.acc.mult(0);
    
    // Calculate rotation angle based on velocity
    this.rotationAngle = atan2(this.vel.y, this.vel.x) + PI/2;
    
    // Pulse effect timer
    this.pulseTimer = (this.pulseTimer + 0.05) % TWO_PI;
  }
  
  display() {
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.rotationAngle);
    
    // Pulsing effect
    let pulseSize = this.size * (1 + sin(this.pulseTimer) * 0.1);
    
    // Body
    fill(this.color);
    stroke(255);
    strokeWeight(2);
    
    // Draw octagonal ship
    beginShape();
    for (let i = 0; i < 8; i++) {
      let angle = i * TWO_PI / 8;
      let x = cos(angle) * pulseSize / 2;
      let y = sin(angle) * pulseSize / 2;
      vertex(x, y);
    }
    endShape(CLOSE);
    
    // Add danger markings - warning stripes
    stroke(255, 255, 0);
    strokeWeight(1);
    for (let i = -1; i <= 1; i += 2) {
      line(i * pulseSize / 4, -pulseSize / 4, i * pulseSize / 4, pulseSize / 4);
    }
    
    // Center core - make it more menacing with red glow
    noStroke();
    fill(255, 0, 0, 150 + sin(this.pulseTimer * 2) * 50);
    ellipse(0, 0, pulseSize / 2, pulseSize / 2);
    
    // Add pulsing red glow
    fill(255, 0, 0, 50 + sin(this.pulseTimer * 3) * 30);
    ellipse(0, 0, pulseSize * 0.8, pulseSize * 0.8);
    
    pop();
  }
  
  getCollisionRadius() {
    return this.size * 0.4; // Slightly smaller collision radius than visual size
  }
} 