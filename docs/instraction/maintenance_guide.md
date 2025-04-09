# キーワード自動提案Webアプリ - メンテナンスガイド

## 概要
このドキュメントでは、キーワード自動提案Webアプリケーションのメンテナンス方法について説明します。
システム管理者やデベロッパーがアプリケーションを維持・更新するための手順を記載しています。

## システム構成

### フロントエンド
- フレームワーク: React + Vite
- スタイリング: Tailwind CSS
- 状態管理: React Context API
- ルーティング: React Router
- デプロイ先: Netlify

### バックエンド
- サーバー: Express.js
- デプロイ先: Netlify Functions
- データベース: Supabase (PostgreSQL)
- 認証: NextAuth.js
- AIサービス: OpenAI API (GPT-4)

## 定期メンテナンス作業

### 週次メンテナンス
1. ログファイルの確認
   - バックエンドログを確認し、エラーや警告がないか確認
   - Netlifyのデプロイログを確認

2. バックアップの確認
   - Supabaseのバックアップが正常に実行されているか確認

### 月次メンテナンス
1. セキュリティアップデート
   - npm パッケージの更新: `npm audit` を実行し、脆弱性がないか確認
   - 必要に応じて `npm update` を実行

2. パフォーマンス確認
   - アプリケーションの応答時間を確認
   - データベースのクエリパフォーマンスを確認

3. ストレージ使用量の確認
   - Supabaseのストレージ使用量を確認
   - 必要に応じてデータのクリーンアップを実行

## データベースメンテナンス

### バックアップと復元
Supabaseでは自動バックアップが設定されていますが、手動バックアップも定期的に実行することをお勧めします。

#### 手動バックアップの実行
1. Supabaseダッシュボードにログイン
2. 「Project Settings」→「Database」を選択
3. 「Backups」タブを選択
4. 「Create Backup」をクリック

#### バックアップからの復元
1. Supabaseダッシュボードにログイン
2. 「Project Settings」→「Database」を選択
3. 「Backups」タブを選択
4. 復元したいバックアップを選択し、「Restore」をクリック

### データベースの最適化
1. インデックスの確認と最適化
   ```sql
   -- テーブルのインデックス情報を確認
   SELECT * FROM pg_indexes WHERE tablename = 'facilities';
   
   -- 必要に応じてインデックスを追加
   CREATE INDEX idx_facility_name ON facilities(facility_name);
   ```

2. 不要なデータのクリーンアップ
   ```sql
   -- 長期間更新されていない一時データを削除
   DELETE FROM temp_keywords WHERE updated_at < NOW() - INTERVAL '30 days';
   ```

## アプリケーションの更新

### フロントエンドの更新
1. ローカル環境で変更を行う
   ```bash
   cd /path/to/keyword-suggestion-app/frontend
   # コードを編集
   npm run dev # 開発サーバーで確認
   ```

2. ビルドとテスト
   ```bash
   npm run build
   # ビルド結果を確認
   ```

3. 変更をリポジトリにコミット
   ```bash
   git add .
   git commit -m "フロントエンドの更新: 変更内容の説明"
   git push
   ```

4. Netlifyが自動的にデプロイを実行

### バックエンドの更新
1. ローカル環境で変更を行う
   ```bash
   cd /path/to/keyword-suggestion-app/backend
   # コードを編集
   npm run dev # 開発サーバーで確認
   ```

2. テスト
   ```bash
   npm test
   ```

3. 変更をリポジトリにコミット
   ```bash
   git add .
   git commit -m "バックエンドの更新: 変更内容の説明"
   git push
   ```

4. Netlifyが自動的にFunctionsをデプロイ

## 環境変数の管理

### 環境変数の更新
1. Netlifyダッシュボードにログイン
2. プロジェクトを選択
3. 「Site settings」→「Environment variables」を選択
4. 環境変数を追加または編集

主要な環境変数:
- `SUPABASE_URL`: SupabaseプロジェクトのURL
- `SUPABASE_ANON_KEY`: SupabaseのAnonymous Key
- `SUPABASE_SERVICE_KEY`: SupabaseのService Role Key
- `NEXTAUTH_URL`: デプロイされたサイトのURL
- `NEXTAUTH_SECRET`: NextAuthの秘密鍵
- `OPENAI_API_KEY`: OpenAI APIキー

## トラブルシューティング

### 一般的な問題と解決策

#### アプリケーションが起動しない
1. 環境変数が正しく設定されているか確認
2. Netlifyのデプロイログでエラーを確認
3. ローカル環境で再現し、詳細なエラーメッセージを確認

#### APIエラー
1. バックエンドログを確認
2. APIエンドポイントが正しく設定されているか確認
3. Supabase接続が正常か確認

#### データベース接続エラー
1. Supabaseのステータスを確認
2. 接続文字列と認証情報が正しいか確認
3. ネットワーク設定を確認

#### キーワード生成が機能しない
1. OpenAI APIキーが有効か確認
2. APIの使用量制限に達していないか確認
3. リクエスト/レスポンスのログを確認

### ログの確認方法
1. Netlifyダッシュボードでデプロイログを確認
2. バックエンドログは `/backend/logs` ディレクトリに保存されています
3. 本番環境のログは Netlify Functions のログで確認できます

## パフォーマンス最適化

### フロントエンド最適化
1. コード分割の実装
2. 画像の最適化
3. キャッシュ戦略の改善

### バックエンド最適化
1. データベースクエリの最適化
2. APIレスポンスのキャッシュ
3. バッチ処理の実装

## セキュリティ管理

### 定期的なセキュリティチェック
1. npm の脆弱性スキャン: `npm audit`
2. 依存関係の更新: `npm update`
3. 環境変数の安全な管理の確認

### アクセス管理
1. Supabaseのアクセス権限の確認
2. API キーのローテーション
3. ユーザー権限の定期的な見直し

## サポート連絡先

技術的な問題やサポートが必要な場合は、以下の連絡先までお問い合わせください:
- メール: tech-support@example.com
- 緊急連絡先: 03-1234-5678
