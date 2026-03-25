function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderChoices(question, attempt) {
  return question.choices
    .map((choice) => {
      const isSelected = attempt.selectedChoiceId === choice.id;
      const isCorrect = attempt.submitted && choice.id === question.correctChoiceId;
      const isWrong = attempt.submitted && isSelected && !attempt.isCorrect;
      const classes = ["choice-button"];

      if (isSelected) {
        classes.push("is-selected");
      }
      if (attempt.submitted) {
        classes.push("is-disabled");
      }
      if (isCorrect) {
        classes.push("is-correct");
      }
      if (isWrong) {
        classes.push("is-wrong");
      }

      return `
        <button
          type="button"
          class="${classes.join(" ")}"
          data-choice-id="${escapeHtml(choice.id)}"
          ${attempt.submitted ? "disabled" : ""}
        >
          <span class="choice-key">${escapeHtml(choice.id)}</span>
          <span class="choice-text">${escapeHtml(choice.label)}</span>
        </button>
      `;
    })
    .join("");
}

function renderFeedback(question, attempt) {
  if (!attempt.feedbackVisible) {
    return "";
  }

  const title = attempt.isCorrect ? "正解です" : "不正解です";
  const modifier = attempt.isCorrect ? "is-correct" : "is-wrong";
  const answerText = question.choices.find(
    (choice) => choice.id === question.correctChoiceId,
  )?.label;

  return `
    <section class="feedback-box ${modifier}" aria-live="polite">
      <h3>${title}</h3>
      <p>正答: ${escapeHtml(question.correctChoiceId)}. ${escapeHtml(answerText ?? "")}</p>
      <p>${escapeHtml(question.explanation)}</p>
      <p><strong>問題文の日本語訳:</strong> ${escapeHtml(question.translationJa)}</p>
    </section>
  `;
}

export function renderQuestionView({
  container,
  question,
  attempt,
  progressLabel,
  statsLabel,
  isLastQuestion,
}) {
  const submitDisabled = !attempt.selectedChoiceId || attempt.submitted;
  const nextDisabled = !attempt.submitted;

  container.innerHTML = `
    <div class="summary-row">
      <span>${escapeHtml(progressLabel)}</span>
      <span>${escapeHtml(statsLabel)}</span>
    </div>
    <div class="utility-actions">
      <button type="button" class="button button-tertiary" id="back-to-top">
        TOPに戻る
      </button>
    </div>
    <p class="prompt">${escapeHtml(question.prompt)}</p>
    <div class="choice-list" role="list">
      ${renderChoices(question, attempt)}
    </div>
    <div class="actions">
      <button type="button" class="button button-primary" id="submit-answer" ${
        submitDisabled ? "disabled" : ""
      }>
        ${attempt.submitted ? "解答済み" : "解答する"}
      </button>
    </div>
    ${renderFeedback(question, attempt)}
    <div class="feedback-actions">
      <button type="button" class="button button-secondary" id="next-question" ${
        nextDisabled ? "disabled" : ""
      }>
        ${isLastQuestion ? "もう一度ランダムに出題する" : "次の問題へ"}
      </button>
    </div>
  `;
}

export function renderLoadingView(container) {
  renderMessage({
    container,
    title: "問題を準備しています",
    message: "問題データを読み込み、練習セッションを開始しています。",
    variant: "loading",
  });
}

export function renderMessage({
  container,
  title,
  message,
  variant = "loading",
  buttonLabel = "",
}) {
  container.innerHTML = `
    <section class="message-box is-${variant}">
      <h3>${escapeHtml(title)}</h3>
      <p>${escapeHtml(message)}</p>
      ${
        buttonLabel
          ? `<div class="actions"><button type="button" class="button button-secondary" id="retry-load">${escapeHtml(buttonLabel)}</button></div>`
          : ""
      }
    </section>
  `;
}
