# テスト

ChordBook プロジェクトのテスト方針と実行方法です。

## テスト戦略

### テストピラミッド

```
        ┌───────────┐
        │   E2E     │  少数・重要フロー
        ├───────────┤
        │ 統合テスト │  API・DB連携
        ├───────────┤
        │ ユニット   │  多数・高速
        └───────────┘
```

| レベル | 対象 | ツール |
|--------|------|--------|
| ユニット | 関数・クラス単体 | xUnit (BE), Jest (FE) |
| 統合 | API エンドポイント | WebApplicationFactory |
| E2E | ユーザーフロー | Playwright |

---

## バックエンド（C#）

### テストプロジェクト構成

```
backend/
├── src/
│   ├── ChordBook.Api/
│   ├── ChordBook.Application/
│   ├── ChordBook.Domain/
│   └── ChordBook.Infrastructure/
└── tests/
    ├── ChordBook.Domain.Tests/           # ドメイン層ユニットテスト
    ├── ChordBook.Application.Tests/      # アプリケーション層テスト
    └── ChordBook.Api.Tests/              # API 統合テスト
```

### ユニットテスト例

```csharp
// ChordBook.Domain.Tests/Entities/SongTests.cs
public class SongTests
{
    [Fact]
    public void Create_WithValidData_ReturnsSong()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var title = "Test Song";

        // Act
        var song = Song.Create(userId, title);

        // Assert
        Assert.NotEqual(Guid.Empty, song.Id);
        Assert.Equal(title, song.Title);
        Assert.Equal(userId, song.UserId);
    }

    [Fact]
    public void UpdateMeta_UpdatesPropertiesAndTimestamp()
    {
        // Arrange
        var song = Song.Create(Guid.NewGuid(), "Original");
        var originalUpdatedAt = song.UpdatedAt;

        // Act
        Thread.Sleep(10); // 時間差を作る
        song.UpdateMeta("Updated", "Artist", "C", 120, "4/4");

        // Assert
        Assert.Equal("Updated", song.Title);
        Assert.True(song.UpdatedAt > originalUpdatedAt);
    }
}
```

### 統合テスト例

```csharp
// ChordBook.Api.Tests/Controllers/SongsControllerTests.cs
public class SongsControllerTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public SongsControllerTests(WebApplicationFactory<Program> factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetSongs_ReturnsOk()
    {
        // Act
        var response = await _client.GetAsync("/api/songs");

        // Assert
        response.EnsureSuccessStatusCode();
        Assert.Equal("application/json", response.Content.Headers.ContentType?.MediaType);
    }
}
```

### テスト実行

```bash
# 全テスト実行
cd backend
dotnet test

# 特定プロジェクトのみ
dotnet test tests/ChordBook.Domain.Tests/

# 詳細出力
dotnet test --verbosity normal

# カバレッジ付き（coverlet インストール後）
dotnet test --collect:"XPlat Code Coverage"
```

---

## フロントエンド（TypeScript）

### テストツール

| ツール | 用途 |
|--------|------|
| Jest | テストランナー |
| React Testing Library | コンポーネントテスト |
| MSW | API モック |

### ユニットテスト例

```typescript
// __tests__/utils/formatDate.test.ts
import { formatDate } from '@/lib/utils'

describe('formatDate', () => {
  it('formats date correctly', () => {
    const date = '2024-01-15T10:30:00Z'
    const result = formatDate(date)
    expect(result).toBe('2024/01/15')
  })

  it('returns empty string for invalid date', () => {
    const result = formatDate('invalid')
    expect(result).toBe('')
  })
})
```

### コンポーネントテスト例

```typescript
// __tests__/components/SongCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { SongCard } from '@/components/SongCard'

describe('SongCard', () => {
  const mockSong = {
    id: '1',
    title: 'Test Song',
    artist: 'Test Artist',
    key: 'C',
    updatedAt: '2024-01-15',
  }

  it('renders song information', () => {
    render(<SongCard song={mockSong} onSelect={jest.fn()} />)

    expect(screen.getByText('Test Song')).toBeInTheDocument()
    expect(screen.getByText('Test Artist')).toBeInTheDocument()
  })

  it('calls onSelect when clicked', () => {
    const onSelect = jest.fn()
    render(<SongCard song={mockSong} onSelect={onSelect} />)

    fireEvent.click(screen.getByRole('button'))

    expect(onSelect).toHaveBeenCalledWith('1')
  })
})
```

### API モック（MSW）

```typescript
// __tests__/mocks/handlers.ts
import { rest } from 'msw'

export const handlers = [
  rest.get('/api/songs', (req, res, ctx) => {
    return res(
      ctx.json([
        { id: '1', title: 'Song 1', artist: 'Artist 1' },
        { id: '2', title: 'Song 2', artist: 'Artist 2' },
      ])
    )
  }),
]
```

### テスト実行

```bash
cd frontend

# 全テスト実行
pnpm test

# ウォッチモード
pnpm test --watch

# カバレッジ
pnpm test --coverage

# 特定ファイル
pnpm test SongCard.test.tsx
```

---

## E2E テスト（Playwright）

### セットアップ

```bash
cd frontend
pnpm add -D @playwright/test
npx playwright install
```

### E2E テスト例

```typescript
// e2e/songs.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Songs', () => {
  test('should display song list', async ({ page }) => {
    await page.goto('/songs')

    // 楽曲一覧が表示される
    await expect(page.getByRole('heading', { name: '楽曲一覧' })).toBeVisible()
  })

  test('should create new song', async ({ page }) => {
    await page.goto('/songs/new')

    // フォーム入力
    await page.getByLabel('曲名').fill('新しい曲')
    await page.getByLabel('アーティスト').fill('テストアーティスト')
    await page.getByRole('button', { name: '作成' }).click()

    // 詳細ページに遷移
    await expect(page).toHaveURL(/\/songs\/[a-z0-9-]+/)
    await expect(page.getByText('新しい曲')).toBeVisible()
  })
})
```

### 実行

```bash
# 全 E2E テスト
npx playwright test

# UI モード
npx playwright test --ui

# 特定ブラウザ
npx playwright test --project=chromium
```

---

## テスト方針

### 何をテストするか

| 優先度 | 対象 |
|--------|------|
| 高 | ビジネスロジック（Domain 層） |
| 高 | API エンドポイントの正常系 |
| 中 | バリデーション |
| 中 | エラーハンドリング |
| 低 | UI のスタイル |

### テストのベストプラクティス

1. **Arrange-Act-Assert パターン**を使う
2. **1テスト1検証**を心がける
3. **テストは独立**させる（順序依存なし）
4. **実装ではなく振る舞い**をテストする
5. **意味のあるテスト名**をつける

```csharp
// Good: 振る舞いを説明するテスト名
[Fact]
public void Create_WithEmptyTitle_ThrowsArgumentException()

// Bad: 実装詳細を含むテスト名
[Fact]
public void Create_CallsConstructor()
```

---

## CI でのテスト

GitHub Actions で PR 時に自動実行:

```yaml
# .github/workflows/ci.yml
jobs:
  backend-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-dotnet@v4
        with:
          dotnet-version: '8.0.x'
      - run: dotnet test backend/ChordBook.sln

  frontend-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: |
          cd frontend
          pnpm install
          pnpm test
```

## 関連ドキュメント

- [コーディング規約](./coding-standards.md)
- [環境構築](./getting-started.md)
