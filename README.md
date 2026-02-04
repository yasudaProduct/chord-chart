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
├── frontend/          # Next.js フロントエンド
├── backend/           # ASP.NET Core バックエンド
├── docs/              # ドキュメント
└── .github/           # GitHub Actions
```

## 開発環境のセットアップ

### 必要なツール

- Node.js 20+
- pnpm
- .NET 8 SDK

### フロントエンド

```bash
cd frontend
pnpm install
pnpm dev
# http://localhost:3000
```

### バックエンド

```bash
cd backend/src/ChordBook.Api
dotnet run
# http://localhost:5000
# Swagger: http://localhost:5000/swagger
```

## ライセンス

MIT
