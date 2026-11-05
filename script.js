/* =========================================
   1. STATE (The Data)
   ========================================= */
let currentWater = 0; 
let waterGoal = 4.5;  
let userName = "User"; 

let timerSeconds = 25 * 60; 
let timerInterval = null;   
let isTimerRunning = false; 

let totalFocusSeconds = 0; 
let streak = 0; 
let lastCompletedDate = null; 

// History object to store daily data for the chart
let history = {}; 

/* =========================================
   2. DOM SELECTION (The Eyes & Hands)
   ========================================= */
// Overview Page Elements
const waterDisplay = document.getElementById('water-display');
const waterStatDisplay = document.getElementById('water-stat-display');
const progressFill = document.getElementById('progress-fill');
const progressText = document.getElementById('progress-text');

const btnMinus = document.getElementById('btn-minus'); 
const btn250 = document.getElementById('btn-250');
const btn500 = document.getElementById('btn-500');

const timerDisplay = document.getElementById('timer-display');
const btnStart = document.getElementById('btn-start');
const btnReset = document.getElementById('btn-reset');

// Focus Timer Page Elements (Big Timer)
const bigTimerDisplay = document.getElementById('big-timer-display');
const btnStartBig = document.getElementById('btn-start-big');
const btnResetBig = document.getElementById('btn-reset-big');
const presetBtns = document.querySelectorAll('.preset-btn');

// Water Tracker Page Elements
const bigWaterDisplay = document.getElementById('big-water-display');
const trackerGoalText = document.getElementById('tracker-goal-text');

// Settings & Stats Elements
const streakDisplay = document.getElementById('streak-display');
const focusStatDisplay = document.getElementById('focus-stat-display');
const greetingName = document.getElementById('greeting-name');
const goalInput = document.getElementById('goal-input');
const btnSaveGoal = document.getElementById('btn-save-goal');
const nameInput = document.getElementById('name-input'); 
const btnSaveName = document.getElementById('btn-save-name');
const btnResetData = document.getElementById('btn-reset-data'); 

// Analytics Page Elements
const waterChart = document.getElementById('water-chart');

// Navigation Elements
const navLinks = document.querySelectorAll('.nav-links li');
const pages = document.querySelectorAll('.app-page');

/* =========================================
   3. LOCAL STORAGE & HISTORY
   ========================================= */
// Helper to get today's date as a string (e.g., "2026-11-06")
function getTodayKey() {
    return new Date().toISOString().split('T')[0]; 
}

function loadData() {
    const savedData = localStorage.getItem('oasisData');
    if (savedData) {
        const data = JSON.parse(savedData);
        currentWater = data.currentWater || 0;
        waterGoal = data.waterGoal || 4.5;
        userName = data.userName || "User"; 
        totalFocusSeconds = data.totalFocusSeconds || 0;
        streak = data.streak || 0;
        lastCompletedDate = data.lastCompletedDate || null;
        history = data.history || {}; 
    }
    
    // Ensure today exists in history
    const todayKey = getTodayKey();
    if (!history[todayKey]) {
        history[todayKey] = { water: 0, focus: 0 };
    }
    // Sync currentWater with today's history
    currentWater = history[todayKey].water;

    // Populate settings inputs
    goalInput.value = waterGoal;
    nameInput.value = userName; 
}

function saveData() {
    const todayKey = getTodayKey();
    // Update today's history before saving to LocalStorage
    history[todayKey] = { water: currentWater, focus: totalFocusSeconds };

    const data = {
        currentWater, waterGoal, userName, totalFocusSeconds, streak, lastCompletedDate, history
    };
    localStorage.setItem('oasisData', JSON.stringify(data));
}

/* =========================================
   4. WATER TRACKER LOGIC
   ========================================= */
function updateWaterUI() {
    const waterText = `${currentWater.toFixed(2)}L`;
    waterDisplay.innerHTML = `${waterText} <span>/ ${waterGoal}L Goal</span>`;
    waterStatDisplay.innerText = `${waterText} Liters`;
    
    // Sync the Water Tracker page
    if(bigWaterDisplay) bigWaterDisplay.innerText = waterText;
    if(trackerGoalText) trackerGoalText.innerText = `${waterGoal}L`;

    // Update Progress Bar
    let percentage = (currentWater / waterGoal) * 100;
    if (percentage > 100) percentage = 100;
    if (percentage < 0) percentage = 0; 

    progressFill.style.width = `${percentage}%`;
    progressText.innerText = `${Math.round(percentage)}% of daily goal`;
    
    renderChart(); // Keep chart updated
}

function addWater(amount) {
    currentWater += amount; 
    if (currentWater < 0) currentWater = 0; 
    
    updateWaterUI();
    checkStreak(); 
    saveData();
}

function checkStreak() {
    const today = new Date().toDateString(); 
    // If we hit the goal and haven't logged it for today yet
    if (currentWater >= waterGoal && lastCompletedDate !== today) {
        streak++; 
        lastCompletedDate = today; 
        updateStreakUI();
        saveData();
        alert(`🔥 Goal hit! Streak is now ${streak} days!`);
    }
}

function updateStreakUI() { 
    streakDisplay.innerText = `${streak} Days`; 
}

