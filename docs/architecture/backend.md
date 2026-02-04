# バックエンドアーキテクチャ

ASP.NET Core 8 を使用したバックエンドの設計を説明します。

## Clean Architecture

バックエンドは Clean Architecture パターンを採用しています。

```
┌─────────────────────────────────────────────────────────────────┐
│                         外部                                    │
│                    (HTTP, DB, etc.)                             │
└───────────────────────────┬─────────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│                    ChordBook.Api                                │
│                   (プレゼンテーション層)                          │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Controllers  │  Middleware  │  Filters  │  Program.cs  │   │
│  └─────────────────────────────────────────────────────────┘   │
└───────────────────────────┬─────────────────────────────────────┘
                            │ 依存
┌───────────────────────────▼─────────────────────────────────────┐
│                 ChordBook.Application                           │
│                   (アプリケーション層)                            │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Commands  │  Queries  │  DTOs  │  Interfaces  │  ...   │   │
│  └─────────────────────────────────────────────────────────┘   │
└───────────────────────────┬─────────────────────────────────────┘
                            │ 依存
┌───────────────────────────▼─────────────────────────────────────┐
│                   ChordBook.Domain                              │
│                     (ドメイン層)                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Entities  │  Value Objects  │  Enums  │  Domain Events │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│               ChordBook.Infrastructure                          │
│                  (インフラストラクチャ層)                         │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  DbContext  │  Repositories  │  External Services  │ ... │   │
│  └─────────────────────────────────────────────────────────┘   │
│                            │                                    │
│              Application層のインターフェースを実装                 │
└─────────────────────────────────────────────────────────────────┘
```

## 各層の責務

### Domain 層（ChordBook.Domain）

ビジネスルールの中核。外部依存なし。

```
ChordBook.Domain/
├── Common/
│   └── BaseEntity.cs         # 共通基底クラス（Id, CreatedAt, UpdatedAt）
├── Entities/
│   ├── Song.cs               # 楽曲エンティティ
│   ├── User.cs               # ユーザーエンティティ
│   ├── Bookmark.cs           # ブックマークエンティティ
│   └── SongShare.cs          # 共有リンクエンティティ
└── Enums/
    └── Visibility.cs         # 公開設定列挙型
```

**設計方針**:
- エンティティはファクトリメソッド（`Create`）で生成
- プロパティは `private set` で外部からの直接変更を防止
- ビジネスロジックをエンティティ内にカプセル化

```csharp
// 例: Song エンティティ
public class Song : BaseEntity
{
    public string Title { get; private set; }

    private Song() { }  // EF Core 用

    public static Song Create(Guid userId, string title, ...)
    {
        return new Song { UserId = userId, Title = title, ... };
    }

    public void UpdateMeta(string title, ...)
    {
        Title = title;
        SetUpdatedAt();
    }
}
```

### Application 層（ChordBook.Application）

ユースケースの実装。MediatR による CQRS パターン。

```
ChordBook.Application/
├── Common/
│   └── Interfaces/
│       └── IApplicationDbContext.cs   # DB コンテキストインターフェース
├── Songs/
│   ├── Commands/                      # 書き込み操作
│   │   ├── CreateSong/
│   │   ├── UpdateSong/
│   │   └── DeleteSong/
│   ├── Queries/                       # 読み取り操作
│   │   ├── GetSong/
│   │   └── GetSongs/
│   └── DTOs/
│       └── SongDto.cs                 # データ転送オブジェクト
└── DependencyInjection.cs             # DI 設定
```

**MediatR パターン**:

```csharp
// Command（書き込み）
public record CreateSongCommand(string Title, string? Artist) : IRequest<Guid>;

public class CreateSongCommandHandler : IRequestHandler<CreateSongCommand, Guid>
{
    public async Task<Guid> Handle(CreateSongCommand request, CancellationToken ct)
    {
        var song = Song.Create(...);
        // 保存処理
        return song.Id;
    }
}

// Query（読み取り）
public record GetSongQuery(Guid Id) : IRequest<SongDto?>;
```

### Infrastructure 層（ChordBook.Infrastructure）

外部システムとの接続。Application 層のインターフェースを実装。

```
ChordBook.Infrastructure/
├── Persistence/
│   ├── ApplicationDbContext.cs        # EF Core DbContext
│   └── Configurations/
│       └── SongConfiguration.cs       # Fluent API 設定
└── DependencyInjection.cs             # DI 設定
```

**Entity Framework Core 設定**:

```csharp
public class ApplicationDbContext : DbContext, IApplicationDbContext
{
    public DbSet<Song> Songs => Set<Song>();
    public DbSet<User> Users => Set<User>();
    // ...
}
```

### Api 層（ChordBook.Api）

HTTP リクエストの処理。Controller と DI 構成。

```
ChordBook.Api/
├── Controllers/
│   ├── HealthController.cs
│   └── SongsController.cs
├── Program.cs                         # アプリケーション構成
└── appsettings.json                   # 設定ファイル
```

## 依存性注入（DI）

各層は拡張メソッドで DI を構成:

```csharp
// Program.cs
builder.Services.AddApplication();      // Application 層の登録
builder.Services.AddInfrastructure(configuration);  // Infrastructure 層の登録
```

**Application 層の DI**:

```csharp
public static IServiceCollection AddApplication(this IServiceCollection services)
{
    services.AddMediatR(cfg =>
        cfg.RegisterServicesFromAssembly(Assembly.GetExecutingAssembly()));
    return services;
}
```

**Infrastructure 層の DI**:

```csharp
public static IServiceCollection AddInfrastructure(
    this IServiceCollection services,
    IConfiguration configuration)
{
    services.AddDbContext<ApplicationDbContext>(options =>
        options.UseNpgsql(configuration.GetConnectionString("DefaultConnection")));

    services.AddScoped<IApplicationDbContext>(provider =>
        provider.GetRequiredService<ApplicationDbContext>());

    return services;
}
```

## リクエスト処理フロー

```
HTTP Request
    │
    ▼
┌─────────────────┐
│   Controller    │  リクエストを受け取り、MediatR に委譲
└────────┬────────┘
         │ Send(command/query)
         ▼
┌─────────────────┐
│    MediatR      │  適切な Handler にルーティング
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    Handler      │  ビジネスロジックの実行
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   DbContext     │  データベース操作
└────────┬────────┘
         │
         ▼
HTTP Response
```

## プロジェクト参照

```
ChordBook.Api
    └── ChordBook.Application
    └── ChordBook.Infrastructure

ChordBook.Application
    └── ChordBook.Domain

ChordBook.Infrastructure
    └── ChordBook.Application
    └── ChordBook.Domain
```

**依存の方向**: 外側 → 内側（Domain が最も内側で依存なし）

## 関連ドキュメント

- [システム概要](./overview.md) - 全体アーキテクチャ
- [API仕様](../api/endpoints.md) - エンドポイント詳細
- [データベース設計](../database/er-diagram.md) - エンティティとテーブル
