// JavaScript Section

// --- SENTENCE LISTS FOR EACH DIFFICULTY ---
const easySentences = [
    "the quick brown fox jumps over the lazy dog", "pack my box with five dozen liquor jugs", "sphinx of black quartz judge my vow", "how vexingly quick daft zebras jump", "the five boxing wizards jump quickly", "a quick brown fox jumps over the lazy dog"
];
const mediumSentences = [
    "The quick brown fox jumps over the lazy dog.", "Pack my box with five dozen liquor jugs!", "The five boxing wizards jump quickly.", "How vexingly quick daft zebras jump?", "Bright vixens jump; dozy fowl quack.", "Sphinx of black quartz, judge my vow.", "Jinxed wizards pluck ivy from the big quilt."
];
const hardSentences = [
    "Amazingly few discotheques provide jukeboxes, yet they draw a crowd of 100 to 200 people.", "My girl wove six dozen plaid jackets before she quit her job, earning $4,580.", "The job requires extra pluck and zeal from every young wage earner, for just 69 cents an hour!", "Big July earthquakes confound zany experimental vow involving quartz fume pipe.", "A wizard’s job is to vex chumps quickly in fog with a glyph, a job that pays $1,234.56."
];

// --- GLOBAL VARIABLES ---
let currentSentence = "", lastPlayedSentence = "", userInput = "", startTime = null, mistakeIndices = new Set(), gameReady = false, gameInProgress = false, gameFinished = false, timerInterval = null, lastResultText = "";
let lastGameStats = { totalTime: 0, netWPM: 0 };
let canRestart = true;
let highScores = JSON.parse(localStorage.getItem("flashFingersHighScores")) || {};

// --- GAME MODE & DIFFICULTY ---
let currentGameMode = localStorage.getItem('gameMode') || 'Time Attack';
let currentDifficulty = localStorage.getItem('gameDifficulty') || 'Medium';
let currentTimeLimit = parseInt(localStorage.getItem('timeLimit')) || 30;
let guideEnabled = localStorage.getItem('guideEnabled') !== 'false';

// --- CHART VARIABLES ---
let wpmInterval = null;
let wpmData = [];
let timeData = [];
let liveWpmChart = null;
let finalWpmChart = null;

// --- GETTING ALL ELEMENTS ---
const display = document.getElementById("display"), typingBox = document.getElementById("typingBox"), stats = document.getElementById("stats"), startButton = document.getElementById("startButton"), restartButton = document.getElementById("restartButton"), statusIndicator = document.getElementById("statusIndicator"), message = document.getElementById("message"), resultButtons = document.getElementById("resultButtons"), downloadResultBtn = document.getElementById("downloadResultBtn"), toast = document.getElementById("toast"), tooltip = document.getElementById("tooltip"), restartIconTop = document.getElementById("restartIconTop"), gameLogo = document.getElementById("gameLogo"), graphContainer = document.getElementById("graphContainer");

// AUDIO & ADs
const buttonSound = document.getElementById("buttonSound"), wrongSound = document.getElementById("wrongSound"), highScoreSound = document.getElementById("highScoreSound"), bg1Sound = document.getElementById("bg1Sound"), bg2Sound = document.getElementById("bg2Sound"), typeSound = document.getElementById("typeSound"), enterSound = document.getElementById("enterSound"), startSound = document.getElementById("startSound");
const skipAdBtn = document.getElementById("skipAdBtn"), adTimer = document.getElementById("adTimer"), adContent = document.getElementById("adContent"), adImage = adContent.querySelector("img");

// ICONS & MENU
const soundIcon = document.getElementById("soundIcon"), resetIcon = document.getElementById("resetIcon"), aboutIcon = document.getElementById("aboutIcon"), homeIcon = document.getElementById("homeIcon"), mobileMenuBtn = document.getElementById("mobileMenuBtn"), mobileMenu = document.getElementById("mobileMenu"), mobileSoundIcon = document.getElementById("mobileSoundIcon"), mobileResetIcon = document.getElementById("mobileResetIcon"), mobileAboutIcon = document.getElementById("mobileAboutIcon"), mobileHomeIcon = document.getElementById("mobileHomeIcon");

// MODALS
const resultModal = document.getElementById("resultModal"), soundModal = document.getElementById("soundModal"), settingsModal = document.getElementById("settingsModal"), resetScoresModal = document.getElementById("resetScoresModal"), aboutModal = document.getElementById("aboutModal"), adModal = document.getElementById("adModal"), highScoreModal = document.getElementById("highScoreModal"), scoreInfoModal = document.getElementById("scoreInfoModal"), optionsModal = document.getElementById('optionsModal');

