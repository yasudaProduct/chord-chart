# ChordBook

コード譜を作成・管理・共有できるWebアプリケーション

## 概要

既存のコード掲載サイトの不満（広告、見づらさ、印刷品質）を解消し、オリジナル曲も含めてコード譜を一元管理できるサービス。

## 技術スタック

| レイヤー | 技術 |
|----------|------|
| フロントエンド | Next.js 14 (App Router), Tailwind CSS, shadcn/ui, Zustand |
| バックエンド | ASP.NET Core 8 Web API, Entity Framework Core |
| データベース | PostgreSQL (Supabase) |
| 認証 | Supabase Auth |
| ホスティング | Vercel (FE), Railway (BE) |

## プロジェクト構成

```
chord-book/
├── apps/
│   ├── frontend/      # Next.js フロントエンド
│   └── backend/       # ASP.NET Core バックエンド
├── docs/              # ドキュメント
└── .github/           # GitHub Actions
```

## 開発環境のセットアップ

### 前提条件

- Node.js 20+
- pnpm
- .NET 8 SDK
- Supabaseプロジェクト（[supabase.com](https://supabase.com) で作成）

### 1. リポジトリのクローン

```bash
git clone https://github.com/yasudaProduct/chord-chart.git
cd chord-chart
```

### 2. Supabaseの準備

Supabaseダッシュボードから以下の情報を取得してください。

| 情報 | 取得場所 |
|------|----------|
| Project URL | Settings > API > Project URL |
| Anon Key | Settings > API > Project API keys |
| JWT Secret | Settings > API > JWT Settings |
| DB接続文字列 | Settings > Database > Connection string (URI) |

### 3. フロントエンドのセットアップ

```bash
cd apps/frontend
pnpm install
```

`.env.local` を作成して環境変数を設定します。

```bash
cp .env.local.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 4. バックエンドのセットアップ

`apps/backend/src/ChordBook.Api/appsettings.Development.json` を作成します。

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning",
      "Microsoft.EntityFrameworkCore": "Information"
    }
  },
  "ConnectionStrings": {
    "DefaultConnection": "Host=db.<your-project>.supabase.co;Port=5432;Database=postgres;Username=postgres;Password=<your-db-password>;SSL Mode=Require;Trust Server Certificate=true"
  },
  "Supabase": {
    "Url": "https://<your-project>.supabase.co",
    "JwtSecret": "<your-jwt-secret>"
  }
}
```

### 5. 開発サーバーの起動

バックエンドとフロントエンドをそれぞれ別のターミナルで起動します。

```bash
# ターミナル1: バックエンド
cd apps/backend/src/ChordBook.Api
dotnet run
# http://localhost:5000
# Swagger: http://localhost:5000/swagger
```

```bash
# ターミナル2: フロントエンド
cd apps/frontend
pnpm dev
# http://localhost:3000
```

### デモモード

バックエンドを起動せずにフロントエンドのみでも動作します。未ログイン状態ではローカルのモックデータを使用したデモモードで動作します。

## ライセンス

MIT
