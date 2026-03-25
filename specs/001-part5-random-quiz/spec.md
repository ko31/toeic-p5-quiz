# Feature Specification: TOEIC Part 5 Random Quiz

**Feature Branch**: `001-part5-random-quiz`  
**Created**: 2026-03-25  
**Status**: Draft  
**Input**: User description: "TOEICのPart5の練習問題をランダムに出題する。問題および回答選択肢は実際の問題と類似した形式にする。選択肢から選んで解答したら即座に正誤と解説を表示する。その後、次の問題へ移動して練習を何度も繰り返せる。アプリは単一ユーザーの利用を想定し、ブラウザで利用できる。モバイル端末に最適化したUIを提供する。"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - ランダム問題を解いて即時確認する (Priority: P1)

学習者として、TOEIC Part 5 形式の問題を1問ずつランダムに解き、回答直後に
正誤と解説を確認したい。短時間でも繰り返し演習できることが最優先である。

**Why this priority**: ランダム出題、選択式回答、即時フィードバックがそろって初めて
Part 5 練習アプリとして成立するため。

**Independent Test**: ブラウザでアプリを開き、開始画面から練習を始め、表示された1問に回答し、
その場で正誤、正答、問題文の日本語訳、解説が表示されることを確認できれば、
このストーリー単体で価値を検証できる。

**Acceptance Scenarios**:

1. **Given** 学習者が開始前の画面を開いている, **When** 問題開始操作を行う,
   **Then** 練習画面へ切り替わり、Part 5 形式の問題文と4つの選択肢が表示される
2. **Given** 学習者が未回答の問題を見ている, **When** 1つの選択肢を選んで解答する,
   **Then** 即座に正誤、正答、問題文の日本語訳、解説が同じ画面内に表示される
3. **Given** 学習者が練習中である, **When** 問題ページを見ている,
   **Then** 問題番号、正答率、経過時間が主問題を邪魔しない情報量で表示される

---

### User Story 2 - 次の問題へ進んで反復練習する (Priority: P2)

学習者として、1問を解き終えたらすぐ次の問題へ進み、同じ流れで繰り返し練習したい。

**Why this priority**: 継続して複数問を解けないと、短時間で量をこなす学習体験が成立しないため。

**Independent Test**: 1問目に回答して解説を確認した後、次の問題へ進み、別の問題が表示されて
再び解答できれば独立して価値を確認できる。

**Acceptance Scenarios**:

1. **Given** 学習者が1問の解説を確認済みである, **When** 次の問題へ進む操作を行う,
   **Then** 新しい問題が表示され、前の問題の回答状態は引き継がれない
2. **Given** 学習者が連続して練習している, **When** 次の問題を繰り返し表示する,
   **Then** 各問題で同じ操作手順で回答とフィードバックを繰り返せる

---

### User Story 3 - モバイル端末で快適に利用する (Priority: P3)

学習者として、スマートフォンのブラウザでも片手で無理なく操作できる画面で練習したい。

**Why this priority**: 利用環境としてモバイル端末が明示されており、移動時間などの短時間学習に
直結するため。

**Independent Test**: モバイル相当の表示幅でアプリを開き、問題の閲覧、選択肢の選択、
解説確認、次の問題への移動までが拡大縮小なしで行えれば価値を確認できる。

**Acceptance Scenarios**:

1. **Given** 学習者がモバイル端末でアプリを開いている, **When** 問題を閲覧して回答する,
   **Then** 横スクロールなしで主要操作を完了できる
2. **Given** 学習者が片手操作をしている, **When** 選択肢や次へ進む操作を行う,
   **Then** タップ対象が判別しやすく誤操作しにくい状態で表示される

### Edge Cases

- 問題データが一時的に取得できない場合は、学習者に再試行可能なエラーメッセージを表示し、
  回答不能なまま空白画面にしない。
- 問題群は重複しない問題文で構成し、学習者に不自然な重複体験を与えない。
- 学習者が回答前に次の問題へ進もうとした場合は、誤操作を防ぐ案内を表示するか、
  進行を抑止する。