// MODAL CONTENT/BUTTONS
const resultModalClose = document.getElementById("resultModalClose"), resultText = document.getElementById("resultText"), modalDownloadBtn = document.getElementById("modalDownloadBtn"), shareResultBtn = document.getElementById("shareResultBtn"), watchAdAgainBtn = document.getElementById("watchAdAgainBtn"), soundModalClose = document.getElementById("soundModalClose"), soundOnButton = document.getElementById("soundOnButton"), soundOffButton = document.getElementById("soundOffButton"), aboutModalClose = document.getElementById("aboutModalClose"), howToPlayHeader = document.getElementById("howToPlayHeader"), aboutGameHeader = document.getElementById("aboutGameHeader"), aboutCreatorHeader = document.getElementById("aboutCreatorHeader"), contactHeader = document.getElementById("contactHeader"), howToPlayContent = document.getElementById("howToPlayContent"), aboutGameContent = document.getElementById("aboutGameContent"), aboutCreatorContent = document.getElementById("aboutCreatorContent"), contactContent = document.getElementById("contactContent"), showHighScoreBtn = document.getElementById("showHighScoreBtn"), highScoreModalClose = document.getElementById("highScoreModalClose"), highScoreList = document.getElementById("highScoreList"), scoreInfoModalClose = document.getElementById("scoreInfoModalClose"), scoreInfoContent = document.getElementById("scoreInfoContent"), optionsBtn = document.getElementById('optionsBtn'), optionsModalClose = document.getElementById('optionsModalClose'), easyBtn = document.getElementById('easyBtn'), mediumBtn = document.getElementById('mediumBtn'), hardBtn = document.getElementById('hardBtn'), settingsModalClose = document.getElementById('settingsModalClose'), guideOnBtn = document.getElementById('guideOnBtn'), guideOffBtn = document.getElementById('guideOffBtn'), resetScoresBtn = document.getElementById('resetScoresBtn'), resetScoresModalClose = document.getElementById('resetScoresModalClose'), resetScoreList = document.getElementById('resetScoreList');

// TIME MODE ELEMENTS
const normalModeBtn = document.getElementById('normalModeBtn'), timeModeBtn = document.getElementById('timeModeBtn'), difficultySection = document.getElementById('difficultySection'), timeOptionsSection = document.getElementById('timeOptionsSection'), time30Btn = document.getElementById('time30Btn'), time60Btn = document.getElementById('time60Btn'), time120Btn = document.getElementById('time120Btn');

// --- MODAL MANAGEMENT SYSTEM ---
function closeAllModals() { document.querySelectorAll('.modal').forEach(modal => modal.style.display = 'none'); if(watchAdAgainBtn) watchAdAgainBtn.classList.remove('visible'); }
function openModal(modalElement) { closeAllModals(); if(modalElement) modalElement.style.display = 'flex'; }

// --- SOUND MANAGEMENT ---
let soundEnabled = localStorage.getItem("soundEnabled") !== "false";
if (soundEnabled && bg2Sound) bg2Sound.play().catch(()=>{});
function playSound(audio) { if (soundEnabled && audio) { audio.currentTime = 0; audio.play().catch(() => {}); } }
function updateSoundButtons() {
    if(soundOnButton) soundOnButton.className = "modal-button " + (soundEnabled ? "green-bg" : "grey-bg");
    if(soundOffButton) soundOffButton.className = "modal-button " + (!soundEnabled ? "green-bg" : "grey-bg");
}

// --- GUIDE (HINT) MANAGEMENT ---
function updateGuideButtons() {
    if(guideOnBtn) guideOnBtn.className = "modal-button " + (guideEnabled ? "green-bg" : "grey-bg");
    if(guideOffBtn) guideOffBtn.className = "modal-button " + (!guideEnabled ? "green-bg" : "grey-bg");
}
function showGuideTooltip(message) {
    if(!tooltip) return;
    tooltip.textContent = message;
    tooltip.style.display = 'block';
    setTimeout(() => { tooltip.style.display = 'none'; }, 1500);
}

// --- ABOUT MODAL TABS ---
function showAboutSection(section) {
    [howToPlayContent, aboutGameContent, aboutCreatorContent, contactContent].forEach(c => { if(c) c.classList.remove("active"); });
    if(section) section.classList.add("active");
}

