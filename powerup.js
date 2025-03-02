// PowerUp class
// Handles different types of power-ups and their effects

class PowerUp {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = createVector(random(-0.5, 0.5), random(1, 2) * (width / 400)); // Scale speed based on screen width
    // Scale size based on screen width
    this.size = 20 * (width / 400);
    this.rotation = 0;
    this.rotationSpeed = random(-0.05, 0.05);
    this.pulseAmount = 0;
    this.pulseSpeed = random(0.05, 0.1);
    
    // Randomly select power-up type
    const types = ['rapidFire', 'shield', 'multiShot'];
    this.type = types[floor(random(types.length))];
    
    // Set color based on type
    switch (this.type) {
      case 'rapidFire':
        this.color = color(255, 200, 0);
        break;
      case 'shield':
        this.color = color(0, 200, 255);
        break;
      case 'multiShot':
        this.color = color(200, 0, 255);
        break;
    }
  }
  
  // Update power-up position and animation
  update() {
    // Move downward with slight drift
    this.pos.add(this.vel);
    
    // Rotate
    this.rotation += this.rotationSpeed;
    
    // Pulse animation
    this.pulseAmount = sin(frameCount * this.pulseSpeed) * 0.2;
  }
  
  // Draw the power-up
  display() {
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.rotation);
    
    // Calculate pulse size
    let pulseSize = this.size * (1 + this.pulseAmount);
    
    // Outer glow
    noStroke();
    fill(this.color.levels[0], this.color.levels[1], this.color.levels[2], 100);
    ellipse(0, 0, pulseSize * 1.5, pulseSize * 1.5);
    
    // Main body
    fill(this.color);
    stroke(255);
    strokeWeight(2);
    
    // Draw different shapes based on power-up type
    switch (this.type) {
      case 'rapidFire':
        // Star shape for rapid fire
        this.drawStar(0, 0, pulseSize / 2, pulseSize / 4, 5);
        break;
      case 'shield':
        // Shield shape
        ellipse(0, 0, pulseSize, pulseSize);
        noFill();
        stroke(255, 200);
        ellipse(0, 0, pulseSize * 0.7, pulseSize * 0.7);
        break;
      case 'multiShot':
        // Triple shot symbol
        rectMode(CENTER);
        rect(0, 0, pulseSize * 0.8, pulseSize * 0.8, 5);
        stroke(255);
        line(-pulseSize/4, -pulseSize/4, -pulseSize/4, pulseSize/4);
        line(0, -pulseSize/4, 0, pulseSize/4);
        line(pulseSize/4, -pulseSize/4, pulseSize/4, pulseSize/4);
        break;
    }
    
    // Inner highlight
    noStroke();
    fill(255, 150);
    ellipse(-pulseSize/5, -pulseSize/5, pulseSize/4, pulseSize/4);
    
    pop();
  }
  
  // Draw a star shape
  drawStar(x, y, radius1, radius2, npoints) {
    let angle = TWO_PI / npoints;
    let halfAngle = angle / 2.0;
    beginShape();
    for (let a = 0; a < TWO_PI; a += angle) {
      let sx = x + cos(a) * radius1;
      let sy = y + sin(a) * radius1;
      vertex(sx, sy);
      sx = x + cos(a + halfAngle) * radius2;
      sy = y + sin(a + halfAngle) * radius2;
      vertex(sx, sy);
    }
    endShape(CLOSE);
  }
  
  // Check if power-up is off screen
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
    return d < this.size / 2 + player.getCollisionRadius();
  }
} 