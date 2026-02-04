# API 概要

ChordBook REST API の概要と認証方式です。

## 基本情報

| 項目 | 値 |
|------|-----|
| プロトコル | HTTPS |
| 形式 | REST API |
| データ形式 | JSON |
| 文字コード | UTF-8 |

### ベース URL

| 環境 | URL |
|------|-----|
| 開発 | http://localhost:5000/api |
| 本番 | https://api.chordbook.example.com/api |

---

## 認証

Supabase Auth を使用した JWT 認証を採用。

### フロー

```
1. ユーザーが Supabase でログイン
           │
           ▼
2. Supabase から Access Token（JWT）を取得
           │
           ▼
3. API リクエスト時に Authorization ヘッダーに JWT を付与
           │
           ▼
4. バックエンドが JWT を検証
           │
           ▼
5. 認証成功: リクエスト処理 / 失敗: 401 エラー
```

### リクエスト例

```http
GET /api/songs HTTP/1.1
Host: api.chordbook.example.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

### JWT の取得（フロントエンド）

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// ログイン後にセッションから取得
const { data: { session } } = await supabase.auth.getSession()
const accessToken = session?.access_token
```

### 認証不要のエンドポイント

| エンドポイント | 説明 |
|---------------|------|
| GET /api/health | ヘルスチェック |
| GET /api/share/{token} | 共有リンクから楽曲取得 |
| GET /api/songs/public | 公開楽曲の検索 |

---

## リクエスト

### ヘッダー

| ヘッダー | 必須 | 説明 |
|----------|------|------|
| Authorization | 認証時 | `Bearer <token>` |
| Content-Type | POST/PUT | `application/json` |

### クエリパラメータ

```http
GET /api/songs?page=1&limit=20&sort=updatedAt&order=desc
```

| パラメータ | 型 | デフォルト | 説明 |
|-----------|-----|-----------|------|
| page | number | 1 | ページ番号 |
| limit | number | 20 | 取得件数 |
| sort | string | updatedAt | ソートキー |
| order | string | desc | asc / desc |

### リクエストボディ

```json
{
  "title": "曲名",
  "artist": "アーティスト",
  "key": "C",
  "bpm": 120
}
```

---

## レスポンス

### 成功レスポンス

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "サンプル曲",
  "artist": "アーティスト",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

### 一覧レスポンス（ページネーション）

```json
{
  "data": [
    { "id": "1", "title": "曲1" },
    { "id": "2", "title": "曲2" }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### エラーレスポンス

```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.1",
  "title": "Bad Request",
  "status": 400,
  "errors": {
    "Title": ["タイトルは必須です"],
    "Bpm": ["BPMは1以上の数値を指定してください"]
  }
}
```

---

## HTTP ステータスコード

### 成功

| コード | 説明 | 用途 |
|--------|------|------|
| 200 | OK | GET成功、PUT成功 |
| 201 | Created | POST成功（リソース作成） |
| 204 | No Content | DELETE成功 |

### クライアントエラー

| コード | 説明 | 原因 |
|--------|------|------|
| 400 | Bad Request | リクエスト形式エラー、バリデーションエラー |
| 401 | Unauthorized | 認証なし、トークン期限切れ |
| 403 | Forbidden | 権限なし |
| 404 | Not Found | リソースが存在しない |
| 409 | Conflict | 競合（重複など） |
| 422 | Unprocessable Entity | ビジネスルールエラー |

### サーバーエラー

| コード | 説明 | 原因 |
|--------|------|------|
| 500 | Internal Server Error | サーバー内部エラー |
| 503 | Service Unavailable | サービス一時停止 |

---

## CORS

Cross-Origin Resource Sharing の設定:

```csharp
// Program.cs
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "https://chordbook.vercel.app")
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials();
    });
});
```

### 許可オリジン

| 環境 | オリジン |
|------|----------|
| 開発 | http://localhost:3000 |
| 本番 | https://chordbook.vercel.app |

---

## レート制限

（将来実装予定）

| エンドポイント | 制限 |
|---------------|------|
| 認証不要 | 100 req/分 |
| 認証あり | 1000 req/分 |

制限超過時は `429 Too Many Requests` を返却。

---

## バージョニング

現在は v1 のみ。将来的にバージョニングを導入する場合:

```
/api/v1/songs
/api/v2/songs
```

---

## Swagger / OpenAPI

開発環境では Swagger UI でAPIをテスト・確認できます。

```
http://localhost:5000/swagger
```

機能:
- エンドポイント一覧
- リクエスト/レスポンス例
- 実際にAPIを実行してテスト

---

## 関連ドキュメント

- [エンドポイント一覧](./endpoints.md) - 各APIの詳細
- [環境変数](../deployment/environments.md) - API URL設定
