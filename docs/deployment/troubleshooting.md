# トラブルシューティング

ChordBook でよくある問題と解決方法です。

---

## 開発環境

### フロントエンドが起動しない

**症状**: `pnpm dev` でエラー

**確認事項**:
```bash
# Node.js バージョン確認
node --version  # 20以上が必要

# 依存関係の再インストール
rm -rf node_modules
pnpm install
```

**よくある原因**:
- Node.js バージョンが古い
- node_modules の破損
- 環境変数ファイルがない

---

### バックエンドが起動しない

**症状**: `dotnet run` でエラー

**確認事項**:
```bash
# .NET バージョン確認
dotnet --version  # 8.0以上が必要

# 依存関係の復元
dotnet restore
```

**よくある原因**:
- .NET SDK バージョンが古い
- NuGet パッケージの破損
- 接続文字列が未設定

---

### データベース接続エラー

**症状**: `Npgsql.NpgsqlException`

**確認事項**:
1. 接続文字列の確認
2. Supabase ダッシュボードで接続許可 IP を確認
3. パスワードに特殊文字がある場合はエスケープ

**接続文字列の例**:
```
Host=db.xxx.supabase.co;Database=postgres;Username=postgres;Password=xxx;Port=5432
```

**SSL 接続が必要な場合**:
```
Host=xxx;...;SslMode=Require;Trust Server Certificate=true
```

---

### CORS エラー

**症状**: ブラウザコンソールに `CORS policy` エラー

**確認事項**:
1. `AllowedOrigins` の設定を確認
2. プロトコル（http/https）が一致しているか
3. ポート番号が一致しているか

**解決方法**:
```csharp
// appsettings.json
{
  "AllowedOrigins": "http://localhost:3000"
}
```

---

### 認証エラー

**症状**: 401 Unauthorized

**確認事項**:
1. Supabase の設定が正しいか
2. トークンが期限切れでないか
3. Authorization ヘッダーの形式

**デバッグ**:
```typescript
// トークンの確認
const { data: { session } } = await supabase.auth.getSession()
console.log('Token:', session?.access_token)
```

---

## デプロイ

### Vercel ビルドエラー

**症状**: ビルド失敗

**確認事項**:
```bash
# ローカルでビルド確認
cd frontend
pnpm build
```

**よくある原因**:
- TypeScript 型エラー
- ESLint エラー
- 環境変数の未設定

**解決方法**:
1. ローカルで `pnpm build` が通るか確認
2. Vercel の環境変数を確認
3. `NEXT_PUBLIC_` プレフィックスを確認

---

### Railway ビルドエラー

**症状**: Docker ビルド失敗

**確認事項**:
```bash
# ローカルで Docker ビルド
cd backend
docker build -t test .
```

**よくある原因**:
- Dockerfile のパスが間違っている
- NuGet の復元エラー
- .NET バージョンの不一致

**Dockerfile の確認**:
```dockerfile
# 正しい SDK バージョン
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
```

---

### デプロイ後に動作しない

**症状**: デプロイ成功だが 500 エラー

**確認事項**:
1. Railway のログを確認
2. 環境変数が正しく設定されているか
3. データベース接続が成功しているか

**ログの確認**:
```bash
# Railway CLI
railway logs
```

---

## パフォーマンス

### API レスポンスが遅い

**確認事項**:
1. N+1 クエリがないか
2. インデックスが適切か
3. 不要なデータを取得していないか

**対策**:
```csharp
// Include で N+1 を防ぐ
var songs = await _context.Songs
    .Include(s => s.User)
    .ToListAsync();

// 必要なカラムのみ Select
var songs = await _context.Songs
    .Select(s => new { s.Id, s.Title })
    .ToListAsync();
```

---

### フロントエンドが重い

**確認事項**:
1. 大きなバンドルサイズ
2. 不要な再レンダリング
3. 画像の最適化

**対策**:
```bash
# バンドル分析
pnpm build
# .next/analyze を確認
```

---

## よくあるエラーメッセージ

### `NEXT_PUBLIC_xxx is not defined`

環境変数が設定されていない。

```bash
# .env.local に追加
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
```

### `Unable to connect to PostgreSQL`

接続文字列が間違っているか、ネットワーク問題。

1. Supabase ダッシュボードで接続情報を確認
2. 許可 IP を確認（0.0.0.0/0 で全許可）

### `JWT token is expired`

トークンが期限切れ。

```typescript
// セッションを更新
await supabase.auth.refreshSession()
```

### `Module not found`

パッケージがインストールされていない。

```bash
pnpm install
# または
dotnet restore
```

---

## デバッグ Tips

### フロントエンド

```typescript
// API レスポンスのログ
const response = await api.get('/songs')
console.log('Response:', response)

// Zustand の状態確認
const state = useEditorStore.getState()
console.log('Editor state:', state)
```

### バックエンド

```csharp
// 開発環境でのログ
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}

// ログ出力
_logger.LogInformation("Song created: {SongId}", song.Id);
```

### ネットワーク

```bash
# API の疎通確認
curl http://localhost:5000/api/health

# SSL 確認
curl -v https://api.chordbook.railway.app/api/health
```

---

## サポート

解決しない場合:

1. GitHub Issues で報告
2. エラーログを添付
3. 再現手順を記載

---

## 関連ドキュメント

- [環境構築](../development/getting-started.md)
- [環境変数](./environments.md)
- [フロントエンドデプロイ](./frontend-deploy.md)
- [バックエンドデプロイ](./backend-deploy.md)
