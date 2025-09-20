document.addEventListener('DOMContentLoaded', () => {
    // === DOM Elemente ===
    const startScreen = document.getElementById('start-screen');
    const testScreen = document.getElementById('test-screen');
    const pauseScreen = document.getElementById('pause-screen');
    const resultsScreen = document.getElementById('results-screen');
    
    const startButton = document.getElementById('start-button');
    const restartButton = document.getElementById('restart-button');
    
    const keyContainer = document.getElementById('key-table-container');
    const timerDisplay = document.getElementById('timer');
    const pauseTimerDisplay = document.getElementById('pause-timer');
    const roundTitle = document.getElementById('round-title');

    // GEÄNDERT: Elemente für die neue Einzelansicht
    const progressIndicator = document.getElementById('progress-indicator');
    const activeSymbolDisplay = document.querySelector('#active-challenge-item .symbol');
    const symbolInput = document.getElementById('symbol-input');

    // === Test Konfiguration ===
    const SYMBOLS = ['#', '&', '@', '$', '%', '*', '?', '+', '!'];
    const NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    const TEST_DURATION = 90;
    const PAUSE_DURATION = 10;
    const TOTAL_SYMBOLS = 100; // Theoretisches Maximum, wenn man sehr schnell ist

    let keyMap = new Map();
    let challengeSequence = [];
    let userAnswers = [];
    let currentSymbolIndex = 0;
    
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

    // GEÄNDERT: Generiert nur noch die Sequenz, nicht die HTML-Elemente
    function generateChallengeSequence() {
        challengeSequence = [];
        for (let i = 0; i < TOTAL_SYMBOLS; i++) {
            const randomSymbol = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
            challengeSequence.push({ symbol: randomSymbol, correct: keyMap.get(randomSymbol) });
        }
    }
    
    // NEU: Zeigt das aktuelle Symbol an
    function displayCurrentSymbol() {
        if (currentSymbolIndex >= challengeSequence.length) {
            endRound(); // Ende, wenn alle Symbole durch sind
            return;
        }
        const current = challengeSequence[currentSymbolIndex];
        activeSymbolDisplay.textContent = current.symbol;
        progressIndicator.textContent = `Symbol ${currentSymbolIndex + 1} / ${TOTAL_SYMBOLS}`;
        symbolInput.value = '';
        symbolInput.focus(); // Setzt den Cursor direkt ins Feld
    }
    
    // NEU: Verarbeitet die Eingabe und springt zum nächsten Symbol
    function handleInput() {
        if (symbolInput.value.length > 0) {
            const answer = parseInt(symbolInput.value);
            userAnswers.push(answer);
            currentSymbolIndex++;
            if (timerInterval) { // Nur weitermachen, wenn der Timer noch läuft
                displayCurrentSymbol();
            }
        }
    }

    function startTimer(duration, display, onEnd) {
        let timer = duration;
        display.textContent = formatTime(timer);
        clearInterval(timerInterval); // Sicherstellen, dass kein alter Timer läuft
        timerInterval = setInterval(() => {
            timer--;
            display.textContent = formatTime(timer);
            if (timer <= 0) {
                onEnd();
            }
        }, 1000);
    }
    
    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
        const secs = (seconds % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    }

    // GEÄNDERT: Zählt die korrekten Antworten aus dem 'userAnswers' Array
    function calculateScore() {
        let score = 0;
        for (let i = 0; i < userAnswers.length; i++) {
            if (userAnswers[i] === challengeSequence[i].correct) {
                score++;
            }
        }
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
        userAnswers = [];
        currentSymbolIndex = 0;
        
        generateKey();
        generateChallengeSequence();
        showScreen(testScreen);
        displayCurrentSymbol();
        startTimer(TEST_DURATION, timerDisplay, endRound);
    }

    function endRound() {
        clearInterval(timerInterval);
        timerInterval = null; // Stoppt den Timer und verhindert weitere Eingaben
        
        const score = calculateScore();
        if (currentRound === 1) {
            scores.round1 = score;
            currentRound = 2;
            startPause();
        } else {
            scores.round2 = score;
            showResults();
        }
    }
    
    function startPause() {
        showScreen(pauseScreen);
        let pause = PAUSE_DURATION;
        pauseTimerDisplay.textContent = pause;
        clearInterval(pauseTimerInterval);
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
        document.getElementById('learning-rate').textContent = learningRate > 0 ? `+${learningRate}` : learningRate;

        let interpretationText = "";
        if (learningRate > 8) {
            interpretationText = "Exzellente Verbesserung! Dein Gehirn hat die neuen Verbindungen extrem schnell gelernt und automatisiert.";
        } else if (learningRate > 4) {
            interpretationText = "Sehr gut! Du hast dich deutlich verbessert, was auf eine solide und schnelle Lernfähigkeit hindeutet.";
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
    // NEU: Event Listener für die Eingabe
    symbolInput.addEventListener('input', handleInput);
});

