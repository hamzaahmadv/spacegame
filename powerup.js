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
    
    // Set color based on type - using brighter, more distinct colors
    switch (this.type) {
      case 'rapidFire':
        this.color = color(255, 220, 0); // Bright yellow
        break;
      case 'shield':
        this.color = color(0, 220, 255); // Bright cyan
        break;
      case 'multiShot':
        this.color = color(220, 0, 255); // Bright magenta
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
    
    // Outer glow - brighter and more visible
    noStroke();
    fill(this.color.levels[0], this.color.levels[1], this.color.levels[2], 150);
    ellipse(0, 0, pulseSize * 2, pulseSize * 2);
    
    // Secondary glow
    fill(this.color.levels[0], this.color.levels[1], this.color.levels[2], 180);
    ellipse(0, 0, pulseSize * 1.5, pulseSize * 1.5);
    
    // Main body
    fill(this.color);
    stroke(255);
    strokeWeight(2);
    
    // Draw different shapes based on power-up type - more distinct shapes
    switch (this.type) {
      case 'rapidFire':
        // Star shape for rapid fire - larger and more pointed
        this.drawStar(0, 0, pulseSize * 0.6, pulseSize * 0.25, 5);
        
        // Add "speed" indicator
        noStroke();
        fill(255, 255, 200);
        for (let i = 0; i < 3; i++) {
          let yOffset = i * 5 - 5;
          triangle(-pulseSize/4, yOffset, 0, yOffset - pulseSize/6, 0, yOffset + pulseSize/6);
        }
        break;
        
      case 'shield':
        // Shield shape - more shield-like
        // Main shield body
        fill(0, 220, 255, 200);
        ellipse(0, 0, pulseSize, pulseSize);
        
        // Shield border
        noFill();
        stroke(255, 250);
        strokeWeight(3);
        arc(0, 0, pulseSize * 1.1, pulseSize * 1.1, PI * 0.25, PI * 1.75);
        
        // Shield center
        fill(255, 255, 255, 200);
        noStroke();
        ellipse(0, 0, pulseSize * 0.3, pulseSize * 0.3);
        break;
        
      case 'multiShot':
        // Triple shot symbol - more weapon-like
        // Base
        rectMode(CENTER);
        fill(220, 0, 255);
        stroke(255);
        strokeWeight(2);
        rect(0, 0, pulseSize * 0.8, pulseSize * 0.8, 5);
        
        // Barrel indicators
        stroke(255);
        strokeWeight(3);
        line(-pulseSize/3, -pulseSize/3, -pulseSize/3, pulseSize/3);
        line(0, -pulseSize/3, 0, pulseSize/3);
        line(pulseSize/3, -pulseSize/3, pulseSize/3, pulseSize/3);
        
        // Bullet indicators
        noStroke();
        fill(255, 255, 200);
        ellipse(-pulseSize/3, -pulseSize/4, pulseSize/6, pulseSize/6);
        ellipse(0, -pulseSize/4, pulseSize/6, pulseSize/6);
        ellipse(pulseSize/3, -pulseSize/4, pulseSize/6, pulseSize/6);
        break;
    }
    
    // Add "POWER-UP" text indicator
    noStroke();
    fill(255, 255, 255, 200);
    textSize(pulseSize * 0.25);
    textAlign(CENTER);
    text("POWER", 0, pulseSize * 0.7);
    
    // Inner highlight
    noStroke();
    fill(255, 200);
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