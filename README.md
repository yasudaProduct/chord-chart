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
├── supabase/
│   └── migrations/    # DBマイグレーション（テーブル・RLS・トリガー）
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


### 2. フロントエンドのセットアップ

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

### 3. バックエンドのセットアップ

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

### 4. 開発サーバーの起動

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

### 5.Supabase ローカル開発フロー

#### 前提

- Docker Desktop がインストール・起動していること
- Supabase プロジェクトが作成済みであること（[supabase.com](https://supabase.com)）

#### 初回セットアップ

```bash
# 1. Supabase にログイン
supabase login

# 2. リモートプロジェクトとリンク
supabase link --project-ref <your-project-ref>

# 3. ローカル環境を起動（supabase/migrations/ 内の migration が自動適用される）
supabase start

# 4. ローカル環境の接続情報を確認
supabase status
```

#### リモートスキーマの再取得（リモート DB を直接変更した場合）

> **注意:** `supabase db pull`（リンク経由）は、Docker Desktop（macOS）の IPv6 制限により
> diff ステップで `ECONNREFUSED` エラーが発生します。
> Supabase の IPv4 Add-on（有料）を使わずに回避するため、`--db-url` で Supavisor pooler 経由の接続文字列を指定しています。

```bash
# 1. リモートスキーマを migration ファイルとして取得（pooler 経由）
supabase db pull --db-url postgresql://postgres.<your-project-ref>:<password>@<pooler-host>:6543/postgres

# 2. ローカル DB をリセットして migration を再適用
supabase db reset
```

#### 日常の開発フロー

```bash
# 1. ローカル環境を起動
supabase start

# 2. ローカルでスキーマを変更（Studio http://localhost:54323 or SQL）

# 3. 変更を migration ファイルに書き出し
supabase db diff -f <migration_name>

# 4. Git にコミット
git add supabase/migrations/
git commit -m "feat: add xxx table"

# 5. デプロイ時にリモートへ migration を適用
supabase db push
```

#### ローカル環境の操作

```bash
supabase start              # 起動
supabase stop               # 停止（データ保持）
supabase stop --no-backup   # 停止（データ削除）
supabase db reset           # ローカル DB をリセット（migration 再適用）
supabase status             # ローカル環境の接続情報を表示
```


### デモモード

バックエンドを起動せずにフロントエンドのみでも動作します。未ログイン状態ではローカルのモックデータを使用したデモモードで動作します。

## ライセンス

MIT
