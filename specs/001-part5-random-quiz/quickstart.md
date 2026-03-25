# Quickstart: TOEIC Part 5 Random Quiz

## Prerequisites

- Docker
- Docker Compose

## Local Development

1. リポジトリのルートでコンテナを起動する。

```bash
docker compose up --build
```

2. ブラウザで `http://localhost:8080` を開く。

3. 以下を確認する。

- 初回表示で 1 問分の問題文と 4 つの選択肢が表示される。
- 選択肢を選んで解答すると、その場で正誤、正答、解説が表示される。
- 次の問題へ進むと、新しい問題が表示される。
- モバイル表示幅でも横スクロールなしで主要操作が行える。

## Deployment Shape

- Cloudflare Pages には `app/` 配下の静的ファイルを配置対象とする。
- サーバーサイド処理は前提としない。
- 永続化が必要になった場合も、初期方針はブラウザ localStorage のみに限定する。

## Validation Notes

- 問題データは表示前に必須項目を検証する。
- 問題取得失敗時は再試行可能なエラー状態を表示する。
- 同一問題の二重送信が起きないことを確認する。
