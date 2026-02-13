const CONFIG = {
  MAX_QUESTIONS: 10,
  TIMER_UPDATE_INTERVAL: 500,
  MIN_NAME_LENGTH: 3,
  MAX_NAME_LENGTH: 20,
  QUESTIONS_FILE: "questions.json",
  SUPPORT_EMAIL: "mertens.florent00@gmail.com",
};

const SUPABASE_CONFIG = {
  URL: "https://bkpcqdnfxilexgwhnokm.supabase.co",
  KEY: "sb_publishable_7bwobBrio2klbwkyfLtgiw_C0eUWVO1",
  TABLE: "ranking",
  TOP_LIMIT: 20,
};


const MESSAGES = {
  CORRECT_ANSWER: "Bonne réponse",
  WRONG_ANSWER: "Mauvaise réponse",
  SHOW_SCORE: "Afficher le score",
  NEXT: "Suivant",
  INVALID_NAME: `Veuillez entrer un nom valide (minimum ${CONFIG.MIN_NAME_LENGTH} caractères maximum ${CONFIG.MAX_NAME_LENGTH} caractères)`,
  NO_QUESTIONS: `Erreur : Pas de questions disponible, merci de contacter le support technique à l'adresse ${CONFIG.SUPPORT_EMAIL}.`,
  LOAD_ERROR: `Erreur : Chargement des questions échoué, merci de rafraîchir la page ou de contacter le support technique à l'adresse ${CONFIG.SUPPORT_EMAIL}.`,
  LEADERBOARD_ERROR : `Erreur : Le chargement du classement à échoué, merci de contacter le support technique à l'adresse ${CONFIG.SUPPORT_EMAIL}.`
};

const state = {
  questions: [],
  currentIndex: 0,
  currentQuestion: null,
  currentScore: 0,
  playerName: "",
  startTime: null,
  timerInterval: null,
  totalTime: 0,
};

const elements = {
  questionEl: document.querySelector(".question"),
  answerBtns: document.querySelectorAll(".answer"),
  nextQuestionBtn: document.querySelector(".next-question-btn"),

  questionNbEl: document.querySelector(".question-nb span"),
  currentScoreEl: document.querySelector(".current-score span"),
  currentTimerEl: document.getElementById("timer"),

  errorMessage: document.querySelector(".error-message"),
  feedbackMessageEl: document.querySelector(".feedback-message"),

  startSection: document.querySelector(".start"),
  quizSectionEl: document.querySelector(".quiz"),
  resultSectionEl: document.querySelector(".result-container"),

  scoreEl: document.querySelector(".score"),
  timeEl: document.querySelector(".time"),

  startBtn: document.querySelector(".start-quiz-btn"),
  nameInput: document.getElementById("playerName"),
  restartBtn: document.querySelector(".restart-btn"),
};

elements.startBtn.addEventListener("click", (e) => {
  e.preventDefault();
  startQuiz();
});

elements.answerBtns.forEach((btn, index) => {
  btn.addEventListener("click", () => {
    checkAnswer(btn, index);
  });
});

elements.nextQuestionBtn.addEventListener("click", nextQuestion);

if (elements.restartBtn) {
  elements.restartBtn.addEventListener("click", restartQuiz);
}

elements.nameInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    startQuiz();
  }
});

function startQuiz() {
  state.playerName = elements.nameInput.value.trim();

  if (!state.playerName || state.playerName.length < CONFIG.MIN_NAME_LENGTH || state.playerName.length > CONFIG.MAX_NAME_LENGTH) {
    alert(MESSAGES.INVALID_NAME);
    return;
  }

  elements.startSection.style.display = "none";
  elements.quizSectionEl.style.display = "flex";

  startTimer();
  loadQuestions();
}

function pickRandomItems(array, count) {
  const shuffled = [...array];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.slice(0, count);
}

async function loadQuestions() {
  try {
    const response = await fetch(CONFIG.QUESTIONS_FILE);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    const maxQuestions = Math.min(data.length, CONFIG.MAX_QUESTIONS);
    state.questions = pickRandomItems(data, maxQuestions);

    if (state.questions.length > 0) {
      showQuestion();
    } else {
      showError(MESSAGES.NO_QUESTIONS);
    }
  } catch (err) {
    console.error("Erreur de chargement:", err);
    showError(MESSAGES.LOAD_ERROR);
  }
}

function showError(message) {
  elements.errorMessage.textContent = message;
  elements.errorMessage.style.display = "flex";
}

function showQuestion() {
  state.currentQuestion = state.questions[state.currentIndex];

  elements.questionEl.textContent = state.currentQuestion.question;
  elements.questionNbEl.textContent = state.currentIndex + 1;

  elements.answerBtns.forEach((btn, i) => {
    const icon = document.createElement("i");
    icon.classList.add("fa-regular", "fa-circle", "fa-xl");
    btn.textContent = state.currentQuestion.options[i];
    btn.prepend(icon);
  });
}

