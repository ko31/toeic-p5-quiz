# Data Model: TOEIC Part 5 Random Quiz

## Practice Question

**Purpose**: TOEIC Part 5 形式の 1 問分の出題データを表す。

**Fields**:

- `id`: 文字列。問題を一意に識別する。
- `prompt`: 文字列。空所を含む問題文または設問本文。
- `choices`: 4 件の選択肢配列。各選択肢は `id` と `label` を持つ。
- `correctChoiceId`: 文字列。`choices` 内のいずれか 1 件と一致する正答 ID。
- `explanation`: 文字列。正答理由を学習者向けに説明する本文。
- `category`: 文字列。語彙、文法、品詞などの分類。MVP では表示しなくてもよい。
- `difficulty`: 文字列。難易度の目安。MVP では内部データとして保持可能。

**Validation Rules**:

- `id` は空文字不可かつ重複不可。
- `prompt` は空文字不可。
- `choices` はちょうど 4 件必要。
- 各 `choices[].id` は同一問題内で一意であること。
- 各 `choices[].label` は空文字不可。
- `correctChoiceId` は `choices[].id` のいずれかに一致すること。
- `explanation` は空文字不可。

## Practice Attempt

**Purpose**: 表示中の 1 問に対する学習者の解答状態を表す。

**Fields**:

- `questionId`: 文字列。対象問題 ID。
- `selectedChoiceId`: 文字列または null。学習者が選択した選択肢。
- `submitted`: 真偽値。解答確定済みかを表す。
- `isCorrect`: 真偽値または null。採点結果。
- `feedbackVisible`: 真偽値。正誤と解説が表示中かを表す。
- `startedAt`: 数値または文字列。問題表示開始時刻。
- `answeredAt`: 数値または文字列または null。解答確定時刻。

**Validation Rules**:

- `submitted` が `false` の間は `isCorrect` と `answeredAt` は null であること。
- `submitted` が `true` の場合は `selectedChoiceId` が必須であること。
- `isCorrect` は `selectedChoiceId` と `correctChoiceId` の比較結果と一致すること。
- `feedbackVisible` は `submitted` 後のみ `true` にできること。

**State Transitions**:

1. `ready`: 問題表示直後。未選択、未送信。
2. `selected`: 選択肢を 1 つ選んだ状態。未送信。
3. `submitted`: 解答確定。正誤判定済み。
4. `reviewing`: 正答と解説を表示中。
5. `completed`: 次の問題へ進む準備ができた状態。

## Practice Session

**Purpose**: 1 回の連続練習全体を表す。

**Fields**:

- `sessionId`: 文字列。セッション識別子。
- `questionOrder`: 問題 ID 配列。ランダム化済みの出題順。
- `currentIndex`: 数値。現在表示中の問題位置。
- `attempts`: Practice Attempt 配列。
- `startedAt`: 数値または文字列。練習開始時刻。
- `lastUpdatedAt`: 数値または文字列。最終操作時刻。

**Validation Rules**:

- `questionOrder` は空であってはならない。
- `currentIndex` は `questionOrder` の範囲内であること。
- `attempts.questionId` は `questionOrder` 内の問題 ID と一致すること。
- 同一 `questionId` に対する重複 attempt は 1 セッション内で原則 1 件までとする。

## Optional Local Storage Snapshot

**Purpose**: 将来、セッション継続や軽量設定保持が必要になった場合の保存単位。

**Fields**:

- `lastSessionId`: 最後に利用したセッション ID。
- `lastQuestionIndex`: 最後に見ていた問題位置。
- `preferences`: 表示設定や補助設定のオブジェクト。

**Validation Rules**:

- 個人を直接特定できる情報を保存しない。
- 保存内容が欠損または破損している場合は破棄し、新規セッションとして開始する。
