# TOEIC パート5 問題生成仕様

## 概要

TOEICパート5（短文穴埋め問題）の本番レベルの練習問題を1000件、AIエージェントを用いてバッチ処理で生成するための指示書です。  
本仕様の最重要要件は、単語差し替えだけの類題を量産しないことです。語彙だけでなく、構文テンプレート、選択肢パターン、固有名詞の再利用も制御してください。  
ただし、ここでいう「テンプレート管理」は生成後の類似検査のための内部識別であり、固定テンプレート文を埋めて量産する方式は禁止します。

---

## 1. システムプロンプト（エージェントの役割定義）

```text
あなたはTOEIC試験の問題作成専門家です。
パート5（短文穴埋め問題）の本番レベルの問題を作成してください。

同じ単語を避けるだけでは不十分です。以下も同時に守ってください。
- 同じ構文骨格（文型テンプレート）を繰り返さない
- 同じ選択肢パターンを繰り返さない
- 同じ固有名詞（人名・会社名・拠点名・製品名）を短い間隔で再利用しない
- 会社名や地名だけを差し替えた類題を作らない
- 固定テンプレートに単語を差し替えて量産しない
- 問題文は毎回その場で新規に作成する

【公開出力形式】以下のJSON形式で厳密に出力すること：
{
  "id": "q0001",
  "category": "noun",
  "difficulty": "hard",
  "prompt": "The manager's _____ of the new policy surprised the staff.",
  "choices": [
    { "id": "A", "label": "approve" },
    { "id": "B", "label": "approval" },
    { "id": "C", "label": "approved" },
    { "id": "D", "label": "approving" }
  ],
  "correctChoiceId": "B",
  "explanation": "文の主語には名詞が必要なので approval が適切です。",
  "translationJa": "新しい方針に対するマネージャーの承認はスタッフを驚かせた。"
}

【生成中の内部管理メタデータ】公開JSONとは別に、各問題ごとに以下を必ず管理すること：
{
  "templateKey": "possessive_noun_subject_surprised_object",
  "choicePattern": "verb/noun/participle/gerund",
  "entitySlots": {
    "personName": null,
    "companyName": null,
    "officeLocation": null,
    "productName": null
  }
}
```

---

## 2. 問題カテゴリと配分

1000件を以下の比率で分散させること：

| カテゴリ（`category` 値） | 内容 | 割合 | 件数 |
|---|---|---|---|
| `noun` | 名詞 | 10% | 100件 |
| `verb` | 動詞の形（時制・態・to不定詞/動名詞） | 20% | 200件 |
| `adjective` | 形容詞 | 10% | 100件 |
| `adverb` | 副詞 | 10% | 100件 |
| `preposition` | 前置詞 | 10% | 100件 |
| `conjunction` | 接続詞 | 5% | 50件 |
| `vocabulary` | 語彙問題（同義語・コロケーション） | 20% | 200件 |
| `pronoun` | 代名詞・関係詞 | 10% | 100件 |
| `other` | その他（比較・数量表現など） | 5% | 50件 |

カテゴリ内でも出題パターンを偏らせないこと。特に `adverb`、`verb`、`vocabulary` は単一テンプレートの量産を禁止する。  
この指定は「生成後に似た構文が集まらないようにする」ためのものであり、事前に固定テンプレート群を定義して回すことを意味しない。

---

## 3. バッチ生成の指示文

```text
以下の条件で、TOEICパート5の問題を20件生成してください。

【条件】
- カテゴリ（category）：[対象カテゴリ名（英語）] のみ
- 難易度（difficulty）："easy" / "medium" / "hard" の3値を使用。比率は easy:5件・medium:10件・hard:5件
- ビジネスシーン（会議/メール/契約/人事/経理など）を題材にすること
- 4択すべてに意味のある「ひっかけ」を含めること
- 同じ語彙・表現・構文骨格・固有名詞スロット構成を繰り返さないこと
- 問題文は都度AIが新規生成し、固定文面の穴埋め差し替えをしないこと
- 前回までの使用済み情報として以下を参照すること
  - 使用済み語彙リスト
  - 使用済み templateKey 一覧
  - choicePattern 出現統計
  - 使用済み固有名詞リスト（personName / companyName / officeLocation / productName）
- id は "q" + ゼロ埋め4桁の連番（例：q0021〜q0040）
- 出力は公開JSONの配列形式のみ。説明文・前置き不要

【重複抑制ルール】
- 直近100問で同一 templateKey を再利用しない
- 同一 category 内で同一 choicePattern の総出現率を 15% 以下に抑える
- 直近200問で同一 personName を再利用しない
- 直近150問で同一 companyName + officeLocation の組み合わせを再利用しない
- 会社名・人名・地名だけを差し替えた問題文を新規問題として扱わない

バッチ番号：[N]/50（全50バッチで1000件生成）
```

---

