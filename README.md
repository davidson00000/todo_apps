# ToDoアプリ — Vercelデプロイ手順

Mac/iPhoneで同じデータを使えるToDoアプリ。Vercel KVでサーバ側にデータを保存します。

## 構成

- 静的HTML + JSX（React 18 via CDN, Babel inline）
- `/api/state` — GET/POSTのエンドポイント（Vercel KV）
- 簡易認証：URL `?key=<APP_KEY>` に一致するときのみ読み書き可
- 初回ロードでKVから取得 → 変更時1秒debounceでKVに保存
- オフライン時は localStorage にフォールバック
- **マルチプロジェクト対応**：複数プロジェクトを切替・作成・削除可能
- **フルCRUD**：タスク追加・編集・削除・サブタスク・依存関係・マイルストーン
- **ガントのドラッグ操作**：Macではマウス、iPhoneではタッチでバー移動・両端リサイズ

## ファイル

| ファイル | 役割 |
|---|---|
| `index.html` | 本番アプリ（Mac/iPhone両対応、レスポンシブ） |
| `ToDoアプリ.html` | デザイン比較用キャンバス（Mac+iPhone並列表示） |
| `api/state.js` | Vercelサーバレス関数（GET/POST + KVアクセス） |
| `sync.js` | フロントの同期クライアント |
| `data.js` | 初期データ・ユーティリティ |
| `editor.jsx` | プロジェクト切替・タスク編集モーダル・確認ダイアログ |
| `app-real.jsx` | デスクトップ版アプリ |
| `iphone-app.jsx` | iPhone/モバイル版アプリ |
| `app-*.jsx`, `ios-frame.jsx` | （旧）デザイン比較用コンポーネント |
| `vercel.json` | Vercel設定 |
| `package.json` | Node version指定 |

---

## デプロイ手順

### 1. プロジェクトをダウンロード
このプロジェクト全体をZIPで書き出し、Macに展開。

### 2. GitHubに新リポジトリを作成
```sh
cd <展開したフォルダ>
git init
git add .
git commit -m "initial"
gh repo create todo-app --private --source=. --push
# または GitHub web で空リポジトリを作って remote add → push
```

### 3. Vercelにインポート
1. <https://vercel.com> にログイン
2. **Add New → Project** → GitHubリポジトリを選択
3. **Framework Preset: Other**（自動検出されるはず）
4. **Build Command**: 空欄でOK
5. **Output Directory**: 空欄でOK
6. **Deploy** をクリック（一度デプロイされる。この時点ではKVがまだなのでエラー）

### 4. Vercel KVを作成・接続
1. プロジェクトページ → **Storage** タブ
2. **Create Database → KV** をクリック
3. 名前を入力（例: `todo-kv`） → **Create**
4. **Connect to Project** で先ほどのプロジェクトを選択
5. これで `KV_REST_API_URL`, `KV_REST_API_TOKEN` 等の環境変数が自動追加される

### 5. APP_KEYを設定
1. プロジェクトページ → **Settings → Environment Variables**
2. 追加：
   - **Key**: `APP_KEY`
   - **Value**: 好きな秘密文字列（例: `mySecret_2026!`）
   - **Environments**: Production, Preview, Development 全て
3. **Save**

### 6. 再デプロイ
**Deployments** タブ → 最新デプロイの`···`メニュー → **Redeploy**

### 7. アクセス
- URL: `https://<your-app>.vercel.app/?key=mySecret_2026!`
- 初回起動時は空のプロジェクト「マイプロジェクト」が作成される
- 上部のプロジェクト名をクリック → 切替・新規作成・名前変更・削除
- 「+ タスク追加」「+ マイルストーン」で要素を追加
- タスクをクリックで編集モーダル
- 変更すると右上に「保存中…」→「同期済み」と表示

### 8. iPhone Safariで「ホーム画面に追加」
1. SafariでURLを開く（keyパラメータ付き）
2. 共有ボタン → **ホーム画面に追加**
3. 名前を「ToDo」などに → 追加
4. アイコンタップでフルスクリーンアプリとして起動

---

## 動作確認

- 右上の **同期ピル** で状態確認
  - 🟢 同期済み — KVに保存完了
  - 🟡 保存中… — debounce中 or POST中
  - 🔴 オフライン — KV接続失敗（localStorageに保存）
  - ⚪ キーなし — `?key=` がURLにない

## トラブルシュート

| 症状 | 原因 | 対処 |
|---|---|---|
| 401 invalid key | URLの`?key=`が間違い | APP_KEYと一致確認 |
| 500 KV not configured | KV接続忘れ | Storage → Connect to Project |
| 500 APP_KEY not configured | 環境変数忘れ | Settings → Env Vars に追加して再デプロイ |
| データが消えた | KVキー違いやリセット | KVダッシュボードで `todoapp:state:v1` を確認 |

## カスタマイズ

- 初期データ変更：`data.js` の `SAMPLE_TASKS` を編集（KVが空のとき使われる）
- ストレージキー変更：`api/state.js` の `STORE_KEY` 定数を編集
- 同期間隔：`sync.js` の `delay: 1000` を編集（ms）

## セキュリティに関する注意

これは**個人専用の最小構成**です：
- 認証はURL内のトークン1つだけ（HTTPSなのでネットワーク経由では暗号化される）
- URLが第三者に漏れると読み書きされる
- 重要なデータ（パスワード等）は保存しない
- 強化したい場合：パスワード認証 + JWT、または Auth0 / Clerk への移行を検討
