const questionEl = document.querySelector(".question");
const errorMessage = document.querySelector(".error-message");
const answerBtnsEl = document.querySelectorAll(".answer");
const nextquestionBtnEl = document.querySelector(".next-question-btn");
const questionNbEl = document.querySelector(".question-nb span");
const currentScoreEl = document.querySelector(".current-score span");
const feedbackMessageEl = document.querySelector(".feedback-message");
const quizSectionEl = document.querySelector(".quiz");
const resultSectionEl = document.querySelector(".result");
const scoreEl = document.querySelector(".score");
let questions = [];
let currentIndex = 0;
let currentQuestion = null;
let currentScore = 0;

loadQuestions();

answerBtnsEl.forEach((btn, i) =>
  btn.addEventListener("click", function () {
    checkAnswer(btn, i);
  })
);

nextquestionBtnEl.addEventListener("click", function () {
  answerBtnsEl.forEach((btn) => {
    btn.disabled = false;
    btn.classList.remove("correct");
    btn.classList.remove("wrong");
    feedbackMessageEl.classList.remove("wrong");
    feedbackMessageEl.classList.remove("correct");
  });
  nextquestionBtnEl.classList.remove("active");

  if (currentIndex === 9) {
    scoreEl.textContent = currentScore;
    quizSectionEl.style.display = "none";
    resultSectionEl.style.display = "flex";
  } else {
    currentIndex++;
    showQuestion();
  }
});

function checkAnswer(selectAnswer, selectAnswerIndex) {
  answerBtnsEl.forEach((btn) => {
    btn.disabled = true;
  });

  if (selectAnswerIndex === currentQuestion.answer) {
    selectAnswer.firstChild.classList.remove("fa-regular", "fa-circle");
    selectAnswer.firstChild.classList.add("fa-solid", "fa-circle-check", "fa-xl");
    answerBtnsEl[selectAnswerIndex].classList.add("correct");
    feedbackMessageEl.classList.add("correct");
    feedbackMessageEl.textContent = "Bonne réponse";
    currentScore++;
    currentScoreEl.textContent = currentScore;
  } else {
    selectAnswer.firstChild.classList.remove("fa-regular", "fa-circle");
    selectAnswer.firstChild.classList.add("fa-solid", "fa-circle-xmark", "fa-xl");
    answerBtnsEl[selectAnswerIndex].classList.add("wrong");
    answerBtnsEl[currentQuestion.answer].classList.add("correct");
    answerBtnsEl[currentQuestion.answer].firstChild.classList.remove("fa-regular", "fa-circle");
answerBtnsEl[currentQuestion.answer].firstChild.classList.add("fa-solid", "fa-circle-check", "fa-xl");
    feedbackMessageEl.classList.add("wrong");
    feedbackMessageEl.textContent = "Mauvaise réponse";
  }

  if (currentIndex === 9) {
    nextquestionBtnEl.textContent = "Afficher le score";
  }
  nextquestionBtnEl.classList.add("active");
}

function pickRandomItems(array, count) {
  const shuffled = array;
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
  const arrayBtn = Array.from(answerBtnsEl);
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

  quizSectionEl.style.display = "flex";
  resultSectionEl.style.display = "none";
  nextquestionBtnEl.textContent = "Suivant";
  questionNbEl.textContent = currentIndex;
  currentScoreEl.textContent = currentScore;

  // Recharge de nouvelles questions aléatoires
  loadQuestions();
}