// --- DISPLAY & GAME LOGIC ---
function updateDisplay() {
    if (!display) return;
    const existingCursor = display.querySelector('.cursor');
    if (existingCursor) existingCursor.classList.remove('cursor');
    display.innerHTML = "";
    const sentenceToDisplay = currentSentence.replace(/’/g, "'");
    for (let i = 0; i < sentenceToDisplay.length; i++) {
        const char = sentenceToDisplay[i];
        const span = document.createElement("span");
        if (i < userInput.length) {
            const userChar = userInput[i].replace(/’/g, "'");
            if (userChar === char) {
                span.className = "green-text";
            } else {
                span.className = char === " " ? "space-error" : "red-text";
            }
        }
        span.textContent = char === " " ? "\u00A0" : char;
        display.appendChild(span);
    }
    const cursorSpan = display.children[userInput.length];
    if (cursorSpan) {
        cursorSpan.classList.add('cursor');
        cursorSpan.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
}

function prepareGame(useLastSentence = false) {
    closeAllModals();
    if (wpmInterval) clearInterval(wpmInterval);
    if (liveWpmChart) liveWpmChart.destroy();
    wpmData = []; timeData = []; liveWpmChart = null;
    if(graphContainer) graphContainer.style.display = 'none';
    if(restartIconTop) restartIconTop.style.display = 'none';
    if(gameLogo) gameLogo.style.display = 'none';

    if (currentGameMode === 'Normal') {
        if (useLastSentence && lastPlayedSentence) {
            currentSentence = lastPlayedSentence;
        } else {
            let sentencePool = currentDifficulty === 'Easy' ? easySentences : (currentDifficulty === 'Hard' ? hardSentences : mediumSentences);
            currentSentence = sentencePool[Math.floor(Math.random() * sentencePool.length)];
            lastPlayedSentence = currentSentence;
        }
    } else {
        let allSentences = [...easySentences, ...mediumSentences, ...hardSentences];
        currentSentence = allSentences.sort(() => Math.random() - 0.5).join(" ");
    }
    
    canRestart = true; userInput = ""; mistakeIndices.clear(); startTime = null; gameReady = true; gameInProgress = false; gameFinished = false;
    if(statusIndicator) {
        statusIndicator.classList.remove("active", "green");
        statusIndicator.textContent = currentGameMode === 'Time Attack' ? currentTimeLimit.toFixed(2) : "0.00";
    }
    updateDisplay();
    if(display) display.style.display = "block";
    if(resultButtons) resultButtons.style.display = "none";
    if(restartButton) restartButton.disabled = false;
    if(stats) stats.innerHTML = "";
    if(message) message.innerHTML = "";
    if(startButton) startButton.style.display = "none";
    if(optionsBtn) optionsBtn.style.display = 'none';
    if(showHighScoreBtn) showHighScoreBtn.style.display = 'none';
    
    if (soundEnabled) { if(bg2Sound) bg2Sound.pause(); if(bg1Sound) bg1Sound.play(); }
    if(typingBox) {
        typingBox.value = "";
        typingBox.focus();
    }
}

function startTimer() {
    if (gameInProgress) return;
    gameInProgress = true; gameReady = false;
    if(statusIndicator) statusIndicator.classList.add("active", "green");
    if(graphContainer) graphContainer.style.display = 'block';
    startTime = new Date();
    playSound(startSound);

    timerInterval = setInterval(() => {
        const elapsed = (new Date() - startTime) / 1000;
        if (currentGameMode === 'Time Attack') {
            const remaining = Math.max(0, currentTimeLimit - elapsed);
            if(statusIndicator) statusIndicator.textContent = remaining.toFixed(2);
            if (remaining <= 0) finishGame();
        } else {
            if(statusIndicator) statusIndicator.textContent = elapsed.toFixed(2);
        }
    }, 10);

    let seconds = 0;
    wpmInterval = setInterval(() => {
        seconds++;
        const elapsedMinutes = seconds / 60;
        const currentWPM = Math.round((userInput.length / 5) / elapsedMinutes) || 0;
        wpmData.push(currentWPM);
        timeData.push(`${seconds}s`);
        initOrUpdateLiveChart();
    }, 1000);
}

function finishGame() {
    if (!gameInProgress) return;
    playSound(enterSound);
    clearInterval(wpmInterval);
    const existingCursor = display.querySelector('.cursor');
    if (existingCursor) existingCursor.classList.remove('cursor');

    const endTime = new Date();
    const actualTime = (endTime - startTime) / 1000;
    const finalTime = currentGameMode === 'Time Attack' ? Math.min(actualTime, currentTimeLimit) : actualTime;
    
    mistakeIndices.clear();
    const normalizedSentence = currentSentence.replace(/’/g, "'");
    for (let i = 0; i < userInput.length; i++) {
        if (i >= normalizedSentence.length || userInput[i].replace(/’/g, "'") !== normalizedSentence[i]) {
            mistakeIndices.add(i);
        }
    }
    const mistakesCount = mistakeIndices.size;
    const correctChars = userInput.length - mistakesCount;
    const accuracy = ((correctChars / (userInput.length || 1)) * 100).toFixed(1);
    const grossWPM = Math.round((userInput.length / 5) / (finalTime / 60)) || 0;
    const netWPM = Math.round((correctChars / 5) / (finalTime / 60)) || 0;
    
    if (currentGameMode === 'Normal') {
        const penalty = mistakesCount * 0.5;
        const totalTime = actualTime + penalty;
        lastGameStats = { totalTime, netWPM };
        
        let newHighScore = false;
        const currentHighScore = highScores[currentDifficulty] ? highScores[currentDifficulty].time : Infinity;
        if (accuracy >= 90 && totalTime < currentHighScore) {
            newHighScore = true;
            highScores[currentDifficulty] = { time: totalTime, sentence: currentSentence, mistakes: mistakesCount, accuracy: accuracy };
            localStorage.setItem("flashFingersHighScores", JSON.stringify(highScores));
            if(message) message.innerHTML = "<span style='color:#00ff00; font-size:24px;'>🏆 New High Score! 🏆</span>";
            playSound(highScoreSound);
            setTimeout(() => { if(message) message.innerHTML = ""; }, 3000);
        }
        lastResultText = `🏆 FLASH FINGERS - RESULT (Normal) 🏆\n\nDifficulty: ${currentDifficulty}\n📝 Sentence: "${currentSentence}"\n⏱ Time Taken: ${actualTime.toFixed(2)}s\n🏃 Gross WPM: ${grossWPM}\n🎯 Net WPM: ${netWPM}\n⏰ Penalty: ${penalty.toFixed(2)}s\n❌ Mistakes: ${mistakesCount}\n🎯 Accuracy: ${accuracy}%\n🏁 Final Time: ${totalTime.toFixed(2)}s`;
    } else {
        const modeKey = `TimeAttack_${currentTimeLimit}`;
        const currentBestChars = highScores[modeKey] ? highScores[modeKey].chars : 0;
        if (userInput.length > currentBestChars) {
            highScores[modeKey] = { chars: userInput.length, correct: correctChars, accuracy: accuracy, wpm: netWPM };
            localStorage.setItem("flashFingersHighScores", JSON.stringify(highScores));
            if(message) message.innerHTML = "<span style='color:#00ff00; font-size:24px;'>🏆 New Time Attack Record! 🏆</span>";
            playSound(highScoreSound);
            setTimeout(() => { if(message) message.innerHTML = ""; }, 3000);
        }
        lastResultText = `🏆 FLASH FINGERS - RESULT (Time Attack) 🏆\n\nTime Limit: ${currentTimeLimit}s\n✍️ Characters Typed: ${userInput.length}\n✅ Correct Chars: ${correctChars}\n❌ Mistakes: ${mistakesCount}\n🎯 Accuracy: ${accuracy}%\n🏃 WPM: ${netWPM}`;
    }

    if(stats) stats.innerHTML = `<b>--- Result ---</b><br>🏃 WPM: ${netWPM}<br>🎯 Accuracy: ${accuracy}%<br>❌ Mistakes: ${mistakesCount}`;
    if(restartIconTop && currentGameMode === 'Normal') restartIconTop.style.display = 'block';
    if(resultButtons) resultButtons.style.display = "flex";
    if(statusIndicator) statusIndicator.classList.remove("active", "green");
    clearInterval(timerInterval);
    timerInterval = null;
    if (soundEnabled) { if(bg1Sound) bg1Sound.pause(); if(bg2Sound) bg2Sound.play(); }
    gameFinished = true; gameInProgress = false; gameReady = false;
    canRestart = false; if(restartButton) restartButton.disabled = true;
    setTimeout(() => { 
        canRestart = true; 
        if(restartButton) restartButton.disabled = false; 
    }, 3000);
}

// --- CHART FUNCTIONS ---
function initOrUpdateLiveChart() {
    const ctx = document.getElementById('liveWpmChart').getContext('2d');
    if (!liveWpmChart) {
        liveWpmChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: timeData,
                datasets: [{
                    label: 'Live WPM',
                    data: wpmData,
                    borderColor: '#00ffcc',
                    backgroundColor: 'rgba(0, 255, 204, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                scales: { y: { beginAtZero: true, ticks: { color: '#ffffff' } }, x: { ticks: { color: '#ffffff' } } },
                plugins: { legend: { display: false } },
                responsive: true,
                maintainAspectRatio: false
            }
        });
    } else {
        liveWpmChart.data.labels = timeData;
        liveWpmChart.data.datasets[0].data = wpmData;
        liveWpmChart.update();
    }
}
function renderFinalGraph() {
    const ctx = document.getElementById('finalWpmChart').getContext('2d');
    if (finalWpmChart) finalWpmChart.destroy();
    finalWpmChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: timeData,
            datasets: [{
                label: 'WPM Over Time',
                data: wpmData,
                borderColor: '#00ffcc',
                backgroundColor: 'rgba(0, 255, 204, 0.2)',
                borderWidth: 2,
                fill: true,
                tension: 0.3,
                pointRadius: 3,
                pointBackgroundColor: '#00ffcc'
            }]
        },
        options: {
            scales: { y: { beginAtZero: true, ticks: { color: '#ffffff' }, grid: { color: 'rgba(255,255,255,0.1)' } }, x: { ticks: { color: '#ffffff' }, grid: { color: 'rgba(255,255,255,0.1)' } } },
            plugins: { legend: { labels: { color: '#ffffff' } } },
            responsive: true,
            maintainAspectRatio: false
        }
    });
}


