document.addEventListener('DOMContentLoaded', () => {
    // === DOM Elemente ===
    const startScreen = document.getElementById('start-screen');
    const testScreen = document.getElementById('test-screen');
    const pauseScreen = document.getElementById('pause-screen');
    const resultsScreen = document.getElementById('results-screen');
    
    const startButton = document.getElementById('start-button');
    const restartButton = document.getElementById('restart-button');
    
    const keyContainer = document.getElementById('key-table-container');
    const challengeContainer = document.getElementById('challenge-container');
    const timerDisplay = document.getElementById('timer');
    const pauseTimerDisplay = document.getElementById('pause-timer');
    const roundTitle = document.getElementById('round-title');

    // === Test Konfiguration ===
    const SYMBOLS = ['#', '&', '@', '$', '%', '*', '?', '+', '!'];
    const NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    const TEST_DURATION = 90; // in Sekunden
    const PAUSE_DURATION = 10; // Pause verkürzt für Web-Version
    const NUM_CHALLENGE_ITEMS = 40;
    
    let keyMap = new Map();
    let currentChallenge = [];
    let timerInterval, pauseTimerInterval;
    let currentRound = 1;
    let scores = { round1: 0, round2: 0 };

    // === Funktionen ===
    
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    function generateKey() {
        keyMap.clear();
        keyContainer.innerHTML = '';
        let shuffledSymbols = [...SYMBOLS];
        shuffleArray(shuffledSymbols);
        for (let i = 0; i < NUMBERS.length; i++) {
            keyMap.set(shuffledSymbols[i], NUMBERS[i]);
            const keyItem = document.createElement('div');
            keyItem.className = 'key-item';
            keyItem.innerHTML = `${shuffledSymbols[i]} = <span>${NUMBERS[i]}</span>`;
            keyContainer.appendChild(keyItem);
        }
    }

    function generateChallenge() {
        currentChallenge = [];
        challengeContainer.innerHTML = '';
        for (let i = 0; i < NUM_CHALLENGE_ITEMS; i++) {
            const randomSymbol = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
            currentChallenge.push({ symbol: randomSymbol, correct: keyMap.get(randomSymbol) });
            
            const item = document.createElement('div');
            item.className = 'challenge-item';
            item.innerHTML = `
                <span class="symbol">${randomSymbol}</span>
                <input type="number" pattern="[0-9]*" inputmode="numeric">
            `;
            challengeContainer.appendChild(item);
        }
    }

    function startTimer(duration, display, onEnd) {
        let timer = duration;
        display.textContent = formatTime(timer);
        timerInterval = setInterval(() => {
            timer--;
            display.textContent = formatTime(timer);
            if (timer <= 0) {
                clearInterval(timerInterval);
                onEnd();
            }
        }, 1000);
    }
    
    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
        const secs = (seconds % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    }

    function calculateScore() {
        const inputs = challengeContainer.querySelectorAll('input');
        let score = 0;
        inputs.forEach((input, index) => {
            if (input.value && parseInt(input.value) === currentChallenge[index].correct) {
                score++;
            }
        });
        return score;
    }

    function showScreen(screen) {
        startScreen.classList.add('hidden');
        testScreen.classList.add('hidden');
        pauseScreen.classList.add('hidden');
        resultsScreen.classList.add('hidden');
        screen.classList.remove('hidden');
    }

    function startRound() {
        roundTitle.textContent = `Runde ${currentRound}`;
        generateKey();
        generateChallenge();
        showScreen(testScreen);
        startTimer(TEST_DURATION, timerDisplay, endRound);
    }

    function endRound() {
        if (currentRound === 1) {
            scores.round1 = calculateScore();
            currentRound = 2;
            startPause();
        } else {
            scores.round2 = calculateScore();
            showResults();
        }
    }
    
    function startPause() {
        showScreen(pauseScreen);
        let pause = PAUSE_DURATION;
        pauseTimerDisplay.textContent = pause;
        pauseTimerInterval = setInterval(() => {
            pause--;
            pauseTimerDisplay.textContent = pause;
            if (pause <= 0) {
                clearInterval(pauseTimerInterval);
                startRound();
            }
        }, 1000);
    }

    function showResults() {
        const learningRate = scores.round2 - scores.round1;
        document.getElementById('score1').textContent = scores.round1;
        document.getElementById('score2').textContent = scores.round2;
        document.getElementById('learning-rate').textContent = learningRate;

        let interpretationText = "";
        if (learningRate > 5) {
            interpretationText = "Exzellente Verbesserung! Dein Gehirn hat die neuen Verbindungen sehr schnell gelernt und automatisiert.";
        } else if (learningRate > 2) {
            interpretationText = "Sehr gut! Du hast dich deutlich verbessert, was auf eine solide Lernfähigkeit hindeutet.";
        } else if (learningRate >= 0) {
            interpretationText = "Gut gemacht! Jeder Fortschritt zeigt, dass Lernprozesse stattgefunden haben.";
        } else {
            interpretationText = "Interessant! Manchmal beeinflussen Konzentration oder Müdigkeit die Leistung. Probiere es doch noch einmal!";
        }
        document.getElementById('interpretation').textContent = interpretationText;

        showScreen(resultsScreen);
    }

    // === Event Listeners ===
    startButton.addEventListener('click', startRound);
    
    restartButton.addEventListener('click', () => {
        currentRound = 1;
        scores = { round1: 0, round2: 0 };
        showScreen(startScreen);
    });
});
