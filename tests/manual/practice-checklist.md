# Practice Checklist

## User Story 1

- [x] 初回表示で 1 問分の問題文と 4 つの選択肢が表示される
- [x] 問題データに `prompt`、4 件の `choices`、`correctChoiceId`、`explanation` がそろっている
- [x] 選択肢を 1 つ選んで解答すると、その場で正誤、正答、解説が表示される
- [x] 解答後に同じ問題を再送信できない

## User Story 2

- [x] 解説表示後に次の問題へ進める
- [x] 次の問題では前問の選択状態とフィードバックがリセットされる
- [x] 同一セッションで不自然な連続重複出題が起きない

## User Story 3

- [ ] モバイル表示幅で横スクロールなしに主要操作を完了できる
- [ ] 選択肢と次へ進む操作がタップしやすいサイズで表示される
- [ ] モバイルで正誤、解説、エラー状態が読みやすい順序で表示される

## Cross-Cutting

- [x] 問題データ読み込み失敗時に再試行可能なエラー表示が出る
- [x] localStorage に個人情報や機密情報を保存していない

## Notes

- `node --check` で `app/scripts/*.js` の構文確認を実施。
- `python3 -m json.tool app/data/questions.json` で問題 JSON の構文確認を実施。
- Node 実行で出題、解答、即時フィードバック、次問遷移、状態リセットを確認。
- `curl -I` で `/` と `/data/questions.json` の HTTP 200 を確認。
- User Story 3 の視覚確認は、実ブラウザまたはヘッドレスブラウザがないため未実施。
