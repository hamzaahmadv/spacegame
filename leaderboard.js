// Leaderboard functionality for Space Shooter Game

// Supabase configuration
// Replace these with your actual Supabase project URL and anon key
const SUPABASE_URL = 'https://qfwlprzvritrqhahemdq.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmd2xwcnp2cml0cnFoYWhlbWRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA5MTgwMzYsImV4cCI6MjA1NjQ5NDAzNn0.etI9YDqQ0DuetqiAomUUr0Vs1AL-pfjNnvPOIR6SQM8';

// Initialize Supabase client
let supabase;

// Leaderboard state constants
const LEADERBOARD_SUBMIT = 4;
const LEADERBOARD_VIEW = 5;

// Leaderboard variables
let leaderboardData = [];
let leaderboardPage = 0;
let leaderboardEntriesPerPage = 10;
let isLeaderboardLoading = false;
let leaderboardError = null;

// Initialize leaderboard functionality
function initLeaderboard() {
  try {
    // Try to initialize Supabase client
    if (typeof window.supabaseClient !== 'undefined') {
      initSupabaseClient();
    } else {
      // If Supabase is not available yet, wait for it to load
      console.log('Waiting for Supabase to load...');
      setTimeout(checkSupabaseAndInit, 500);
    }
    
    // Set up event listeners for the leaderboard form
    document.getElementById('submitScore').addEventListener('click', submitScore);
    document.getElementById('skipSubmission').addEventListener('click', skipScoreSubmission);
  } catch (error) {
    console.error('Error initializing Supabase:', error);
    // Continue with the game even if Supabase fails
    console.log('Continuing with game without leaderboard functionality');
  }
}

// Check if Supabase is available and initialize the client
function checkSupabaseAndInit() {
  if (typeof window.supabaseClient !== 'undefined') {
    initSupabaseClient();
  } else {
    // Try again after a delay, but only up to 5 times
    if (window.supabaseRetryCount === undefined) {
      window.supabaseRetryCount = 1;
    } else {
      window.supabaseRetryCount++;
    }
    
    if (window.supabaseRetryCount <= 5) {
      console.log(`Supabase not available yet, retrying... (${window.supabaseRetryCount}/5)`);
      setTimeout(checkSupabaseAndInit, 500);
    } else {
      console.error('Failed to load Supabase after multiple attempts. Leaderboard functionality will be limited.');
    }
  }
}

// Initialize the Supabase client
function initSupabaseClient() {
  try {
    supabase = window.supabaseClient.createClient(SUPABASE_URL, SUPABASE_KEY);
    console.log('Supabase client initialized successfully');
  } catch (error) {
    console.error('Error creating Supabase client:', error);
  }
}

// Show the leaderboard input form
function showLeaderboardInput() {
  // Update the final score display
  document.getElementById('finalScoreDisplay').textContent = `Score: ${score} - Level: ${level}`;
  
  // Show the input form
  document.getElementById('leaderboardInput').style.display = 'block';
  
  // Focus on the email input
  document.getElementById('playerEmail').focus();
  
  // Set game state to leaderboard submit
  gameState = LEADERBOARD_SUBMIT;
}

// Submit score to the leaderboard
async function submitScore() {
  const emailInput = document.getElementById('playerEmail');
  const email = emailInput.value.trim();
  
  // Basic email validation
  if (!email || !email.includes('@') || !email.includes('.')) {
    alert('Please enter a valid email address');
    return;
  }
  
  try {
    // Check if Supabase is initialized
    if (!supabase) {
      console.error('Supabase client not initialized. Cannot submit score.');
      alert('Unable to connect to the leaderboard server. Your score could not be submitted.');
      
      // Hide the input form
      document.getElementById('leaderboardInput').style.display = 'none';
      
      // Return to game over state
      gameState = GAME_OVER;
      return;
    }
    
    // Submit score to Supabase
    const { data, error } = await supabase
      .from('leaderboard')
      .insert([
        { 
          email: email,
          score: score,
          level: level,
          created_at: new Date()
        }
      ]);
    
    if (error) {
      console.error('Error submitting score:', error);
      alert('Error submitting score. Please try again.');
    } else {
      console.log('Score submitted successfully:', data);
      
      // Hide the input form
      document.getElementById('leaderboardInput').style.display = 'none';
      
      // Show the leaderboard
      showLeaderboard();
    }
  } catch (error) {
    console.error('Error submitting score:', error);
    alert('Error submitting score. Please try again.');
  }
}

