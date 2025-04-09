# API仕様書

## 概要

このAPIは、キーワード自動提案Webアプリケーションのバックエンドサービスを提供します。施設情報の管理、キーワードの生成と管理、CSVエクスポート機能などを提供します。

## ベースURL

```
https://api.keyword-suggestion-app.com/api
```

開発環境:

```
http://localhost:3000/api
```

## 認証

すべてのAPIリクエストには認証が必要です。認証はJWTトークンを使用して行われます。

リクエストヘッダーに以下のように認証トークンを含めてください:

```
Authorization: Bearer {token}
```

## エンドポイント

### 認証

#### ログイン

```
POST /auth/login
```

**リクエスト本文**:

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**レスポンス**:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "1",
    "email": "user@example.com",
    "name": "ユーザー名"
  }
}
```

### 施設管理

#### 施設一覧の取得

```
GET /facilities
```

**クエリパラメータ**:

- `page`: ページ番号 (デフォルト: 1)
- `limit`: 1ページあたりの件数 (デフォルト: 10)

**レスポンス**:

```json
{
  "facilities": [
    {
      "facility_id": "1",
      "facility_name": "サンプル施設",
      "business_type": "レストラン",
      "address": "東京都渋谷区",
      "created_at": "2023-01-01T00:00:00Z",
      "updated_at": "2023-01-01T00:00:00Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10
}
```

#### 施設の詳細取得

```
GET /facilities/:id
```

**レスポンス**:

```json
{
  "facility_id": "1",
  "facility_name": "サンプル施設",
  "business_type": "レストラン",
  "address": "東京都渋谷区",
  "phone": "03-1234-5678",
  "email": "facility@example.com",
  "website": "https://example.com",
  "business_hours": "10:00-22:00",
  "closed_days": "月曜日",
  "parking": "あり",
  "wifi": "あり",
  "payment_options": "現金、クレジットカード",
  "barrier_free": "一部対応",
  "additional_info": "サンプル施設の追加情報",
  "gbp_url": "https://www.google.com/maps/place/...",
  "official_site_url": "https://example.com",
  "created_at": "2023-01-01T00:00:00Z",
  "updated_at": "2023-01-01T00:00:00Z"
}
```

#### 施設の作成

```
POST /facilities
```

**リクエスト本文**:

```json
{
  "facility_name": "新規施設",
  "business_type": "レストラン",
  "address": "東京都渋谷区",
  "phone": "03-1234-5678",
  "email": "facility@example.com",
  "website": "https://example.com",
  "business_hours": "10:00-22:00",
  "closed_days": "月曜日",
  "parking": "あり",
  "wifi": "あり",
  "payment_options": "現金、クレジットカード",
  "barrier_free": "一部対応",
  "additional_info": "新規施設の追加情報",
  "gbp_url": "https://www.google.com/maps/place/...",
  "official_site_url": "https://example.com"
}
```

**レスポンス**:

```json
{
  "facility_id": "2",
  "facility_name": "新規施設",
  "business_type": "レストラン",
  "address": "東京都渋谷区",
  "created_at": "2023-01-02T00:00:00Z",
  "updated_at": "2023-01-02T00:00:00Z"
}
```

#### 施設の更新

```
PUT /facilities/:id
```

**リクエスト本文**:

```json
{
  "facility_name": "更新施設",
  "business_type": "カフェ",
  "address": "東京都新宿区",
  "phone": "03-1234-5678",
  "email": "updated@example.com"
}
```

**レスポンス**:

```json
{
  "facility_id": "1",
  "facility_name": "更新施設",
  "business_type": "カフェ",
  "address": "東京都新宿区",
  "phone": "03-1234-5678",
  "email": "updated@example.com",
  "updated_at": "2023-01-03T00:00:00Z"
}
```

#### 施設の削除

```
DELETE /facilities/:id
```

**レスポンス**:

```json
{
  "message": "施設が正常に削除されました",
  "facility_id": "1"
}
```

### キーワード管理

#### 施設のキーワード取得

```
GET /keywords/:facilityId
```

**レスポンス**:

```json
{
  "facility_id": "1",
  "menu_service": [
    "ランチセット",
    "ディナーコース",
    "季節の料理"
  ],
  "environment_facility": [
    "テラス席あり",
    "個室完備",
    "Wi-Fi利用可"
  ],
  "recommended_scene": [
    "デート",
    "接待",
    "家族での食事"
  ],
  "generated_at": "2023-01-04T00:00:00Z"
}
```

#### キーワード生成

```
POST /keywords/:facilityId/generate
```

**レスポンス**:

```json
{
  "facility_id": "1",
  "menu_service": [
    "ランチセット",
    "ディナーコース",
    "季節の料理",
    "テイクアウト",
    "デザート"
  ],
  "environment_facility": [
    "テラス席あり",
    "個室完備",
    "Wi-Fi利用可",
    "禁煙席あり",
    "駐車場完備"
  ],
  "recommended_scene": [
    "デート",
    "接待",
    "家族での食事",
    "記念日",
    "女子会"
  ],
  "generated_at": "2023-01-05T00:00:00Z"
}
```

#### キーワード更新

```
PUT /keywords/:facilityId
```

**リクエスト本文**:

```json
{
  "menu_service": [
    "ランチセット",
    "ディナーコース",
    "季節の料理",
    "テイクアウト"
  ],
  "environment_facility": [
    "テラス席あり",
    "個室完備",
    "Wi-Fi利用可"
  ],
  "recommended_scene": [
    "デート",
    "接待",
    "家族での食事"
  ]
}
```

**レスポンス**:

```json
{
  "facility_id": "1",
  "menu_service": [
    "ランチセット",
    "ディナーコース",
    "季節の料理",
    "テイクアウト"
  ],
  "environment_facility": [
    "テラス席あり",
    "個室完備",
    "Wi-Fi利用可"
  ],
  "recommended_scene": [
    "デート",
    "接待",
    "家族での食事"
  ],
  "updated_at": "2023-01-06T00:00:00Z"
}
```

### エクスポート

#### キーワードのCSVエクスポート

```
GET /export/csv/:facilityId
```

**レスポンス**:

CSVファイルがダウンロードされます。

## エラーレスポンス

エラーが発生した場合、以下の形式でレスポンスが返されます:

```json
{
  "error": "エラーメッセージ"
}
```

### HTTPステータスコード

- `200 OK`: リクエストが成功しました
- `201 Created`: リソースが正常に作成されました
- `400 Bad Request`: リクエストが不正です
- `401 Unauthorized`: 認証が必要です
- `403 Forbidden`: アクセス権限がありません
- `404 Not Found`: リソースが見つかりません
- `500 Internal Server Error`: サーバーエラーが発生しました

## レート制限

APIには1分間に100リクエストのレート制限があります。制限を超えた場合、`429 Too Many Requests`ステータスコードが返されます。

## バージョニング

APIのバージョンはURLパスに含まれます。現在のバージョンはv1です。

```
https://api.keyword-suggestion-app.com/api/v1/facilities
```
