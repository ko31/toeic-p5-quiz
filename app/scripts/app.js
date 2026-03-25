import {
  createQuestionSequence,
  getQuestionById,
  loadQuestions,
} from "./question-store.js";
import {
  canMoveNext,
  createSession,
  moveToNextQuestion,
  selectChoice,
  submitAnswer,
} from "./session-state.js";
import {
  renderLoadingView,
  renderMessage,
  renderQuestionView,
} from "./ui-renderer.js";

const elements = {
  page: document.querySelector("#page"),
  app: document.querySelector("#app"),
  startButton: document.querySelector("#start-practice"),
  practiceScreen: document.querySelector("#practice-screen"),
};

const state = {
  questions: [],
  session: null,
  lastQuestionId: null,
  eventsBound: false,
  practiceStarted: false,
};

function getCurrentQuestion() {
  return getQuestionById(state.questions, state.session.currentAttempt.questionId);
}

function render() {
  const question = getCurrentQuestion();
  const attempt = state.session.currentAttempt;
  const current = state.session.currentIndex + 1;

  renderQuestionView({
    container: elements.app,
    question,
    attempt,
    progressLabel: `${current}問目`,
    isLastQuestion: current === state.session.questionOrder.length,
  });
}

function showPracticeScreen() {
  state.practiceStarted = true;
  elements.page.classList.add("is-practice");
  elements.practiceScreen.hidden = false;
}

function restartSequence() {
  const questionOrder = createQuestionSequence(state.questions, state.lastQuestionId);
  state.session = createSession(questionOrder);
  render();
}

function handleChoiceSelection(choiceId) {
  selectChoice(state.session, choiceId);
  render();
}

function handleSubmit() {
  try {
    const question = getCurrentQuestion();
    submitAnswer(state.session, question);
    state.lastQuestionId = question.id;
    render();
  } catch (error) {
    renderMessage({
      container: elements.app,
      title: "選択肢を選んでください",
      message: error.message,
      variant: "error",
      buttonLabel: "問題に戻る",
    });
  }
}

function handleNextQuestion() {
  if (!canMoveNext(state.session)) {
    return;
  }

  const nextQuestionId = state.session.questionOrder[state.session.currentIndex + 1];

  if (!nextQuestionId) {
    restartSequence();
    return;
  }

  moveToNextQuestion(state.session, nextQuestionId);
  render();
}

function bindEvents() {
  if (state.eventsBound) {
    return;
  }

  elements.app.addEventListener("click", (event) => {
    const choiceButton = event.target.closest("[data-choice-id]");
    if (choiceButton) {
      handleChoiceSelection(choiceButton.dataset.choiceId);
      return;
    }

    if (event.target.id === "submit-answer") {
      handleSubmit();
      return;
    }

    if (event.target.id === "next-question") {
      handleNextQuestion();
      return;
    }

    if (event.target.id === "retry-load") {
      bootstrap();
    }
  });

  elements.startButton.addEventListener("click", () => {
    showPracticeScreen();
    bootstrap();
  });

  state.eventsBound = true;
}

async function bootstrap() {
  renderLoadingView(elements.app);

  try {
    state.questions = await loadQuestions();
    state.session = createSession(createQuestionSequence(state.questions));
    bindEvents();
    render();
  } catch (error) {
    renderMessage({
      container: elements.app,
      title: "問題を表示できませんでした",
      message: error.message,
      variant: "error",
      buttonLabel: "再試行",
    });
  }
}

bindEvents();
