# 運用マニュアル

## 概要
このドキュメントは、キーワード自動提案Webアプリケーションの運用管理者向けのマニュアルです。システムの設定、監視、メンテナンス、トラブルシューティングについて説明します。

## 目次
1. [システム構成](#システム構成)
2. [環境設定](#環境設定)
3. [デプロイメント](#デプロイメント)
4. [バックアップと復元](#バックアップと復元)
5. [監視とアラート](#監視とアラート)
6. [トラブルシューティング](#トラブルシューティング)
7. [セキュリティ管理](#セキュリティ管理)
8. [パフォーマンスチューニング](#パフォーマンスチューニング)
9. [定期メンテナンス](#定期メンテナンス)
10. [ユーザー管理](#ユーザー管理)

## システム構成

### アーキテクチャ概要
キーワード自動提案Webアプリケーションは以下のコンポーネントで構成されています：

1. **フロントエンド**
   - React + Vite.js
   - Tailwind CSS
   - Netlifyでホスティング

2. **バックエンド**
   - Node.js
   - Express.js
   - Fly.ioでホスティング

3. **データベース**
   - Supabase (PostgreSQL)

4. **AI/外部サービス**
   - Open Router API (GPT-4o)
   - Firecrawl API

### システム要件
- Node.js v18以上
- npm v8以上
- PostgreSQL v14以上

### ネットワーク構成
```
[ユーザー] → [Netlify CDN] → [フロントエンド] → [バックエンドAPI] → [Supabase]
                                                 ↓
                                          [AI/外部サービス]
```

## 環境設定

### 環境変数
アプリケーションは以下の環境変数を使用します：

#### フロントエンド環境変数
```
VITE_API_URL=https://api.keyword-suggestion-app.example.com
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

#### バックエンド環境変数
```
PORT=3000
NODE_ENV=production
JWT_SECRET=your-jwt-secret
CORS_ORIGIN=https://keyword-suggestion-app.example.com
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-key
OPENROUTER_API_KEY=your-openrouter-api-key
FIRECRAWL_API_KEY=your-firecrawl-api-key
```

### 環境変数の設定方法

#### Netlify（フロントエンド）
1. Netlifyダッシュボードにログイン
2. プロジェクトを選択
3. 「Site settings」→「Build & deploy」→「Environment」を選択
4. 「Edit variables」をクリックして環境変数を追加

#### Fly.io（バックエンド）
```bash
fly secrets set JWT_SECRET=your-jwt-secret CORS_ORIGIN=https://keyword-suggestion-app.example.com ...
```

## デプロイメント

### CI/CDパイプライン
アプリケーションはGitHub Actionsを使用して自動デプロイを行います。

#### フロントエンドデプロイ
1. mainブランチにコードがプッシュされると、GitHub Actionsが起動
2. ビルドとテストが実行される
3. テストが成功すると、Netlifyに自動デプロイされる

#### バックエンドデプロイ
1. mainブランチにコードがプッシュされると、GitHub Actionsが起動
2. ビルドとテストが実行される
3. テストが成功すると、Fly.ioに自動デプロイされる

### 手動デプロイ

#### フロントエンド手動デプロイ
```bash
# ビルド
npm run build

# Netlifyへデプロイ
netlify deploy --prod
```

#### バックエンド手動デプロイ
```bash
# Fly.ioへデプロイ
fly deploy
```

## バックアップと復元

### データベースバックアップ
Supabaseのバックアップ機能を使用します。

#### 自動バックアップ
Supabaseは自動的に日次バックアップを作成します。これらのバックアップは7日間保持されます。

#### 手動バックアップ
Supabaseダッシュボードから手動バックアップを作成できます：
1. Supabaseダッシュボードにログイン
2. 「Database」→「Backups」を選択
3. 「Create backup」をクリックして手動バックアップを作成

### バックアップ復元
1. Supabaseダッシュボードにログイン
2. 「Database」→「Backups」を選択
3. 復元したいバックアップの「Restore」ボタンをクリック
4. 確認ダイアログで「Restore」をクリック

## 監視とアラート

### アプリケーション監視
アプリケーションのパフォーマンスと可用性を監視するために以下のツールを使用します：

1. **Netlify Analytics**
   - フロントエンドのトラフィックとパフォーマンスを監視

2. **Fly.io Metrics**
   - バックエンドのリソース使用率とパフォーマンスを監視

3. **Supabase Metrics**
   - データベースのパフォーマンスと使用状況を監視

### ログ監視
アプリケーションログは以下の場所で確認できます：

1. **フロントエンドログ**
   - Netlifyダッシュボードの「Deploys」→「Deploy detail」→「Deploy log」

2. **バックエンドログ**
   - Fly.ioダッシュボードの「Monitoring」→「Logs」
   - または `fly logs` コマンドを使用

3. **アプリケーションログ**
   - アプリケーションは `logs` ディレクトリにログを出力
   - 本番環境では `/var/log/app.log` と `/var/log/error.log` に出力

### アラート設定
重要なイベントが発生した場合にアラートを受け取るための設定：

1. **Netlifyアラート**
   - ビルド失敗時にメール通知
   - デプロイ完了時にSlack通知

2. **Fly.ioアラート**
   - CPU/メモリ使用率が高い場合にメール通知
   - アプリケーションがダウンした場合にSlack通知

## トラブルシューティング

### 一般的な問題と解決策

#### フロントエンドの問題

1. **ビルドエラー**
   - 問題: Netlifyでのビルドが失敗する
   - 解決策:
     - Netlifyのビルドログを確認
     - 依存関係の問題がないか確認
     - ローカルでビルドを試して問題を特定

2. **APIアクセスエラー**
   - 問題: フロントエンドからAPIにアクセスできない
   - 解決策:
     - CORSの設定を確認
     - APIのエンドポイントURLが正しいか確認
     - ネットワーク接続を確認

#### バックエンドの問題

1. **サーバー起動エラー**
   - 問題: バックエンドサーバーが起動しない
   - 解決策:
     - ログを確認
     - 環境変数が正しく設定されているか確認
     - ポートの競合がないか確認

2. **データベース接続エラー**
   - 問題: Supabaseに接続できない
   - 解決策:
     - Supabaseの接続情報を確認
     - Supabaseのステータスページを確認
     - ネットワーク接続を確認

#### AI関連の問題

1. **キーワード生成エラー**
   - 問題: キーワードが生成されない
   - 解決策:
     - APIキーが正しいか確認
     - APIのレート制限に達していないか確認
     - ログを確認して詳細なエラーメッセージを確認

2. **クロールエラー**
   - 問題: ウェブサイトやGBPのクロールに失敗する
   - 解決策:
     - URLが正しいか確認
     - Firecrawl APIキーが正しいか確認
     - ターゲットサイトがクロール可能か確認

### ログ分析
問題の診断には、ログファイルの分析が重要です：

```bash
# バックエンドログの確認
cat /var/log/app.log | grep ERROR

# 特定の期間のログを確認
cat /var/log/app.log | grep "2023-01-01"

# 特定のユーザーのアクティビティを確認
cat /var/log/app.log | grep "user@example.com"
```

### 診断コマンド
システムの状態を診断するためのコマンド：

```bash
# サーバーの状態確認
pm2 status

# データベース接続テスト
node -e "const { createClient } = require('@supabase/supabase-js'); const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY); supabase.from('users').select('count').then(console.log).catch(console.error);"

# APIエンドポイントテスト
curl -H "Authorization: Bearer YOUR_TOKEN" https://api.keyword-suggestion-app.example.com/api/facilities
```

## セキュリティ管理

### 認証とアクセス制御
アプリケーションはJWTベースの認証を使用しています：

1. **トークン管理**
   - JWTトークンの有効期限は24時間
   - リフレッシュトークンの有効期限は7日間
   - トークンの無効化はログアウト時に行われる

2. **権限管理**
   - 管理者: すべての機能にアクセス可能
   - 一般ユーザー: 自分が作成した施設とキーワードのみアクセス可能

### データ保護
1. **暗号化**
   - データベース内の機密情報は暗号化して保存
   - HTTPS通信のみを許可

2. **バックアップ**
   - 日次バックアップ
   - 7日間のバックアップ保持

### セキュリティ監査
1. **定期的なセキュリティスキャン**
   - 依存関係の脆弱性スキャン: 週1回
   - コードセキュリティレビュー: 四半期ごと

2. **インシデント対応**
   - セキュリティインシデント発生時の連絡先: security@keyword-suggestion-app.example.com
   - インシデント対応手順書は社内Wikiを参照

## パフォーマンスチューニング

### フロントエンドの最適化
1. **ビルド最適化**
   - コード分割の活用
   - 画像の最適化
   - キャッシュ戦略の実装

2. **レンダリング最適化**
   - メモ化の活用
   - 仮想スクロールの実装
   - レンダリングの遅延読み込み

### バックエンドの最適化
1. **クエリ最適化**
   - インデックスの適切な設定
   - クエリのキャッシュ
   - N+1問題の回避

2. **リソース管理**
   - コネクションプールの適切な設定
   - メモリ使用量の監視
   - 非同期処理の活用

### AI処理の最適化
1. **バッチ処理**
   - 複数のリクエストをバッチ処理
   - バックグラウンドジョブの活用

2. **キャッシュ戦略**
   - 生成結果のキャッシュ
   - 類似リクエストの結果再利用

## 定期メンテナンス

### 日次タスク
1. **ログの確認**
   - エラーログの確認
   - 異常なアクセスパターンの確認

2. **バックアップの確認**
   - バックアップが正常に実行されたか確認

### 週次タスク
1. **パフォーマンス監視**
   - レスポンスタイムの確認
   - リソース使用率の確認

2. **セキュリティ更新**
   - セキュリティパッチの適用
   - 脆弱性スキャンの実行

### 月次タスク
1. **システム更新**
   - 依存関係の更新
   - 機能の追加・改善

2. **ユーザーフィードバックの確認**
   - ユーザーからのフィードバックの分析
   - 改善点の特定と計画

## ユーザー管理

### ユーザーアカウント管理
1. **ユーザー作成**
   ```bash
   # 管理者ユーザーの作成
   node scripts/create-user.js --email admin@example.com --password secure123 --role admin
   
   # 一般ユーザーの作成
   node scripts/create-user.js --email user@example.com --password secure456 --role user
   ```

2. **ユーザー編集**
   ```bash
   # ユーザー情報の更新
   node scripts/update-user.js --id 123 --email new-email@example.com
   
   # パスワードのリセット
   node scripts/reset-password.js --email user@example.com
   ```

3. **ユーザー削除**
   ```bash
   # ユーザーの削除
   node scripts/delete-user.js --id 123
   ```

### アクセス権限管理
1. **権限の付与**
   ```bash
   # 管理者権限の付与
   node scripts/grant-role.js --email user@example.com --role admin
   ```

2. **権限の取り消し**
   ```bash
   # 管理者権限の取り消し
   node scripts/revoke-role.js --email user@example.com --role admin
   ```

### ユーザーアクティビティ監視
1. **ログイン履歴の確認**
   ```bash
   # ユーザーのログイン履歴を確認
   node scripts/view-login-history.js --email user@example.com
   ```

2. **アクティビティログの確認**
   ```bash
   # ユーザーのアクティビティを確認
   node scripts/view-activity-log.js --email user@example.com
   ```

## 連絡先

### サポート
- メール: support@keyword-suggestion-app.example.com
- 電話: 03-1234-5678（平日10:00-18:00）

### 緊急連絡先
- システム管理者: admin@keyword-suggestion-app.example.com
- 緊急電話: 090-1234-5678（24時間対応）
