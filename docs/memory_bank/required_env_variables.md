# 必要な環境変数一覧

## 認証関連
- `NEXTAUTH_URL`: アプリケーションのベースURL
- `NEXTAUTH_SECRET`: NextAuthの暗号化キー
- `NEXTAUTH_URL_INTERNAL`: 内部通信用のURL（Netlify用）

## Supabase関連
- `VITE_SUPABASE_URL`: SupabaseのプロジェクトURL
- `VITE_SUPABASE_ANON_KEY`: Supabaseの匿名キー
- `SUPABASE_SERVICE_ROLE_KEY`: Supabaseのサービスロールキー（管理者権限用）

## AI/クローリング関連
- `OPENAI_API_KEY`: GPT-4 APIキー
- `FIRECRAWL_API_KEY`: Firecrawl APIキー（ウェブクローリング用）

## アプリケーション設定
- `VITE_API_URL`: バックエンドAPIのベースURL
- `VITE_AUTH_URL`: 認証エンドポイントのURL

## デプロイメント設定
- `NETLIFY_SITE_URL`: NetlifyのデプロイURL
- `NODE_ENV`: 実行環境（development/production）

## 注意事項
1. 本番環境では、これらの値は適切に暗号化され、安全に管理される必要があります
2. 開発環境と本番環境で異なる値を使用する場合は、それぞれの環境用の.envファイルを用意してください
3. APIキーは定期的にローテーションすることを推奨します
4. 本番環境の環境変数は、Netlifyのダッシュボードで設定してください 