    console.log('DOM fully loaded and parsed');
    // Game state
    var score = 0;
    var current = 0;
    var attempts = 0;
    var maxAttempts = 3;
    var questionTimeLeft = 0;
    var hintRevealed = false;
    var answerRevealed = false;
    var questionTimerRunning = false;
    var questionTimerInterval = null;

    // Questions array
    var questions = [
        {
            title: "",
            question: "I am like an OR, but with a twist, Only one input must exist. If both are same, I say 'No way!' But if they differ, I light the way. What gate am I?",
            answer: "xor",
            hint: "This gate outputs true only when inputs are different."
        },
        {
            title: "",
            question: "In a hypothetical CPU, an instruction takes 4 cycles to execute. If the clock speed is 2 GHz, how long does one instruction take?",
            answer: "2",
            hint: "Calculate time per cycle as 1 divided by frequency, then multiply by cycles per instruction."
        },
        {
            title: "",
            question: "A D flip-flop receives a clock pulse every 10 ns. If D = 1 for the first 3 pulses and 0 for the next 2, what is the output after 5 pulses?",
            answer: "0",
            hint: "The output follows the D input at the last pulse."
        },
        {
            title: "",
            question: "A 5-stage pipeline executes 100 instructions. If there are no stalls, how many cycles are needed?",
            answer: "104",
            hint: "Use the formula: stages + (instructions - 1)."
        },
        {
            title: "",
            question: "What is the output of this Python code? for i in range(3): print(i, end=',')",
            answer: "0,1,2",
            hint: "The loop runs from 0 to 2, and end parameter adds a comma and space."
        },
        {
            title: "",
            question: "The Memory Twin: I allocate memory, but I do not initialize it. My sibling does both. Who are we?",
            answer: "malloc() and calloc()",
            hint: "These are C functions for memory allocation."
        },
        {
            title: "",
            question: "I turn source code into object code. But I do not link or run it. What phase am I?",
            answer: "compilation",
            hint: "This step comes before linking."
        },
        {
            title: "",
            question: "I am close to the machine. I give you direct access to memory, but you must manage it yourself. I am fast, but unforgiving. What language am I?",
            answer: "c",
            hint: "Known for pointers and manual memory management."
        },
        {
            title: "",
            question: "I do not care about your type — if you act like it, I will treat you like it. What typing philosophy do I follow? Hint: Think of a bird that walks and quacks.",
            answer: "duck typing",
            hint: "If it looks like a duck and quacks like a duck, it is a duck."
        },
        {
            title: "",
            question: "I store data in rows and columns, But I am not a spreadsheet. I am fast, volatile, and live close to the CPU. What am I?",
            answer: "cache memory",
            hint: "It is a high-speed storage near the processor."
        }
    ];

    // DOM elements
    console.log('Attempting to retrieve DOM elements');
    try {
        var welcomeScreen = document.getElementById('welcome-screen');
        var instructionsScreen = document.getElementById('instructions-screen');
        var gameScreen = document.getElementById('game-screen');
        var resultScreen = document.getElementById('result-screen');
        var startBtn = document.getElementById('start-btn');
        var instructionsBtn = document.getElementById('instructions-btn');
        var backBtn = document.getElementById('back-btn');
        var puzzleTitle = document.getElementById('puzzle-title');
        var questionCount = document.getElementById('question-count');
        var scoreEl = document.getElementById('score');
        var timerEl = document.getElementById('timer');
        var progressBar = document.getElementById('progress');
        var questionEl = document.getElementById('question');
        var answerInput = document.getElementById('answer');
        var feedbackEl = document.getElementById('feedback');
        var hintEl = document.getElementById('hint');
        var submitBtn = document.getElementById('submit-btn');
        var hintBtn = document.getElementById('hint-btn');
        var resultTitle = document.getElementById('result-title');
        var resultScore = document.getElementById('result-score');
        var resultMessage = document.getElementById('result-message');
        var playAgainBtn = document.getElementById('play-again-btn');
        var exitBtn = document.getElementById('exit-btn');
        console.log('DOM elements retrieved', { startBtn, instructionsBtn, welcomeScreen, gameScreen });

        // Helper functions with simplified logic
        function showScreen(screenId) {
            console.log('Switching to screen:', screenId);
            try {
                var screens = ['welcome-screen', 'instructions-screen', 'game-screen', 'result-screen'];
                screens.forEach(function(id) {
                    var screen = document.getElementById(id);
                    if (screen) {
                        screen.classList.remove('active');
                    }
                });
                var targetScreen = document.getElementById(screenId);
                if (targetScreen) {
                    targetScreen.classList.add('active');
                    console.log('Screen switched to:', screenId);
                } else {
                    console.error('Target screen not found:', screenId);
                }
            } catch (error) {
                console.error('Error switching screens:', error);
            }
        }

        function updateQuestionTimer() {
            if (questionTimerRunning && questionTimeLeft > 0) {
                questionTimeLeft--;
                var minutes = Math.floor(questionTimeLeft / 60);
                var seconds = questionTimeLeft % 60;
                try {
                    if (timerEl) timerEl.textContent = 'Time: ' + minutes + ':' + seconds.toString().padStart(2, '0');
                    
                    // Enable hint button after 1 minute (120 seconds left)
                    if (questionTimeLeft === 120 && !hintRevealed) {
                        hintRevealed = true;
                        if (hintBtn) {
                            hintBtn.disabled = false;
                            hintBtn.style.opacity = '1';
                            hintBtn.style.cursor = 'pointer';
                        }
                    }
                    
                    // Display answer after 2 more minutes (60 seconds left)
                    if (questionTimeLeft === 60 && !answerRevealed) {
                        answerRevealed = true;
                        var correctAnswer = questions[current].answer.toUpperCase();
                        if (feedbackEl) {
                            feedbackEl.textContent = ' Answer: ' + correctAnswer;
                            feedbackEl.style.color = '#ff6666';
                        }
                    }
                } catch (error) {
                    console.error('Error updating question timer:', error);
                }
            }
        }

        function startQuestionTimer() {
            try {
                // Clear any existing timer to prevent multiple intervals
                if (questionTimerInterval) {
                    clearInterval(questionTimerInterval);
                }
                questionTimeLeft = 180; // 3 minutes for each question
                hintRevealed = false;
                answerRevealed = false;
                questionTimerRunning = true;
                if (timerEl) timerEl.textContent = 'Time: 3:00';
                if (timerEl) timerEl.style.color = '#ffcc00';
                // Gray out hint and submit buttons initially
                if (hintBtn) {
                    hintBtn.disabled = true;
                    hintBtn.style.opacity = '0.5';
                    hintBtn.style.cursor = 'not-allowed';
                }
                questionTimerInterval = setInterval(updateQuestionTimer, 1000); // Ensure normal speed (1000ms = 1 second)
                console.log('Question timer started');
            } catch (error) {
                console.error('Error starting question timer:', error);
            }
        }

        function stopQuestionTimer() {
            try {
                questionTimerRunning = false;
                clearInterval(questionTimerInterval);
                console.log('Question timer stopped');
            } catch (error) {
                console.error('Error stopping question timer:', error);
            }
        }

        function showQuestion() {
            try {
                if (current >= questions.length) {
                    stopQuestionTimer();
                    showScreen('result-screen');
                    updateResultScreen();
                    return;
                }
                var q = questions[current];
                if (puzzleTitle) puzzleTitle.textContent = q.title;
                if (questionCount) questionCount.textContent = 'Q' + (current + 1) + '/10';
                if (scoreEl) scoreEl.textContent = 'Score: ' + score;
                if (progressBar) progressBar.style.width = ((current) / questions.length) * 100 + '%';
                if (questionEl) questionEl.textContent = q.question;
                if (answerInput) answerInput.value = '';
                if (feedbackEl) feedbackEl.textContent = '';
                if (hintEl) hintEl.textContent = '';
                if (answerInput) answerInput.focus();
                startQuestionTimer();
                console.log('Showing question', current + 1);
            } catch (error) {
                console.error('Error showing question:', error);
            }
        }

        function checkAnswer() {
            try {
                var userAnswer = answerInput ? answerInput.value.trim().toLowerCase() : '';
                var correctAnswer = questions[current].answer.toLowerCase();

                if (userAnswer === correctAnswer) {
                    if (feedbackEl) {
                        feedbackEl.textContent = ' Correct!';
                        feedbackEl.style.color = '#00ff00';
                    }
                    score++;
                    setTimeout(nextQuestion, 1000);
                } else {
                    if (feedbackEl) {
                        feedbackEl.textContent = ' Wrong! Try again.';
                        feedbackEl.style.color = '#ff6666';
                    }
                }
            } catch (error) {
                console.error('Error checking answer:', error);
            }
        }

        function nextQuestion() {
            try {
                current++;
                showQuestion();
            } catch (error) {
                console.error('Error moving to next question:', error);
            }
        }

        function updateResultScreen() {
            try {
                var passed = score >= 5;
                if (resultTitle) {
                    resultTitle.textContent = passed ? ' ESCAPED!' : ' TRAPPED!';
                    resultTitle.style.color = score >= 7 ? '#00ffaa' : '#ff5555';
                }
                if (resultScore) resultScore.textContent = 'Score: ' + score + '/10';
                if (resultMessage) resultMessage.textContent = passed ? 'You escaped successfully! your next hint is Seek the chamber named after the pioneer who shaped Indias digital core and IS students dont work here,but this is where they must crack their puzzle ' : 'You got trapped... Try again!';
            } catch (error) {
                console.error('Error updating result screen:', error);
            }
        }

        // Expose functions globally for fallback onclick handlers
        window.startGame = function() {
            try {
                console.log('Starting game');
                score = 0;
                current = 0;
                showScreen('game-screen');
                showQuestion();
            } catch (error) {
                console.error('Error starting game:', error);
            }
        };

        window.showInstructions = function() {
            try {
                console.log('Showing instructions');
                showScreen('instructions-screen');
            } catch (error) {
                console.error('Error showing instructions:', error);
            }
        };

        window.showWelcome = function() {
            try {
                console.log('Showing welcome screen');
                showScreen('welcome-screen');
            } catch (error) {
                console.error('Error showing welcome screen:', error);
            }
        };

        // Event listeners
        if (startBtn) {
            startBtn.addEventListener('click', function() {
                console.log('Start Adventure clicked!');
                window.startGame();
            });
            console.log('Start button listener attached');
        } else {
            console.error('Start button not found');
        }
        if (instructionsBtn) {
            instructionsBtn.addEventListener('click', function() {
                console.log('Instructions clicked!');
                window.showInstructions();
            });
            console.log('Instructions button listener attached');
        } else {
            console.error('Instructions button not found');
        }
        if (backBtn) {
            backBtn.addEventListener('click', function() {
                console.log('Back clicked!');
                window.showWelcome();
            });
        }
        if (submitBtn) {
            submitBtn.addEventListener('click', checkAnswer);
        }
        if (hintBtn) {
            hintBtn.addEventListener('click', showHintEarly);
        }
        if (playAgainBtn) {
            playAgainBtn.addEventListener('click', window.startGame);
        }
        if (exitBtn) {
            exitBtn.addEventListener('click', function() { window.showWelcome(); });
        }

        // Allow submit on Enter key
        if (answerInput) {
            answerInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    checkAnswer();
                }
            });
        }

        function showHintEarly() {
            try {
                if (hintRevealed && hintEl && hintEl.textContent === '') {
                    hintEl.textContent = ' Hint: ' + questions[current].hint;
                    hintEl.style.color = '#ffcc00';
                } else if (hintEl && hintEl.textContent !== '') {
                    hintEl.textContent = '';
                }
            } catch (error) {
                console.error('Error showing hint:', error);
            }
        }
    } catch (error) {
        console.error('Error in initialization:', error);
    }
