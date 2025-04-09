# キーワード自動提案Webアプリ開発 タスクリスト

## 現在の実装状況

### 移行済みファイル
1. フロントエンド（keyword-suggestion-app/）：
   - src/App.jsx
   - src/contexts/AuthContext.jsx
   - src/services/api.js
   - .env.development
   - .env.production
   - vite.config.js
   - postcss.config.js
   - tailwind.config.js
   - netlify.toml
   - package.json

2. バックエンド（keyword-suggestion-app/server/）：
   - server.js
   - middleware/security.js
   - db/schema.sql

## 今後のタスク（優先順位順）

### 1. フロントエンド実装（優先度: 高）
- [ ] レイアウトコンポーネント
  - [ ] src/components/layout/Layout.jsx
  - [ ] src/components/layout/Navbar.jsx
  - [ ] src/components/layout/Sidebar.jsx
- [ ] 認証関連
  - [ ] src/pages/auth/LoginPage.jsx
- [ ] 施設管理
  - [ ] src/pages/facilities/FacilitiesListPage.jsx
  - [ ] src/pages/facilities/FacilityFormPage.jsx
- [ ] キーワード管理
  - [ ] src/pages/keywords/KeywordGenerationPage.jsx
- [ ] その他
  - [ ] src/pages/NotFoundPage.jsx

### 2. バックエンド実装（優先度: 高）
- [ ] ユーティリティ
  - [ ] server/utils/logger.js
- [ ] モデル
  - [ ] server/models/user.js
  - [ ] server/models/facility.js
  - [ ] server/models/keyword.js
- [ ] ルーティング
  - [ ] server/routes/facilities.js
  - [ ] server/routes/keywords.js
  - [ ] server/routes/export.js
- [ ] サービス
  - [ ] server/services/auth.js
  - [ ] server/services/facility.js
  - [ ] server/services/keyword.js

### 3. AI機能実装（優先度: 中）
- [ ] GPT-4統合
  - [ ] server/services/ai/gpt.js
- [ ] Firecrawl統合
  - [ ] server/services/ai/crawler.js
- [ ] キーワード生成
  - [ ] server/services/ai/keyword-generator.js
- [ ] エラーハンドリング
  - [ ] server/services/ai/error-handler.js

### 4. テスト実装（優先度: 中）
- [ ] ユニットテスト
  - [ ] tests/unit/frontend/
  - [ ] tests/unit/backend/
- [ ] 統合テスト
  - [ ] tests/integration/
- [ ] E2Eテスト
  - [ ] tests/e2e/

### 5. デプロイメント準備（優先度: 低）
- [ ] Netlify設定
  - [ ] 本番環境の環境変数設定
  - [ ] ビルド設定の確認
- [ ] CI/CD
  - [ ] GitHub Actionsの設定
  - [ ] デプロイメントパイプラインの構築

### 6. ドキュメント整備（優先度: 低）
- [ ] API仕様書
- [ ] ユーザーマニュアル
- [ ] 運用マニュアル

## 注意事項
1. 各コンポーネントの実装時には、仕様書の要件を満たしているか確認
2. セキュリティ要件の遵守
3. パフォーマンス要件の確認
4. 本番環境の環境変数は、Netlifyのダッシュボードで設定 