// --- MODE & DIFFICULTY SELECTION ---
function updateModeButtons() {
    if(normalModeBtn) normalModeBtn.classList.toggle('active', currentGameMode === 'Normal');
    if(timeModeBtn) timeModeBtn.classList.toggle('active', currentGameMode === 'Time Attack');
    if(difficultySection) difficultySection.style.display = currentGameMode === 'Normal' ? 'block' : 'none';
    if(timeOptionsSection) timeOptionsSection.style.display = currentGameMode === 'Time Attack' ? 'block' : 'none';
}
function updateTimeButtons() {
    if(time30Btn) time30Btn.classList.toggle('active', currentTimeLimit === 30);
    if(time60Btn) time60Btn.classList.toggle('active', currentTimeLimit === 60);
    if(time120Btn) time120Btn.classList.toggle('active', currentTimeLimit === 120);
}
function updateDifficultyButtons() {
    if(easyBtn) easyBtn.classList.toggle('active', currentDifficulty === 'Easy');
    if(mediumBtn) mediumBtn.classList.toggle('active', currentDifficulty === 'Medium');
    if(hardBtn) hardBtn.classList.toggle('active', currentDifficulty === 'Hard');
}

if(normalModeBtn) normalModeBtn.addEventListener('click', () => { currentGameMode = 'Normal'; localStorage.setItem('gameMode', 'Normal'); updateModeButtons(); playSound(buttonSound); });
if(timeModeBtn) timeModeBtn.addEventListener('click', () => { currentGameMode = 'Time Attack'; localStorage.setItem('gameMode', 'Time Attack'); updateModeButtons(); playSound(buttonSound); });
if(time30Btn) time30Btn.addEventListener('click', () => { currentTimeLimit = 30; localStorage.setItem('timeLimit', 30); updateTimeButtons(); playSound(buttonSound); });
if(time60Btn) time60Btn.addEventListener('click', () => { currentTimeLimit = 60; localStorage.setItem('timeLimit', 60); updateTimeButtons(); playSound(buttonSound); });
if(time120Btn) time120Btn.addEventListener('click', () => { currentTimeLimit = 120; localStorage.setItem('timeLimit', 120); updateTimeButtons(); playSound(buttonSound); });
if(easyBtn) easyBtn.addEventListener('click', () => { currentDifficulty = 'Easy'; localStorage.setItem('gameDifficulty', 'Easy'); updateDifficultyButtons(); playSound(buttonSound); });
if(mediumBtn) mediumBtn.addEventListener('click', () => { currentDifficulty = 'Medium'; localStorage.setItem('gameDifficulty', 'Medium'); updateDifficultyButtons(); playSound(buttonSound); });
if(hardBtn) hardBtn.addEventListener('click', () => { currentDifficulty = 'Hard'; localStorage.setItem('gameDifficulty', 'Hard'); updateDifficultyButtons(); playSound(buttonSound); });

