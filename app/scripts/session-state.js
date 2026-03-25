export function createSession(questionOrder) {
  if (!Array.isArray(questionOrder) || questionOrder.length === 0) {
    throw new Error("Session requires at least one question.");
  }

  return {
    sessionId: `session-${Date.now()}`,
    questionOrder,
    currentIndex: 0,
    attempts: [],
    currentAttempt: createAttempt(questionOrder[0]),
    startedAt: new Date().toISOString(),
    lastUpdatedAt: new Date().toISOString(),
  };
}

function createAttempt(questionId) {
  return {
    questionId,
    selectedChoiceId: null,
    submitted: false,
    isCorrect: null,
    feedbackVisible: false,
    startedAt: new Date().toISOString(),
    answeredAt: null,
  };
}

function updateTimestamp(session) {
  session.lastUpdatedAt = new Date().toISOString();
}

export function selectChoice(session, choiceId) {
  if (session.currentAttempt.submitted) {
    return session;
  }

  session.currentAttempt.selectedChoiceId = choiceId;
  updateTimestamp(session);
  return session;
}

export function submitAnswer(session, question) {
  const attempt = session.currentAttempt;

  if (attempt.submitted) {
    return attempt;
  }

  if (!attempt.selectedChoiceId) {
    throw new Error("選択肢を選んでから解答してください。");
  }

  attempt.submitted = true;
  attempt.isCorrect = attempt.selectedChoiceId === question.correctChoiceId;
  attempt.feedbackVisible = true;
  attempt.answeredAt = new Date().toISOString();
  session.attempts.push({ ...attempt });
  updateTimestamp(session);

  return attempt;
}

export function canMoveNext(session) {
  return session.currentAttempt.submitted;
}

export function moveToNextQuestion(session, nextQuestionId) {
  if (!nextQuestionId) {
    throw new Error("次の問題がありません。");
  }

  session.currentIndex += 1;
  session.currentAttempt = createAttempt(nextQuestionId);
  updateTimestamp(session);

  return session;
}
