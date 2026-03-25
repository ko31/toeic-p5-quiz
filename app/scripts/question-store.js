const QUESTION_DATA_PATH = "./data/questions.json";

const REQUIRED_FIELDS = ["id", "prompt", "choices", "correctChoiceId", "explanation", "translationJa"];

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function validateQuestionShape(question, seenIds) {
  for (const field of REQUIRED_FIELDS) {
    if (!(field in question)) {
      throw new Error(`Question is missing required field: ${field}`);
    }
  }

  if (!isNonEmptyString(question.id)) {
    throw new Error("Question id must be a non-empty string");
  }

  if (seenIds.has(question.id)) {
    throw new Error(`Duplicate question id found: ${question.id}`);
  }

  if (!isNonEmptyString(question.prompt)) {
    throw new Error(`Question ${question.id} has an empty prompt`);
  }

  if (!Array.isArray(question.choices) || question.choices.length !== 4) {
    throw new Error(`Question ${question.id} must have exactly 4 choices`);
  }

  const choiceIds = new Set();
  question.choices.forEach((choice) => {
    if (!isNonEmptyString(choice.id) || !isNonEmptyString(choice.label)) {
      throw new Error(`Question ${question.id} has an invalid choice`);
    }
    if (choiceIds.has(choice.id)) {
      throw new Error(`Question ${question.id} has duplicate choice id: ${choice.id}`);
    }
    choiceIds.add(choice.id);
  });

  if (!choiceIds.has(question.correctChoiceId)) {
    throw new Error(`Question ${question.id} has a correctChoiceId not found in choices`);
  }

  if (!isNonEmptyString(question.explanation)) {
    throw new Error(`Question ${question.id} has an empty explanation`);
  }

  if (!isNonEmptyString(question.translationJa)) {
    throw new Error(`Question ${question.id} has an empty translationJa`);
  }
}

function shuffle(array) {
  const cloned = [...array];

  for (let index = cloned.length - 1; index > 0; index -= 1) {
    const nextIndex = Math.floor(Math.random() * (index + 1));
    [cloned[index], cloned[nextIndex]] = [cloned[nextIndex], cloned[index]];
  }

  return cloned;
}

export async function loadQuestions() {
  const response = await fetch(QUESTION_DATA_PATH, { cache: "no-store" });

  if (!response.ok) {
    throw new Error("問題データの読み込みに失敗しました。");
  }

  const questions = await response.json();

  if (!Array.isArray(questions) || questions.length === 0) {
    throw new Error("利用可能な問題データがありません。");
  }

  const seenIds = new Set();
  questions.forEach((question) => {
    validateQuestionShape(question, seenIds);
    seenIds.add(question.id);
  });

  return questions;
}

export function createQuestionSequence(questions, previousQuestionId = null) {
  const randomized = shuffle(questions);

  if (
    previousQuestionId &&
    randomized.length > 1 &&
    randomized[0] &&
    randomized[0].id === previousQuestionId
  ) {
    [randomized[0], randomized[1]] = [randomized[1], randomized[0]];
  }

  return randomized.map((question) => question.id);
}

export function getQuestionById(questions, questionId) {
  return questions.find((question) => question.id === questionId) ?? null;
}