// --- EVENT LISTENERS ---
document.addEventListener("keydown", (e) => {
    if (startButton.style.display !== "none" && e.key === "Enter") {
        e.preventDefault(); 
        playSound(buttonSound); 
        prepareGame();
    }
    if (gameFinished && e.key === "Enter") {
        if (!canRestart) return;
        gtag('event', 'game_restart', { 'method': 'enter_key' });
        e.preventDefault(); 
        playSound(buttonSound); 
        prepareGame();
    }
});

if(typingBox) {
    typingBox.addEventListener("input", () => {
        if (gameFinished) return;
        if (!gameInProgress && gameReady) {
            if(window.gtag) gtag('event', 'game_start', { mode: currentGameMode });
            startTimer();
        }
        userInput = typingBox.value;
        updateDisplay();
        
        const typedIndex = userInput.length - 1;
        if (typedIndex < 0) return;

        const typedChar = userInput[typedIndex].replace(/’/g, "'");
        const targetChar = currentSentence[typedIndex] ? currentSentence[typedIndex].replace(/’/g, "'") : '';

        if (typedChar) {
            playSound(typedChar !== targetChar ? wrongSound : typeSound);
            if (guideEnabled && targetChar && typedChar.toLowerCase() === targetChar.toLowerCase() && typedChar !== targetChar) {
                showGuideTooltip(typedChar === typedChar.toLowerCase() ? "Capital needed" : "Lowercase needed");
            }
        }
        if (currentGameMode === 'Normal' && userInput.length === currentSentence.length) {
            finishGame();
        }
    });
    typingBox.addEventListener('paste', (e) => e.preventDefault());
}

if(startButton) startButton.addEventListener("click", () => { playSound(buttonSound); prepareGame(); });
if(restartButton) restartButton.addEventListener("click", () => { if (!canRestart) return; playSound(buttonSound); prepareGame(); });
if(optionsBtn) optionsBtn.addEventListener('click', () => { playSound(buttonSound); updateModeButtons(); updateTimeButtons(); updateDifficultyButtons(); openModal(optionsModal); });

