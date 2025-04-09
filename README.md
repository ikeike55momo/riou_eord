# キーワード自動提案Webアプリ

## プロジェクト概要

このプロジェクトは、内部スタッフ向けのAIを活用したSEO/MEOキーワード生成Webアプリケーションです。施設情報を入力し、Google Business ProfileやWebサイトから情報を収集して、3つのカテゴリ（メニュー・サービス、環境・設備、おすすめ利用シーン）のキーワードを自動生成します。

## ドキュメント

プロジェクトに関する詳細なドキュメントは `docs` ディレクトリに格納されています：

- `docs/instraction/`: プロジェクトの要件定義や技術仕様書
  - `project_requirements_document.md`: プロジェクトの要件定義
  - `implementation_plan.md`: 実装計画
  - `tech_stack_document.md`: 使用技術の詳細
  - その他の技術ドキュメント

- `docs/memory_bank/`: プロジェクトの進捗状況や注意事項
  - `task_list.md`: 実装タスクのリストと進捗状況
  - `required_env_variables.md`: 必要な環境変数の一覧
  - その他のメモや記録

## 開発環境のセットアップ

1. 必要な依存関係のインストール:
```bash
npm install
```

2. 開発サーバーの起動:
```bash
# フロントエンド開発サーバー
npm run dev

# バックエンド開発サーバー
npm run dev:server
```

## 環境変数

開発環境と本番環境で必要な環境変数は、それぞれ `.env.development` と `.env.production` で管理されています。本番環境の環境変数は、Netlifyのダッシュボードで設定します。

## コントリビューション

1. このリポジトリをクローン
2. 新しいブランチを作成 (`git checkout -b feature/your-feature`)
3. 変更をコミット (`git commit -am 'Add some feature'`)
4. ブランチをプッシュ (`git push origin feature/your-feature`)
5. プルリクエストを作成

## ライセンス

このプロジェクトは非公開です。すべての権利は保持されています。 