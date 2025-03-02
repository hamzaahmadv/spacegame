// Leaderboard functionality for Space Shooter Game

// Supabase configuration
// Replace these with your actual Supabase project URL and anon key
const SUPABASE_URL = 'https://qfwlprzvritrqhahemdq.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmd2xwcnp2cml0cnFoYWhlbWRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA5MTgwMzYsImV4cCI6MjA1NjQ5NDAzNn0.etI9YDqQ0DuetqiAomUUr0Vs1AL-pfjNnvPOIR6SQM8';

// Initialize Supabase client
let supabase;

// Leaderboard variables
let leaderboardData = [];
let leaderboardPage = 0;
let leaderboardEntriesPerPage = 10;
let isLeaderboardLoading = false;
let leaderboardError = null;

// Initialize leaderboard functionality
function initLeaderboard() {
  try {
    console.log('Initializing leaderboard functionality...');
    
    // Try to initialize Supabase client
    if (typeof window.supabaseClient !== 'undefined') {
      console.log('Supabase client found, initializing...');
      initSupabaseClient();
    } else {
      console.log('Supabase client not found, waiting for it to load...');
      
      // Listen for the supabaseLoaded event
      window.addEventListener('supabaseLoaded', function supabaseLoadedHandler() {
        console.log('Received supabaseLoaded event');
        initSupabaseClient();
        // Remove the event listener after it's been handled
        window.removeEventListener('supabaseLoaded', supabaseLoadedHandler);
      });
    }
    
    // Set up event listeners for the leaderboard form
    const submitButton = document.getElementById('submitScore');
    const skipButton = document.getElementById('skipSubmission');
    
    if (submitButton) {
      submitButton.addEventListener('click', submitScore);
      console.log('Added event listener to submit button');
    } else {
      console.error('Submit button not found');
    }
    
    if (skipButton) {
      skipButton.addEventListener('click', skipScoreSubmission);
      console.log('Added event listener to skip button');
    } else {
      console.error('Skip button not found');
    }
  } catch (error) {
    console.error('Error initializing leaderboard:', error);
    // Continue with the game even if leaderboard fails
    console.log('Continuing with game without leaderboard functionality');
  }
}

// Initialize the Supabase client
function initSupabaseClient() {
  try {
    console.log('Creating Supabase client with URL:', SUPABASE_URL);
    
    if (!window.supabaseClient) {
      console.error('window.supabaseClient is not defined');
      createMockSupabaseClient();
      return;
    }
    
    supabase = window.supabaseClient.createClient(SUPABASE_URL, SUPABASE_KEY);
    console.log('Supabase client initialized successfully');
    
    // Test the connection
    testSupabaseConnection();
  } catch (error) {
    console.error('Error creating Supabase client:', error);
    createMockSupabaseClient();
  }
}

// Test the Supabase connection
async function testSupabaseConnection() {
  try {
    console.log('Testing Supabase connection...');
    
    // Simple query to test connection
    const { data, error } = await supabase
      .from('leaderboard')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Supabase connection test failed:', error);
      createMockSupabaseClient();
    } else {
      console.log('Supabase connection test successful, found data:', data);
    }
  } catch (error) {
    console.error('Error testing Supabase connection:', error);
    createMockSupabaseClient();
  }
}

// Create a mock Supabase client with sample data for offline mode
function createMockSupabaseClient() {
  console.warn('Creating mock Supabase client with sample data');
  
  // Create a mock client that returns sample data
  supabase = {
    from: function(table) {
      console.log('Mock client accessing table:', table);
      return {
        select: function() { return this; },
        insert: function(data) {
          console.log('Mock insert:', data);
          // Simulate successful insert
          return Promise.resolve({ 
            data: [{ id: 'mock-id', ...data[0] }], 
            error: null 
          });
        },
        order: function() { return this; },
        limit: function() {
          // Return mock leaderboard data
          return Promise.resolve({
            data: [
              { id: '1', email: 'player1@example.com', score: 5000, level: 5, created_at: new Date().toISOString() },
              { id: '2', email: 'player2@example.com', score: 3500, level: 3, created_at: new Date().toISOString() },
              { id: '3', email: 'player3@example.com', score: 2800, level: 2, created_at: new Date().toISOString() },
              { id: '4', email: 'offline-mode@example.com', score: 1500, level: 1, created_at: new Date().toISOString() }
            ],
            error: null
          });
        }
      };
    }
  };
  
  console.log('Mock Supabase client created successfully');
}

