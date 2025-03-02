// Player Ship Types
// Different ship types with unique stats and abilities

// Ship type constants
const SHIP_SCOUT = 0;
const SHIP_FIGHTER = 1;
const SHIP_TANK = 2;
const SHIP_ASSAULT = 3;

// Ship unlock levels
const SHIP_UNLOCK_LEVELS = {
  [SHIP_SCOUT]: 1,    // Available from start
  [SHIP_FIGHTER]: 3,  // Unlock at level 3
  [SHIP_TANK]: 5,     // Unlock at level 5
  [SHIP_ASSAULT]: 8   // Unlock at level 8
};

// Base Ship class (extends Player)
class Ship extends Player {
  constructor(type) {
    super(); // Call Player constructor
    
    // Ship type
    this.type = type;
    
    // Apply ship-specific properties
    this.applyShipProperties();
    
    // Special ability
    this.specialCooldown = 0;
    this.specialCooldownTime = 300; // 5 seconds
    this.specialActive = false;
    this.specialDuration = 180; // 3 seconds
    this.specialTimer = 0;
  }
  
  // Apply properties based on ship type
  applyShipProperties() {
    switch (this.type) {
      case SHIP_SCOUT:
        // Scout: Fast but fragile, rapid fire
        this.maxSpeed = 9;
        this.cooldownTime = 10; // Faster firing rate
        this.color = color(100, 200, 255);
        this.specialCooldownTime = 240; // 4 seconds
        break;
        
      case SHIP_FIGHTER:
        // Fighter: Balanced, triple shot special
        this.maxSpeed = 7;
        this.cooldownTime = 15;
        this.color = color(100, 255, 150);
        this.specialCooldownTime = 300; // 5 seconds
        break;
        
      case SHIP_TANK:
        // Tank: Slow but tough, shield special
        this.maxSpeed = 5;
        this.cooldownTime = 20; // Slower firing rate
        this.color = color(255, 200, 100);
        this.specialCooldownTime = 360; // 6 seconds
        break;
        
      case SHIP_ASSAULT:
        // Assault: Medium speed, powerful shots
        this.maxSpeed = 6;
        this.cooldownTime = 18;
        this.color = color(255, 100, 150);
        this.specialCooldownTime = 330; // 5.5 seconds
        break;
    }
  }
  
  // Override update method to handle special ability
  update() {
    // Call parent update method
    super.update();
    
    // Update special cooldown
    if (this.specialCooldown > 0) {
      this.specialCooldown--;
    }
    
    // Update special ability timer if active
    if (this.specialActive) {
      this.specialTimer--;
      if (this.specialTimer <= 0) {
        this.deactivateSpecial();
      }
    }
  }
  
  // Activate special ability
  activateSpecial() {
    if (this.specialCooldown <= 0 && !this.specialActive) {
      this.specialActive = true;
      this.specialTimer = this.specialDuration;
      this.specialCooldown = this.specialCooldownTime;
      
      // Apply special effect based on ship type
      switch (this.type) {
        case SHIP_SCOUT:
          // Scout special: Time slow (enemies move slower)
          this.applyTimeSlowEffect();
          break;
          
        case SHIP_FIGHTER:
          // Fighter special: Rapid triple shot
          this.applyTripleShotEffect();
          break;
          
        case SHIP_TANK:
          // Tank special: Shield
          this.applyShieldEffect();
          break;
          
        case SHIP_ASSAULT:
          // Assault special: Screen-clearing blast
          this.applyBlastEffect();
          break;
      }
      
      // Screen shake effect
      screenShake = 5;
    }
  }
  
  // Deactivate special ability
  deactivateSpecial() {
    this.specialActive = false;
    
    // Remove special effect based on ship type
    switch (this.type) {
      case SHIP_SCOUT:
        // Remove time slow effect
        this.removeTimeSlowEffect();
        break;
        
      case SHIP_FIGHTER:
        // Remove triple shot effect
        this.removeTripleShotEffect();
        break;
        
      case SHIP_TANK:
        // Shield effect handled by timer
        break;
        
      case SHIP_ASSAULT:
        // Blast effect is instantaneous
        break;
    }
  }
  
  // Special ability effects
  applyTimeSlowEffect() {
    // Slow down all enemies
    for (let enemy of enemies) {
      // Store original velocity for restoration later
      enemy.originalVel = enemy.vel.copy();
      // Slow down by 50%
      enemy.vel.mult(0.5);
    }
  }
  
