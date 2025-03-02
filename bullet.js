// Bullet class
// Handles bullet movement and collision detection

class Bullet {
  constructor(x, y, angleOffset = 0) {
    this.pos = createVector(x, y - 10); // Start slightly above the player
    this.vel = createVector(sin(angleOffset) * 2, -BULLET_SPEED); // Move upward with optional angle
    // Scale size based on screen width
    this.size = 6 * (width / 400);
    this.color = color(50, 200, 255);
  }
  
  // Update bullet position
  update() {
    this.pos.add(this.vel);
  }
  
  // Draw the bullet
  display() {
    push();
    translate(this.pos.x, this.pos.y);
    
    // Glow effect
    noStroke();
    fill(this.color.levels[0], this.color.levels[1], this.color.levels[2], 100);
    ellipse(0, 0, this.size * 2, this.size * 2);
    
    // Core
    fill(this.color);
    ellipse(0, 0, this.size, this.size);
    
    // Highlight
    fill(255);
    ellipse(-1, -1, this.size / 2, this.size / 2);
    
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