// public/script.js
document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const welcomeScreen = document.getElementById('welcome-screen');
    const quizScreen = document.getElementById('quiz-screen');
    const resultsScreen = document.getElementById('results-screen');
    const leaderboardScreen = document.getElementById('leaderboard-screen');

    const startBtn = document.getElementById('start-btn');
    const nextBtn = document.getElementById('next-btn');
    const retryBtn = document.getElementById('retry-btn');
    const leaderboardBtn = document.getElementById('leaderboard-btn');
    const backToQuizBtn = document.getElementById('back-to-quiz-btn');

    const usernameInput = document.getElementById('username');
    const questionElement = document.getElementById('question');
    const optionsContainer = document.getElementById('options');
    const feedbackElement = document.getElementById('feedback');
    const questionCountElement = document.getElementById('question-count');
    const scoreElement = document.getElementById('score');
    const timeElement = document.getElementById('time');
    const progressFill = document.getElementById('progress-fill');
    const finalScoreElement = document.getElementById('final-score');
    const performanceComment = document.getElementById('performance-comment');

    // API base URL - works for local dev and hosted
    const API_BASE_URL = window.location.hostname.includes("localhost")
      ? "http://localhost:4000/api"
      : "/api";

    // Quiz variables
    let currentQuestionIndex = 0;
    let score = 0;
    let timeLeft = 30;
    let timer;
    let username = '';
    let leaderboard = [];

    // Quiz questions
    const questions = [
        {
            question: "In the context of a college club, what do the pigs stealing eggs represent?",
            options: ["Technical challenges", "Event organizers", "Guest speakers", "Hackathon prizes"],
            answer: 0
        },
        {
            question: "What’s the most important circuit every engineer learns?",
            options: ["RLC Circuit", "Short Circuit", "Placement Circuit", "Tea-Canteen Circuit"],
            answer: 3
        },
        {
            question: "What is the main goal of both Angry Birds and college clubs like GDG?",
            options: ["Destroying obstacles to achieve success", "Skipping exams", "Collecting coins", "Finding shortcuts"],
            answer: 0
        },
        
        {
            question: "What is an engineer’s real superpower?",
            options: ["Debugging at 3 AM", "Copy-pasting from Stack Overflow", "Explaining memes as research", "Sleeping with open eyes in class"],
            answer: 1
        },
        {
            question: "Why do engineering students love group projects?",
            options: ["Because teamwork is fun", "Because one person does all the work", "Because it builds leadership", "Because it means free attendance"],
            answer: 1
        },
        {
            question: "In Angry Birds, team effort is key. In GDG clubs, what represents the team effort?",
            options: ["Student volunteers", "Bird powers", "Coding mentors", "Campus audience"],
            answer: 0
        },
        {
            question: "What does CGPA actually stand for in engineering sarcasm?",
            options: ["Cumulative Grade Point Average", "Can’t Get Proper Attendance", "Coding Games Play Always", "Continuous Group Project Anxiety"],
            answer: 1
        },
        {
            question: "If the birds represent students, what do the slingshot launches symbolize in a GDG event?",
            options: ["New opportunities and learning", "Breaking rules", "Skipping classes", "Event decorations"],
            answer: 0
        },
        {
            question: "Why do engineers carry laptops everywhere?",
            options: ["To look professional", "To actually code", "To hide that they’re watching anime", "Because WiFi is their oxygen"],
            answer: 3
        },
        {
            question: "Which formula do engineers apply the most in real life?",
            options: ["Ohm’s Law", "Newton’s Laws", "Ctrl + C, Ctrl + V", "Schrodinger’s Equation"],
            answer: 2
        }
    ];


    // If you have the original questions array, paste it here exactly as before.
    // Event listeners
    startBtn.addEventListener('click', startQuiz);
    nextBtn.addEventListener('click', nextQuestion);
    retryBtn.addEventListener('click', retryQuiz);
    leaderboardBtn.addEventListener('click', showLeaderboard);
    backToQuizBtn.addEventListener('click', () => {
        leaderboardScreen.classList.add('hidden');
        welcomeScreen.classList.remove('hidden');
    });

    // Load leaderboard on page load
    loadLeaderboardFromDB();

    function startQuiz() {
        username = usernameInput.value.trim();
        localStorage.setItem("usernamels", username);

        if (!username) {
            username = "Anonymous Pirate";
        }

        welcomeScreen.classList.add('hidden');
        quizScreen.classList.remove('hidden');

        currentQuestionIndex = 0;
        score = 0;
        scoreElement.textContent = score;

        showQuestion();
    }

    function showQuestion() {
        resetState();
        const currentQuestion = questions[currentQuestionIndex];
        questionElement.textContent = currentQuestion.question;
        questionCountElement.textContent = `${currentQuestionIndex + 1}/${questions.length}`;

        currentQuestion.options.forEach((option, index) => {
            const button = document.createElement('button');
            button.textContent = option;
            button.classList.add('option', 'p-4', 'rounded-lg', 'text-left', 'hover:shadow-lg');
            button.addEventListener('click', () => selectAnswer(index));
            optionsContainer.appendChild(button);
        });

        startTimer();
    }

    function startTimer() {
        timeLeft = 30;
        timeElement.textContent = timeLeft;
        progressFill.style.width = '100%';

        clearInterval(timer);
        timer = setInterval(() => {
            timeLeft--;
            timeElement.textContent = timeLeft;
            progressFill.style.width = `${(timeLeft / 30) * 100}%`;

            if (timeLeft <= 0) {
                clearInterval(timer);
                timeUp();
            }
        }, 1000);
    }

    function timeUp() {
        feedbackElement.textContent = "Time's up!";
        feedbackElement.classList.remove('hidden');
        feedbackElement.style.color = "#ff758c";

        const options = optionsContainer.querySelectorAll('.option');
        options.forEach(option => {
            option.disabled = true;
        });

        nextBtn.classList.remove('hidden');
    }

    function selectAnswer(selectedIndex) {
        clearInterval(timer);

        const currentQuestion = questions[currentQuestionIndex];
        const options = optionsContainer.querySelectorAll('.option');
        const correctIndex = currentQuestion.answer;

        options.forEach((option, index) => {
            option.disabled = true;

            if (index === correctIndex) {
                option.classList.add('correct');
            } else if (index === selectedIndex && selectedIndex !== correctIndex) {
                option.classList.add('incorrect');
            }
        });

        if (selectedIndex === correctIndex) {
            const timeBonus = Math.floor(timeLeft * 3);
            score += 100 + timeBonus;
            scoreElement.textContent = score;

            feedbackElement.textContent = `Correct! +${100 + timeBonus} points`;
            feedbackElement.classList.remove('hidden');
            feedbackElement.style.color = "#4facfe";
            createConfetti();
        } else {
            feedbackElement.innerHTML = `Incorrect! <br> The correct answer is: ${currentQuestion.options[correctIndex]}`;
            feedbackElement.classList.remove('hidden');
            feedbackElement.style.color = "#2ed604ff";
        }

        nextBtn.classList.remove('hidden');
    }

    function createConfetti() {
        const colors = ['#4facfe', '#00f2fe', '#ff758c', '#ff7eb3', '#ffd700'];

        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.classList.add('confetti');
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.left = `${Math.random() * 100}%`;
            confetti.style.top = '-10px';
            confetti.style.transform = `rotate(${Math.random() * 360}deg)`;

            quizScreen.appendChild(confetti);

            const animationDuration = Math.random() * 3 + 2;

            confetti.style.animation = `
                confetti-fall ${animationDuration}s linear forwards,
                confetti-spin ${animationDuration}s linear infinite
            `;

            setTimeout(() => {
                if (confetti.parentNode) {
                    confetti.remove();
                }
            }, animationDuration * 1000);
        }
    }

    function nextQuestion() {
        currentQuestionIndex++;

        if (currentQuestionIndex < questions.length) {
            showQuestion();
        } else {
            endQuiz();
        }
    }

    function endQuiz() {
        clearInterval(timer);
        quizScreen.classList.add('hidden');
        resultsScreen.classList.remove('hidden');

        finalScoreElement.textContent = score;

        localStorage.setItem("scorels", score);
        const namecurr = localStorage.getItem("usernamels");

        if (namecurr) {
            // POST to the server using API_BASE_URL (works locally + hosted)
            fetch(`${API_BASE_URL}/score`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: namecurr, score: score })
            })
            .then(response => response.json())
            .then(result => {
                console.log("✅ Score synced:", result.message);
                // refresh local leaderboard list so it's up-to-date
                loadLeaderboardFromDB();
            })
            .catch(error => {
                console.log("❌ Sync failed:", error);
                // fallback to localStorage
                updateLocalLeaderboard();
            });
        } else {
            console.warn("⚠️ No username found in localStorage. Score not sent.");
            updateLocalLeaderboard();
        }

        const percentage = (score / (questions.length * 130)) * 100;
        if (percentage >= 90) {
            performanceComment.textContent = "Legendary Pirate! You're the captain now!";
        } else if (percentage >= 70) {
            performanceComment.textContent = "Skilled Buccaneer! Well done, matey!";
        } else if (percentage >= 50) {
            performanceComment.textContent = "Decent Sailor! Keep practicing!";
        } else {
            performanceComment.textContent = "Landlubber! Time to learn the ropes!";
        }
    }

    // Load leaderboard from MongoDB database
    async function loadLeaderboardFromDB() {
        try {
            const response = await fetch(`${API_BASE_URL}/leaderboard`);
            if (response.ok) {
                leaderboard = await response.json();
                console.log('✅ Leaderboard loaded from database');
            } else {
                console.error('❌ Error loading leaderboard from database');
                leaderboard = JSON.parse(localStorage.getItem('cosmicQuizLeaderboard')) || [];
            }
        } catch (error) {
            console.error('❌ Network error loading leaderboard:', error);
            leaderboard = JSON.parse(localStorage.getItem('cosmicQuizLeaderboard')) || [];
        }
    }

    function updateLocalLeaderboard() {
        const entry = {
            name: username || localStorage.getItem("usernamels") || "Anonymous Pirate",
            score: score,
            submittedAt: new Date().toISOString()
        };

        let localLeaderboard = JSON.parse(localStorage.getItem('cosmicQuizLeaderboard')) || [];
        localLeaderboard.push(entry);
        localLeaderboard.sort((a, b) => b.score - a.score);
        if (localLeaderboard.length > 10) {
            localLeaderboard = localLeaderboard.slice(0, 10);
        }

        localStorage.setItem('cosmicQuizLeaderboard', JSON.stringify(localLeaderboard));
        leaderboard = localLeaderboard;
        console.log('📱 Score saved to localStorage as fallback');
    }

    function showLeaderboard() {
        resultsScreen.classList.add('hidden');
        leaderboardScreen.classList.remove('hidden');

        loadLeaderboardFromDB().then(() => {
            displayLeaderboard();
        });
    }

    function displayLeaderboard() {
        // Update podium
        document.getElementById('first-place').textContent = leaderboard[0] ? leaderboard[0].name : '-';
        document.getElementById('first-score').textContent = leaderboard[0] ? `${leaderboard[0].score} pts` : '0 pts';
        document.getElementById('second-place').textContent = leaderboard[1] ? leaderboard[1].name : '-';
        document.getElementById('second-score').textContent = leaderboard[1] ? `${leaderboard[1].score} pts` : '0 pts';
        document.getElementById('third-place').textContent = leaderboard[2] ? leaderboard[2].name : '-';
        document.getElementById('third-score').textContent = leaderboard[2] ? `${leaderboard[2].score} pts` : '0 pts';

        // Update list
        const leaderboardList = document.getElementById('leaderboard-list');
        leaderboardList.innerHTML = '';

        leaderboard.forEach((entry, index) => {
            const entryElement = document.createElement('div');
            entryElement.classList.add('leaderboard-entry', 'p-4', 'rounded-lg', 'flex', 'justify-between', 'items-center');

            const rankElement = document.createElement('span');
            rankElement.classList.add('font-bold', 'w-8', 'text-center');
            rankElement.textContent = `${index + 1}.`;

            const nameElement = document.createElement('span');
            nameElement.classList.add('flex-1', 'ml-4');
            nameElement.textContent = entry.name;

            const scoreElement = document.createElement('span');
            scoreElement.classList.add('font-bold');
            scoreElement.textContent = `${entry.score} pts`;

            const dateElement = document.createElement('span');
            dateElement.classList.add('text-sm', 'text-gray-400', 'ml-4');
            const date = new Date(entry.submittedAt || entry.date || entry.timestamp);
            dateElement.textContent = date.toLocaleDateString();

            entryElement.appendChild(rankElement);
            entryElement.appendChild(nameElement);
            entryElement.appendChild(scoreElement);
            entryElement.appendChild(dateElement);

            leaderboardList.appendChild(entryElement);
        });

        if (leaderboard.length === 0) {
            const noDataElement = document.createElement('div');
            noDataElement.classList.add('text-center', 'text-gray-400', 'py-8');
            noDataElement.textContent = 'No scores yet! Be the first to play!';
            leaderboardList.appendChild(noDataElement);
        }
    }

    function retryQuiz() {
        resultsScreen.classList.add('hidden');
        welcomeScreen.classList.remove('hidden');
    }

    function resetState() {
        feedbackElement.classList.add('hidden');
        nextBtn.classList.add('hidden');

        while (optionsContainer.firstChild) {
            optionsContainer.removeChild(optionsContainer.firstChild);
        }
    }
});