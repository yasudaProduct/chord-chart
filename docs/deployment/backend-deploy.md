# バックエンドデプロイ（Railway）

ASP.NET Core バックエンドを Railway にデプロイする手順です。

## 前提条件

- GitHub アカウント
- Railway アカウント
- リポジトリが GitHub にプッシュ済み
- Dockerfile が `backend/` に存在

---

## 初回セットアップ

### 1. Railway にログイン

[railway.app](https://railway.app) にアクセスし、GitHub アカウントでログイン。

### 2. 新規プロジェクト作成

1. **New Project** をクリック
2. **Deploy from GitHub repo** を選択
3. リポジトリを選択

### 3. サービス設定

| 項目 | 値 |
|------|-----|
| Root Directory | backend |
| Builder | Dockerfile |
| Dockerfile Path | Dockerfile |

### 4. 環境変数の設定

**Variables** タブで以下を追加:

| 変数名 | 値 |
|--------|-----|
| ASPNETCORE_ENVIRONMENT | Production |
| ConnectionStrings__DefaultConnection | Host=xxx;Database=xxx;... |
| AllowedOrigins | https://chordbook.vercel.app |

### 5. デプロイ

設定保存後、自動的にビルド・デプロイが開始されます。

---

## Dockerfile

```dockerfile
# backend/Dockerfile
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# 依存関係の復元
COPY ["src/ChordBook.Api/ChordBook.Api.csproj", "src/ChordBook.Api/"]
COPY ["src/ChordBook.Application/ChordBook.Application.csproj", "src/ChordBook.Application/"]
COPY ["src/ChordBook.Domain/ChordBook.Domain.csproj", "src/ChordBook.Domain/"]
COPY ["src/ChordBook.Infrastructure/ChordBook.Infrastructure.csproj", "src/ChordBook.Infrastructure/"]
RUN dotnet restore "src/ChordBook.Api/ChordBook.Api.csproj"

# ビルド
COPY . .
RUN dotnet build "src/ChordBook.Api/ChordBook.Api.csproj" -c Release -o /app/build

# 発行
FROM build AS publish
RUN dotnet publish "src/ChordBook.Api/ChordBook.Api.csproj" -c Release -o /app/publish

# 実行
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENV ASPNETCORE_URLS=http://+:$PORT
EXPOSE $PORT
ENTRYPOINT ["dotnet", "ChordBook.Api.dll"]
```

---

## 環境変数の詳細

### 接続文字列

Supabase PostgreSQL への接続:

```
ConnectionStrings__DefaultConnection=Host=db.xxx.supabase.co;Database=postgres;Username=postgres;Password=YOUR_PASSWORD;Port=5432;SslMode=Require;Trust Server Certificate=true
```

| パラメータ | 説明 |
|-----------|------|
| Host | Supabase のホスト |
| Database | データベース名（通常 `postgres`） |
| Username | ユーザー名 |
| Password | パスワード |
| Port | ポート番号（5432） |
| SslMode | SSL 必須 |

### CORS 設定

```
AllowedOrigins=https://chordbook.vercel.app
```

複数オリジンの場合:
```
AllowedOrigins=https://chordbook.vercel.app,https://preview.chordbook.vercel.app
```

---

## 自動デプロイ

GitHub 連携により自動デプロイ:

| ブランチ | 動作 |
|----------|------|
| main | 自動デプロイ |
| その他 | 手動デプロイ |

### トリガー設定

1. プロジェクト設定 → **Deployments**
2. **Watch Paths** で `backend/**` を設定

---

## ドメイン設定

### Railway 提供ドメイン

デフォルトで `xxx.railway.app` が割り当てられます。

### カスタムドメイン

1. Settings → **Domains**
2. **Custom Domain** を追加
3. DNS の CNAME レコードを設定

---

## ヘルスチェック

Railway は自動でヘルスチェックを行います。

```csharp
// HealthController.cs
[HttpGet]
public IActionResult Get()
{
    return Ok(new { status = "healthy", timestamp = DateTime.UtcNow });
}
```

エンドポイント: `GET /api/health`

---

## スケーリング

### リソース設定

Settings → **Resources**:

| 項目 | 推奨値 |
|------|--------|
| Memory | 512MB - 1GB |
| CPU | 0.5 - 1 vCPU |

### 自動スリープ

無料プランでは非アクティブ時にスリープします。
初回リクエスト時にコールドスタートが発生。

---

## ログ確認

### デプロイログ

1. プロジェクト → **Deployments**
2. 対象のデプロイを選択
3. **Build Logs** / **Deploy Logs** を確認

### ランタイムログ

1. サービス → **Logs** タブ
2. リアルタイムでログを確認

```bash
# Railway CLI でログ確認
railway logs
```

---

## Railway CLI

### インストール

```bash
npm i -g @railway/cli
```

### 使用方法

```bash
# ログイン
railway login

# プロジェクト連携
railway link

# ローカルで環境変数を使って実行
railway run dotnet run

# デプロイ
railway up
```

---

## トラブルシューティング

### ビルドエラー

```bash
# ローカルでDockerビルド確認
cd backend
docker build -t chordbook-api .
docker run -p 5000:5000 chordbook-api
```

### 接続エラー

- 環境変数の確認
- Supabase の接続許可 IP を確認
- SSL 設定を確認

### ポートエラー

Railway は `PORT` 環境変数でポートを指定:

```csharp
// Program.cs
var port = Environment.GetEnvironmentVariable("PORT") ?? "5000";
builder.WebHost.UseUrls($"http://*:{port}");
```

または Dockerfile で:

```dockerfile
ENV ASPNETCORE_URLS=http://+:$PORT
```

---

## 関連ドキュメント

- [環境変数](./environments.md) - 環境変数一覧
- [フロントエンドデプロイ](./frontend-deploy.md) - Vercel設定
- [トラブルシューティング](./troubleshooting.md) - 問題解決