// Skip score submission
function skipScoreSubmission() {
  // Hide the input form
  document.getElementById('leaderboardInput').style.display = 'none';
  
  // Return to game over state
  gameState = GAME_OVER;
}

// Show the leaderboard
async function showLeaderboard() {
  // Set game state to leaderboard view
  gameState = LEADERBOARD_VIEW;
  
  // Reset leaderboard page
  leaderboardPage = 0;
  
  // Check if Supabase is initialized
  if (!supabase) {
    console.error('Supabase client not initialized. Cannot load leaderboard data.');
    leaderboardError = 'Unable to connect to the leaderboard server.';
    isLeaderboardLoading = false;
    return;
  }
  
  // Load leaderboard data
  await loadLeaderboardData();
}

// Load leaderboard data from Supabase
async function loadLeaderboardData() {
  isLeaderboardLoading = true;
  leaderboardError = null;
  
  try {
    // Fetch top scores from Supabase
    const { data, error } = await supabase
      .from('leaderboard')
      .select('*')
      .order('score', { ascending: false })
      .limit(50);
    
    if (error) {
      console.error('Error loading leaderboard:', error);
      leaderboardError = 'Failed to load leaderboard data';
    } else {
      leaderboardData = data;
      console.log('Leaderboard data loaded:', data);
    }
  } catch (error) {
    console.error('Error loading leaderboard:', error);
    leaderboardError = 'Failed to load leaderboard data';
  } finally {
    isLeaderboardLoading = false;
  }
}

// Draw the leaderboard screen
function drawLeaderboard() {
  // Background
  background(bgColor);
  
  // Update and draw stars for background
  updateStars();
  
  // Semi-transparent overlay
  fill(0, 0, 30, 200);
  rect(0, 0, width, height);
  
  // Leaderboard title
  fill(255);
  textSize(gameWidth * 0.08);
  textAlign(CENTER, CENTER);
  text("LEADERBOARD", width/2, height * 0.1);
  
  // Draw loading indicator or error message
  if (isLeaderboardLoading) {
    fill(200, 200, 255);
    textSize(gameWidth * 0.04);
    text("Loading leaderboard...", width/2, height/2);
    return;
  }
  
  if (leaderboardError) {
    fill(255, 100, 100);
    textSize(gameWidth * 0.04);
    text(leaderboardError, width/2, height/2);
    
    // Back button
    drawButton("BACK", width/2, height * 0.8, () => {
      gameState = GAME_OVER;
    });
    
    return;
  }
  
  // Calculate start and end indices for current page
  const startIndex = leaderboardPage * leaderboardEntriesPerPage;
  const endIndex = Math.min(startIndex + leaderboardEntriesPerPage, leaderboardData.length);
  
  // Draw leaderboard entries
  if (leaderboardData.length === 0) {
    fill(200, 200, 255);
    textSize(gameWidth * 0.04);
    text("No scores yet. Be the first!", width/2, height/2);
  } else {
    // Header
    fill(150, 150, 255);
    textSize(gameWidth * 0.035);
    textAlign(LEFT);
    text("RANK", width * 0.1, height * 0.2);
    textAlign(CENTER);
    text("EMAIL", width * 0.5, height * 0.2);
    textAlign(RIGHT);
    text("SCORE", width * 0.8, height * 0.2);
    textAlign(RIGHT);
    text("LEVEL", width * 0.9, height * 0.2);
    
    // Entries
    const entryHeight = (height * 0.6) / leaderboardEntriesPerPage;
    
    for (let i = startIndex; i < endIndex; i++) {
      const entry = leaderboardData[i];
      const yPos = height * 0.25 + (i - startIndex) * entryHeight;
      
      // Highlight the player's entry
      if (entry.email === document.getElementById('playerEmail').value) {
        fill(50, 100, 150, 100);
        rect(width * 0.05, yPos - entryHeight/2, width * 0.9, entryHeight);
      }
      
      // Rank
      fill(255);
      textSize(gameWidth * 0.03);
      textAlign(LEFT);
      text(`${i + 1}.`, width * 0.1, yPos);
      
      // Email (truncated if too long)
      textAlign(CENTER);
      const displayEmail = truncateEmail(entry.email);
      text(displayEmail, width * 0.5, yPos);
      
      // Score
      textAlign(RIGHT);
      text(entry.score, width * 0.8, yPos);
      
      // Level
      textAlign(RIGHT);
      text(entry.level, width * 0.9, yPos);
    }
  }
  
  // Navigation buttons
  if (leaderboardData.length > leaderboardEntriesPerPage) {
    // Previous page button
    if (leaderboardPage > 0) {
      drawButton("PREV", width * 0.25, height * 0.85, () => {
        leaderboardPage--;
      });
    }
    
    // Next page button
    if ((leaderboardPage + 1) * leaderboardEntriesPerPage < leaderboardData.length) {
      drawButton("NEXT", width * 0.75, height * 0.85, () => {
        leaderboardPage++;
      });
    }
    
    // Page indicator
    fill(200, 200, 255);
    textSize(gameWidth * 0.03);
    textAlign(CENTER);
    const totalPages = Math.ceil(leaderboardData.length / leaderboardEntriesPerPage);
    text(`Page ${leaderboardPage + 1}/${totalPages}`, width * 0.5, height * 0.85);
  }
  
  // Back button
  drawButton("BACK", width * 0.5, height * 0.92, () => {
    gameState = GAME_OVER;
  });
  
  // Reset text alignment
  textAlign(CENTER, CENTER);
}

