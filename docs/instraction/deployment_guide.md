# キーワード自動提案Webアプリ - デプロイガイド

## 概要
このドキュメントでは、キーワード自動提案Webアプリケーションをデプロイするための手順を説明します。
アプリケーションはNetlifyにデプロイされ、フロントエンドとバックエンド（Netlify Functions）の両方が含まれています。

## 前提条件
- Netlifyアカウント
- GitHubアカウント（ソースコード管理用）
- Supabaseプロジェクト（データベース用）
- OpenAI API キー（キーワード生成用）

## デプロイ手順

### 1. リポジトリの準備
1. GitHubにリポジトリを作成
2. プロジェクトをリポジトリにプッシュ
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <リポジトリURL>
   git push -u origin main
   ```

### 2. Netlifyでの設定
1. Netlifyにログイン
2. 「New site from Git」をクリック
3. GitHubを選択し、リポジトリを選択
4. ビルド設定を確認（netlify.tomlから自動的に読み込まれます）
5. 環境変数を設定：
   - `SUPABASE_URL`: SupabaseプロジェクトのURL
   - `SUPABASE_ANON_KEY`: SupabaseのAnonymous Key
   - `SUPABASE_SERVICE_KEY`: SupabaseのService Role Key
   - `NEXTAUTH_URL`: デプロイされたサイトのURL
   - `NEXTAUTH_SECRET`: NextAuthの秘密鍵
   - `OPENAI_API_KEY`: OpenAI APIキー
   - `NODE_ENV`: production
   - `NEXT_TRUSTHOST`: true
6. 「Deploy site」をクリック

### 3. デプロイ後の確認
1. デプロイが完了したら、提供されたURLにアクセス
2. ログイン機能が正常に動作することを確認
3. 施設情報の登録、キーワード生成、CSV出力などの機能をテスト

### 4. カスタムドメインの設定（オプション）
1. Netlifyダッシュボードで「Domain settings」を選択
2. 「Add custom domain」をクリック
3. ドメイン名を入力し、指示に従ってDNS設定を行う

### 5. 継続的デプロイ
- GitHubリポジトリに変更をプッシュすると、自動的にNetlifyでビルドとデプロイが行われます
- ビルドの進行状況はNetlifyダッシュボードで確認できます

## トラブルシューティング

### ビルドエラー
- Netlifyのビルドログを確認
- 依存関係が正しくインストールされているか確認
- 環境変数が正しく設定されているか確認

### API接続エラー
- Netlify Functionsが正しくデプロイされているか確認
- ブラウザの開発者ツールでネットワークリクエストを確認
- CORSの設定が正しいか確認

### データベース接続エラー
- Supabaseの接続情報が正しいか確認
- Supabaseプロジェクトが稼働中か確認
- RLSポリシーが適切に設定されているか確認

## メンテナンス

### 更新の適用
1. ローカル環境で変更を行う
2. テストを実行して問題がないことを確認
3. 変更をGitHubリポジトリにプッシュ
4. Netlifyで自動的にビルドとデプロイが行われる

### バックアップ
- Supabaseのデータは定期的にバックアップすることを推奨
- GitHubリポジトリはソースコードのバックアップとして機能

### モニタリング
- Netlifyのアナリティクスでサイトのパフォーマンスを監視
- Supabaseのダッシュボードでデータベースの使用状況を監視
