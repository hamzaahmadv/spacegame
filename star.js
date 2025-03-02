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
    
    // Set initial color
    this.updateColor(1);
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
  
  // Update star color based on game level
  updateColor(level) {
    // Base color theme changes with level
    let theme = (level - 1) % 5; // 5 different color themes
    
    // Color variation within the theme
    this.hue = random(1);
    
    switch(theme) {
      case 0: // Level 1: Blue theme (default)
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
        break;
        
      case 1: // Level 2: Purple nebula theme
        if (this.hue < 0.6) {
          // 60% purple stars
          this.color = color(
            150 + random(50),
            50 + random(100),
            200 + random(55)
          );
        } else if (this.hue < 0.9) {
          // 30% pink stars
          this.color = color(
            200 + random(55),
            100 + random(50),
            200 + random(55)
          );
        } else {
          // 10% blue stars
          this.color = color(
            50 + random(50),
            100 + random(50),
            220 + random(35)
          );
        }
        break;
        
      case 2: // Level 3: Green nebula theme
        if (this.hue < 0.6) {
          // 60% green stars
          this.color = color(
            50 + random(100),
            200 + random(55),
            100 + random(50)
          );
        } else if (this.hue < 0.9) {
          // 30% cyan stars
          this.color = color(
            50 + random(100),
            200 + random(55),
            200 + random(55)
          );
        } else {
          // 10% yellow stars
          this.color = color(
            220 + random(35),
            220 + random(35),
            50 + random(50)
          );
        }
        break;
        
      case 3: // Level 4: Orange/red nebula theme
        if (this.hue < 0.6) {
          // 60% orange stars
          this.color = color(
            220 + random(35),
            150 + random(50),
            50 + random(50)
          );
        } else if (this.hue < 0.9) {
          // 30% red stars
          this.color = color(
            220 + random(35),
            50 + random(100),
            50 + random(50)
          );
        } else {
          // 10% yellow stars
          this.color = color(
            220 + random(35),
            220 + random(35),
            50 + random(100)
          );
        }
        break;
        
      case 4: // Level 5+: Multicolor cosmic theme
        if (this.hue < 0.25) {
          // 25% purple stars
          this.color = color(
            150 + random(100),
            50 + random(100),
            220 + random(35)
          );
        } else if (this.hue < 0.5) {
          // 25% teal stars
          this.color = color(
            50 + random(100),
            220 + random(35),
            200 + random(55)
          );
        } else if (this.hue < 0.75) {
          // 25% pink stars
          this.color = color(
            220 + random(35),
            100 + random(100),
            200 + random(55)
          );
        } else {
          // 25% gold stars
          this.color = color(
            220 + random(35),
            200 + random(55),
            50 + random(100)
          );
        }
        break;
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