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

## OpenAPI（仕様の一次情報）

API 仕様の一次情報は OpenAPI で管理します。

- OpenAPI: `docs/api/openapi.yaml`

## 認証

**MVP では認証なしで利用する前提です。**

---

## リクエスト

### ヘッダー

| ヘッダー | 必須 | 説明 |
|----------|------|------|
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

### Content（コード譜データ）

`Song.content` は JSON のセクション配列です（JSON 文字列ではありません）。

例:

```json
[
  {
    "id": "section-1",
    "name": "Aメロ",
    "type": "lyrics-chord",
    "lines": [
      {
        "lyrics": "きょうも いちにち",
        "chords": [{ "chord": "C", "position": 0 }]
      }
    ]
  }
]
```

- `docs/database/tables.md`

---

## レスポンス

### 成功レスポンス

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "サンプル曲",
  "artist": "アーティスト",
  "key": "C",
  "bpm": 120,
  "timeSignature": "4/4",
  "content": [],
  "visibility": 0,
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

### 一覧レスポンス

```json
{
  "items": [
    { "id": "1", "title": "曲1" },
    { "id": "2", "title": "曲2" }
  ],
  "total": 100,
  "page": 1,
  "pageSize": 20,
  "totalPages": 5
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
| 200 | OK | GET成功 |
| 201 | Created | POST成功（リソース作成） |
| 204 | No Content | PUT/DELETE成功 |

### クライアントエラー

| コード | 説明 | 原因 |
|--------|------|------|
| 400 | Bad Request | リクエスト形式エラー、バリデーションエラー |
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

（未実装）

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