// --- HIGH SCORE DISPLAY & RESET ---
function displayHighScores() {
    if(!highScoreList) return;
    highScoreList.innerHTML = "";
    
    const normalHeader = document.createElement('h3');
    normalHeader.textContent = "Normal Mode";
    normalHeader.style.color = "#00ffcc";
    normalHeader.style.borderBottom = "1px solid #3a3a4f";
    normalHeader.style.paddingBottom = "5px";
    highScoreList.appendChild(normalHeader);

    ['Easy', 'Medium', 'Hard'].forEach(level => {
        const scoreData = highScores[level];
        const scoreEntry = document.createElement('div');
        scoreEntry.className = 'score-entry';
        let timeDisplay = "No record yet";
        let infoIconHTML = "";
        if (scoreData) {
            timeDisplay = `${scoreData.time.toFixed(2)} seconds`;
            infoIconHTML = `<span class="info-icon" data-type="normal" data-level="${level}">ℹ️</span>`;
        }
        scoreEntry.innerHTML = `<span class="score-difficulty">${level}</span><span class="score-time">${timeDisplay}</span><span class="score-actions">${infoIconHTML}</span>`;
        highScoreList.appendChild(scoreEntry);
    });

    const timeHeader = document.createElement('h3');
    timeHeader.textContent = "Time Attack Mode";
    timeHeader.style.color = "#00ffcc";
    timeHeader.style.borderBottom = "1px solid #3a3a4f";
    timeHeader.style.paddingBottom = "5px";
    timeHeader.style.marginTop = "20px";
    highScoreList.appendChild(timeHeader);

    [30, 60, 120].forEach(limit => {
        const level = `TimeAttack_${limit}`;
        const scoreData = highScores[level];
        const scoreEntry = document.createElement('div');
        scoreEntry.className = 'score-entry';
        let displayVal = "No record yet";
        let infoIconHTML = "";
        if (scoreData) {
            displayVal = `${scoreData.chars} chars (${scoreData.wpm} WPM)`;
            infoIconHTML = `<span class="info-icon" data-type="time" data-level="${level}" data-limit="${limit}">ℹ️</span>`;
        }
        scoreEntry.innerHTML = `<span class="score-difficulty">${limit}s</span><span class="score-time">${displayVal}</span><span class="score-actions">${infoIconHTML}</span>`;
        highScoreList.appendChild(scoreEntry);
    });

    document.querySelectorAll('.info-icon').forEach(icon => {
        icon.addEventListener('click', (e) => {
            const level = e.target.getAttribute('data-level');
            const type = e.target.getAttribute('data-type');
            const scoreData = highScores[level];
            if (scoreData) {
                if (type === 'normal') {
                    if(scoreInfoContent) scoreInfoContent.innerHTML = `<p><strong>Difficulty:</strong> ${level}</p><p><strong>Time:</strong> ${scoreData.time.toFixed(2)}s</p><p><strong>Accuracy:</strong> ${scoreData.accuracy}%</p><p><strong>Mistakes:</strong> ${scoreData.mistakes}</p><p><strong>Sentence:</strong> "${scoreData.sentence}"</p>`;
                } else {
                    const limit = e.target.getAttribute('data-limit');
                    if(scoreInfoContent) scoreInfoContent.innerHTML = `<p><strong>Time Limit:</strong> ${limit}s</p><p><strong>Total Chars:</strong> ${scoreData.chars}</p><p><strong>Correct Chars:</strong> ${scoreData.correct}</p><p><strong>Accuracy:</strong> ${scoreData.accuracy}%</p><p><strong>WPM:</strong> ${scoreData.wpm}</p>`;
                }
                openModal(scoreInfoModal);
            }
        });
    });
}
function displayScoresForReset() {
    if(!resetScoreList) return;
    resetScoreList.innerHTML = "";
    
    ['Easy', 'Medium', 'Hard'].forEach(level => {
        const scoreData = highScores[level];
        const scoreEntry = document.createElement('div');
        scoreEntry.className = 'score-entry';
        let timeDisplay = "No record";
        let deleteIconHTML = "";
        if (scoreData) {
            timeDisplay = `${scoreData.time.toFixed(2)}s`;
            deleteIconHTML = `<span class="delete-icon" data-level="${level}">🗑️</span>`;
        }
        scoreEntry.innerHTML = `<span class="score-difficulty">${level}</span><span class="score-time">${timeDisplay}</span><span class="score-actions">${deleteIconHTML}</span>`;
        resetScoreList.appendChild(scoreEntry);
    });

    [30, 60, 120].forEach(limit => {
        const level = `TimeAttack_${limit}`;
        const scoreData = highScores[level];
        const scoreEntry = document.createElement('div');
        scoreEntry.className = 'score-entry';
        let displayVal = "No record";
        let deleteIconHTML = "";
        if (scoreData) {
            displayVal = `${limit}s: ${scoreData.chars} chars`;
            deleteIconHTML = `<span class="delete-icon" data-level="${level}">🗑️</span>`;
        }
        scoreEntry.innerHTML = `<span class="score-difficulty">Time ${limit}s</span><span class="score-time">${displayVal}</span><span class="score-actions">${deleteIconHTML}</span>`;
        resetScoreList.appendChild(scoreEntry);
    });

    document.querySelectorAll('.delete-icon').forEach(icon => {
        icon.addEventListener('click', (e) => {
            const level = e.target.getAttribute('data-level');
            if (confirm(`Are you sure you want to reset the '${level}' record?`)) {
                delete highScores[level];
                localStorage.setItem("flashFingersHighScores", JSON.stringify(highScores));
                playSound(buttonSound);
                displayScoresForReset();
            }
        });
    });
}

