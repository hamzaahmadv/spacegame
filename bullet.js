// Bullet class
// Handles bullet movement and collision detection

class Bullet {
  constructor(x, y, angleOffset = 0) {
    this.pos = createVector(x, y - 10); // Start slightly above the player
    this.vel = createVector(sin(angleOffset) * 2, -BULLET_SPEED); // Move upward with optional angle
    // Scale size based on screen width
    this.size = 6 * (width / 400);
    this.color = color(50, 200, 255);
    this.trail = []; // Store previous positions for trail effect
    this.maxTrailLength = 5;
    this.age = 0;
    this.pulsePhase = random(TWO_PI); // Random starting phase for pulse animation
  }
  
  // Update bullet position
  update() {
    // Store current position for trail
    if (this.trail.length >= this.maxTrailLength) {
      this.trail.shift(); // Remove oldest position
    }
    this.trail.push(createVector(this.pos.x, this.pos.y));
    
    // Move bullet
    this.pos.add(this.vel);
    
    // Update age
    this.age++;
  }
  
  // Draw the bullet
  display() {
    push();
    
    // Draw trail
    noStroke();
    for (let i = 0; i < this.trail.length; i++) {
      let trailPos = this.trail[i];
      let alpha = map(i, 0, this.trail.length - 1, 30, 150);
      let trailSize = map(i, 0, this.trail.length - 1, this.size * 0.3, this.size * 0.8);
      
      fill(this.color.levels[0], this.color.levels[1], this.color.levels[2], alpha);
      ellipse(trailPos.x, trailPos.y, trailSize, trailSize);
    }
    
    // Draw main bullet with pulsing effect
    translate(this.pos.x, this.pos.y);
    
    // Pulse animation
    let pulse = sin(this.age * 0.2 + this.pulsePhase) * 0.2 + 1;
    
    // Outer glow
    fill(this.color.levels[0], this.color.levels[1], this.color.levels[2], 100);
    ellipse(0, 0, this.size * 2 * pulse, this.size * 2 * pulse);
    
    // Middle glow
    fill(this.color.levels[0], this.color.levels[1], this.color.levels[2], 150);
    ellipse(0, 0, this.size * 1.5 * pulse, this.size * 1.5 * pulse);
    
    // Core
    fill(this.color);
    ellipse(0, 0, this.size * pulse, this.size * pulse);
    
    // Highlight
    fill(255);
    ellipse(-this.size * 0.2, -this.size * 0.2, this.size * 0.4, this.size * 0.4);
    
    pop();
  }
  
  // Check if bullet is off screen
  isOffScreen() {
    return (
      this.pos.x < -this.size ||
      this.pos.x > width + this.size ||
      this.pos.y < -this.size ||
      this.pos.y > height + this.size
    );
  }
  
  // Check collision with an enemy
  hits(enemy) {
    let d = dist(this.pos.x, this.pos.y, enemy.pos.x, enemy.pos.y);
    return d < this.size / 2 + enemy.getCollisionRadius();
  }
} 