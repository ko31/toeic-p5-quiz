# Implementation Plan: TOEIC Part 5 Random Quiz

**Branch**: `001-part5-random-quiz` | **Date**: 2026-03-25 | **Spec**: [/Users/ko/Documents/work/github/toeic-p5-quiz/specs/001-part5-random-quiz/spec.md](/Users/ko/Documents/work/github/toeic-p5-quiz/specs/001-part5-random-quiz/spec.md)
**Input**: Feature specification from `/specs/001-part5-random-quiz/spec.md`

## Summary

Cloudflare Pages で配信可能な静的 Web アプリとして、TOEIC Part 5 形式の問題を
ランダム出題し、回答直後に正誤、完成済みの日本語訳、解説を即時表示する。
開始前は最小限のトップ画面を出し、練習中は問題と選択肢に集中できる構成にする。初回リリースでは
HTML/CSS/JavaScript のみで実装し、ローカル開発は Docker で静的配信を確認する。
永続化が必要な範囲はローカルストレージに限定し、MVP では個人情報を扱わない。

## Technical Context

**Language/Version**: HTML5, CSS3, JavaScript (ES2023)  
**Primary Dependencies**: 依存ライブラリなしの Vanilla JavaScript、Docker、静的 Web サーバー  
**Storage**: 既定は永続化なし、必要時のみ browser localStorage  
**Testing**: ブラウザでの手動受け入れ確認、表示幅別 UI 確認、問題データ整合確認  
**Target Platform**: Cloudflare Pages で配信されるモダンブラウザ、ローカル Docker 開発環境  
**Project Type**: 静的 Web アプリ  
**Performance Goals**: 初回表示 2 秒以内、解答後の正誤と解説表示 1 秒以内、主要操作で体感遅延なし  
**Constraints**: サーバーサイド処理なし、Cloudflare Pages 配置可能な静的ファイル構成、モバイル最適化、単一ユーザー利用、複雑なビルド工程を持ち込まない  
**Scale/Scope**: 単一機能の学習アプリ、1000 問の一意な問題群を用意し、1 セッションあたり連続数十問の反復練習を想定

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Simplicity: 主操作は「選択肢を選んで解答する」に限定する。ランキング、認証、カテゴリ絞り込み、詳細分析、共有機能は初回スコープから除外する。
- Immediate Feedback: 解答ボタン押下直後に入力受付状態を画面で示し、同一画面内で正誤、正答、日本語訳、解説、次へ進む操作を表示する。読み込み失敗時は空白ではなく再試行導線を出す。
- MVP Iteration: 最小価値は 1 問表示、4 択解答、即時フィードバック、次問遷移、モバイル表示対応で成立する。履歴保存や分析は後続反復に延期する。
- Learning Quality: 問題データは prompt、choices、correctChoice、explanation、translationJa を必須項目とし、表示前に整合検証する。受け入れ確認では正誤判定、日本語訳表示、解説表示、重複回答防止、次問遷移を検証する。
- Security & Maintainability: 個人情報は扱わない。入力は選択肢 ID と画面操作に限定し、localStorage を使う場合も非機密の軽量データだけを保存する。依存ライブラリは追加しない。

## Project Structure

### Documentation (this feature)

```text
specs/001-part5-random-quiz/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── practice-ui-contract.md
└── tasks.md
```

### Source Code (repository root)

```text
app/
├── index.html
├── styles/
│   └── main.css
├── scripts/
│   ├── app.js
│   ├── question-store.js
│   ├── session-state.js
│   └── ui-renderer.js
└── data/
    └── questions.json

docker/
└── nginx.conf

tests/
└── manual/
    └── practice-checklist.md

Dockerfile
docker-compose.yml
```

**Structure Decision**: Cloudflare Pages へそのまま配置できる静的ファイル中心の単一プロジェクト構成を採用する。`app/` をデプロイ対象にし、ローカルでは `Dockerfile` と `docker-compose.yml` で静的配信環境を再現する。JavaScript は責務ごとに分割しつつ、ビルド不要で保守できる範囲に留める。

## Complexity Tracking

現時点で憲章違反のための例外申請は不要。
