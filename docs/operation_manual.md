# キーワード自動提案Webアプリ 運用マニュアル

## 目次

1. [システム概要](#システム概要)
2. [システム構成](#システム構成)
3. [環境設定](#環境設定)
4. [デプロイメント](#デプロイメント)
5. [バックアップと復元](#バックアップと復元)
6. [監視とアラート](#監視とアラート)
7. [トラブルシューティング](#トラブルシューティング)
8. [セキュリティ対策](#セキュリティ対策)
9. [定期メンテナンス](#定期メンテナンス)
10. [スケーリング](#スケーリング)

## システム概要

キーワード自動提案Webアプリは、施設情報を入力することで、SEO/MEO向けのキーワードを自動生成するツールです。AIを活用して、メニュー・サービス、環境・設備、おすすめの利用シーンの3つのカテゴリに分けてキーワードを提案します。

## システム構成

### フロントエンド
- React + Vite.js
- Tailwind CSS
- TypeScript
- React Router
- 認証: NextAuth.js

### バックエンド
- Node.js + Express
- Netlify Functions (サーバーレス)
- API: RESTful

### データベース
- Supabase (PostgreSQL)

### AI機能
- OpenAI GPT-4
- Firecrawl (Webクローリング)
- LangChain/Auto-GPT

### インフラストラクチャ
- Netlify (フロントエンドホスティング)
- Netlify Functions (バックエンドホスティング)
- Supabase (データベースホスティング)

## 環境設定

### 必要な環境変数

#### フロントエンド (.env.production)
```
VITE_API_URL=https://api.keyword-suggestion-app.com/api
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

#### バックエンド (.env)
```
NODE_ENV=production
PORT=3000
JWT_SECRET=your-jwt-secret
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-key
OPENAI_API_KEY=your-openai-api-key
FIRECRAWL_API_KEY=your-firecrawl-api-key
```

### 環境変数の設定方法

1. Netlifyダッシュボードにログインします。
2. プロジェクトを選択します。
3. 「Site settings」→「Build & deploy」→「Environment」を選択します。
4. 「Environment variables」セクションで必要な環境変数を追加します。

## デプロイメント

### 前提条件
- Node.js v18以上
- npm v8以上
- Netlifyアカウント
- Supabaseアカウント

### デプロイ手順

#### 手動デプロイ
1. リポジトリをクローンします。
   ```
   git clone https://github.com/your-org/keyword-suggestion-app.git
   cd keyword-suggestion-app
   ```

2. 依存関係をインストールします。
   ```
   npm install
   ```

3. ビルドを実行します。
   ```
   npm run build
   ```

4. Netlifyにデプロイします。
   ```
   npx netlify deploy --prod
   ```

#### CI/CDパイプライン
GitHub Actionsを使用した自動デプロイが設定されています。

1. mainブランチにプッシュすると、自動的にビルドとデプロイが実行されます。
2. `.github/workflows/ci.yml`ファイルにCI/CDの設定が記述されています。

## バックアップと復元

### データベースバックアップ

#### 自動バックアップ
Supabaseは自動的に日次バックアップを作成します。

#### 手動バックアップ
1. Supabaseダッシュボードにログインします。
2. プロジェクトを選択します。
3. 「Database」→「Backups」を選択します。
4. 「Create backup」ボタンをクリックします。

### バックアップの復元
1. Supabaseダッシュボードにログインします。
2. プロジェクトを選択します。
3. 「Database」→「Backups」を選択します。
4. 復元したいバックアップを選択し、「Restore」ボタンをクリックします。

## 監視とアラート

### パフォーマンス監視
- Netlify Analyticsを使用してフロントエンドのパフォーマンスを監視
- Supabase Metricsを使用してデータベースのパフォーマンスを監視

### エラー監視
- Sentry.ioを使用してフロントエンドとバックエンドのエラーを監視

### アラート設定
1. Sentryダッシュボードにログインします。
2. プロジェクトを選択します。
3. 「Alerts」→「Rules」を選択します。
4. 「Create Alert Rule」ボタンをクリックします。
5. アラートの条件と通知先を設定します。

## トラブルシューティング

### 一般的な問題と解決策

#### APIエラー
- ログを確認: `netlify functions:logs`
- 環境変数が正しく設定されているか確認
- APIレート制限に達していないか確認

#### データベース接続エラー
- Supabaseのステータスページを確認
- データベース接続文字列が正しいか確認
- ファイアウォール設定を確認

#### AI生成エラー
- OpenAI APIキーが有効か確認
- APIレート制限に達していないか確認
- ログを確認して詳細なエラーメッセージを確認

### ログの確認方法
1. Netlifyダッシュボードにログインします。
2. プロジェクトを選択します。
3. 「Functions」→「Logs」を選択します。

## セキュリティ対策

### 実装されているセキュリティ対策
- HTTPS通信
- JWTによる認証
- CSRFトークン検証
- レート制限
- 入力バリデーション
- セキュアなHTTPヘッダー

### セキュリティアップデート
1. 定期的に依存関係を更新します。
   ```
   npm audit
   npm update
   ```

2. セキュリティの脆弱性が見つかった場合は、すぐに対応します。
   ```
   npm audit fix
   ```

## 定期メンテナンス

### 週次タスク
- ログの確認と分析
- パフォーマンスメトリクスの確認
- エラーレポートの確認

### 月次タスク
- 依存関係の更新
- セキュリティ監査の実施
- バックアップの検証

### 四半期タスク
- システム全体のパフォーマンスレビュー
- スケーリング要件の評価
- 新機能の計画

## スケーリング

### 水平スケーリング
- Netlify Functions: 自動的にスケールします。
- Supabase: プランのアップグレードでリソースを増やせます。

### 垂直スケーリング
- Supabaseプランのアップグレード
- データベースのパフォーマンスチューニング

### スケーリングの監視
1. Netlifyダッシュボードでファンクション呼び出し数を監視
2. Supabaseダッシュボードでデータベース使用量を監視
3. 閾値を超えた場合はアラートを設定
