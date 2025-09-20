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
    const pauseContent = document.getElementById('pause-content');
    
    const progressIndicator = document.getElementById('progress-indicator');
    const activeSymbolDisplay = document.querySelector('#active-challenge-item .symbol');
    const symbolInput = document.getElementById('symbol-input');

    // === Test Konfiguration ===
    const SYMBOLS = ['#', '&', '@', '$', '%', '*', '?', '+', '!'];
    const NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    const TEST_DURATION = 90;
    const PAUSE_DURATION = 60; // DEFINITIVE KORREKTUR: Wert ist jetzt 60.
    const TOTAL_SYMBOLS = 100;
    const JOKES = [
        "Fragt die Lehrerin Fritzchen: 'Was ist die Hälfte von acht?' Fritzchen: 'Der obere oder der untere Teil?'",
        "Fritzchen geht zum Bäcker und fragt: 'Haben Sie 100 Brötchen?' Der Bäcker sagt: 'Nein, leider nicht.' Am nächsten Tag wieder. Nach einer Woche sagt der Bäcker stolz: 'Ja, heute habe ich 100 Brötchen da!' Sagt Fritzchen: 'Super, da nehm ich eins.'",
        "Die Mutter sagt zu Fritzchen: 'Zieh dich an, der Bus kommt gleich.' Antwortet Fritzchen: 'Ich weiß, ich hab ihn hupen hören!'"
    ];
    const INSTRUCTIONS = [
        "Bitte lesen Sie den folgenden Witz aufmerksam durch. Lachen Sie danach dreimal laut: Ha-Ha-Ha!",
        "Sehr gut! Hier kommt der nächste Witz. Gleiche Aufgabe.",
        "Fantastisch! Ein letzter Witz zur mentalen Lockerung."
    ];

    let keyMap = new Map();
    let challengeSequence = [];
    let userAnswers = [];
    let currentSymbolIndex = 0;
    
    let timerInterval, pauseTimerInterval;
    let currentRound = 1;
    let scores = { round1: { score: 0, correct: 0, incorrect: 0 }, round2: { score: 0, correct: 0, incorrect: 0 } };

    // === Funktionen ===
    
    function shuffleArray(array) { for (let i = array.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [array[i], array[j]] = [array[j], array[i]]; } }

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

    function generateChallengeSequence() {
        challengeSequence = [];
        for (let i = 0; i < TOTAL_SYMBOLS; i++) {
            const randomSymbol = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
            challengeSequence.push({ symbol: randomSymbol, correct: keyMap.get(randomSymbol) });
        }
    }
    
    function displayCurrentSymbol() {
        if (currentSymbolIndex >= challengeSequence.length) { endRound(); return; }
        const current = challengeSequence[currentSymbolIndex];
        activeSymbolDisplay.textContent = current.symbol;
        progressIndicator.textContent = `Symbol ${currentSymbolIndex + 1}`;
        symbolInput.value = '';
        symbolInput.focus();
    }
    
    function handleInput() {
        if (symbolInput.value.length > 0) {
            const answer = parseInt(symbolInput.value);
            userAnswers.push(answer);
            currentSymbolIndex++;
            if (timerInterval) { displayCurrentSymbol(); }
        }
    }

    function startTimer(duration, display, onEnd) {
        let timer = duration;
        display.textContent = formatTime(timer);
        clearInterval(timerInterval);
        timerInterval = setInterval(() => {
            timer--;
            display.textContent = formatTime(timer);
            if (timer <= 0) { onEnd(); }
        }, 1000);
    }
    
    function formatTime(seconds) { const mins = Math.floor(seconds / 60).toString().padStart(2, '0'); const secs = (seconds % 60).toString().padStart(2, '0'); return `${mins}:${secs}`; }

    function calculateScore() {
        let correct = 0;
        let incorrect = 0;
        for (let i = 0; i < userAnswers.length; i++) {
            if (userAnswers[i] === challengeSequence[i].correct) {
                correct++;
            } else {
                incorrect++;
            }
        }
        return { score: correct - incorrect, correct: correct, incorrect: incorrect };
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
        generateChallengeSequence(); // Die Sequenz der Symbole wird neu gemischt
        showScreen(testScreen);
        displayCurrentSymbol();
        startTimer(TEST_DURATION, timerDisplay, endRound);
    }

    function endRound() {
        clearInterval(timerInterval);
        timerInterval = null;
        
        const roundResult = calculateScore();
        if (currentRound === 1) {
            scores.round1 = roundResult;
            currentRound = 2;
            startPause();
        } else {
            scores.round2 = roundResult;
            showResults();
        }
    }
    
    function managePauseSequence() {
        setTimeout(() => { pauseContent.innerHTML = `<p>${INSTRUCTIONS[0]}</p>`; }, 0);
        setTimeout(() => { pauseContent.innerHTML = `<p><strong>${JOKES[0]}</strong></p>`; }, 5000);
        setTimeout(() => { pauseContent.innerHTML = `<p>${INSTRUCTIONS[1]}</p>`; }, 20000);
        setTimeout(() => { pauseContent.innerHTML = `<p><strong>${JOKES[1]}</strong></p>`; }, 25000);
        setTimeout(() => { pauseContent.innerHTML = `<p>${INSTRUCTIONS[2]}</p>`; }, 40000);
        setTimeout(() => { pauseContent.innerHTML = `<p><strong>${JOKES[2]}</strong></p>`; }, 45000);
    }
    
    function startPause() {
        showScreen(pauseScreen);
        managePauseSequence();
        
        let pause = PAUSE_DURATION;
        pauseTimerDisplay.textContent = pause;
        clearInterval(pauseTimerInterval);
        pauseTimerInterval = setInterval(() => {
            pause--;
            if(pause >= 0) {
               pauseTimerDisplay.textContent = pause;
            }
            if (pause < 0) {
                clearInterval(pauseTimerInterval);
                startRound();
            }
        }, 1000);
    }

    function showResults() {
        const learningRate = scores.round2.score - scores.round1.score;
        document.getElementById('score1').textContent = scores.round1.score;
        document.getElementById('details1').textContent = `(${scores.round1.correct} richtige / ${scores.round1.incorrect} falsche)`;
        
        document.getElementById('score2').textContent = scores.round2.score;
        document.getElementById('details2').textContent = `(${scores.round2.correct} richtige / ${scores.round2.incorrect} falsche)`;
        
        document.getElementById('learning-rate').textContent = learningRate >= 0 ? `+${learningRate}` : learningRate;

        let interpretationText = "";
        if (learningRate > 8) { interpretationText = "Exzellente Verbesserung! Dein Gehirn hat die neuen Verbindungen extrem schnell gelernt und automatisiert."; } 
        else if (learningRate > 4) { interpretationText = "Sehr gut! Du hast dich deutlich verbessert, was auf eine solide und schnelle Lernfähigkeit hindeutet."; } 
        else if (learningRate >= 0) { interpretationText = "Gut gemacht! Jeder Fortschritt zeigt, dass Lernprozesse stattgefunden haben."; } 
        else { interpretationText = "Interessant! Manchmal beeinflussen Konzentration oder Müdigkeit die Leistung. Probiere es doch noch einmal!"; }
        document.getElementById('interpretation').textContent = interpretationText;

        showScreen(resultsScreen);
    }

    // === Event Listeners ===
    startButton.addEventListener('click', () => {
        // DEFINITIVE KORREKTUR: generateKey() wird NUR HIER EINMALIG aufgerufen.
        generateKey(); 
        currentRound = 1; // Sicherstellen, dass ein Neustart immer mit Runde 1 beginnt
        startRound();
    });

    restartButton.addEventListener('click', () => {
        scores = { round1: { score: 0, correct: 0, incorrect: 0 }, round2: { score: 0, correct: 0, incorrect: 0 } };
        showScreen(startScreen);
    });
    
    symbolInput.addEventListener('input', handleInput);
});