// Global UI Event Listeners
if(showHighScoreBtn) showHighScoreBtn.addEventListener("click", () => { playSound(buttonSound); displayHighScores(); openModal(highScoreModal); });
if(restartIconTop) restartIconTop.addEventListener('click', () => { playSound(buttonSound); prepareGame(true); });
if(soundIcon) soundIcon.addEventListener("click", () => { playSound(buttonSound); openModal(soundModal); });
if(resetIcon) resetIcon.addEventListener("click", () => { playSound(buttonSound); openModal(settingsModal); });
if(aboutIcon) aboutIcon.addEventListener("click", () => { playSound(buttonSound); openModal(aboutModal); showAboutSection(howToPlayContent); });
if(homeIcon) homeIcon.addEventListener("click", () => { playSound(buttonSound); location.reload(); });
if(mobileMenuBtn) mobileMenuBtn.addEventListener("click", () => { playSound(buttonSound); if(mobileMenu) mobileMenu.style.display = mobileMenu.style.display === "flex" ? "none" : "flex"; });
if(mobileSoundIcon) mobileSoundIcon.addEventListener("click", () => { playSound(buttonSound); openModal(soundModal); if(mobileMenu) mobileMenu.style.display = "none"; });
if(mobileResetIcon) mobileResetIcon.addEventListener("click", () => { playSound(buttonSound); openModal(settingsModal); if(mobileMenu) mobileMenu.style.display = "none"; });
if(mobileAboutIcon) mobileAboutIcon.addEventListener("click", () => { playSound(buttonSound); openModal(aboutModal); showAboutSection(howToPlayContent); if(mobileMenu) mobileMenu.style.display = "none"; });
if(mobileHomeIcon) mobileHomeIcon.addEventListener("click", () => { playSound(buttonSound); location.reload(); });
if(soundOnButton) soundOnButton.addEventListener("click", () => { soundEnabled = true; localStorage.setItem("soundEnabled", "true"); updateSoundButtons(); playSound(buttonSound); if(bg2Sound) bg2Sound.play().catch(()=>{}); });
if(soundOffButton) soundOffButton.addEventListener("click", () => { soundEnabled = false; localStorage.setItem("soundEnabled", "false"); if(bg1Sound) bg1Sound.pause(); if(bg2Sound) bg2Sound.pause(); updateSoundButtons(); playSound(buttonSound); });
if(guideOnBtn) guideOnBtn.addEventListener('click', () => { guideEnabled = true; localStorage.setItem('guideEnabled', 'true'); updateGuideButtons(); playSound(buttonSound); });
if(guideOffBtn) guideOffBtn.addEventListener('click', () => { guideEnabled = false; localStorage.setItem('guideEnabled', 'false'); updateGuideButtons(); playSound(buttonSound); });
if(resetScoresBtn) resetScoresBtn.addEventListener('click', () => { playSound(buttonSound); displayScoresForReset(); openModal(resetScoresModal); });
if(howToPlayHeader) howToPlayHeader.addEventListener("click", () => { playSound(buttonSound); showAboutSection(howToPlayContent); });
if(aboutGameHeader) aboutGameHeader.addEventListener("click", () => { playSound(buttonSound); showAboutSection(aboutGameContent); });
if(aboutCreatorHeader) aboutCreatorHeader.addEventListener("click", () => { playSound(buttonSound); showAboutSection(aboutCreatorContent); });
if(contactHeader) contactHeader.addEventListener("click", () => { playSound(buttonSound); showAboutSection(contactContent); });

[optionsModalClose, resultModalClose, soundModalClose, settingsModalClose, aboutModalClose, highScoreModalClose, scoreInfoModalClose, resetScoresModalClose].forEach(btn => {
    if(btn) btn.addEventListener('click', () => { playSound(buttonSound); closeAllModals(); });
});

// Ad & Result logic
const advertisers = [
    { id: 'client_A', imageUrl: 'https://via.placeholder.com/800x400.png?text=Fashion+Store+Ad', targetUrl: 'https://www.instagram.com/fashionstore' },
    { id: 'client_B', imageUrl: 'https://via.placeholder.com/800x400.png?text=Gaming+Cafe+Ad', targetUrl: 'https://www.instagram.com/gamingcafe' }
];
const defaultAd = { id: 'default', imageUrl: 'https://via.placeholder.com/800x400.png?text=Advertise+Here!', targetUrl: 'https://www.instagram.com/elia' };
let currentAd = null;

