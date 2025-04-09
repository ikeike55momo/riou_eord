# キーワード自動提案Webアプリ - プロジェクト納品書

## プロジェクト概要
本プロジェクトは、施設情報を入力し、AIを活用して3つのカテゴリ（メニュー・サービス、環境・設備、おすすめの利用シーン）のキーワードを自動生成するWebアプリケーションです。生成されたキーワードは編集可能で、最終的にCSV形式でエクスポートできます。

## 納品物一覧

### ソースコード
- `/keyword-suggestion-app/` - プロジェクトルートディレクトリ
  - `/frontend/` - フロントエンドコード（React + Vite）
  - `/backend/` - バックエンドコード（Express.js）
  - `/netlify/` - Netlifyデプロイ用設定

### データベース
- Supabaseプロジェクト（URL: https://dstigzldesimivihsryn.supabase.co）
  - ユーザーテーブル
  - 施設情報テーブル
  - キーワードテーブル

### ドキュメント
- `/docs/user_manual.md` - 使用方法ドキュメント
- `/docs/api_specification.md` - API仕様書
- `/docs/deployment_guide.md` - デプロイガイド
- `/docs/maintenance_guide.md` - メンテナンスガイド

### 環境設定ファイル
- `.env.production` - 本番環境用環境変数
- `netlify.toml` - Netlify設定ファイル

## 技術スタック

### フロントエンド
- React 18
- Vite
- Tailwind CSS
- React Router
- Axios

### バックエンド
- Node.js
- Express.js
- NextAuth.js（認証）
- LangChain/OpenAI（AIキーワード生成）
- Puppeteer/Cheerio（Webクローリング）

### データベース
- Supabase（PostgreSQL）

### デプロイ
- Netlify（フロントエンド）
- Netlify Functions（バックエンド）

## アクセス情報

### 開発環境
- フロントエンド: http://localhost:5173
- バックエンド: http://localhost:3000/api

### 本番環境
- URL: https://keyword-suggestion-app.netlify.app
- API: https://keyword-suggestion-app.netlify.app/.netlify/functions/api

### 管理者アカウント
- メールアドレス: admin@example.com
- パスワード: 別途お知らせします

## 機能一覧
1. 内部スタッフ向け認証機能
2. 施設情報の登録・編集・削除
3. AIによるキーワード自動生成
   - メニュー・サービスカテゴリ
   - 環境・設備カテゴリ
   - おすすめの利用シーンカテゴリ
4. キーワードの編集・確定
5. CSV形式でのエクスポート

## 保守・運用
- 定期的なバックアップを推奨（Supabaseの自動バックアップ機能を活用）
- セキュリティアップデートの定期的な適用
- 詳細はメンテナンスガイドを参照

## サポート
- サポート期間: 納品日より6ヶ月間
- 連絡先: support@example.com
- 緊急連絡先: 03-1234-5678（平日10:00-18:00）

## 著作権・ライセンス
- 本プロジェクトの著作権は発注者に帰属します
- 使用しているオープンソースライブラリのライセンスについては、各ライブラリのライセンス条項に従います

---

納品日: 2025年4月8日

開発者: Manus AI
