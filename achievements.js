// Achievement System
// Tracks player accomplishments and rewards

// Achievement constants
const ACHIEVEMENT_UNLOCKED = 1;
const ACHIEVEMENT_DISPLAYED = 2;

// Achievement types
const ACHIEVEMENTS = [
  {
    id: 'first_kill',
    name: 'First Contact',
    description: 'Destroy your first enemy',
    icon: '👾',
    condition: (stats) => stats.enemiesDestroyed >= 1,
    secret: false
  },
  {
    id: 'score_1000',
    name: 'Rookie Pilot',
    description: 'Reach a score of 1,000 points',
    icon: '🏆',
    condition: (stats) => stats.highScore >= 1000,
    secret: false
  },
  {
    id: 'score_5000',
    name: 'Veteran Pilot',
    description: 'Reach a score of 5,000 points',
    icon: '🏆🏆',
    condition: (stats) => stats.highScore >= 5000,
    secret: false
  },
  {
    id: 'score_10000',
    name: 'Ace Pilot',
    description: 'Reach a score of 10,000 points',
    icon: '🏆🏆🏆',
    condition: (stats) => stats.highScore >= 10000,
    secret: false
  },
  {
    id: 'level_5',
    name: 'Rising Star',
    description: 'Reach level 5',
    icon: '⭐',
    condition: (stats) => stats.maxLevel >= 5,
    secret: false
  },
  {
    id: 'level_10',
    name: 'Galactic Hero',
    description: 'Reach level 10',
    icon: '⭐⭐',
    condition: (stats) => stats.maxLevel >= 10,
    secret: false
  },
  {
    id: 'boss_kill',
    name: 'Boss Slayer',
    description: 'Defeat a boss enemy',
    icon: '👑',
    condition: (stats) => stats.bossesDefeated >= 1,
    secret: false
  },
  {
    id: 'powerup_10',
    name: 'Powered Up',
    description: 'Collect 10 power-ups in a single game',
    icon: '⚡',
    condition: (stats) => stats.powerUpsCollected >= 10,
    secret: false
  },
  {
    id: 'no_damage',
    name: 'Perfect Run',
    description: 'Reach level 3 without taking damage',
    icon: '🛡️',
    condition: (stats) => stats.currentLevel >= 3 && !stats.damageTaken,
    secret: true
  },
  {
    id: 'kamikaze_survivor',
    name: 'Close Call',
    description: 'Survive 5 kamikaze enemies in a single game',
    icon: '💥',
    condition: (stats) => stats.kamikazeEnemiesSurvived >= 5,
    secret: true
  },
  {
    id: 'formation_destroyer',
    name: 'Formation Breaker',
    description: 'Destroy a complete enemy formation',
    icon: '🎯',
    condition: (stats) => stats.formationsDestroyed >= 1,
    secret: true
  },
  {
    id: 'bullet_dodger',
    name: 'Matrix Mode',
    description: 'Dodge 50 enemy bullets in a single game',
    icon: '🔄',
    condition: (stats) => stats.bulletsDodged >= 50,
    secret: true
  },
  {
    id: 'ship_collector',
    name: 'Fleet Commander',
    description: 'Unlock all ship types',
    icon: '🚀',
    condition: (stats) => stats.shipsUnlocked >= 4,
    secret: false
  },
  {
    id: 'special_master',
    name: 'Special Forces',
    description: 'Use special abilities 10 times in a single game',
    icon: '✨',
    condition: (stats) => stats.specialsUsed >= 10,
    secret: false
  },
  {
    id: 'survivor',
    name: 'Survivor',
    description: 'Survive for 5 minutes in a single game',
    icon: '⏱️',
    condition: (stats) => stats.survivalTime >= 300, // 5 minutes in seconds
    secret: false
  }
];

// Achievement manager class
class AchievementManager {
  constructor() {
    // Initialize achievement status
    this.achievements = {};
    ACHIEVEMENTS.forEach(achievement => {
      this.achievements[achievement.id] = 0; // 0 = locked, 1 = unlocked, 2 = displayed
    });
    
    // Load saved achievements from local storage
    this.loadAchievements();
    
    // Stats for tracking achievement progress
    this.stats = {
      enemiesDestroyed: 0,
      highScore: 0,
      maxLevel: 1,
      currentLevel: 1,
      bossesDefeated: 0,
      powerUpsCollected: 0,
      damageTaken: false,
      kamikazeEnemiesSurvived: 0,
      formationsDestroyed: 0,
      bulletsDodged: 0,
      shipsUnlocked: 1, // Start with one ship
      specialsUsed: 0,
      survivalTime: 0
    };
    
    // Display queue for showing achievements
    this.displayQueue = [];
    this.displayTimer = 0;
    this.displayDuration = 180; // 3 seconds at 60fps
    this.currentlyDisplaying = null;
  }
  
  // Load achievements from local storage
  loadAchievements() {
    try {
      const savedData = localStorage.getItem('spaceShooterAchievements');
      if (savedData) {
        const parsed = JSON.parse(savedData);
        // Merge saved achievements with current ones
        for (let id in parsed) {
          if (this.achievements.hasOwnProperty(id)) {
            this.achievements[id] = parsed[id];
          }
        }
      }
    } catch (e) {
      console.error('Error loading achievements:', e);
    }
  }
  