## 4. 実装ワークフロー

```text
[エージェントへの全体指示]

1. 初期化フェーズ
   - カテゴリ別の件数計画を作成
   - 使用済み語彙リストを初期化
   - 使用済み templateKey 一覧を初期化
   - choicePattern 集計表を初期化
   - 固有名詞台帳（personName / companyName / officeLocation / productName）を初期化

2. ループフェーズ（50回 × 20件）
   - バッチごとにカテゴリ・難易度を指定
   - 生成時に各問題をその場で新規作成し、生成後に templateKey / choicePattern / entitySlots を内部付与
   - 生成 → JSON検証 → 重複検査 → 偏り検査 → 保存
   - 検査失敗時は該当問題のみ再生成

3. 統合フェーズ
   - 全バッチをマージしIDを振り直し
   - カテゴリ・難易度の分布を確認
   - templateKey と choicePattern の偏りを確認
   - 固有名詞再利用の閾値違反がないか確認
   - 最終的に公開JSON形式で出力
```

---

## 5. 品質チェック指示

```text
各問題について以下を自己チェックしてから出力すること：

□ 正答は文法的に明確に正しいか
□ 不正解の3択は「それっぽいが明確に誤り」か
□ ビジネス英語として自然な文か
□ TOEICの難易度・語彙レベルに合致しているか
□ 日本語訳は直訳でなく自然な日本語か
□ 選択肢4件にラベル重複がないか
□ 不自然な派生語や辞書性の低い語を混ぜていないか
□ 会社名・人名・地名だけを差し替えた類題になっていないか
□ 直近の問題と templateKey が重複していないか
□ 同一 category 内で choicePattern が偏りすぎていないか
```

---

## 6. 出力フィールド一覧

### 公開JSON

| フィールド名 | 型 | 内容 |
|---|---|---|
| `id` | string | 問題ID（例：`q0001`）。"q" + ゼロ埋め4桁の連番 |
| `category` | string | 問題カテゴリ（英語）。`noun` / `verb` / `adjective` / `adverb` / `preposition` / `conjunction` / `vocabulary` / `pronoun` / `other` |
| `difficulty` | string | 難易度。`easy` / `medium` / `hard` の3値 |
| `prompt` | string | 問題文（空欄は `_____` で表現） |
| `choices` | array | 選択肢の配列。各要素は `{ "id": "A"〜"D", "label": "選択肢テキスト" }` |
| `correctChoiceId` | string | 正解の選択肢ID（`"A"` / `"B"` / `"C"` / `"D"`） |
| `explanation` | string | 日本語での解説（なぜその選択肢が正解か） |
| `translationJa` | string | 問題文の自然な日本語訳 |

### 生成中の内部管理フィールド

| フィールド名 | 型 | 内容 |
|---|---|---|
| `templateKey` | string | 問題文の構文骨格を表す識別子 |
| `choicePattern` | string | 選択肢構成の識別子 |
| `entitySlots` | object | 固有名詞スロットの記録 |

最終公開JSONには内部管理フィールドを含めないこと。必要であればデバッグ用の別ファイルに保持すること。

---

## 7. 自動検査ルール

```text
生成後に以下の検査を必ず実施すること：

1. JSON妥当性検査
   - パース可能であること
   - 必須フィールドがそろっていること
   - choices が4件であること
   - choice の id と label に重複がないこと

2. 近似重複検査
   - prompt を小文字化・固有名詞除去・記号正規化した比較文字列を作る
   - 正規化後の比較文字列が既存問題と一致する場合は類題として再生成する

3. templateKey 重複検査
   - 直近100問で同一 templateKey が存在したら再生成する

4. choicePattern 偏り検査
   - 同一 category で同一 choicePattern の総出現率が閾値を超えたら再生成する

5. 固有名詞再利用検査
   - personName の短距離再出を禁止する
   - companyName + officeLocation の再利用を禁止する

6. 表現品質検査
   - explanation と translationJa がテンプレート説明文になっていないこと
   - 辞書性の低い不自然語形が不正解選択肢に含まれていないこと
```

---

## 8. 注意事項

- **1度に生成する件数は20件以下**にすること（品質維持のため）
- 重複抑制はプロンプト指示だけでなく、自動検査で強制すること
- JSON形式の厳守：パース失敗時は該当バッチを再生成する
- 難易度は `easy`（600点以下）・`medium`（600〜750点）・`hard`（750点以上）の基準で設定すること
- `choices` の配列順は必ず A → B → C → D の順にすること
- `correctChoiceId` は必ず `choices` 内のいずれかの `id` と一致させること
- `translationJa` に「○○ initiative に関する文脈です」のようなメタ説明を入れないこと
- 固有名詞は現実の企業・個人を直接連想しにくい中立的な架空名を使うこと
- 事前定義した英文テンプレートや選択肢テンプレートを使って量産しないこと
