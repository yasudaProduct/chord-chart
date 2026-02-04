---
name: backend-dev
description: ASP.NET Core 8 + Clean Architecture + MediatR + Entity Framework Core を使ったバックエンド開発。API実装、ドメインロジック、データアクセスの際に使用。
---

# バックエンド開発スキル

ChordBook バックエンド開発のためのガイドラインです。

## 技術スタック
- **フレームワーク:** ASP.NET Core 8
- **アーキテクチャ:** Clean Architecture
- **CQRS:** MediatR
- **ORM:** Entity Framework Core
- **データベース:** PostgreSQL (Supabase)

## ディレクトリ構造 (Clean Architecture)

```
apps/backend/src/
├── ChordBook.Api/            # プレゼンテーション層
│   ├── Controllers/          # API エンドポイント
│   └── Program.cs            # アプリケーション設定
├── ChordBook.Application/    # アプリケーション層
│   ├── DTOs/                 # データ転送オブジェクト
│   ├── Handlers/             # MediatR ハンドラー
│   └── Interfaces/           # インターフェース定義
├── ChordBook.Domain/         # ドメイン層
│   ├── Entities/             # エンティティ
│   └── Enums/                # 列挙型
└── ChordBook.Infrastructure/ # インフラ層
    ├── Data/                 # DbContext
    └── Repositories/         # リポジトリ実装
```

## コーディング規約

### 命名規則
- **クラス/メソッド:** PascalCase
- **インターフェース:** `I` プレフィックス (例: `ISongRepository`)
- **プライベートフィールド:** `_camelCase`
- **非同期メソッド:** `Async` サフィックス

### 非同期メソッド
すべての非同期メソッドには `CancellationToken` を含める：

```csharp
public async Task<Song> GetByIdAsync(Guid id, CancellationToken cancellationToken)
{
    return await _context.Songs
        .FirstOrDefaultAsync(s => s.Id == id, cancellationToken);
}
```

### インデント
スペース4を使用

## レイヤー別実装パターン

### Controller (API層)

```csharp
[ApiController]
[Route("api/[controller]")]
public class SongsController : ControllerBase
{
    private readonly IMediator _mediator;

    public SongsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<SongDto>> GetById(
        Guid id,
        CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(
            new GetSongByIdQuery(id),
            cancellationToken);

        return result is null ? NotFound() : Ok(result);
    }
}
```

### MediatR Handler (Application層)

```csharp
public record GetSongByIdQuery(Guid Id) : IRequest<SongDto?>;

public class GetSongByIdHandler : IRequestHandler<GetSongByIdQuery, SongDto?>
{
    private readonly ISongRepository _repository;

    public GetSongByIdHandler(ISongRepository repository)
    {
        _repository = repository;
    }

    public async Task<SongDto?> Handle(
        GetSongByIdQuery request,
        CancellationToken cancellationToken)
    {
        var song = await _repository.GetByIdAsync(
            request.Id,
            cancellationToken);

        return song is null ? null : SongDto.FromEntity(song);
    }
}
```

### Entity (Domain層)

```csharp
public class Song
{
    public Guid Id { get; private set; }
    public string Title { get; private set; } = string.Empty;
    public string Artist { get; private set; } = string.Empty;
    public string Key { get; private set; } = string.Empty;
    public int? Bpm { get; private set; }
    public Guid UserId { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime UpdatedAt { get; private set; }

    // ナビゲーションプロパティ
    public ICollection<Section> Sections { get; private set; } = [];

    // ファクトリメソッド
    public static Song Create(string title, string artist, string key, Guid userId)
    {
        return new Song
        {
            Id = Guid.NewGuid(),
            Title = title,
            Artist = artist,
            Key = key,
            UserId = userId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
    }
}
```

### Repository Interface (Application層)

```csharp
public interface ISongRepository
{
    Task<Song?> GetByIdAsync(Guid id, CancellationToken cancellationToken);
    Task<IEnumerable<Song>> GetAllByUserIdAsync(Guid userId, CancellationToken cancellationToken);
    Task AddAsync(Song song, CancellationToken cancellationToken);
    Task UpdateAsync(Song song, CancellationToken cancellationToken);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken);
}
```

### Repository Implementation (Infrastructure層)

```csharp
public class SongRepository : ISongRepository
{
    private readonly AppDbContext _context;

    public SongRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Song?> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        return await _context.Songs
            .Include(s => s.Sections)
            .FirstOrDefaultAsync(s => s.Id == id, cancellationToken);
    }
}
```

## コマンド

```bash
cd apps/backend/src/ChordBook.Api
dotnet run                    # 開発サーバー起動
dotnet watch run              # ホットリロード対応

cd apps/backend
dotnet build ChordBook.sln    # ビルド
dotnet test                   # テスト実行
```

## 主要エンティティ

| エンティティ | 説明 |
|------------|------|
| `Song` | 楽曲（タイトル、アーティスト、キー、BPM、セクション） |
| `User` | ユーザー |
| `Bookmark` | ブックマーク |
| `SongShare` | 楽曲共有 |