- 解説が長い場合でも、モバイル画面で正答と解説の両方を読み取れる表示にする。

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display one TOEIC Part 5 style question at a time in a browser-based practice screen.
- **FR-002**: System MUST present a question stem and multiple answer choices in a format similar to actual TOEIC Part 5 questions.
- **FR-003**: Users MUST be able to select one answer choice and submit that choice with a single clear action.
- **FR-004**: System MUST immediately display whether the selected answer is correct or incorrect after submission.
- **FR-005**: System MUST display the correct answer and a plain-language explanation immediately after submission.
- **FR-005a**: System MUST display a Japanese translation of the completed question sentence immediately after submission.
- **FR-006**: System MUST prevent the same question instance from being answered multiple times after feedback is shown.
- **FR-007**: System MUST provide a clear action to move to the next practice question after feedback is displayed.
- **FR-008**: System MUST load the next question as a new attempt so the learner can continue practicing repeatedly.
- **FR-009**: System MUST support a randomized question order for each practice session.
- **FR-010**: System MUST optimize the primary practice flow for a single learner using the app in a web browser on mobile devices.
- **FR-011**: System MUST communicate loading, error, and ready states in a way that makes the current app state unambiguous.
- **FR-012**: System MUST ensure each question record includes the problem text, answer choices, correct answer, explanation, and Japanese translation needed for evaluation and review.
- **FR-013**: System MUST provide a minimal start screen before practice begins, containing only the title, short description, and a clear action to start practice.
- **FR-014**: System MUST display current accuracy and elapsed practice time during the practice session without obscuring the question and choices.
- **FR-015**: System MUST support a question set of 1000 unique prompt records without degrading the short-loop practice flow on common modern mobile browsers.

### UX & Feedback Requirements *(mandatory)*

- The primary user flow MUST be completable in a short loop of four steps: open practice, read one question, answer, review feedback, then continue to the next question.
- Practice MUST begin from a minimal top screen and transition to a distraction-reduced practice screen where the question and choices remain the visual priority.
- Immediately after answer submission, the screen MUST visually indicate that the answer was received and then show correctness, correct answer, and explanation without requiring a page refresh.
- Feedback MUST include the Japanese translation of the full sentence after the blank is resolved so the learner can confirm meaning after answering.
- The screen MUST clearly distinguish unanswered, answered-correct, answered-incorrect, loading, and error states.
- The interface MUST prioritize one main action at a time so that the learner is not asked to choose between multiple competing actions on the same screen.
- The mobile layout MUST keep the question, answer choices, feedback, and next-question action usable without horizontal scrolling.
- The question and all four answer choices SHOULD fit within the first viewport on common mobile portrait widths whenever the item length is within the normal dataset range.

### Data & Security Requirements *(include if feature stores or processes user data)*

- The feature MAY operate without personally identifiable information and SHOULD avoid collecting personal data in the MVP.
- If the app stores learning history in the future, it MUST store only data needed for practice continuity or progress review.
- Question content, correct answers, and explanations MUST be validated before being shown so malformed data does not produce invalid grading or misleading feedback.
- Any user-triggered input accepted by the feature MUST be constrained to valid answer selection and navigation actions for the current question.

### Key Entities *(include if feature involves data)*

- **Practice Question**: A single TOEIC Part 5 style item containing the prompt, answer choices, correct choice, explanation, and completed Japanese translation.
- **Practice Attempt**: A learner interaction for one displayed question, including the presented question, selected answer, result status, and completion state.
- **Practice Session**: A sequence of randomly ordered practice attempts experienced continuously by one learner in one browsing session, including running accuracy, elapsed time, and current question position.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 90% 以上の学習者が、アプリを開いてから最初の1問の正誤と解説を 30 秒以内に確認できる。
- **SC-002**: 95% 以上の回答で、解答操作後 1 秒以内に正誤と解説が表示される。
- **SC-003**: 90% 以上の学習者が、説明なしで 3 問連続の練習を完了できる。
- **SC-004**: モバイル表示幅での主要操作において、横スクロールを必要とする画面が発生しない。
- **SC-005**: Users can understand whether their action succeeded, failed, or is processing without needing to refresh or retry blindly.

## Assumptions

- 初期リリースでは単一ユーザーの個人学習利用を前提とし、アカウント機能は含まない。
- 問題データは TOEIC Part 5 に類似した独自作成コンテンツを利用し、実際の試験問題そのものは扱わない。
- 初期リリースでは進捗分析や履歴保存よりも、1問ずつ素早く解いて反復する体験を優先する。
- 初期リリースの問題データは 1000 問の重複しない問題文で構成する。
- ブラウザ利用中は一般的なモバイル回線または安定したネットワーク接続が利用できる。

## MVP Boundaries *(mandatory)*

- 含めるもの: 開始画面、ランダム出題、4択回答、即時の正誤表示、正答表示、問題文の日本語訳表示、解説表示、正答率と経過時間の表示、次の問題への遷移、モバイル最適化された単一ユーザー向けブラウザUI。
- 後続反復へ回すもの: 学習履歴の保存、成績分析、カテゴリ絞り込み、難易度調整、ログイン機能、音声や画像を使う拡張問題形式。