// Water Buttons
btnMinus.addEventListener('click', () => addWater(-0.25)); 
btn250.addEventListener('click', () => addWater(0.25)); 
btn500.addEventListener('click', () => addWater(0.50)); 

/* =========================================
   5. POMODORO & FOCUS TIME LOGIC
   ========================================= */
function formatTime(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const formattedSeconds = seconds < 10 ? `0${seconds}` : seconds;
    return `${minutes}:${formattedSeconds}`;
}

function formatFocusTime(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
}

function updateTimerUI() {
    const timeString = formatTime(timerSeconds);
    timerDisplay.innerText = timeString;
    // Sync the big timer on the Focus page
    if(bigTimerDisplay) bigTimerDisplay.innerText = timeString; 
}

function updateFocusUI() { 
    focusStatDisplay.innerText = formatFocusTime(totalFocusSeconds); 
}

function tick() {
    if (timerSeconds > 0) {
        timerSeconds--; 
        updateTimerUI(); 
    } else {
        stopTimer(); 
        alert("Focus session complete! Take a break. 🧠");
    }
    
    // Track actual focus time every second the timer runs
    if (isTimerRunning) {
        totalFocusSeconds++;
        updateFocusUI();
        saveData(); 
    }
}

function startTimer() {
    if (!isTimerRunning) {
        timerInterval = setInterval(tick, 1000); 
        isTimerRunning = true;
        btnStart.innerText = "Pause"; 
        if(btnStartBig) btnStartBig.innerText = "Pause"; // Sync buttons
    } else {
        stopTimer(); 
    }
}

function stopTimer() {
    clearInterval(timerInterval); 
    isTimerRunning = false;
    btnStart.innerText = "Start"; 
    if(btnStartBig) btnStartBig.innerText = "Start"; // Sync buttons
}

function resetTimer() {
    stopTimer(); 
    timerSeconds = 25 * 60; 
    updateTimerUI(); 
}

// Preset Buttons Logic (15m, 25m, 50m)
presetBtns.forEach(btn => {
    btn.addEventListener('click', function() {
        stopTimer();
        const mins = parseInt(this.getAttribute('data-min'));
        timerSeconds = mins * 60;
        updateTimerUI();
    });
});

// Timer Buttons
btnStart.addEventListener('click', startTimer);
btnReset.addEventListener('click', resetTimer);
if(btnStartBig) btnStartBig.addEventListener('click', startTimer);
if(btnResetBig) btnResetBig.addEventListener('click', resetTimer);

/* =========================================
   6. SETTINGS & RESET LOGIC
   ========================================= */
btnSaveGoal.addEventListener('click', () => {
    const newGoal = parseFloat(goalInput.value);
    if (newGoal > 0) {
        waterGoal = newGoal;
        updateWaterUI();
        saveData();
        alert(`Goal updated to ${waterGoal}L!`);
    }
});

btnSaveName.addEventListener('click', () => {
    const newName = nameInput.value.trim(); 
    if (newName) {
        userName = newName;
        greetingName.innerText = userName; 
        saveData();
        alert(`Name updated to ${userName}!`);
    }
});

// Danger Zone: Reset All Data
btnResetData.addEventListener('click', () => {
    if(confirm("Are you sure? This will delete ALL your data and cannot be undone.")) {
        localStorage.removeItem('oasisData');
        location.reload(); // Refresh the page to reset everything to default
    }
});

/* =========================================
   7. ANALYTICS CHART LOGIC
   ========================================= */
function renderChart() {
    if (!waterChart) return; 
    waterChart.innerHTML = ''; // Clear existing chart
    const days = [];
    
    // Generate the last 7 days
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        days.push(d.toISOString().split('T')[0]);
    }

    days.forEach(dayKey => {
        const dayData = history[dayKey] || { water: 0 };
        const waterAmount = dayData.water || 0;
        
        // Calculate height percentage based on goal
        let heightPercent = (waterAmount / waterGoal) * 100;
        if (heightPercent > 100) heightPercent = 100;
        if (heightPercent < 2) heightPercent = 2; // Min height so empty bars are visible
        
        const dateObj = new Date(dayKey);
        const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' }); 

        // Build the HTML for the bar
        const barHTML = `
            <div class="chart-bar-group">
                <div class="chart-value">${waterAmount.toFixed(1)}L</div>
                <div class="chart-bar ${waterAmount === 0 ? 'empty' : ''}" style="height: ${heightPercent}%;"></div>
                <div class="chart-label">${dayName}</div>
            </div>
        `;
        waterChart.innerHTML += barHTML;
    });
}

/* =========================================
   8. NAVIGATION LOGIC (SPA Switching)
   ========================================= */
navLinks.forEach(link => {
    link.addEventListener('click', function() {
        navLinks.forEach(l => l.classList.remove('active'));
        pages.forEach(page => page.classList.remove('active-page'));

        this.classList.add('active');
        const targetId = this.getAttribute('data-target');
        document.getElementById(targetId).classList.add('active-page');
        
        // Re-render chart if navigating to analytics to ensure smooth animation
        if (targetId === 'page-analytics') {
            renderChart();
        }
    });
});

/* =========================================
   9. INITIALIZATION
   ========================================= */
// Run everything on page load
loadData(); 
updateWaterUI();
updateTimerUI();
updateStreakUI();
updateFocusUI();
greetingName.innerText = userName; 
renderChart(); 