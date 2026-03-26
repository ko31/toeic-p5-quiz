const QUESTION_DATA_PATH = "./data/questions.json";

const REQUIRED_FIELDS = [
  "id",
  "category",
  "difficulty",
  "prompt",
  "choices",
  "correctChoiceId",
  "explanation",
  "translationJa",
];
const VALID_CATEGORIES = new Set([
  "noun",
  "verb",
  "adjective",
  "adverb",
  "preposition",
  "conjunction",
  "vocabulary",
  "pronoun",
  "other",
]);
const VALID_DIFFICULTIES = new Set(["easy", "medium", "hard"]);
const EXPECTED_CHOICE_IDS = ["A", "B", "C", "D"];

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function normalizeWhitespace(value) {
  return value.replace(/\s+/g, " ").trim();
}

function normalizeChoiceLabel(value) {
  return normalizeWhitespace(value).toLowerCase();
}

function getBlankCount(prompt) {
  return (prompt.match(/_____+/g) ?? []).length;
}

function buildChoiceSetKey(choices) {
  return choices
    .map((choice) => normalizeChoiceLabel(choice.label))
    .sort()
    .join("||");
}

function validateQuestionShape(question, validationState) {
  for (const field of REQUIRED_FIELDS) {
    if (!(field in question)) {
      throw new Error(`Question is missing required field: ${field}`);
    }
  }

  if (!isNonEmptyString(question.id)) {
    throw new Error("Question id must be a non-empty string");
  }

  if (validationState.seenIds.has(question.id)) {
    throw new Error(`Duplicate question id found: ${question.id}`);
  }

  if (!VALID_CATEGORIES.has(question.category)) {
    throw new Error(`Question ${question.id} has an invalid category`);
  }

  if (!VALID_DIFFICULTIES.has(question.difficulty)) {
    throw new Error(`Question ${question.id} has an invalid difficulty`);
  }

  if (!isNonEmptyString(question.prompt)) {
    throw new Error(`Question ${question.id} has an empty prompt`);
  }

  if (getBlankCount(question.prompt) !== 1) {
    throw new Error(`Question ${question.id} must contain exactly one blank placeholder`);
  }

  const normalizedPrompt = normalizeWhitespace(question.prompt);
  if (validationState.seenPrompts.has(normalizedPrompt)) {
    throw new Error(`Duplicate prompt text found: ${question.id}`);
  }

  if (!Array.isArray(question.choices) || question.choices.length !== 4) {
    throw new Error(`Question ${question.id} must have exactly 4 choices`);
  }

  const choiceIds = new Set();
  const choiceLabels = new Set();
  question.choices.forEach((choice) => {
    if (!isNonEmptyString(choice.id) || !isNonEmptyString(choice.label)) {
      throw new Error(`Question ${question.id} has an invalid choice`);
    }
    if (choiceIds.has(choice.id)) {
      throw new Error(`Question ${question.id} has duplicate choice id: ${choice.id}`);
    }
    choiceIds.add(choice.id);

    const normalizedLabel = normalizeChoiceLabel(choice.label);
    if (choiceLabels.has(normalizedLabel)) {
      throw new Error(`Question ${question.id} has duplicate choice label: ${choice.label}`);
    }
    choiceLabels.add(normalizedLabel);
  });

  if (
    question.choices.some((choice, index) => choice.id !== EXPECTED_CHOICE_IDS[index])
  ) {
    throw new Error(`Question ${question.id} must order choice ids as A, B, C, D`);
  }

  if (!choiceIds.has(question.correctChoiceId)) {
    throw new Error(`Question ${question.id} has a correctChoiceId not found in choices`);
  }

  if (!isNonEmptyString(question.explanation)) {
    throw new Error(`Question ${question.id} has an empty explanation`);
  }

  if (!isNonEmptyString(question.translationJa)) {
    throw new Error(`Question ${question.id} has an empty translationJa`);
  }

  const choiceSetKey = buildChoiceSetKey(question.choices);
  if (validationState.seenChoiceSets.has(choiceSetKey)) {
    throw new Error(`Duplicate choice set found: ${question.id}`);
  }

  validationState.seenIds.add(question.id);
  validationState.seenPrompts.add(normalizedPrompt);
  validationState.seenChoiceSets.add(choiceSetKey);
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

  const validationState = {
    seenIds: new Set(),
    seenPrompts: new Set(),
    seenChoiceSets: new Set(),
  };
  const validQuestions = [];
  const rejectedQuestions = [];

  questions.forEach((question) => {
    try {
      validateQuestionShape(question, validationState);
      validQuestions.push(question);
    } catch (error) {
      rejectedQuestions.push(`${question?.id ?? "<unknown>"}: ${error.message}`);
    }
  });

  if (validQuestions.length === 0) {
    throw new Error("利用可能な問題データがありません。");
  }

  if (rejectedQuestions.length > 0) {
    console.warn(
      `Rejected ${rejectedQuestions.length} invalid question record(s).`,
      rejectedQuestions.slice(0, 10),
    );
  }

  return validQuestions;
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
