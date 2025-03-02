// Star class
// Creates a parallax star background effect

class Star {
  constructor() {
    this.pos = createVector(random(width), random(height));
    
    // Different layers move at different speeds for parallax effect
    this.layer = floor(random(3));
    
    // Set properties based on layer (distance)
    switch (this.layer) {
      case 0: // Distant stars (slow, small, dim)
        this.speed = random(0.1, 0.5) * (width / 400);
        this.size = random(1, 2) * (width / 400);
        this.brightness = random(100, 150);
        break;
      case 1: // Mid-distance stars (medium speed, size, brightness)
        this.speed = random(0.5, 1.5) * (width / 400);
        this.size = random(2, 3) * (width / 400);
        this.brightness = random(150, 200);
        break;
      case 2: // Close stars (fast, large, bright)
        this.speed = random(1.5, 3) * (width / 400);
        this.size = random(2, 4) * (width / 400);
        this.brightness = random(200, 255);
        break;
    }
    
    // Twinkle effect
    this.twinkleSpeed = random(0.02, 0.05);
    this.twinkleAmount = random(0.3, 0.7);
    this.twinkleOffset = random(TWO_PI);
    
    // Color variation
    this.hue = random(1);
    if (this.hue < 0.7) {
      // 70% white/blue stars
      this.color = color(
        200 + random(55),
        200 + random(55),
        220 + random(35)
      );
    } else if (this.hue < 0.9) {
      // 20% yellow/orange stars
      this.color = color(
        220 + random(35),
        180 + random(75),
        100 + random(50)
      );
    } else {
      // 10% red stars
      this.color = color(
        220 + random(35),
        100 + random(50),
        100 + random(50)
      );
    }
  }
  
  // Update star position for parallax scrolling
  update() {
    // Move down based on layer speed
    this.pos.y += this.speed;
    
    // Reset position when off screen
    if (this.pos.y > height) {
      this.pos.y = 0;
      this.pos.x = random(width);
    }
  }
  
  // Draw the star
  display() {
    // Calculate twinkle effect
    let twinkle = 1 + sin(frameCount * this.twinkleSpeed + this.twinkleOffset) * this.twinkleAmount;
    let size = this.size * twinkle;
    let alpha = this.brightness * twinkle;
    
    // Draw star with glow based on size
    noStroke();
    
    // Outer glow for larger stars
    if (this.layer > 0) {
      fill(
        this.color.levels[0],
        this.color.levels[1],
        this.color.levels[2],
        alpha * 0.3
      );
      ellipse(this.pos.x, this.pos.y, size * 3, size * 3);
    }
    
    // Main star
    fill(
      this.color.levels[0],
      this.color.levels[1],
      this.color.levels[2],
      alpha
    );
    ellipse(this.pos.x, this.pos.y, size, size);
    
    // Bright center for larger stars
    if (this.layer == 2) {
      fill(255, alpha);
      ellipse(this.pos.x, this.pos.y, size * 0.5, size * 0.5);
    }
  }
} 