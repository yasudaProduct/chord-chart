# 開発環境のセットアップ

ChordBook の開発環境を構築する手順を説明します。

## 必要なツール

| ツール | バージョン | 用途 |
|--------|-----------|------|
| Node.js | 20以上 | フロントエンド実行環境 |
| pnpm | 8以上 | パッケージマネージャー |
| .NET SDK | 8.0 | バックエンド実行環境 |
| Docker | 最新 | ローカルDB（オプション） |
| Git | 最新 | バージョン管理 |

## インストール手順

### 1. リポジトリのクローン

```bash
git clone https://github.com/yasudaProduct/ChordChart-app-draft.git
cd ChordChart-app-draft
```

### 2. フロントエンドのセットアップ

```bash
cd frontend

# 依存関係のインストール
pnpm install

# 環境変数ファイルの作成
cp .env.example .env.local
```

`.env.local` を編集して必要な環境変数を設定します（詳細は[環境変数](../deployment/environments.md)を参照）。

### 3. バックエンドのセットアップ

```bash
cd backend/src/ChordBook.Api

# 依存関係の復元
dotnet restore

# 開発用設定の確認
# appsettings.Development.json が存在することを確認
```

### 4. データベースの準備

開発環境では Supabase のクラウド環境を使用します。

1. [Supabase](https://supabase.com) でプロジェクトを作成
2. 接続文字列を取得
3. `appsettings.Development.json` に接続文字列を設定

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=xxx.supabase.co;Database=postgres;Username=postgres;Password=xxx"
  }
}
```

## 開発サーバーの起動

### フロントエンド

```bash
cd frontend
pnpm dev
```

http://localhost:3000 でアクセスできます。

### バックエンド

```bash
cd backend/src/ChordBook.Api
dotnet run
```

- API: http://localhost:5000
- Swagger UI: http://localhost:5000/swagger

## 開発ツール

### 推奨エディタ

- **VS Code** - フロントエンド開発
  - 推奨拡張機能: ESLint, Prettier, Tailwind CSS IntelliSense
- **Visual Studio 2022** または **Rider** - バックエンド開発

### デバッグ

#### フロントエンド

```bash
# 開発サーバー（ホットリロード有効）
pnpm dev

# Lintチェック
pnpm lint

# ビルド確認
pnpm build
```

#### バックエンド

```bash
# 開発モードで実行（ホットリロード有効）
dotnet watch run

# テスト実行
dotnet test
```

## トラブルシューティング

### pnpm install が失敗する

```bash
# pnpm のキャッシュをクリア
pnpm store prune

# node_modules を削除して再インストール
rm -rf node_modules
pnpm install
```

### dotnet restore が失敗する

```bash
# NuGet キャッシュをクリア
dotnet nuget locals all --clear

# 再度復元
dotnet restore
```

### ポートが使用中

- フロントエンド: `PORT=3001 pnpm dev` で別ポートを指定
- バックエンド: `launchSettings.json` でポートを変更

## 次のステップ

- [コーディング規約](./coding-standards.md)を確認する
- [Git運用ルール](./git-workflow.md)を確認する
- [API仕様](../api/endpoints.md)を確認する
