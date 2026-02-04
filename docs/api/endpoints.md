# API エンドポイント

ChordBook バックエンド API のエンドポイント一覧です。

## 基本情報

| 項目 | 値 |
|------|-----|
| ベースURL（開発） | http://localhost:5000/api |
| ベースURL（本番） | https://api.chordbook.example.com/api |
| 形式 | REST API |
| データ形式 | JSON |
| 認証 | Bearer Token (Supabase JWT) |

## 認証

認証が必要なエンドポイントには、リクエストヘッダーに JWT トークンを含めます。

```http
Authorization: Bearer <supabase_access_token>
```

## エンドポイント一覧

### Health Check

#### GET /api/health

サーバーの稼働状態を確認します。

**認証**: 不要

**レスポンス**

```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

### Songs（楽曲）

#### GET /api/songs

ユーザーの楽曲一覧を取得します。

**認証**: 必要

**レスポンス**

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "サンプル曲",
    "artist": "サンプルアーティスト",
    "key": "C",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
]
```

---

#### GET /api/songs/{id}

指定した楽曲の詳細を取得します。

**認証**: 必要（所有者または公開曲のみ）

**パスパラメータ**

| 名前 | 型 | 説明 |
|------|-----|------|
| id | UUID | 楽曲ID |

**レスポンス**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "サンプル曲",
  "artist": "サンプルアーティスト",
  "key": "C",
  "bpm": 120,
  "timeSignature": "4/4",
  "content": "[{\"id\":\"section-1\",\"name\":\"イントロ\",\"type\":\"bar\",\"lines\":[]}]",
  "visibility": 0,
  "createdAt": "2024-01-10T08:00:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

**エラーレスポンス**

| ステータス | 説明 |
|-----------|------|
| 404 | 楽曲が見つからない |
| 403 | アクセス権限がない |

---

#### POST /api/songs

新しい楽曲を作成します。

**認証**: 必要

**リクエストボディ**

```json
{
  "title": "新しい曲",
  "artist": "アーティスト名",
  "key": "G",
  "bpm": 100,
  "timeSignature": "4/4"
}
```

| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| title | string | Yes | 曲名 |
| artist | string | No | アーティスト名 |
| key | string | No | キー（C, Am, etc.） |
| bpm | number | No | テンポ |
| timeSignature | string | No | 拍子（デフォルト: "4/4"） |

**レスポンス**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "新しい曲",
  "artist": "アーティスト名",
  "key": "G",
  "bpm": 100,
  "timeSignature": "4/4",
  "content": "[]",
  "visibility": 0,
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

**ステータスコード**: 201 Created

---

#### PUT /api/songs/{id}

楽曲を更新します。

**認証**: 必要（所有者のみ）

**パスパラメータ**

| 名前 | 型 | 説明 |
|------|-----|------|
| id | UUID | 楽曲ID |

**リクエストボディ**

```json
{
  "title": "更新後の曲名",
  "artist": "更新後のアーティスト",
  "key": "Am",
  "bpm": 110,
  "timeSignature": "3/4",
  "content": "[{\"id\":\"section-1\",\"name\":\"Aメロ\",\"type\":\"bar\",\"lines\":[]}]"
}
```

| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| title | string | Yes | 曲名 |
| artist | string | No | アーティスト名 |
| key | string | No | キー |
| bpm | number | No | テンポ |
| timeSignature | string | Yes | 拍子 |
| content | string | Yes | コード譜データ（JSON文字列） |

**レスポンス**: 204 No Content

---

#### DELETE /api/songs/{id}

楽曲を削除します。

**認証**: 必要（所有者のみ）

**パスパラメータ**

| 名前 | 型 | 説明 |
|------|-----|------|
| id | UUID | 楽曲ID |

**レスポンス**: 204 No Content

---

## 共通エラーレスポンス

### エラー形式

```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.1",
  "title": "Bad Request",
  "status": 400,
  "errors": {
    "Title": ["タイトルは必須です"]
  }
}
```

### HTTPステータスコード

| コード | 説明 |
|--------|------|
| 200 | 成功 |
| 201 | 作成成功 |
| 204 | 成功（レスポンスボディなし） |
| 400 | リクエスト不正 |
| 401 | 認証エラー |
| 403 | アクセス権限なし |
| 404 | リソースが見つからない |
| 500 | サーバーエラー |

## 今後追加予定のエンドポイント

| エンドポイント | 説明 |
|---------------|------|
| GET /api/songs/public | 公開曲の検索 |
| POST /api/songs/{id}/share | 共有リンクの生成 |
| GET /api/share/{token} | 共有リンクから曲を取得 |
| GET /api/bookmarks | ブックマーク一覧 |
| POST /api/bookmarks | ブックマーク追加 |
| DELETE /api/bookmarks/{id} | ブックマーク削除 |
| GET /api/users/me | 現在のユーザー情報 |
| PUT /api/users/me | ユーザー情報更新 |

## Swagger UI

開発環境では Swagger UI でAPIをテストできます。

```
http://localhost:5000/swagger
```

## 関連ドキュメント

- [API概要](./overview.md) - 認証方式の詳細
- [データベース設計](../database/er-diagram.md) - データ構造
