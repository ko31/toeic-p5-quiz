# Research: TOEIC Part 5 Random Quiz

## Decision 1: Cloudflare Pages に適した静的アプリ構成を採用する

- **Decision**: デプロイ成果物は HTML、CSS、JavaScript、JSON データのみで構成する。
- **Rationale**: Cloudflare Pages は静的ファイル配信との相性が良く、サーバーを持たない構成なら運用が単純で、MVP の速度と保守性に合う。
- **Alternatives considered**:
  - SPA フレームワーク導入: UI 構築は速くなる可能性があるが、依存追加とビルド工程が増え、今回の MVP には過剰。
  - Cloudflare Functions 併用: 将来的な拡張余地はあるが、現時点の単一ユーザー練習機能には不要。

## Decision 2: ローカル開発は Docker ベースの静的サーバー確認とする

- **Decision**: ローカルでは Docker コンテナ上の静的 Web サーバーで `app/` を配信し、ブラウザ確認を行う。
- **Rationale**: 開発者環境差分を減らし、Cloudflare Pages に近い静的配信確認を簡単に再現できる。
- **Alternatives considered**:
  - `python -m http.server` などローカルコマンドのみ: 軽量だが、開発環境依存が増える。
  - Node ベースの開発サーバー: 柔軟だが、依存追加と管理対象が増える。

## Decision 3: フロントエンドは Vanilla JavaScript を採用する

- **Decision**: UI 制御はモジュール分割した素の JavaScript で実装する。
- **Rationale**: 問題表示、解答判定、状態遷移の範囲であれば十分に表現でき、学習コストと構成複雑性を抑えられる。
- **Alternatives considered**:
  - React/Vue などの導入: 状態管理はしやすいが、ビルド、依存、運用負荷が増える。
  - 1 ファイルに全ロジックを集約: 初期は速いが、問題データ、状態管理、UI 更新が密結合になり保守しづらい。

## Decision 4: 問題データは静的 JSON と表示前バリデーションで扱う

- **Decision**: 問題セットは JSON で保持し、アプリ起動時または読込時に必須項目と整合性を検証する。
- **Rationale**: 問題内容の追加・修正を UI ロジックから分離でき、誤答判定や解説欠落を早期に検出できる。
- **Alternatives considered**:
  - HTML へ直書き: 小規模でも更新性が悪く、ランダム出題との相性が悪い。
  - JavaScript オブジェクトへ埋め込み: 実装は簡単だが、データとロジックの分離が弱くなる。

## Decision 5: 永続化は必要時のみ localStorage に限定する

- **Decision**: MVP では永続化を必須にせず、設定や軽量な進捗を保持する必要が生じた場合のみ localStorage を使う。
- **Rationale**: 憲章の「小さな単位でのMVP反復」に沿い、個人情報やサーバー保存を避けつつ最小コストで継続性を持たせられる。
- **Alternatives considered**:
  - 常時 localStorage 保存: 初期段階では不要な状態設計が増える。
  - IndexedDB: 拡張性はあるが、今回の要件に対して実装コストが高い。

## Decision 6: UI はモバイルファーストで 1 画面 1 目的を保つ

- **Decision**: 画面は「問題表示」「回答」「即時フィードバック」「次へ進む」を同一フローに収め、補助情報は過剰に増やさない。
- **Rationale**: TOEIC Part 5 の反復学習では、操作数と認知負荷の少なさが継続利用に直結する。
- **Alternatives considered**:
  - 複数パネルの高機能画面: 情報量は増やせるが、モバイルでの可読性と直感性を損なう。
  - 結果を別画面へ遷移表示: 即時反映が弱くなり、練習テンポが落ちる。
