# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 言語設定
常に日本語で会話してください。

## プロジェクト概要
ChordBook - コード譜を作成・管理・共有できるWebアプリケーション

## 技術スタック
- **フロントエンド:** Next.js 14 (App Router) + React 18 + TypeScript + Tailwind CSS + Zustand
- **バックエンド:** ASP.NET Core 8 + Clean Architecture + MediatR + Entity Framework Core
- **データベース:** PostgreSQL (Supabase)
- **認証:** Supabase Auth (JWT)
- **ホスティング:** Vercel (FE), Railway (BE)

## コマンド

### フロントエンド (apps/frontend)
```bash
pnpm dev          # 開発サーバー起動 (localhost:3000)
pnpm build        # 本番ビルド
pnpm lint         # ESLint実行
pnpm lint --fix   # ESLint自動修正
```

### バックエンド (apps/backend)
```bash
cd apps/backend/src/ChordBook.Api
dotnet run                    # 開発サーバー起動
dotnet watch run              # ホットリロード対応
dotnet build ChordBook.sln    # ビルド
dotnet test                   # テスト実行
```

## アーキテクチャ

### フロントエンド構造
```
apps/frontend/src/
├── app/          # Next.js App Router (ページ・レイアウト)
├── lib/          # API通信、ユーティリティ
├── stores/       # Zustand ストア (authStore, editorStore)
└── types/        # TypeScript型定義
```

### バックエンド構造 (Clean Architecture)
```
apps/backend/src/
├── ChordBook.Api/            # プレゼンテーション層 (Controllers, Program.cs)
├── ChordBook.Application/    # アプリケーション層 (DTOs, Handlers, Interfaces)
├── ChordBook.Domain/         # ドメイン層 (Entities, Enums, ビジネスロジック)
└── ChordBook.Infrastructure/ # インフラ層 (DbContext, Repositories)
```

### 主要エンティティ
- `Song` - 楽曲（タイトル、アーティスト、キー、BPM、セクション）
- `User` - ユーザー
- `Bookmark` - ブックマーク
- `SongShare` - 楽曲共有

### データフロー
Frontend (Zustand) → API Request → Backend (MediatR Handler) → Repository → PostgreSQL

## コーディング規約

### TypeScript/React
- コンポーネント: PascalCase、関数コンポーネント（アロー関数）
- インデント: スペース2
- インポート順序: React → 外部ライブラリ → 内部モジュール → 型 → 相対パス

### C#
- クラス/メソッド: PascalCase
- インターフェース: I prefix (例: `ISongRepository`)
- 非同期メソッド: Async suffix + CancellationToken パラメータ
- プライベートフィールド: _camelCase
- インデント: スペース4

### Git コミットメッセージ
```
<type>: <subject>
```
Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

## 詳細ドキュメント
`docs/` ディレクトリに包括的なドキュメントあり:
- `architecture/` - システム構成図、アーキテクチャ詳細
- `development/` - 環境構築、コーディング規約、Git運用
- `api/` - REST API仕様
- `database/` - ER図、テーブル定義