// Helper function to truncate email for display
function truncateEmail(email) {
  if (!email) return '';
  
  if (email.length <= 20) return email;
  
  // Find the @ symbol
  const atIndex = email.indexOf('@');
  
  if (atIndex <= 0) return email.substring(0, 17) + '...';
  
  // Truncate the username part if it's too long
  const username = email.substring(0, atIndex);
  const domain = email.substring(atIndex);
  
  if (username.length > 10) {
    return username.substring(0, 7) + '...' + domain;
  }
  
  // Truncate the domain part if needed
  if (domain.length > 12) {
    return username + domain.substring(0, 9) + '...';
  }
  
  return email;
}

// Draw a button with text and click handler
function drawButton(label, x, y, onClick) {
  // Check if mouse is over button
  const buttonWidth = gameWidth * 0.3;
  const buttonHeight = gameHeight * 0.06;
  const isHovered = mouseX > x - buttonWidth/2 && mouseX < x + buttonWidth/2 &&
                    mouseY > y - buttonHeight/2 && mouseY < y + buttonHeight/2;
  
  // Draw button background
  if (isHovered) {
    fill(80, 120, 255, 200);
  } else {
    fill(60, 80, 200, 150);
  }
  
  noStroke();
  rect(x - buttonWidth/2, y - buttonHeight/2, buttonWidth, buttonHeight, 5);
  
  // Draw button text
  fill(255);
  textSize(gameWidth * 0.03);
  textAlign(CENTER, CENTER);
  text(label, x, y);
  
  // Add click handler
  if (isHovered && mouseIsPressed) {
    onClick();
    // Add a small delay to prevent multiple clicks
    mouseIsPressed = false;
  }
}

// Handle mouse clicks for leaderboard buttons
function handleLeaderboardClicks() {
  // This function will be called from mousePressed in sketch.js
  if (gameState !== LEADERBOARD_VIEW) return false;
  
  // The actual click handling is done in the drawButton function
  return true;
}

// Initialize leaderboard when the window loads
window.addEventListener('load', initLeaderboard); 