// Show the leaderboard input form
function showLeaderboardInput() {
  try {
    const leaderboardInput = document.getElementById('leaderboardInput');
    const finalScoreDisplay = document.getElementById('finalScoreDisplay');
    
    if (!leaderboardInput) {
      console.error('Leaderboard input form not found in the DOM');
      // Continue with the game even if the form is missing
      gameState = GAME_OVER;
      return;
    }
    
    // Update the final score display
    if (finalScoreDisplay) {
      finalScoreDisplay.textContent = `Score: ${score} - Level: ${level}`;
    }
    
    // Show the input form
    leaderboardInput.style.display = 'block';
    
    // Pause the game loop to prevent p5.js from capturing keyboard events
    noLoop();
    
    // Focus on the email input after a short delay to ensure the DOM is ready
    setTimeout(() => {
      const emailInput = document.getElementById('playerEmail');
      if (emailInput) {
        emailInput.value = ''; // Clear any previous value
        emailInput.focus();
        console.log('Email input focused');
      } else {
        console.error('Email input element not found');
      }
    }, 100);
    
    // Set game state to leaderboard submit
    gameState = LEADERBOARD_SUBMIT;
    
    // Add event listeners for form submission via Enter key
    const playerEmail = document.getElementById('playerEmail');
    if (playerEmail) {
      playerEmail.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
          event.preventDefault();
          submitScore();
        }
      });
    }
    
    console.log('Leaderboard input form displayed');
  } catch (error) {
    console.error('Error showing leaderboard input:', error);
    // Continue with the game even if there's an error
    gameState = GAME_OVER;
  }
}

// Submit score to the leaderboard
async function submitScore() {
  try {
    const emailInput = document.getElementById('playerEmail');
    if (!emailInput) {
      console.error('Email input element not found');
      alert('Error: Email input not found');
      return;
    }
    
    const email = emailInput.value.trim();
    if (!email) {
      alert('Please enter your email to submit your score');
      return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert('Please enter a valid email address');
      return;
    }
    
    console.log(`Submitting score: ${score} for email: ${email}`);
    
    // Check if supabase is initialized
    if (!supabase) {
      console.error('Supabase client not initialized');
      alert('You are in offline mode. Your score will be saved locally.');
      
      // Save to local storage in offline mode
      const offlineScores = JSON.parse(localStorage.getItem('offlineScores') || '[]');
      offlineScores.push({ email, score, created_at: new Date().toISOString() });
      localStorage.setItem('offlineScores', JSON.stringify(offlineScores));
      
      // Hide the input form
      document.getElementById('leaderboardInput').style.display = 'none';
      
      // Update game state
      gameState = GAME_OVER;
      
      // Resume the game loop
      loop();
      return;
    }
    
    // Show loading indicator
    document.getElementById('submitScore').textContent = 'Submitting...';
    document.getElementById('submitScore').disabled = true;
    
    // Insert the score into the leaderboard table
    const { data, error } = await supabase
      .from('leaderboard')
      .insert([
        { email, score }
      ]);
    
    if (error) {
      console.error('Error submitting score:', error);
      alert('Failed to submit score. Please try again later.');
      
      // Save to local storage if submission fails
      const offlineScores = JSON.parse(localStorage.getItem('offlineScores') || '[]');
      offlineScores.push({ email, score, created_at: new Date().toISOString() });
      localStorage.setItem('offlineScores', JSON.stringify(offlineScores));
      
      document.getElementById('submitScore').textContent = 'Submit';
      document.getElementById('submitScore').disabled = false;
    } else {
      console.log('Score submitted successfully:', data);
      alert('Score submitted successfully!');
      
      // Hide the input form
      document.getElementById('leaderboardInput').style.display = 'none';
      
      // Reload leaderboard data to include the new score
      await loadLeaderboardData();
      
      // Update game state to show the leaderboard
      gameState = LEADERBOARD_VIEW;
    }
    
    // Resume the game loop
    loop();
  } catch (error) {
    console.error('Error in submitScore:', error);
    alert('An error occurred while submitting your score. Please try again.');
    
    document.getElementById('submitScore').textContent = 'Submit';
    document.getElementById('submitScore').disabled = false;
    
    // Resume the game loop
    loop();
  }
}

// Skip score submission
function skipScoreSubmission() {
  // Hide the input form
  document.getElementById('leaderboardInput').style.display = 'none';
  
  // Resume the game loop
  loop();
  
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
  try {
    console.log('Loading leaderboard data...');
    isLeaderboardLoading = true;
    leaderboardError = null;
    
    // Check if supabase is initialized
    if (!supabase) {
      console.error('Supabase client not initialized');
      leaderboardError = 'Leaderboard unavailable (offline mode)';
      isLeaderboardLoading = false;
      return;
    }
    
    console.log('Fetching leaderboard data from Supabase...');
    const { data, error } = await supabase
      .from('leaderboard')
      .select('*')
      .order('score', { ascending: false })
      .limit(100);
    
    if (error) {
      console.error('Error loading leaderboard data:', error);
      leaderboardError = 'Failed to load leaderboard data';
      isLeaderboardLoading = false;
      return;
    }
    
    if (data && data.length > 0) {
      console.log('Leaderboard data loaded successfully:', data);
      leaderboardData = data;
    } else {
      console.log('No leaderboard data found, using mock data');
      // Use mock data if no data is returned
      leaderboardData = generateMockLeaderboardData();
    }
    
    isLeaderboardLoading = false;
  } catch (error) {
    console.error('Error in loadLeaderboardData:', error);
    leaderboardError = 'Error loading leaderboard';
    isLeaderboardLoading = false;
    // Use mock data in case of error
    leaderboardData = generateMockLeaderboardData();
  }
}

