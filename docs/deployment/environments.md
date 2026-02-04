# 環境変数

ChordBook の環境変数一覧と設定方法です。

## フロントエンド（Next.js）

### 必須環境変数

| 変数名 | 説明 | 例 |
|--------|------|-----|
| NEXT_PUBLIC_SUPABASE_URL | Supabase プロジェクトURL | https://xxx.supabase.co |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Supabase 匿名キー | eyJhbGciOiJIUzI1NiIsInR5cCI... |
| NEXT_PUBLIC_API_URL | バックエンドAPI URL | http://localhost:5000/api |

### 設定方法

#### ローカル開発

`.env.local` ファイルを作成:

```bash
# frontend/.env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

#### Vercel（本番）

Vercel ダッシュボードで設定:
1. Project Settings → Environment Variables
2. 各変数を追加（Production/Preview/Development を選択可能）

---

## バックエンド（ASP.NET Core）

### 必須環境変数

| 変数名 | 説明 | 例 |
|--------|------|-----|
| ConnectionStrings__DefaultConnection | PostgreSQL 接続文字列 | Host=xxx;Database=xxx;... |
| AllowedOrigins | CORS 許可オリジン | https://chordbook.vercel.app |

### オプション環境変数

| 変数名 | 説明 | デフォルト |
|--------|------|-----------|
| ASPNETCORE_ENVIRONMENT | 実行環境 | Production |
| Logging__LogLevel__Default | ログレベル | Information |

### 設定方法

#### ローカル開発

`appsettings.Development.json` を編集:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=chordbook;Username=postgres;Password=postgres"
  },
  "AllowedOrigins": "http://localhost:3000"
}
```

または環境変数で設定:

```bash
export ConnectionStrings__DefaultConnection="Host=localhost;Database=chordbook;..."
export AllowedOrigins="http://localhost:3000"
```

#### Railway（本番）

Railway ダッシュボードで設定:
1. プロジェクト → Variables
2. 各変数を追加

```
ConnectionStrings__DefaultConnection=Host=xxx.railway.app;Database=railway;Username=postgres;Password=xxx;Port=5432
AllowedOrigins=https://chordbook.vercel.app
ASPNETCORE_ENVIRONMENT=Production
```

---

## Supabase 設定

Supabase ダッシュボードから以下の情報を取得:

### Project Settings → API

| 項目 | 用途 |
|------|------|
| Project URL | NEXT_PUBLIC_SUPABASE_URL |
| anon (public) key | NEXT_PUBLIC_SUPABASE_ANON_KEY |

### Project Settings → Database

| 項目 | 用途 |
|------|------|
| Connection string | ConnectionStrings__DefaultConnection |

接続文字列の形式:
```
Host=db.xxx.supabase.co;Database=postgres;Username=postgres;Password=YOUR_PASSWORD;Port=5432
```

---

## 環境別設定一覧

### 開発環境（Development）

| サービス | 設定値 |
|----------|--------|
| フロントエンド URL | http://localhost:3000 |
| バックエンド URL | http://localhost:5000 |
| データベース | localhost または Supabase |
| CORS | http://localhost:3000 |

### 本番環境（Production）

| サービス | 設定値 |
|----------|--------|
| フロントエンド URL | https://chordbook.vercel.app |
| バックエンド URL | https://chordbook-api.railway.app |
| データベース | Supabase PostgreSQL |
| CORS | https://chordbook.vercel.app |

---

## セキュリティ注意事項

1. **秘密情報をコミットしない**
   - `.env.local` は `.gitignore` に含まれている
   - `appsettings.Development.json` に本番の認証情報を入れない

2. **NEXT_PUBLIC_ プレフィックス**
   - このプレフィックスの変数はブラウザに公開される
   - 秘密情報には使用しない

3. **接続文字列**
   - 本番環境では SSL 接続を有効にする
   - `sslmode=require` を追加

```
Host=xxx;Database=xxx;Username=xxx;Password=xxx;Port=5432;SslMode=Require;Trust Server Certificate=true
```

## 関連ドキュメント

- [フロントエンドデプロイ](./frontend-deploy.md) - Vercel 設定
- [バックエンドデプロイ](./backend-deploy.md) - Railway 設定
- [環境構築](../development/getting-started.md) - ローカル開発
