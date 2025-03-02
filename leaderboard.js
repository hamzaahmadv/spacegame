// Leaderboard functionality for Space Shooter Game

// Supabase configuration
// Replace these with your actual Supabase project URL and anon key
const SUPABASE_URL = 'https://qfwlprzvritrqhahemdq.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmd2xwcnp2cml0cnFoYWhlbWRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA5MTgwMzYsImV4cCI6MjA1NjQ5NDAzNn0.etI9YDqQ0DuetqiAomUUr0Vs1AL-pfjNnvPOIR6SQM8';

// Leaderboard variables
let leaderboardData = [];
let leaderboardPage = 0;
let leaderboardEntriesPerPage = 10;
let isLeaderboardLoading = false;
let leaderboardError = null;

// Initialize Supabase client
let supabase = null;

// Try to initialize Supabase client immediately if it's already loaded
if (typeof window !== 'undefined' && window.supabaseClient) {
  supabase = window.supabaseClient;
  console.log('Supabase client initialized from window.supabaseClient');
} else {
  console.log('Supabase client not available yet, will initialize later');
  
  // Listen for the supabaseLoaded event
  if (typeof window !== 'undefined') {
    window.addEventListener('supabaseLoaded', function(event) {
      if (window.supabaseClient) {
        supabase = window.supabaseClient;
        console.log('Supabase client initialized from supabaseLoaded event');
        
        // Test the connection if we already have a client
        if (typeof testSupabaseConnection === 'function') {
          testSupabaseConnection();
        }
      } else {
        console.error('supabaseLoaded event fired but window.supabaseClient is not available');
        if (typeof createMockSupabaseClient === 'function') {
          createMockSupabaseClient();
        }
      }
    });
  }
}

// Initialize leaderboard functionality
function initLeaderboard() {
  try {
    console.log('Initializing leaderboard functionality...');
    
    // Try to initialize Supabase client if not already initialized
    if (!supabase) {
      initSupabaseClient();
    } else {
      // Test the connection if we already have a client
      testSupabaseConnection();
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
    
    // First check if window.supabaseClient is already available
    if (window.supabaseClient) {
      console.log('Using existing window.supabaseClient');
      supabase = window.supabaseClient;
      
      // Verify that the client has the necessary methods
      if (typeof supabase.from !== 'function') {
        console.error('Existing Supabase client is missing required methods');
        createMockSupabaseClient();
        return;
      }
      
      console.log('Supabase client initialized successfully from window.supabaseClient');
      testSupabaseConnection();
      return;
    }
    
    // If window.supabase is available, try to create a client
    if (typeof window.supabase !== 'undefined' && typeof window.supabase.createClient === 'function') {
      console.log('Creating Supabase client using window.supabase');
      try {
        window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        supabase = window.supabaseClient;
        console.log('Supabase client created successfully');
        testSupabaseConnection();
        return;
      } catch (e) {
        console.error('Error creating Supabase client:', e);
      }
    }
    
    // If we still don't have a client, try to load Supabase from CDN
    console.log('Attempting to load Supabase from CDN');
    
    // Check if the script is already in the DOM
    if (!document.querySelector('script[src*="supabase"]')) {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.38.4/dist/umd/supabase.min.js';
      
      script.onload = function() {
        console.log('Supabase loaded from CDN');
        try {
          if (typeof window.supabase !== 'undefined' && typeof window.supabase.createClient === 'function') {
            window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
            supabase = window.supabaseClient;
            console.log('Supabase client created after CDN load');
            testSupabaseConnection();
          } else {
            console.error('Supabase still not available after CDN load');
            createMockSupabaseClient();
          }
        } catch (cdnError) {
          console.error('Error initializing Supabase after CDN load:', cdnError);
          createMockSupabaseClient();
        }
      };
      
      script.onerror = function() {
        console.error('Failed to load Supabase from CDN');
        createMockSupabaseClient();
      };
      
      document.head.appendChild(script);
    } else {
      console.error('Supabase script already in DOM but not working');
      createMockSupabaseClient();
    }
  } catch (error) {
    console.error('Error in initSupabaseClient:', error);
    createMockSupabaseClient();
  }
}

// Test the Supabase connection
async function testSupabaseConnection() {
  try {
    console.log('Testing Supabase connection...');
    
    // Check if supabase client has the required methods
    if (!supabase || typeof supabase.from !== 'function') {
      console.error('Supabase client is not properly initialized for connection test');
      createMockSupabaseClient();
      return;
    }
    
    try {
      // Set a timeout to prevent hanging if the connection takes too long
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Connection test timed out')), 8000);
      });
      
      // Simple query to test connection
      const connectionPromise = supabase
        .from('leaderboard')
        .select('*')
        .limit(1);
      
      // Race between the connection and the timeout
      const { data, error } = await Promise.race([
        connectionPromise,
        timeoutPromise
      ]);
      
      if (error) {
        console.error('Supabase connection test failed:', error);
        
        // If the error is because the table doesn't exist, try to create it
        if (error.code === '42P01' || 
            (error.message && error.message.includes('relation "leaderboard" does not exist'))) {
          console.log('Leaderboard table does not exist, attempting to create it');
          await createLeaderboardTable();
        } else {
          console.error('Connection error not related to missing table:', error);
          createMockSupabaseClient();
        }
      } else {
        console.log('Supabase connection test successful, found data:', data);
      }
    } catch (queryError) {
      console.error('Error during connection test query:', queryError);
      createMockSupabaseClient();
    }
  } catch (error) {
    console.error('Error testing Supabase connection:', error);
    createMockSupabaseClient();
  }
}