  removeTimeSlowEffect() {
    // Restore enemy speeds
    for (let enemy of enemies) {
      if (enemy.originalVel) {
        enemy.vel = enemy.originalVel.copy();
        delete enemy.originalVel;
      }
    }
  }
  
  applyTripleShotEffect() {
    // Temporarily reduce cooldown dramatically
    this.originalCooldownTime = this.cooldownTime;
    this.cooldownTime = 5;
  }
  
  removeTripleShotEffect() {
    // Restore original cooldown
    if (this.originalCooldownTime) {
      this.cooldownTime = this.originalCooldownTime;
    }
  }
  
  applyShieldEffect() {
    // Make player invulnerable
    this.setInvulnerable();
    this.invulnerableTimer = this.specialDuration;
  }
  
  applyBlastEffect() {
    // Create expanding blast wave
    this.blastRadius = 0;
    this.blastMaxRadius = height * 0.4;
    this.blastExpanding = true;
    
    // Screen shake
    screenShake = 15;
  }
  
  // Override shoot method to handle ship-specific shooting patterns
  shoot() {
    // Don't shoot if on cooldown
    if (this.cooldown > 0) return;
    
    // Different shooting patterns based on ship type
    switch (this.type) {
      case SHIP_SCOUT:
        // Scout: Single fast shot
        bullets.push(new Bullet(this.pos.x, this.pos.y, 0));
        break;
        
      case SHIP_FIGHTER:
        // Fighter: Triple shot when special is active, otherwise single
        if (this.specialActive) {
          bullets.push(new Bullet(this.pos.x, this.pos.y, 0));
          bullets.push(new Bullet(this.pos.x, this.pos.y, -0.2));
          bullets.push(new Bullet(this.pos.x, this.pos.y, 0.2));
        } else {
          bullets.push(new Bullet(this.pos.x, this.pos.y, 0));
        }
        break;
        
      case SHIP_TANK:
        // Tank: Wider, more powerful shot
        let tankBullet = new Bullet(this.pos.x, this.pos.y, 0);
        tankBullet.size *= 1.5; // Larger bullet
        bullets.push(tankBullet);
        break;
        
      case SHIP_ASSAULT:
        // Assault: Two parallel shots
        bullets.push(new Bullet(this.pos.x - 10, this.pos.y, 0));
        bullets.push(new Bullet(this.pos.x + 10, this.pos.y, 0));
        break;
    }
    
    // Reset cooldown
    this.cooldown = this.cooldownTime;
  }
  
  // Override display method to draw ship-specific appearance
  display() {
    push();
    translate(this.pos.x, this.pos.y);
    
    // Draw engine glow
    this.drawEngineGlow();
    
    // Draw thruster flame
    this.drawThruster();
    
    // Draw ship body based on type
    if (this.invulnerable) {
      // Blink when invulnerable
      if (frameCount % 6 < 3) {
        this.drawShipBody();
      }
      // Draw shield flash effect when invulnerable
      this.drawInvulnerableShield();
    } else {
      this.drawShipBody();
    }
    
    // Draw special ability effects
    if (this.specialActive) {
      this.drawSpecialEffects();
    }
    
    // Draw blast wave for assault ship
    if (this.type === SHIP_ASSAULT && this.blastExpanding) {
      this.drawBlastWave();
    }
    
    pop();
  }
  
  // Draw ship body based on type
  drawShipBody() {
    // Base styling
    fill(this.color);
    stroke(255);
    strokeWeight(2);
    
    switch (this.type) {
      case SHIP_SCOUT:
        // Scout: Sleek, triangular design
        this.drawScoutShip();
        break;
        
      case SHIP_FIGHTER:
        // Fighter: Balanced X-wing style
        this.drawFighterShip();
        break;
        
      case SHIP_TANK:
        // Tank: Bulky, hexagonal design
        this.drawTankShip();
        break;
        
      case SHIP_ASSAULT:
        // Assault: Angular, aggressive design
        this.drawAssaultShip();
        break;
    }
  }
  