function checkAnswer(selectedBtn, selectedIndex) {
  const isCorrect = selectedIndex === state.currentQuestion.answer;

  elements.answerBtns.forEach((btn) => {
    btn.disabled = true;
  });

  if (isCorrect) {
    updateAnswerIcon(selectedBtn, "correct");
    selectedBtn.classList.add("correct");
    elements.feedbackMessageEl.classList.add("correct");
    elements.feedbackMessageEl.textContent = MESSAGES.CORRECT_ANSWER;

    state.currentScore++;
    elements.currentScoreEl.textContent = state.currentScore;
  } else {
    updateAnswerIcon(selectedBtn, "wrong");
    selectedBtn.classList.add("wrong");

    const correctBtn = elements.answerBtns[state.currentQuestion.answer];
    correctBtn.classList.add("correct");
    updateAnswerIcon(correctBtn, "correct");

    elements.feedbackMessageEl.classList.add("wrong");
    elements.feedbackMessageEl.textContent = MESSAGES.WRONG_ANSWER;
  }

  if (state.currentIndex === CONFIG.MAX_QUESTIONS - 1) {
    elements.nextQuestionBtn.textContent = MESSAGES.SHOW_SCORE;
  }

  elements.nextQuestionBtn.classList.add("active");
}

function updateAnswerIcon(answerElement, iconType) {
  const icon = answerElement.firstChild;

  icon.classList.remove(
    "fa-regular",
    "fa-circle",
    "fa-solid",
    "fa-circle-check",
    "fa-circle-xmark",
  );

  switch (iconType) {
    case "correct":
      icon.classList.add("fa-solid", "fa-circle-check", "fa-xl");
      break;
    case "wrong":
      icon.classList.add("fa-solid", "fa-circle-xmark", "fa-xl");
      break;
    default:
      icon.classList.add("fa-regular", "fa-circle", "fa-xl");
  }
}

function nextQuestion() {
  resetAnswersDisplay();

  if (state.currentIndex === CONFIG.MAX_QUESTIONS - 1) {
    showResults();
  } else {
    state.currentIndex++;
    showQuestion();
  }
}

function resetAnswersDisplay() {
  elements.answerBtns.forEach((btn) => {
    btn.disabled = false;
    btn.classList.remove("correct", "wrong");
    updateAnswerIcon(btn, "default");
  });

  elements.feedbackMessageEl.classList.remove("correct", "wrong");
  elements.feedbackMessageEl.textContent = "";
  elements.nextQuestionBtn.classList.remove("active");
}

function startTimer() {
  state.startTime = Date.now();
  state.timerInterval = setInterval(() => {
    const elapsedTime = Math.floor((Date.now() - state.startTime) / 1000);
    elements.currentTimerEl.textContent = formatTime(elapsedTime);
  }, CONFIG.TIMER_UPDATE_INTERVAL);
}

function stopTimer() {
  if (state.timerInterval) {
    clearInterval(state.timerInterval);
    state.timerInterval = null;
  }
}

function resetTimer() {
  stopTimer();
  elements.currentTimerEl.textContent = "00:00";
}

function formatTime(seconds) {
  const min = String(Math.floor(seconds / 60)).padStart(2, "0");
  const sec = String(seconds % 60).padStart(2, "0");
  return `${min}:${sec}`;
}

async function showResults() {
  stopTimer();

  state.totalTime = Math.floor((Date.now() - state.startTime) / 1000);

  elements.scoreEl.textContent = `${state.currentScore}/${CONFIG.MAX_QUESTIONS}`;
  elements.timeEl.textContent = formatTime(state.totalTime);;

  elements.quizSectionEl.style.display = "none";
  elements.resultSectionEl.style.display = "grid";
  
  try {
    await addScore({ name:state.playerName, score: state.currentScore, time: state.totalTime})
    const leaderBoard = await getLeaderboard(SUPABASE_CONFIG.TOP_LIMIT)
    showLeaderBoard(leaderBoard)
  } catch (err) {
    console.error("Erreur Supabase : ", err)
    showError(MESSAGES.LEADERBOARD_ERROR)
  }
}

function restartQuiz() {
  state.questions = [];
  state.currentIndex = 0;
  state.currentQuestion = null;
  state.currentScore = 0;
  state.totalTime = 0;

  elements.questionNbEl.textContent = 0;
  elements.currentScoreEl.textContent = 0;
  elements.nextQuestionBtn.textContent = MESSAGES.NEXT;

  elements.resultSectionEl.style.display = "none";
  elements.quizSectionEl.style.display = "flex";

  resetTimer();
  startTimer();
  loadQuestions();
}

function showLeaderBoard(leaderBoard) {
  const list = document.getElementById("leaderboardList");
  
  list.innerHTML = "";
  
  leaderBoard.forEach((l, i) => {
    const li = document.createElement("li");
    li.textContent = `${i + 1}. ${l.name} — ${l.score} pts — ${formatTime(l.time)}`;

    list.appendChild(li);
  });
}

const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_CONFIG.URL, SUPABASE_CONFIG.KEY);

async function addScore({ name, score, time }) {
  const { error } = await supabaseClient
    .from(SUPABASE_CONFIG.TABLE)
    .insert([{ name, score, time }]);
  if (error) throw error;
}

async function getLeaderboard(limit) {
  const { data, error } = await supabaseClient
    .from(SUPABASE_CONFIG.TABLE)
    .select("name,score,time,created_at")
    .order("score", { ascending: false })
    .order("time", { ascending: true })
    .limit(limit);

  if (error) throw error;
  return data ?? [];
}