// Create the leaderboard table if it doesn't exist
async function createLeaderboardTable() {
  try {
    console.log('Attempting to create leaderboard table...');
    
    // Check if we have access to the Supabase REST API
    if (!supabase || typeof supabase.rpc !== 'function') {
      console.error('Supabase client does not have RPC method, cannot create table');
      createMockSupabaseClient();
      return;
    }
    
    // Note: Creating tables requires database admin privileges
    // This is just a fallback that might work in some cases with proper permissions
    // In most cases, you would create the table through the Supabase dashboard
    
    try {
      // Try to create the table using a stored procedure (if available)
      const { error } = await supabase.rpc('create_leaderboard_table_if_not_exists');
      
      if (error) {
        console.error('Failed to create leaderboard table via RPC:', error);
        
        // Store the error in local storage for debugging
        const errors = JSON.parse(localStorage.getItem('supabaseErrors') || '[]');
        errors.push({
          timestamp: new Date().toISOString(),
          message: error.message,
          code: error.code,
          details: error.details
        });
        localStorage.setItem('supabaseErrors', JSON.stringify(errors));
        
        // If the RPC method doesn't exist, we can't create the table from the client
        // This is expected in most cases as table creation requires admin privileges
        console.warn('Unable to create table from client, switching to offline mode');
        createMockSupabaseClient();
        return;
      }
      
      console.log('Leaderboard table created successfully via RPC');
      
      // Test the connection again
      try {
        const { data, error: testError } = await supabase
          .from('leaderboard')
          .select('*')
          .limit(1);
        
        if (testError) {
          console.error('Table created but test query failed:', testError);
          createMockSupabaseClient();
        } else {
          console.log('Table created and test query successful:', data);
        }
      } catch (testError) {
        console.error('Error testing newly created table:', testError);
        createMockSupabaseClient();
      }
    } catch (rpcError) {
      console.error('Exception during table creation RPC call:', rpcError);
      
      // Store the error in local storage for debugging
      const errors = JSON.parse(localStorage.getItem('supabaseErrors') || '[]');
      errors.push({
        timestamp: new Date().toISOString(),
        message: rpcError.message,
        stack: rpcError.stack
      });
      localStorage.setItem('supabaseErrors', JSON.stringify(errors));
      
      createMockSupabaseClient();
    }
  } catch (error) {
    console.error('Error creating leaderboard table:', error);
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
    },
    rpc: function(procedureName, params) {
      console.log('Mock RPC call to:', procedureName, params);
      return Promise.resolve({ data: null, error: null });
    }
  };
  
  // Also set the global supabaseClient
  window.supabaseClient = supabase;
  
  console.log('Mock Supabase client created successfully');
  
  // Dispatch event to notify that mock Supabase is ready
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('supabaseLoaded', { 
      detail: { success: false, mock: true } 
    }));
  }
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
    
    // Show loading indicator
    const submitButton = document.getElementById('submitScore');
    if (submitButton) {
      submitButton.textContent = 'Submitting...';
      submitButton.disabled = true;
    }
    
    // Check if supabase is initialized
    if (!supabase || typeof supabase.from !== 'function') {
      console.error('Supabase client not initialized or missing from method');
      
      // Try to initialize it one more time
      initSupabaseClient();
      
      // Wait a moment for initialization to complete
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // If still not initialized, use offline mode
      if (!supabase || typeof supabase.from !== 'function') {
        console.warn('Still unable to initialize Supabase, using offline mode');
        alert('You are in offline mode. Your score will be saved locally.');
        
        // Save to local storage in offline mode
        const offlineScores = JSON.parse(localStorage.getItem('offlineScores') || '[]');
        offlineScores.push({ 
          email, 
          score, 
          level, 
          created_at: new Date().toISOString() 
        });
        localStorage.setItem('offlineScores', JSON.stringify(offlineScores));
        
        // Hide the input form
        const leaderboardInput = document.getElementById('leaderboardInput');
        if (leaderboardInput) {
          leaderboardInput.style.display = 'none';
        }
        
        // Update game state
        gameState = GAME_OVER;
        
        // Resume the game loop
        if (typeof loop === 'function') {
          loop();
        }
        
        // Reset button state
        if (submitButton) {
          submitButton.textContent = 'Submit';
          submitButton.disabled = false;
        }
        
        return;
      }
    }
    
    console.log('Inserting score into Supabase:', { email, score, level });
    
    try {
      // Insert the score into the leaderboard table with level information
      const { data, error } = await supabase
        .from('leaderboard')
        .insert([
          { email, score, level }
        ]);
      
      if (error) {
        console.error('Error submitting score:', error);
        
        // More detailed error message
        let errorMessage = 'Failed to submit score. ';
        if (error.code === '23505') {
          errorMessage += 'You have already submitted a score with this email.';
        } else if (error.code === '23503') {
          errorMessage += 'Database constraint error.';
        } else if (error.code === '42P01') {
          errorMessage += 'Leaderboard table not found.';
        } else {
          errorMessage += 'Please try again later. Error: ' + error.message;
        }
        
        alert(errorMessage);
        
        // Save to local storage if submission fails
        const offlineScores = JSON.parse(localStorage.getItem('offlineScores') || '[]');
        offlineScores.push({ 
          email, 
          score, 
          level, 
          created_at: new Date().toISOString(),
          error: error.message
        });
        localStorage.setItem('offlineScores', JSON.stringify(offlineScores));
        
        // Reset button state
        if (submitButton) {
          submitButton.textContent = 'Submit';
          submitButton.disabled = false;
        }
      } else {
        console.log('Score submitted successfully:', data);
        alert('Score submitted successfully!');
        
        // Hide the input form
        const leaderboardInput = document.getElementById('leaderboardInput');
        if (leaderboardInput) {
          leaderboardInput.style.display = 'none';
        }
        
        // Reload leaderboard data to include the new score
        await loadLeaderboardData();
        
        // Update game state to show the leaderboard
        gameState = LEADERBOARD_VIEW;
      }
    } catch (insertError) {
      console.error('Exception during score insertion:', insertError);
      alert('An error occurred while submitting your score. Please try again.');
      
      // Save to local storage if submission fails
      const offlineScores = JSON.parse(localStorage.getItem('offlineScores') || '[]');
      offlineScores.push({ 
        email, 
        score, 
        level, 
        created_at: new Date().toISOString(),
        error: insertError.message
      });
      localStorage.setItem('offlineScores', JSON.stringify(offlineScores));
      
      // Reset button state
      if (submitButton) {
        submitButton.textContent = 'Submit';
        submitButton.disabled = false;
      }
    }
    
    // Resume the game loop
    if (typeof loop === 'function') {
      loop();
    }
  } catch (error) {
    console.error('Error in submitScore:', error);
    alert('An error occurred while submitting your score. Please try again.');
    
    // Reset button state
    const submitButton = document.getElementById('submitScore');
    if (submitButton) {
      submitButton.textContent = 'Submit';
      submitButton.disabled = false;
    }
    
    // Resume the game loop
    if (typeof loop === 'function') {
      loop();
    }
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
    if (!supabase || typeof supabase.from !== 'function') {
      console.error('Supabase client not initialized for loading leaderboard data');
      
      // Try to initialize it one more time
      initSupabaseClient();
      
      // Wait a moment for initialization to complete
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // If still not initialized, use offline mode
      if (!supabase || typeof supabase.from !== 'function') {
        console.warn('Still unable to initialize Supabase for leaderboard, using offline mode');
        leaderboardError = 'Leaderboard unavailable (offline mode)';
        
        // Get any offline scores
        const offlineScores = JSON.parse(localStorage.getItem('offlineScores') || '[]');
        
        if (offlineScores.length > 0) {
          console.log('Using offline scores:', offlineScores);
          leaderboardData = offlineScores;
        } else {
          console.log('No offline scores found, using mock data');
          leaderboardData = generateMockLeaderboardData();
        }
        
        isLeaderboardLoading = false;
        return;
      }
    }
    
    console.log('Fetching leaderboard data from Supabase...');
    
    try {
      // Set a timeout to prevent hanging if the query takes too long
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Leaderboard query timed out')), 10000);
      });
      
      // Query to get leaderboard data
      const queryPromise = supabase
        .from('leaderboard')
        .select('*')
        .order('score', { ascending: false })
        .limit(100);
      
      // Race between the query and the timeout
      const { data, error } = await Promise.race([
        queryPromise,
        timeoutPromise
      ]);
      
      if (error) {
        console.error('Error loading leaderboard data:', error);
        leaderboardError = 'Failed to load leaderboard data: ' + error.message;
        
        // Try to use offline scores if available
        const offlineScores = JSON.parse(localStorage.getItem('offlineScores') || '[]');
        
        if (offlineScores.length > 0) {
          console.log('Using offline scores due to error:', offlineScores);
          leaderboardData = offlineScores;
        } else {
          console.log('No offline scores found, using mock data');
          leaderboardData = generateMockLeaderboardData();
        }
      } else if (data && data.length > 0) {
        console.log('Leaderboard data loaded successfully:', data);
        
        // Get any offline scores
        const offlineScores = JSON.parse(localStorage.getItem('offlineScores') || '[]');
        
        if (offlineScores.length > 0) {
          console.log('Merging offline scores with online data');
          
          // Merge offline scores with online data
          const mergedData = [...data];
          
          // Add offline scores that aren't already in the online data
          for (const offlineScore of offlineScores) {
            // Skip if this score has an error or is already in the online data
            if (offlineScore.error) continue;
            
            // Check if this score is already in the online data
            const isDuplicate = data.some(onlineScore => 
              onlineScore.email === offlineScore.email && 
              onlineScore.score === offlineScore.score &&
              onlineScore.level === offlineScore.level
            );
            
            if (!isDuplicate) {
              mergedData.push(offlineScore);
            }
          }
          
          // Sort by score (descending)
          mergedData.sort((a, b) => b.score - a.score);
          
          leaderboardData = mergedData;
        } else {
          leaderboardData = data;
        }
      } else {
        console.log('No leaderboard data found, using mock data');
        // Use mock data if no data is returned
        leaderboardData = generateMockLeaderboardData();
      }
    } catch (queryError) {
      console.error('Error querying leaderboard data:', queryError);
      leaderboardError = 'Error loading leaderboard: ' + queryError.message;
      
      // Try to use offline scores if available
      const offlineScores = JSON.parse(localStorage.getItem('offlineScores') || '[]');
      
      if (offlineScores.length > 0) {
        console.log('Using offline scores due to query error:', offlineScores);
        leaderboardData = offlineScores;
      } else {
        // Use mock data in case of error
        leaderboardData = generateMockLeaderboardData();
      }
    }
    
    isLeaderboardLoading = false;
  } catch (error) {
    console.error('Error in loadLeaderboardData:', error);
    leaderboardError = 'Error loading leaderboard: ' + error.message;
    isLeaderboardLoading = false;
    
    // Try to use offline scores if available
    const offlineScores = JSON.parse(localStorage.getItem('offlineScores') || '[]');
    
    if (offlineScores.length > 0) {
      console.log('Using offline scores due to error:', offlineScores);
      leaderboardData = offlineScores;
    } else {
      // Use mock data in case of error
      leaderboardData = generateMockLeaderboardData();
    }
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
    
    // Draw leaderboard title with glow effect
    drawingContext.shadowBlur = 15;
    drawingContext.shadowColor = color(100, 150, 255, 200);
    fill(255);
    textSize(32);
    textAlign(CENTER);
    text('LEADERBOARD', width / 2, 60);
    drawingContext.shadowBlur = 0;
    
    // Draw loading indicator or error message
    if (isLeaderboardLoading) {
      // Animated loading indicator
      textSize(18);
      text('Loading leaderboard data...', width / 2, height / 2);
      
      // Draw animated dots
      let dots = '';
      for (let i = 0; i < (frameCount / 15) % 4; i++) {
        dots += '.';
      }
      text(dots, width / 2 + 100, height / 2);
      return;
    }
    
    if (leaderboardError) {
      textSize(18);
      fill(255, 100, 100);
      text(leaderboardError, width / 2, 100);
      fill(200);
      textSize(16);
      text('Check your internet connection and try again later', width / 2, 130);
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
    
    // Draw column headers with background
    fill(30, 30, 60, 200);
    rect(width * 0.05, 85, width * 0.9, 30, 5);
    
    textSize(16);
    textAlign(LEFT);
    fill(200, 200, 255);
    text('RANK', width * 0.1, 105);
    text('PLAYER', width * 0.2, 105);
    text('SCORE', width * 0.6, 105);
    text('LEVEL', width * 0.8, 105);
    
    // Draw horizontal line
    stroke(100, 100, 200);
    line(width * 0.05, 120, width * 0.95, 120);
    noStroke();
    
    // Draw leaderboard entries with alternating row backgrounds
    textAlign(LEFT);
    for (let i = startIndex; i < endIndex; i++) {
      const entry = leaderboardData[i];
      const y = 150 + (i - startIndex) * 30;
      
      // Alternating row backgrounds
      if ((i - startIndex) % 2 === 0) {
        fill(30, 30, 60, 100);
      } else {
        fill(40, 40, 80, 100);
      }
      rect(width * 0.05, y - 20, width * 0.9, 30, 5);
      
      // Highlight the current player's score if it matches
      const isCurrentPlayer = entry.score === score && entry.level === level && entry.created_at && 
                             new Date(entry.created_at).getTime() > Date.now() - 300000; // Within the last 5 minutes
      
      if (isCurrentPlayer) {
        fill(100, 255, 100, 50);
        rect(width * 0.05, y - 20, width * 0.9, 30, 5);
        
        // Add a "YOU" indicator
        fill(100, 255, 100);
        textAlign(RIGHT);
        text('YOU', width * 0.04, y);
      }
      
      // Draw rank with medal for top 3
      fill(255);
      textAlign(LEFT);
      
      if (i === 0) {
        // Gold medal for 1st place
        fill(255, 215, 0);
        text('🥇 1', width * 0.1, y);
      } else if (i === 1) {
        // Silver medal for 2nd place
        fill(192, 192, 192);
        text('🥈 2', width * 0.1, y);
      } else if (i === 2) {
        // Bronze medal for 3rd place
        fill(205, 127, 50);
        text('🥉 3', width * 0.1, y);
      } else {
        // Regular rank
        fill(255);
        text(`${i + 1}.`, width * 0.1, y);
      }
      
      // Draw email (masked for privacy)
      const email = entry.email || 'anonymous';
      const maskedEmail = maskEmail(email);
      
      // Highlight current player's email
      if (isCurrentPlayer) {
        fill(100, 255, 100);
      } else {
        fill(255);
      }
      text(maskedEmail, width * 0.2, y);
      
      // Draw score
      textAlign(RIGHT);
      if (isCurrentPlayer) {
        fill(100, 255, 100);
      } else {
        fill(255, 220, 100);
      }
      text(entry.score.toLocaleString(), width * 0.7, y);
      
      // Draw level
      if (isCurrentPlayer) {
        fill(100, 255, 100);
      } else {
        fill(100, 200, 255);
      }
      text(entry.level || '1', width * 0.85, y);
      
      textAlign(LEFT);
    }
    
    // Draw pagination controls with better styling
    if (totalPages > 1) {
      // Pagination background
      fill(30, 30, 60, 200);
      rect(width * 0.2, height - 90, width * 0.6, 40, 10);
      
      textAlign(CENTER);
      fill(255);
      textSize(16);
      text(`Page ${leaderboardPage + 1} of ${totalPages}`, width / 2, height - 65);
      
      // Previous page button
      if (leaderboardPage > 0) {
        drawButton('< PREV', width / 3, height - 40, function() {
          leaderboardPage--;
        });
      }
      
      // Next page button
      if (leaderboardPage < totalPages - 1) {
        drawButton('NEXT >', width * 2 / 3, height - 40, function() {
          leaderboardPage++;
        });
      }
    }
    
    // Instructions to return
    fill(200);
    textSize(14);
    text('Press ESC to return to game over screen', width / 2, height - 15);
    
    // Draw offline indicator if using mock data
    if (leaderboardData[0] && leaderboardData[0].id === '1' && leaderboardData[0].email === 'player1@example.com') {
      fill(255, 150, 50);
      textSize(12);
      text('OFFLINE MODE', width - 60, 20);
    }
  } catch (error) {
    console.error('Error drawing leaderboard:', error);
    // Show error message
    fill(255, 100, 100);
    textSize(18);
    textAlign(CENTER);
    text('Error displaying leaderboard', width / 2, height / 2);
    text(error.message, width / 2, height / 2 + 30);
    
    // Instructions to return
    fill(200);
    textSize(14);
    text('Press ESC to return to game over screen', width / 2, height - 20);
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
  
  // Check for pagination button clicks
  const totalPages = Math.ceil(leaderboardData.length / leaderboardEntriesPerPage);
  
  // Previous page button
  if (leaderboardPage > 0) {
    let isHovering = mouseX > width / 3 - 50 && 
                     mouseX < width / 3 + 50 && 
                     mouseY > height - 50 && 
                     mouseY < height - 30;
    
    if (isHovering) {
      leaderboardPage--;
      return true;
    }
  }
  
  // Next page button
  if (leaderboardPage < totalPages - 1) {
    let isHovering = mouseX > width * 2 / 3 - 50 && 
                     mouseX < width * 2 / 3 + 50 && 
                     mouseY > height - 50 && 
                     mouseY < height - 30;
    
    if (isHovering) {
      leaderboardPage++;
      return true;
    }
  }
  
  // Check for ESC key equivalent (clicking outside the leaderboard area)
  let leaderboardArea = {
    x: width * 0.05,
    y: 80,
    width: width * 0.9,
    height: height - 150
  };
  
  let isOutsideLeaderboard = mouseX < leaderboardArea.x || 
                             mouseX > leaderboardArea.x + leaderboardArea.width ||
                             mouseY < leaderboardArea.y || 
                             mouseY > leaderboardArea.y + leaderboardArea.height;
  
  if (isOutsideLeaderboard) {
    // Return to game over screen
    gameState = GAME_OVER;
    return true;
  }
  
  return true;
}

// Initialize leaderboard when the window loads
window.addEventListener('load', initLeaderboard); 