  // Ship type-specific designs
  drawScoutShip() {
    // Sleek triangular design
    beginShape();
    vertex(0, -this.size / 2);
    vertex(-this.size / 4, this.size / 4);
    vertex(-this.size / 6, this.size / 6);
    vertex(-this.size / 6, this.size / 2);
    vertex(this.size / 6, this.size / 2);
    vertex(this.size / 6, this.size / 6);
    vertex(this.size / 4, this.size / 4);
    endShape(CLOSE);
    
    // Cockpit
    fill(150, 220, 255, 200);
    noStroke();
    ellipse(0, -this.size / 6, this.size / 3, this.size / 4);
    
    // Wing details
    stroke(255);
    strokeWeight(1);
    line(-this.size / 4, this.size / 4, -this.size / 6, -this.size / 6);
    line(this.size / 4, this.size / 4, this.size / 6, -this.size / 6);
  }
  
  drawFighterShip() {
    // X-wing style design
    beginShape();
    vertex(0, -this.size / 2);
    vertex(-this.size / 3, this.size / 4);
    vertex(-this.size / 5, this.size / 6);
    vertex(-this.size / 5, this.size / 2);
    vertex(this.size / 5, this.size / 2);
    vertex(this.size / 5, this.size / 6);
    vertex(this.size / 3, this.size / 4);
    endShape(CLOSE);
    
    // Extended wings
    beginShape();
    vertex(-this.size / 3, this.size / 4);
    vertex(-this.size / 2, 0);
    vertex(-this.size / 3, -this.size / 4);
    endShape();
    
    beginShape();
    vertex(this.size / 3, this.size / 4);
    vertex(this.size / 2, 0);
    vertex(this.size / 3, -this.size / 4);
    endShape();
    
    // Cockpit
    fill(100, 255, 150, 200);
    noStroke();
    ellipse(0, -this.size / 6, this.size / 3, this.size / 4);
    
    // Wing lights
    fill(255, 100, 100, 200);
    ellipse(-this.size / 2, 0, this.size / 10, this.size / 10);
    ellipse(this.size / 2, 0, this.size / 10, this.size / 10);
  }
  
  drawTankShip() {
    // Bulky hexagonal design
    beginShape();
    for (let i = 0; i < 6; i++) {
      let angle = i * TWO_PI / 6 + PI / 6;
      let x = cos(angle) * this.size / 2;
      let y = sin(angle) * this.size / 2;
      vertex(x, y);
    }
    endShape(CLOSE);
    
    // Armor plates
    stroke(255);
    strokeWeight(2);
    line(-this.size / 3, -this.size / 3, this.size / 3, -this.size / 3);
    line(-this.size / 3, this.size / 3, this.size / 3, this.size / 3);
    
    // Cockpit
    fill(255, 200, 100, 200);
    noStroke();
    ellipse(0, 0, this.size / 3, this.size / 3);
    
    // Armor details
    fill(200, 200, 200);
    rect(-this.size / 4, -this.size / 2, this.size / 2, this.size / 10, 2);
  }
  
  drawAssaultShip() {
    // Angular aggressive design
    beginShape();
    vertex(0, -this.size / 2);
    vertex(-this.size / 2, this.size / 4);
    vertex(-this.size / 4, this.size / 4);
    vertex(-this.size / 6, this.size / 2);
    vertex(this.size / 6, this.size / 2);
    vertex(this.size / 4, this.size / 4);
    vertex(this.size / 2, this.size / 4);
    endShape(CLOSE);
    
    // Weapon pods
    fill(200, 100, 100);
    ellipse(-this.size / 3, this.size / 6, this.size / 5, this.size / 5);
    ellipse(this.size / 3, this.size / 6, this.size / 5, this.size / 5);
    
    // Cockpit
    fill(255, 100, 150, 200);
    noStroke();
    ellipse(0, -this.size / 6, this.size / 3, this.size / 4);
    
    // Weapon details
    fill(255, 50, 50, 150);
    ellipse(-this.size / 3, this.size / 6, this.size / 10, this.size / 10);
    ellipse(this.size / 3, this.size / 6, this.size / 10, this.size / 10);
  }
  
