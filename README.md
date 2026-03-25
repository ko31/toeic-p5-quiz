# TOEIC Part 5 Quiz

TOEIC Part 5 形式の練習問題を、ブラウザで 1 問ずつランダムに解ける静的 Web アプリです。  
トップ画面から練習を開始し、選択肢を選んで解答すると、その場で正誤、正答、問題文の日本語訳、解説を表示し、次の問題へ進んで反復練習できます。

## 特徴

- ブラウザで動作するアプリ
- 開始前は最小限のトップ画面、開始後は問題に集中できる練習画面
- TOEIC Part 5 形式の 4 択問題をランダム出題
- 解答後に即時で正誤、正答、日本語訳、解説を表示
- 練習中に正答率と経過時間を表示
- 現在の登録問題数: 1000問
- 問題文は 1000 問すべて重複なし

## ローカル起動

前提:

- Docker
- Docker Compose

起動:

```bash
docker compose up --build
```

ブラウザで `http://localhost:8080` を開いて確認します。

停止:

```bash
docker compose down
```

一時的に Docker を使わず確認したい場合は、簡易サーバーでも起動できます。

```bash
python3 -m http.server 8123 --directory app
```

この場合は `http://localhost:8123` を開きます。