  // Save achievements to local storage
  saveAchievements() {
    try {
      localStorage.setItem('spaceShooterAchievements', JSON.stringify(this.achievements));
    } catch (e) {
      console.error('Error saving achievements:', e);
    }
  }
  
  // Reset stats for a new game
  resetGameStats() {
    this.stats.enemiesDestroyed = 0;
    this.stats.currentLevel = 1;
    this.stats.bossesDefeated = 0;
    this.stats.powerUpsCollected = 0;
    this.stats.damageTaken = false;
    this.stats.kamikazeEnemiesSurvived = 0;
    this.stats.formationsDestroyed = 0;
    this.stats.bulletsDodged = 0;
    this.stats.specialsUsed = 0;
    this.stats.survivalTime = 0;
  }
  
  // Update stats based on game events
  updateStats(statName, value) {
    // Update the specific stat
    if (this.stats.hasOwnProperty(statName)) {
      if (typeof value === 'boolean') {
        this.stats[statName] = value;
      } else if (typeof value === 'number') {
        this.stats[statName] += value;
      }
    }
    
    // Special case for high score and max level
    if (statName === 'score' && value > this.stats.highScore) {
      this.stats.highScore = value;
    }
    if (statName === 'level' && value > this.stats.maxLevel) {
      this.stats.maxLevel = value;
      this.stats.currentLevel = value;
    }
    
    // Check for newly unlocked achievements
    this.checkAchievements();
  }
  
  // Check if any achievements should be unlocked
  checkAchievements() {
    ACHIEVEMENTS.forEach(achievement => {
      // Skip already unlocked achievements
      if (this.achievements[achievement.id] === ACHIEVEMENT_UNLOCKED || 
          this.achievements[achievement.id] === ACHIEVEMENT_DISPLAYED) {
        return;
      }
      
      // Check if achievement condition is met
      if (achievement.condition(this.stats)) {
        this.unlockAchievement(achievement.id);
      }
    });
  }
  
  // Unlock an achievement
  unlockAchievement(id) {
    // Mark as unlocked
    this.achievements[id] = ACHIEVEMENT_UNLOCKED;
    
    // Add to display queue
    this.displayQueue.push(id);
    
    // Save to local storage
    this.saveAchievements();
  }
  
  // Update achievement display
  update() {
    // Update display timer if showing an achievement
    if (this.currentlyDisplaying) {
      this.displayTimer--;
      
      if (this.displayTimer <= 0) {
        // Mark as displayed
        this.achievements[this.currentlyDisplaying] = ACHIEVEMENT_DISPLAYED;
        this.currentlyDisplaying = null;
        
        // Save to local storage
        this.saveAchievements();
      }
    }
    // Show next achievement if not currently displaying
    else if (this.displayQueue.length > 0 && !this.currentlyDisplaying) {
      this.currentlyDisplaying = this.displayQueue.shift();
      this.displayTimer = this.displayDuration;
    }
  }
  
  // Draw achievement notification
  display() {
    if (!this.currentlyDisplaying) return;
    
    // Find achievement data
    const achievement = ACHIEVEMENTS.find(a => a.id === this.currentlyDisplaying);
    if (!achievement) return;
    
    // Calculate fade in/out
    let alpha = 255;
    if (this.displayTimer < 60) {
      alpha = map(this.displayTimer, 0, 60, 0, 255);
    } else if (this.displayTimer > this.displayDuration - 60) {
      alpha = map(this.displayTimer, this.displayDuration - 60, this.displayDuration, 0, 255);
    }
    
    // Draw notification box
    push();
    
    // Background
    fill(0, 0, 30, alpha * 0.8);
    stroke(255, alpha * 0.8);
    strokeWeight(2);
    rect(width / 2 - 150, height * 0.2 - 40, 300, 80, 10);
    
    // Title
    fill(255, 255, 100, alpha);
    noStroke();
    textSize(16);
    textAlign(CENTER);
    text("Achievement Unlocked!", width / 2, height * 0.2 - 20);
    
    // Icon
    textSize(24);
    text(achievement.icon, width / 2 - 120, height * 0.2 + 10);
    
    // Achievement name
    fill(255, alpha);
    textSize(16);
    textAlign(LEFT);
    text(achievement.name, width / 2 - 90, height * 0.2);
    
    // Description
    fill(200, 200, 255, alpha);
    textSize(12);
    text(achievement.description, width / 2 - 90, height * 0.2 + 20);
    
    pop();
  }
  
  // Get number of unlocked achievements
  getUnlockedCount() {
    let count = 0;
    for (let id in this.achievements) {
      if (this.achievements[id] > 0) {
        count++;
      }
    }
    return count;
  }
  
  // Get total number of achievements
  getTotalCount() {
    return ACHIEVEMENTS.length;
  }
  
  // Get all achievements with their status
  getAllAchievements() {
    return ACHIEVEMENTS.map(achievement => {
      return {
        ...achievement,
        status: this.achievements[achievement.id]
      };
    });
  }
  
  // Check if an achievement is unlocked
  isUnlocked(id) {
    return this.achievements[id] > 0;
  }
}

// Create global achievement manager
let achievementManager; 