  // Draw special ability effects
  drawSpecialEffects() {
    switch (this.type) {
      case SHIP_SCOUT:
        // Time slow effect - blue trail
        noStroke();
        for (let i = 0; i < 5; i++) {
          let alpha = 150 - i * 30;
          fill(100, 200, 255, alpha);
          ellipse(0, this.size / 2 + i * 5, this.size / 2 - i * 5, this.size / 10);
        }
        break;
        
      case SHIP_FIGHTER:
        // Triple shot effect - weapon glow
        noStroke();
        fill(100, 255, 150, 100 + sin(frameCount * 0.2) * 50);
        ellipse(-this.size / 3, this.size / 4, this.size / 4, this.size / 4);
        ellipse(0, this.size / 4, this.size / 4, this.size / 4);
        ellipse(this.size / 3, this.size / 4, this.size / 4, this.size / 4);
        break;
        
      case SHIP_TANK:
        // Shield effect - already handled by invulnerability
        break;
        
      case SHIP_ASSAULT:
        // Charging effect for blast
        noStroke();
        fill(255, 100, 150, 100 + sin(frameCount * 0.2) * 50);
        ellipse(0, 0, this.size * (0.5 + sin(frameCount * 0.2) * 0.1), this.size * (0.5 + sin(frameCount * 0.2) * 0.1));
        break;
    }
  }
  
  // Draw blast wave for assault ship
  drawBlastWave() {
    // Increment blast radius
    this.blastRadius += 15;
    
    // Check for enemies hit by blast
    for (let i = enemies.length - 1; i >= 0; i--) {
      let enemy = enemies[i];
      let d = dist(this.pos.x, this.pos.y, enemy.pos.x, enemy.pos.y);
      
      // If enemy is within blast radius and not already hit
      if (d < this.blastRadius && !enemy.hitByBlast) {
        // Mark as hit to prevent multiple hits
        enemy.hitByBlast = true;
        
        // Add score
        score += enemy.points;
        
        // Remove enemy
        enemies.splice(i, 1);
      }
    }
    
    // Draw expanding blast wave
    noFill();
    stroke(255, 100, 150, 200 - (this.blastRadius / this.blastMaxRadius) * 200);
    strokeWeight(5 - (this.blastRadius / this.blastMaxRadius) * 4);
    ellipse(0, 0, this.blastRadius * 2, this.blastRadius * 2);
    
    // Inner wave
    stroke(255, 200, 200, 150 - (this.blastRadius / this.blastMaxRadius) * 150);
    strokeWeight(3 - (this.blastRadius / this.blastMaxRadius) * 2);
    ellipse(0, 0, this.blastRadius * 1.8, this.blastRadius * 1.8);
    
    // Stop expanding when max radius is reached
    if (this.blastRadius >= this.blastMaxRadius) {
      this.blastExpanding = false;
    }
  }
  
  // Get special ability cooldown percentage
  getSpecialCooldownPercent() {
    if (this.specialActive) {
      return this.specialTimer / this.specialDuration;
    } else {
      return 1 - (this.specialCooldown / this.specialCooldownTime);
    }
  }
  
  // Get special ability name
  getSpecialName() {
    switch (this.type) {
      case SHIP_SCOUT:
        return "TIME SLOW";
      case SHIP_FIGHTER:
        return "TRIPLE SHOT";
      case SHIP_TANK:
        return "SHIELD";
      case SHIP_ASSAULT:
        return "BLAST WAVE";
      default:
        return "SPECIAL";
    }
  }
  
  // Get ship name
  getShipName() {
    switch (this.type) {
      case SHIP_SCOUT:
        return "SCOUT";
      case SHIP_FIGHTER:
        return "FIGHTER";
      case SHIP_TANK:
        return "TANK";
      case SHIP_ASSAULT:
        return "ASSAULT";
      default:
        return "SHIP";
    }
  }
  
  // Get ship description
  getShipDescription() {
    switch (this.type) {
      case SHIP_SCOUT:
        return "Fast & agile with rapid fire. Special: Time Slow";
      case SHIP_FIGHTER:
        return "Balanced with triple shot special";
      case SHIP_TANK:
        return "Tough but slow. Special: Shield";
      case SHIP_ASSAULT:
        return "Powerful with screen-clearing blast";
      default:
        return "";
    }
  }
}

// Check if a ship type is unlocked
function isShipUnlocked(shipType) {
  return level >= SHIP_UNLOCK_LEVELS[shipType];
}

// Get all unlocked ship types
function getUnlockedShips() {
  let unlocked = [];
  for (let type in SHIP_UNLOCK_LEVELS) {
    if (isShipUnlocked(parseInt(type))) {
      unlocked.push(parseInt(type));
    }
  }
  return unlocked;
} 