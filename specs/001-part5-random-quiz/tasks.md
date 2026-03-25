# Tasks: TOEIC Part 5 Random Quiz

**Input**: Design documents from `/specs/001-part5-random-quiz/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: 問題の正確性、即時フィードバック、状態遷移、モバイル UI に影響するため、各ユーザーストーリーに受け入れ確認タスクを含める。

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- 静的アプリ本体: `app/`
- Docker 開発環境: `Dockerfile`, `docker-compose.yml`, `docker/`
- 手動確認ドキュメント: `tests/manual/`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: 静的 Web アプリとローカル Docker 確認環境の土台を作る

- [ ] T001 Create the static app directory structure in app/index.html, app/styles/main.css, app/scripts/app.js, app/scripts/question-store.js, app/scripts/session-state.js, app/scripts/ui-renderer.js, and app/data/questions.json
- [ ] T002 Create the Docker-based local preview setup in Dockerfile, docker-compose.yml, and docker/nginx.conf
- [ ] T003 [P] Create the manual verification checklist in tests/manual/practice-checklist.md
- [ ] T004 Define the MVP scope and deferred scope notes in specs/001-part5-random-quiz/quickstart.md

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: すべてのユーザーストーリーで共有するデータ取得、状態管理、描画基盤を整える

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T005 Create the question data set with validated sample items in app/data/questions.json
- [ ] T006 [P] Implement question loading and schema validation in app/scripts/question-store.js
- [ ] T007 [P] Implement session and attempt state transitions in app/scripts/session-state.js
- [ ] T008 Define shared loading, error, correct, and incorrect UI styles in app/styles/main.css
- [ ] T009 Build the base HTML shell and application mount points in app/index.html
- [ ] T010 Implement shared rendering helpers for loading and error states in app/scripts/ui-renderer.js
- [ ] T011 Wire app bootstrap, initialization flow, and failure handling in app/scripts/app.js
- [ ] T012 Review input constraints and localStorage usage boundaries in specs/001-part5-random-quiz/quickstart.md and tests/manual/practice-checklist.md

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - ランダム問題を解いて即時確認する (Priority: P1) 🎯 MVP

**Goal**: 1 問表示、4 択回答、即時の正誤・正答・解説表示を成立させる

**Independent Test**: ブラウザで最初の問題を表示し、1 つ選んで解答すると、その場で正誤、正答、解説が表示され、同一問題を再回答できないことを確認する

### Validation for User Story 1

- [ ] T013 [P] [US1] Add the User Story 1 acceptance steps to tests/manual/practice-checklist.md
- [ ] T014 [P] [US1] Add question data validation cases for prompt, choices, correctChoiceId, and explanation in tests/manual/practice-checklist.md

### Implementation for User Story 1

- [ ] T015 [P] [US1] Implement randomized first-question selection from the validated data set in app/scripts/question-store.js
- [ ] T016 [P] [US1] Implement answer selection and submission state updates in app/scripts/session-state.js
- [ ] T017 [US1] Implement question, choices, and submit-action rendering in app/scripts/ui-renderer.js
- [ ] T018 [US1] Implement immediate feedback rendering for correct/incorrect state, correct answer, and explanation in app/scripts/ui-renderer.js
- [ ] T019 [US1] Connect question display, answer submission, and re-submit prevention in app/scripts/app.js
- [ ] T020 [US1] Apply mobile-first layout and visual feedback styling for the primary answer flow in app/styles/main.css
- [ ] T021 [US1] Update the semantic practice screen structure for the answer flow in app/index.html

**Checkpoint**: User Story 1 should be fully functional and independently demoable

---

## Phase 4: User Story 2 - 次の問題へ進んで反復練習する (Priority: P2)

**Goal**: 解説確認後に次問へ進み、同じ流れで反復練習できるようにする

**Independent Test**: 1 問目の解説表示後に次へ進み、別問題が表示され、前問の選択状態を引き継がずに再び解答できることを確認する

### Validation for User Story 2

- [ ] T022 [P] [US2] Add the repeated-practice acceptance steps to tests/manual/practice-checklist.md
- [ ] T023 [P] [US2] Add state reset and duplicate-question review checks to tests/manual/practice-checklist.md

### Implementation for User Story 2

- [ ] T024 [P] [US2] Extend question sequencing and remaining-question handling in app/scripts/question-store.js
- [ ] T025 [P] [US2] Extend session progress and next-question transitions in app/scripts/session-state.js
- [ ] T026 [US2] Render the next-question action and cleared attempt state in app/scripts/ui-renderer.js
- [ ] T027 [US2] Wire next-question navigation, repeated practice loop, and end-of-sequence fallback in app/scripts/app.js
- [ ] T028 [US2] Adjust feedback and transition styling for continuous practice in app/styles/main.css

**Checkpoint**: User Stories 1 and 2 should both work as independent practice increments

---

## Phase 5: User Story 3 - モバイル端末で快適に利用する (Priority: P3)

**Goal**: スマートフォン相当の表示幅でも横スクロールなく主要操作を完了できるようにする

**Independent Test**: モバイル表示幅で問題閲覧、解答、解説確認、次問遷移までを拡大縮小なしで完了できることを確認する

### Validation for User Story 3

- [ ] T029 [P] [US3] Add mobile viewport acceptance checks to tests/manual/practice-checklist.md
- [ ] T030 [P] [US3] Add tap-target, readability, and error-state checks for mobile in tests/manual/practice-checklist.md

### Implementation for User Story 3

- [ ] T031 [P] [US3] Refine the page structure and viewport metadata for mobile browsers in app/index.html
- [ ] T032 [US3] Implement responsive spacing, typography, and tap-target sizing in app/styles/main.css
- [ ] T033 [US3] Adjust feedback, error, and next-action rendering order for small screens in app/scripts/ui-renderer.js
- [ ] T034 [US3] Ensure mobile-specific UI states and focus movement are coordinated in app/scripts/app.js

**Checkpoint**: All user stories should now be independently functional on mobile browsers

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: 複数ストーリーにまたがる仕上げとリリース準備

- [ ] T035 [P] Update deployment and local run instructions for Cloudflare Pages and Docker in specs/001-part5-random-quiz/quickstart.md
- [ ] T036 Verify the full manual checklist and record final acceptance results in tests/manual/practice-checklist.md
- [ ] T037 Review question content safety, malformed data handling, and localStorage non-use or limited-use behavior in app/scripts/question-store.js, app/scripts/session-state.js, and tests/manual/practice-checklist.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational completion
- **User Story 2 (Phase 4)**: Depends on Foundational completion and benefits from User Story 1 state/rendering flow
- **User Story 3 (Phase 5)**: Depends on Foundational completion and should be applied after core flows are available
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational - no dependency on later stories
- **User Story 2 (P2)**: Reuses the answer and feedback flow from US1, but remains independently testable once that shared flow exists
- **User Story 3 (P3)**: Reuses the implemented practice flow and adapts it for mobile-specific usability

### Within Each User Story

- Validation checklist updates before implementation completion
- Data/state updates before final UI wiring
- Rendering updates before final app integration
- Story checkpoint validation before moving to the next priority

### Parallel Opportunities

- `T003` and `T004` can run in parallel after the directory plan is clear
- `T006`, `T007`, and `T008` can run in parallel in the Foundational phase
- `T013` and `T014`, `T022` and `T023`, `T029` and `T030` can run in parallel within each story
- `T015` and `T016` can run in parallel for User Story 1
- `T024` and `T025` can run in parallel for User Story 2
- `T031` and `T029` can run in parallel for User Story 3

---

## Parallel Example: User Story 1

```bash
Task: "T013 [US1] Add the User Story 1 acceptance steps to tests/manual/practice-checklist.md"
Task: "T014 [US1] Add question data validation cases for prompt, choices, correctChoiceId, and explanation in tests/manual/practice-checklist.md"
Task: "T015 [US1] Implement randomized first-question selection from the validated data set in app/scripts/question-store.js"
Task: "T016 [US1] Implement answer selection and submission state updates in app/scripts/session-state.js"
```

## Parallel Example: User Story 2

```bash
Task: "T022 [US2] Add the repeated-practice acceptance steps to tests/manual/practice-checklist.md"
Task: "T023 [US2] Add state reset and duplicate-question review checks to tests/manual/practice-checklist.md"
Task: "T024 [US2] Extend question sequencing and remaining-question handling in app/scripts/question-store.js"
Task: "T025 [US2] Extend session progress and next-question transitions in app/scripts/session-state.js"
```

## Parallel Example: User Story 3

```bash
Task: "T029 [US3] Add mobile viewport acceptance checks to tests/manual/practice-checklist.md"
Task: "T030 [US3] Add tap-target, readability, and error-state checks for mobile in tests/manual/practice-checklist.md"
Task: "T031 [US3] Refine the page structure and viewport metadata for mobile browsers in app/index.html"
```

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. Validate `tests/manual/practice-checklist.md`
5. Preview locally via Docker and decide MVP release readiness

### Incremental Delivery

1. Setup + Foundational → static app shell and validated data pipeline ready
2. Add User Story 1 → first releasable TOEIC Part 5 practice loop
3. Add User Story 2 → repeated practice across multiple questions
4. Add User Story 3 → mobile usability refinement
5. Complete Polish phase → deployment and acceptance confirmation

### Parallel Team Strategy

1. One developer prepares Docker/static shell while another drafts manual verification steps
2. Foundational state/data/style tasks split across separate files
3. After Foundational, one developer can focus on state sequencing while another handles UI rendering and styling

## Notes

- All tasks follow the required checklist format with checkbox, task ID, optional `[P]`, story label where required, and concrete file path
- User Story 1 is the recommended MVP scope
- Manual acceptance is explicit because the design artifacts specify browser and mobile behavior rather than automated test tooling
