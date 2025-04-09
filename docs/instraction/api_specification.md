# キーワード自動提案Webアプリ - API仕様書

## 概要
このドキュメントでは、キーワード自動提案Webアプリケーションで使用されるAPIエンドポイントの仕様を説明します。

## ベースURL
- 開発環境: `http://localhost:3000/api`
- 本番環境: `https://keyword-suggestion-app.netlify.app/.netlify/functions/api`

## 認証
すべてのAPIリクエストには認証が必要です。認証はJWTトークンを使用して行われます。
トークンは、`Authorization`ヘッダーに`Bearer <token>`の形式で指定する必要があります。

### 認証エンドポイント

#### ログイン
```
POST /auth/login
```

リクエスト:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

レスポンス:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "テストユーザー",
    "role": "user"
  }
}
```

## 施設情報API

### 施設一覧の取得
```
GET /facilities
```

クエリパラメータ:
- `page`: ページ番号（デフォルト: 1）
- `limit`: 1ページあたりの件数（デフォルト: 10）

レスポンス:
```json
{
  "facilities": [
    {
      "id": 1,
      "facility_name": "サンプル施設",
      "facility_type": "レストラン",
      "address": "東京都渋谷区1-1-1",
      "created_at": "2025-04-01T12:00:00Z",
      "updated_at": "2025-04-01T12:00:00Z"
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 10,
  "total_pages": 10
}
```

### 施設情報の取得
```
GET /facilities/:id
```

レスポンス:
```json
{
  "id": 1,
  "facility_name": "サンプル施設",
  "facility_type": "レストラン",
  "address": "東京都渋谷区1-1-1",
  "phone_number": "03-1234-5678",
  "website_url": "https://example.com",
  "google_map_url": "https://maps.google.com/?q=35.6812,139.7671",
  "business_hours": ["月-金: 10:00-22:00", "土日: 11:00-21:00"],
  "price_range": "¥1,000~¥3,000",
  "capacity": 50,
  "parking": true,
  "reservation_required": false,
  "average_rating": 4.5,
  "review_count": 120,
  "description": "サンプル施設の説明文です。",
  "features": ["Wi-Fi完備", "禁煙"],
  "images": ["https://example.com/image1.jpg"],
  "menu_items": ["メニュー1", "メニュー2"],
  "services": ["サービス1", "サービス2"],
  "accessibility": {
    "wheelchair": true,
    "elevator": true
  },
  "payment_methods": ["現金", "クレジットカード", "電子マネー"],
  "social_media": {
    "twitter": "https://twitter.com/example",
    "instagram": "https://instagram.com/example"
  },
  "certifications": ["認証1", "認証2"],
  "languages_supported": ["日本語", "英語"],
  "nearby_attractions": ["観光スポット1", "観光スポット2"],
  "additional_info": {
    "note": "追加情報"
  },
  "created_at": "2025-04-01T12:00:00Z",
  "updated_at": "2025-04-01T12:00:00Z"
}
```

### 施設情報の作成
```
POST /facilities
```

リクエスト:
```json
{
  "facility_name": "新規施設",
  "facility_type": "レストラン",
  "address": "東京都新宿区1-1-1",
  "phone_number": "03-1234-5678",
  "website_url": "https://example.com",
  "google_map_url": "https://maps.google.com/?q=35.6812,139.7671",
  "business_hours": ["月-金: 10:00-22:00", "土日: 11:00-21:00"],
  "price_range": "¥1,000~¥3,000",
  "capacity": 50,
  "parking": true,
  "reservation_required": false,
  "description": "新規施設の説明文です。"
}
```

レスポンス:
```json
{
  "facility_id": 2,
  "message": "施設情報が正常に作成されました"
}
```

### 施設情報の更新
```
PUT /facilities/:id
```

リクエスト:
```json
{
  "facility_name": "更新施設",
  "description": "更新された説明文です。"
}
```

レスポンス:
```json
{
  "message": "施設情報が正常に更新されました"
}
```

### 施設情報の削除
```
DELETE /facilities/:id
```

レスポンス:
```json
{
  "message": "施設情報が正常に削除されました"
}
```

## キーワードAPI

### キーワードの取得
```
GET /keywords/:facility_id
```

レスポンス:
```json
{
  "facility_id": 1,
  "menu_service": ["キーワード1", "キーワード2", "キーワード3"],
  "environment_facility": ["キーワード4", "キーワード5", "キーワード6"],
  "recommended_scene": ["キーワード7", "キーワード8", "キーワード9"],
  "created_at": "2025-04-01T12:00:00Z",
  "updated_at": "2025-04-01T12:00:00Z"
}
```

### キーワードの生成
```
POST /keywords/generate/:facility_id
```

レスポンス:
```json
{
  "facility_id": 1,
  "menu_service": ["生成キーワード1", "生成キーワード2", "生成キーワード3"],
  "environment_facility": ["生成キーワード4", "生成キーワード5", "生成キーワード6"],
  "recommended_scene": ["生成キーワード7", "生成キーワード8", "生成キーワード9"]
}
```

### キーワードの更新
```
PUT /keywords/:facility_id
```

リクエスト:
```json
{
  "menu_service": ["更新キーワード1", "更新キーワード2", "更新キーワード3"],
  "environment_facility": ["更新キーワード4", "更新キーワード5", "更新キーワード6"],
  "recommended_scene": ["更新キーワード7", "更新キーワード8", "更新キーワード9"]
}
```

レスポンス:
```json
{
  "message": "キーワードが正常に更新されました"
}
```

## エクスポートAPI

### CSVエクスポート
```
GET /export/csv/:facility_id
```

レスポンス:
CSVファイルがダウンロードされます。

CSVの形式:
```
施設ID,施設名,施設タイプ,住所,メニュー・サービスキーワード,環境・設備キーワード,おすすめの利用シーンキーワード
1,サンプル施設,レストラン,東京都渋谷区1-1-1,"キーワード1,キーワード2,キーワード3","キーワード4,キーワード5,キーワード6","キーワード7,キーワード8,キーワード9"
```

## エラーレスポンス

### 認証エラー
```json
{
  "error": "認証エラー",
  "message": "認証情報が無効です"
}
```
ステータスコード: 401

### バリデーションエラー
```json
{
  "error": "バリデーションエラー",
  "errors": [
    {
      "field": "facility_name",
      "message": "施設名は必須です"
    }
  ]
}
```
ステータスコード: 400

### リソースが見つからないエラー
```json
{
  "error": "リソースが見つかりません",
  "message": "指定されたIDの施設が見つかりません"
}
```
ステータスコード: 404

### サーバーエラー
```json
{
  "error": "サーバーエラー",
  "message": "サーバー内部でエラーが発生しました"
}
```
ステータスコード: 500
