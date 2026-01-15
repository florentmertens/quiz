const questionEl = document.querySelector(".question");
const errorMessage = document.querySelector(".error-message");
const answerBtns = document.querySelectorAll(".answer");
const nextQuestionBtn = document.querySelector(".next-question-btn");
const questionNbEl = document.querySelector(".question-nb span");
const currentScoreEl = document.querySelector(".current-score span");
const feedbackMessageEl = document.querySelector(".feedback-message");
const quizSectionEl = document.querySelector(".quiz");
const resultSectionEl = document.querySelector(".result");
const scoreEl = document.querySelector(".score");
const timerEl = document.getElementById("timer");
const startBtn = document.querySelector(".start-quiz-btn");
const nameInput = document.getElementById("playerName");
const startSection = document.querySelector(".start");
const mainSection = document.querySelector("main");

let questions = [];
let currentIndex = 0;
let currentQuestion = null;
let currentScore = 0;
let playerName = "";
let startTime = null;
let timerInterval = null;
let totalTime = 0;

startBtn.addEventListener("click", function (e) {
  e.preventDefault();
  playerName = nameInput.value.trim();
  if (playerName) {
    startSection.style.display = "none";
    mainSection.style.display = "flex";
    startTime = Date.now();
    updateTimer();
    loadQuestions();
  }
});

answerBtns.forEach((btn, i) =>
  btn.addEventListener("click", function () {
    checkAnswer(btn, i);
  })
);

nextQuestionBtn.addEventListener("click", function () {
  answerBtns.forEach((btn) => {
    btn.disabled = false;
    btn.classList.remove("correct");
    btn.classList.remove("wrong");
    feedbackMessageEl.classList.remove("wrong");
    feedbackMessageEl.classList.remove("correct");
  });
  nextQuestionBtn.classList.remove("active");

  if (currentIndex === 9) {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
    totalTime = Math.floor((Date.now() - startTime) / 1000);
    scoreEl.textContent = `${currentScore}/10 (${totalTime}s)`;
    quizSectionEl.style.display = "none";
    resultSectionEl.style.display = "grid";
  } else {
    currentIndex++;
    showQuestion();
  }
});

function updateTimer() {
  timerInterval = setInterval(() => {
    if (startTime) {
      const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
      const min = String(Math.floor(elapsedTime / 60)).padStart(2, "0");
      const sec = String(elapsedTime % 60).padStart(2, "0");
      timerEl.textContent = `${min}:${sec}`;
    }
  }, 500);
}

function checkAnswer(selectedAnswerElement, selectAnswerIndex) {
  answerBtns.forEach((btn) => {
    btn.disabled = true;
  });

  if (selectAnswerIndex === currentQuestion.answer) {
    updateAnswerIcon(selectedAnswerElement, "correct");
    answerBtns[selectAnswerIndex].classList.add("correct");
    feedbackMessageEl.classList.add("correct");
    feedbackMessageEl.textContent = "Bonne réponse";
    currentScore++;
    currentScoreEl.textContent = currentScore;
  } else {
    updateAnswerIcon(selectedAnswerElement, "wrong");
    answerBtns[selectAnswerIndex].classList.add("wrong");
    answerBtns[currentQuestion.answer].classList.add("correct");
    feedbackMessageEl.classList.add("wrong");
    feedbackMessageEl.textContent = "Mauvaise réponse";
    updateAnswerIcon(answerBtns[currentQuestion.answer], "correct");
  }

  if (currentIndex === 9) {
    nextQuestionBtn.textContent = "Afficher le score";
  }
  nextQuestionBtn.classList.add("active");
}

function pickRandomItems(array, count) {
  const shuffled = [...array];
  for (let index = shuffled.length - 1; index > 0; index--) {
    const randIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randIndex]] = [
      shuffled[randIndex],
      shuffled[index],
    ];
  }

  return shuffled.slice(0, count);
}

function showQuestion() {
  currentQuestion = questions[currentIndex];
  questionEl.textContent = currentQuestion.question;
  const arrayBtn = Array.from(answerBtns);
  arrayBtn.forEach((btn, i) => {
    const icon = document.createElement("i");
    icon.classList.add("fa-regular", "fa-circle", "fa-xl");
    btn.textContent = currentQuestion.options[i];
    btn.prepend(icon);
  });
  questionNbEl.textContent = currentIndex + 1;
}

function showNoQuestionsMessage() {
  errorMessage.textContent =
    "Erreur : Pas de questions disponible, merci de contacter le support technique à l'adresse mertens.florent00@gmail.com.";
  errorMessage.style.display = "flex";
}

async function loadQuestions() {
  try {
    const response = await fetch("questions.json");
    if (!response.ok) throw new Error(response.status);
    const data = await response.json();
    const maxQuestions = Math.min(data.length, 10);
    questions = pickRandomItems(data, maxQuestions);
    if (questions.length) showQuestion();
    else showNoQuestionsMessage();
  } catch (err) {
    console.error(err);
    errorMessage.textContent =
      "Erreur : Chargement des questions échoué, merci de rafraîchir la page ou de contacter le support technique à l'adresse mertens.florent00@gmail.com.";
    errorMessage.style.display = "flex";
  }
}

function restartQuiz() {
  questions = [];
  currentIndex = 0;
  currentQuestion = null;
  currentScore = 0;

  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }

  startTime = null;
  totalTime = 0;
  timerEl.textContent = "00:00";

  quizSectionEl.style.display = "flex";
  resultSectionEl.style.display = "none";
  nextQuestionBtn.textContent = "Suivant";
  questionNbEl.textContent = currentIndex;
  currentScoreEl.textContent = currentScore;

  loadQuestions();
}

function updateAnswerIcon(answerElement, iconType) {
  const icon = answerElement.firstChild;
  icon.classList.remove(
    "fa-regular",
    "fa-circle",
    "fa-solid",
    "fa-circle-check",
    "fa-circle-xmark"
  );

  if (iconType === "correct") {
    icon.classList.add("fa-solid", "fa-circle-check", "fa-xl");
  } else if (iconType === "wrong") {
    icon.classList.add("fa-solid", "fa-circle-xmark", "fa-xl");
  } else {
    icon.classList.add("fa-regular", "fa-circle", "fa-xl");
  }
}