function showAd(withTimer = true) {
    if(adModal) {
        currentAd = advertisers[Math.floor(Math.random() * advertisers.length)] || defaultAd;
        
        adModal.style.display = 'flex';
        setTimeout(() => adModal.style.opacity = '1', 10);
        if(adContent) adContent.href = currentAd.targetUrl;
        if(adImage) adImage.src = currentAd.imageUrl;
        
        if (withTimer) {
            if(skipAdBtn) skipAdBtn.style.display = 'none';
            if(adTimer) adTimer.style.display = 'block';
            let countdown = 3;
            if(adTimer) adTimer.textContent = countdown;
            const interval = setInterval(() => {
                countdown--;
                if(adTimer) adTimer.textContent = countdown;
                if (countdown <= 0) {
                    clearInterval(interval);
                    if(adTimer) adTimer.style.display = 'none';
                    if(skipAdBtn) skipAdBtn.style.display = 'block';
                }
            }, 1000);
        } else {
            if(adTimer) adTimer.style.display = 'none';
            if(skipAdBtn) skipAdBtn.style.display = 'block';
        }
        if(window.gtag) gtag('event', 'ad_shown', { 'advertiser_id': currentAd.id });
    }
}

if(skipAdBtn) skipAdBtn.addEventListener('click', () => {
    if(currentAd && window.gtag) gtag('event', 'ad_skipped', { 'advertiser_id': currentAd.id });

    const adRect = adModal.getBoundingClientRect();
    const clone = document.createElement('div');
    clone.id = 'ad-clone';
    clone.style.left = `${adRect.left}px`;
    clone.style.top = `${adRect.top}px`;
    clone.style.width = `${adRect.width}px`;
    clone.style.height = `${adRect.height}px`;
    document.body.appendChild(clone);
    
    adModal.style.opacity = '0';
    setTimeout(() => adModal.style.display = 'none', 300);
    
    resultText.textContent = lastResultText;
    renderFinalGraph(); // Render graph right before showing modal
    openModal(resultModal);
    
    requestAnimationFrame(() => {
        const targetRect = watchAdAgainBtn.getBoundingClientRect();
        setTimeout(() => {
            clone.style.left = `${targetRect.left}px`;
            clone.style.top = `${targetRect.top}px`;
            clone.style.width = `${targetRect.width}px`;
            clone.style.height = `${targetRect.height}px`;
            clone.style.borderRadius = '50%';
        }, 10);
    });

    setTimeout(() => {
        clone.remove();
        if(watchAdAgainBtn) watchAdAgainBtn.classList.add('visible');
    }, 1200);
});

if(downloadResultBtn) downloadResultBtn.addEventListener('click', () => { playSound(buttonSound); showAd(true); });
if(modalDownloadBtn) modalDownloadBtn.addEventListener('click', () => {
    if(window.gtag) gtag('event', 'result_downloaded');
    const blob = new Blob([lastResultText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "flashfingers_result.txt";
    a.click();
    URL.revokeObjectURL(url);
    playSound(buttonSound);
});

if(shareResultBtn) shareResultBtn.addEventListener('click', () => {
    if(window.gtag) gtag('event', 'result_shared');
    const { totalTime, netWPM } = lastGameStats;
    const shareText = `I scored ${totalTime.toFixed(2)}s with ${netWPM} WPM on '${currentDifficulty}' in Flash Fingers! Can you beat me? 🏆\n\nPlay here: ${window.location.href}`;
    const isMobile = /Mobi|Android|iPhone/i.test(navigator.userAgent);

    if (isMobile && navigator.share) {
        navigator.share({
            title: 'Flash Fingers Typing Result',
            text: shareText,
        }).catch((error) => console.log('Error sharing:', error));
    } else {
        navigator.clipboard.writeText(shareText).then(() => {
            toast.innerText = "Result copied! Ready to share."; 
            toast.style.display = "block"; 
            setTimeout(() => toast.style.display = "none", 3000); 
            playSound(buttonSound);
        });
    }
});

if(watchAdAgainBtn) watchAdAgainBtn.addEventListener("click", () => {
    playSound(buttonSound);
    closeAllModals();
    if(adModal && currentAd) {
        adModal.style.display = 'flex';
        setTimeout(() => adModal.style.opacity = '1', 10);
        
        if(adContent) adContent.href = currentAd.targetUrl;
        if(adImage) adImage.src = currentAd.imageUrl;
        
        if(adTimer) adTimer.style.display = 'none';
        if(skipAdBtn) skipAdBtn.style.display = 'block';
    }
});

updateSoundButtons();
updateGuideButtons();
updateModeButtons();
updateTimeButtons();
updateDifficultyButtons();