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
import { renderMessage, renderQuestionView } from "./ui-renderer.js";

const elements = {
  app: document.querySelector("#app"),
  statusBadge: document.querySelector("#status-badge"),
  sessionLabel: document.querySelector("#session-label"),
};

const state = {
  questions: [],
  session: null,
  lastQuestionId: null,
  eventsBound: false,
};

function updateStatus(text, variant = "") {
  elements.statusBadge.textContent = text;
  elements.statusBadge.classList.remove("is-error", "is-success");

  if (variant) {
    elements.statusBadge.classList.add(variant);
  }
}

function getCurrentQuestion() {
  return getQuestionById(state.questions, state.session.currentAttempt.questionId);
}

function render() {
  const question = getCurrentQuestion();
  const attempt = state.session.currentAttempt;
  const total = state.session.questionOrder.length;
  const current = state.session.currentIndex + 1;

  elements.sessionLabel.textContent = `Question ${current} / ${total}`;
  updateStatus(attempt.submitted ? "Answered" : "Ready", attempt.submitted ? "is-success" : "");

  renderQuestionView({
    container: elements.app,
    question,
    attempt,
    progressLabel: `${current}問目 / 全${total}問`,
    isLastQuestion: current === total,
  });
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
    updateStatus("Action needed", "is-error");
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

  state.eventsBound = true;
}

async function bootstrap() {
  updateStatus("Loading");
  renderMessage({
    container: elements.app,
    title: "問題を準備しています",
    message: "問題データを読み込み、練習セッションを開始しています。",
    variant: "loading",
  });

  try {
    state.questions = await loadQuestions();
    state.session = createSession(createQuestionSequence(state.questions));
    bindEvents();
    render();
  } catch (error) {
    updateStatus("Error", "is-error");
    renderMessage({
      container: elements.app,
      title: "問題を表示できませんでした",
      message: error.message,
      variant: "error",
      buttonLabel: "再試行",
    });
  }
}

bootstrap();