// Draw the leaderboard on the screen
function drawLeaderboard() {
  try {
    background(0, 0, 20);
    
    // Draw stars in the background
    for (let i = 0; i < stars.length; i++) {
      stars[i].y += stars[i].speed * 0.2; // Slow movement in leaderboard view
      if (stars[i].y > height) {
        stars[i].y = 0;
      }
      fill(stars[i].brightness);
      ellipse(stars[i].x, stars[i].y, stars[i].size);
    }
    
    // Draw leaderboard title
    fill(255);
    textSize(32);
    textAlign(CENTER);
    text('LEADERBOARD', width / 2, 60);
    
    // Draw loading indicator or error message
    if (isLeaderboardLoading) {
      textSize(18);
      text('Loading leaderboard data...', width / 2, height / 2);
      return;
    }
    
    if (leaderboardError) {
      textSize(18);
      fill(255, 100, 100);
      text(leaderboardError, width / 2, 100);
      fill(255);
    }
    
    // Check if we have leaderboard data
    if (!leaderboardData || leaderboardData.length === 0) {
      textSize(18);
      text('No leaderboard data available', width / 2, height / 2);
      
      textSize(16);
      text('Press ESC to return to game over screen', width / 2, height - 50);
      return;
    }
    
    // Calculate pagination
    const totalPages = Math.ceil(leaderboardData.length / leaderboardEntriesPerPage);
    const startIndex = leaderboardPage * leaderboardEntriesPerPage;
    const endIndex = Math.min(startIndex + leaderboardEntriesPerPage, leaderboardData.length);
    
    // Draw column headers
    textSize(16);
    textAlign(LEFT);
    fill(200, 200, 255);
    text('RANK', width * 0.1, 100);
    text('PLAYER', width * 0.2, 100);
    text('SCORE', width * 0.7, 100);
    
    // Draw horizontal line
    stroke(100, 100, 200);
    line(width * 0.05, 110, width * 0.95, 110);
    noStroke();
    
    // Draw leaderboard entries
    textAlign(LEFT);
    for (let i = startIndex; i < endIndex; i++) {
      const entry = leaderboardData[i];
      const y = 140 + (i - startIndex) * 30;
      
      // Highlight the current player's score if it matches
      const isCurrentPlayer = entry.score === score && entry.created_at && 
                             new Date(entry.created_at).getTime() > Date.now() - 60000; // Within the last minute
      
      if (isCurrentPlayer) {
        fill(100, 255, 100, 50);
        rect(width * 0.05, y - 20, width * 0.9, 30, 5);
      }
      
      // Draw rank
      fill(255);
      text(`${i + 1}.`, width * 0.1, y);
      
      // Draw email (masked for privacy)
      const email = entry.email || 'anonymous';
      const maskedEmail = maskEmail(email);
      text(maskedEmail, width * 0.2, y);
      
      // Draw score
      textAlign(RIGHT);
      text(entry.score.toLocaleString(), width * 0.8, y);
      textAlign(LEFT);
    }
    
    // Draw pagination controls
    if (totalPages > 1) {
      textAlign(CENTER);
      fill(255);
      textSize(16);
      text(`Page ${leaderboardPage + 1} of ${totalPages}`, width / 2, height - 80);
      
      // Previous page button
      if (leaderboardPage > 0) {
        fill(150, 150, 255);
        text('< Previous', width / 3, height - 50);
      }
      
      // Next page button
      if (leaderboardPage < totalPages - 1) {
        fill(150, 150, 255);
        text('Next >', width * 2 / 3, height - 50);
      }
    }
    
    // Instructions to return
    fill(200);
    textSize(14);
    text('Press ESC to return to game over screen', width / 2, height - 20);
  } catch (error) {
    console.error('Error drawing leaderboard:', error);
    // Show error message
    fill(255, 100, 100);
    textSize(18);
    textAlign(CENTER);
    text('Error displaying leaderboard', width / 2, height / 2);
  }
}

// Mask email for privacy
function maskEmail(email) {
  if (!email || !email.includes('@')) return email;
  
  const parts = email.split('@');
  let username = parts[0];
  const domain = parts[1];
  
  // Show first 2 characters and last character of username
  if (username.length > 3) {
    username = username.substring(0, 2) + '*'.repeat(username.length - 3) + username.charAt(username.length - 1);
  }
  
  return `${username}@${domain}`;
}

// Generate mock leaderboard data
function generateMockLeaderboardData() {
  console.log('Generating mock leaderboard data');
  return [
    { id: '1', email: 'player1@example.com', score: 5000, created_at: new Date().toISOString() },
    { id: '2', email: 'player2@example.com', score: 3500, created_at: new Date().toISOString() },
    { id: '3', email: 'player3@example.com', score: 2800, created_at: new Date().toISOString() },
    { id: '4', email: 'player4@example.com', score: 2200, created_at: new Date().toISOString() },
    { id: '5', email: 'player5@example.com', score: 1800, created_at: new Date().toISOString() }
  ];
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