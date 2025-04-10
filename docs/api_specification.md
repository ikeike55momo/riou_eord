# API仕様書

## 概要
このドキュメントでは、キーワード自動提案Webアプリケーションで使用されるAPIエンドポイントの詳細を説明します。

## ベースURL
```
開発環境: http://localhost:3000/api
本番環境: https://api.keyword-suggestion-app.example.com/api
```

## 認証
すべてのAPIリクエストには認証が必要です。認証はJWTトークンを使用して行われます。

### 認証ヘッダー
```
Authorization: Bearer {token}
```

## エンドポイント

### 認証

#### ログイン
```
POST /auth/login
```

**リクエスト本文**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**レスポンス**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "123",
      "email": "user@example.com",
      "name": "ユーザー名"
    }
  }
}
```

#### ログアウト
```
POST /auth/logout
```

**レスポンス**
```json
{
  "success": true,
  "message": "ログアウトしました"
}
```

### 施設管理

#### 施設一覧取得
```
GET /facilities
```

**クエリパラメータ**
- `page`: ページ番号（デフォルト: 1）
- `limit`: 1ページあたりの件数（デフォルト: 10）
- `search`: 検索キーワード

**レスポンス**
```json
{
  "success": true,
  "data": {
    "facilities": [
      {
        "id": "1",
        "facility_name": "サンプル施設",
        "business_type": "レストラン",
        "address": "東京都渋谷区",
        "created_at": "2023-01-01T00:00:00Z",
        "updated_at": "2023-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "total": 100,
      "page": 1,
      "limit": 10,
      "pages": 10
    }
  }
}
```

#### 施設詳細取得
```
GET /facilities/:id
```

**レスポンス**
```json
{
  "success": true,
  "data": {
    "id": "1",
    "facility_name": "サンプル施設",
    "business_type": "レストラン",
    "address": "東京都渋谷区",
    "phone": "03-1234-5678",
    "business_hours": "10:00-22:00",
    "closed_days": "月曜日",
    "official_site_url": "https://example.com",
    "gbp_url": "https://maps.google.com/example",
    "additional_info": "駐車場あり",
    "created_at": "2023-01-01T00:00:00Z",
    "updated_at": "2023-01-01T00:00:00Z"
  }
}
```

#### 施設作成
```
POST /facilities
```

**リクエスト本文**
```json
{
  "facility_name": "新規施設",
  "business_type": "カフェ",
  "address": "東京都新宿区",
  "phone": "03-1234-5678",
  "business_hours": "9:00-20:00",
  "closed_days": "水曜日",
  "official_site_url": "https://example.com",
  "gbp_url": "https://maps.google.com/example",
  "additional_info": "Wi-Fi完備"
}
```

**レスポンス**
```json
{
  "success": true,
  "data": {
    "id": "2",
    "facility_name": "新規施設",
    "business_type": "カフェ",
    "address": "東京都新宿区",
    "phone": "03-1234-5678",
    "business_hours": "9:00-20:00",
    "closed_days": "水曜日",
    "official_site_url": "https://example.com",
    "gbp_url": "https://maps.google.com/example",
    "additional_info": "Wi-Fi完備",
    "created_at": "2023-01-02T00:00:00Z",
    "updated_at": "2023-01-02T00:00:00Z"
  }
}
```

#### 施設更新
```
PUT /facilities/:id
```

**リクエスト本文**
```json
{
  "facility_name": "更新施設",
  "business_type": "カフェ",
  "address": "東京都新宿区",
  "phone": "03-1234-5678",
  "business_hours": "9:00-20:00",
  "closed_days": "水曜日",
  "official_site_url": "https://example.com",
  "gbp_url": "https://maps.google.com/example",
  "additional_info": "Wi-Fi完備"
}
```

**レスポンス**
```json
{
  "success": true,
  "data": {
    "id": "2",
    "facility_name": "更新施設",
    "business_type": "カフェ",
    "address": "東京都新宿区",
    "phone": "03-1234-5678",
    "business_hours": "9:00-20:00",
    "closed_days": "水曜日",
    "official_site_url": "https://example.com",
    "gbp_url": "https://maps.google.com/example",
    "additional_info": "Wi-Fi完備",
    "created_at": "2023-01-02T00:00:00Z",
    "updated_at": "2023-01-03T00:00:00Z"
  }
}
```

#### 施設削除
```
DELETE /facilities/:id
```

**レスポンス**
```json
{
  "success": true,
  "message": "施設が削除されました"
}
```

### キーワード管理

#### キーワード生成
```
POST /keywords/generate
```

**リクエスト本文**
```json
{
  "facility_id": "1"
}
```

**レスポンス**
```json
{
  "success": true,
  "data": {
    "facility_id": "1",
    "menu_service": [
      "ランチメニュー",
      "ディナーコース",
      "テイクアウト"
    ],
    "environment_facility": [
      "個室あり",
      "座敷あり",
      "テラス席"
    ],
    "recommended_scene": [
      "家族での食事",
      "デート",
      "接待"
    ]
  }
}
```

#### キーワード取得
```
GET /keywords/:facilityId
```

**レスポンス**
```json
{
  "success": true,
  "data": {
    "facility_id": "1",
    "menu_service": [
      "ランチメニュー",
      "ディナーコース",
      "テイクアウト"
    ],
    "environment_facility": [
      "個室あり",
      "座敷あり",
      "テラス席"
    ],
    "recommended_scene": [
      "家族での食事",
      "デート",
      "接待"
    ],
    "created_at": "2023-01-01T00:00:00Z",
    "updated_at": "2023-01-01T00:00:00Z"
  }
}
```

#### キーワード更新
```
PUT /keywords/:facilityId
```

**リクエスト本文**
```json
{
  "menu_service": [
    "ランチメニュー",
    "ディナーコース",
    "テイクアウト",
    "新メニュー"
  ],
  "environment_facility": [
    "個室あり",
    "座敷あり",
    "テラス席"
  ],
  "recommended_scene": [
    "家族での食事",
    "デート",
    "接待"
  ]
}
```

**レスポンス**
```json
{
  "success": true,
  "data": {
    "facility_id": "1",
    "menu_service": [
      "ランチメニュー",
      "ディナーコース",
      "テイクアウト",
      "新メニュー"
    ],
    "environment_facility": [
      "個室あり",
      "座敷あり",
      "テラス席"
    ],
    "recommended_scene": [
      "家族での食事",
      "デート",
      "接待"
    ],
    "created_at": "2023-01-01T00:00:00Z",
    "updated_at": "2023-01-04T00:00:00Z"
  }
}
```

### エクスポート

#### CSVエクスポート
```
GET /export/csv/:facilityId
```

**レスポンス**
CSVファイルがダウンロードされます。

#### JSONエクスポート
```
GET /export/json/:facilityId
```

**レスポンス**
JSONファイルがダウンロードされます。

## エラーレスポンス

### 認証エラー
```json
{
  "success": false,
  "error": "認証エラー",
  "message": "ログインが必要です"
}
```

### バリデーションエラー
```json
{
  "success": false,
  "error": "バリデーションエラー",
  "message": "入力内容に誤りがあります",
  "details": {
    "facility_name": "施設名は必須です"
  }
}
```

### サーバーエラー
```json
{
  "success": false,
  "error": "サーバーエラー",
  "message": "サーバー内部でエラーが発生しました"
}
```

## レート制限
APIには1分あたり100リクエストのレート制限があります。制限を超えた場合は429ステータスコードが返されます。

## バージョン管理
APIのバージョンはURLパスに含まれます。現在のバージョンはv1です。

```
/api/v1/facilities
```

## 変更履歴
- 2023-01-01: 初版リリース
