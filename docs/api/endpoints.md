# API エンドポイント

ChordBook バックエンド API のエンドポイント一覧です。

## 基本情報

| 項目 | 値 |
|------|-----|
| ベースURL（開発） | http://localhost:5000/api |
| ベースURL（本番） | https://api.chordbook.example.com/api |
| 形式 | REST API |
| データ形式 | JSON |
| 認証 | なし（MVPフロント準拠） |

## OpenAPI（仕様の一次情報）

API 仕様の一次情報は OpenAPI で管理します。

- OpenAPI: `docs/api/openapi.yaml`

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

楽曲一覧を取得します（MVPでは権限制御なし）。

**認証**: なし

**クエリパラメータ**

| パラメータ | 型 | デフォルト | 説明 |
|-----------|-----|-----------|------|
| page | number | 1 | ページ番号 |
| limit | number | 20 | 取得件数 |
| sort | string | updatedAt | ソートキー |
| order | string | desc | asc / desc |

**レスポンス**

```json
{
  "items": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "サンプル曲",
      "artist": "サンプルアーティスト",
      "key": "C",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 1,
  "page": 1,
  "pageSize": 20,
  "totalPages": 1
}
```

---

#### GET /api/songs/{id}

指定した楽曲の詳細を取得します（MVPでは権限制御なし）。

**認証**: なし

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
  "content": [
    {
      "id": "section-1",
      "name": "イントロ",
      "type": "bar",
      "lines": [{ "bars": ["C", "G", "Am", "F"] }]
    }
  ],
  "visibility": 0,
  "createdAt": "2024-01-10T08:00:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

**エラーレスポンス**

| ステータス | 説明 |
|-----------|------|
| 404 | 楽曲が見つからない |

---

#### POST /api/songs

新しい楽曲を作成します。

**認証**: なし

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
  "content": [],
  "visibility": 0,
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

**ステータスコード**: 201 Created

---

#### PUT /api/songs/{id}

楽曲を更新します（MVPでは権限制御なし）。

**認証**: なし

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
  "content": [
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
}
```

| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| title | string | Yes | 曲名 |
| artist | string | No | アーティスト名 |
| key | string | No | キー |
| bpm | number | No | テンポ |
| timeSignature | string | Yes | 拍子 |
| content | array | Yes | コード譜データ（セクション配列） |

**レスポンス**: 204 No Content

---

#### DELETE /api/songs/{id}

楽曲を削除します（MVPでは権限制御なし）。

**認証**: なし

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
| 404 | リソースが見つからない |
| 500 | サーバーエラー |

## Swagger UI

開発環境では Swagger UI でAPIをテストできます。

```
http://localhost:5000/swagger
```

## 関連ドキュメント

- [API概要](./overview.md) - 認証方式の詳細
- [データベース設計](../database/er-diagram.md) - データ構造
