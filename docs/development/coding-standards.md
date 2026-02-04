# コーディング規約

ChordBook プロジェクトのコーディングスタイルと命名規則です。

## 共通ルール

### 言語設定

- コードコメント: 日本語 OK
- 変数名・関数名: 英語
- コミットメッセージ: 日本語 OK

### インデント

| 言語 | インデント |
|------|-----------|
| TypeScript/JavaScript | スペース 2 |
| C# | スペース 4 |
| JSON | スペース 2 |
| YAML | スペース 2 |

---

## フロントエンド（TypeScript/React）

### ファイル命名

| 種類 | 規則 | 例 |
|------|------|-----|
| コンポーネント | PascalCase | `SongList.tsx` |
| フック | camelCase（use prefix） | `useSongEditor.ts` |
| ユーティリティ | camelCase | `formatDate.ts` |
| 型定義 | camelCase | `song.ts` |
| ストア | camelCase（Store suffix） | `editorStore.ts` |

### 変数・関数命名

```typescript
// 変数: camelCase
const songTitle = 'Sample Song'
const isLoading = true

// 定数: UPPER_SNAKE_CASE
const MAX_TITLE_LENGTH = 200
const API_BASE_URL = 'http://localhost:5000'

// 関数: camelCase（動詞で始める）
function getSongById(id: string) { }
function handleSubmit() { }
function formatChordName(chord: string) { }

// 型・インターフェース: PascalCase
interface Song { }
type SectionType = 'lyrics-chord' | 'bar'
```

### React コンポーネント

```tsx
// 関数コンポーネント（アロー関数推奨）
export const SongCard = ({ song, onSelect }: SongCardProps) => {
  return (
    <div className="p-4 border rounded">
      <h3>{song.title}</h3>
    </div>
  )
}

// Props 型は別定義
interface SongCardProps {
  song: Song
  onSelect: (id: string) => void
}
```

### インポート順序

```typescript
// 1. React 関連
import { useState, useEffect } from 'react'

// 2. 外部ライブラリ
import { create } from 'zustand'

// 3. 内部モジュール（パスエイリアス）
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/authStore'

// 4. 型定義
import type { Song } from '@/types/song'

// 5. 相対パス
import { formatDate } from './utils'
```

### ESLint / Prettier

プロジェクトの設定に従う（`frontend/.eslintrc.json`）。

```bash
# Lint チェック
pnpm lint

# 自動修正
pnpm lint --fix
```

---

## バックエンド（C#）

### ファイル命名

| 種類 | 規則 | 例 |
|------|------|-----|
| クラス | PascalCase | `SongController.cs` |
| インターフェース | I prefix + PascalCase | `ISongRepository.cs` |
| 列挙型 | PascalCase | `Visibility.cs` |

### 命名規則

```csharp
// 名前空間: PascalCase
namespace ChordBook.Application.Songs;

// クラス・インターフェース: PascalCase
public class SongService { }
public interface ISongRepository { }

// メソッド: PascalCase
public async Task<Song> GetSongByIdAsync(Guid id) { }

// プロパティ: PascalCase
public string Title { get; set; }

// フィールド: _camelCase（private）
private readonly ISongRepository _songRepository;

// 定数: PascalCase
public const int MaxTitleLength = 200;

// ローカル変数: camelCase
var songTitle = "Sample";
```

### 非同期メソッド

```csharp
// Async suffix を付ける
public async Task<Song> GetSongAsync(Guid id)
{
    return await _context.Songs.FindAsync(id);
}

// CancellationToken を受け取る
public async Task<Song> GetSongAsync(Guid id, CancellationToken ct = default)
{
    return await _context.Songs.FindAsync(id, ct);
}
```

### LINQ

```csharp
// メソッド構文を推奨
var activeSongs = await _context.Songs
    .Where(s => s.Visibility == Visibility.Public)
    .OrderByDescending(s => s.UpdatedAt)
    .ToListAsync(ct);

// 複雑なクエリは改行して読みやすく
var result = await _context.Songs
    .Include(s => s.User)
    .Where(s => s.UserId == userId)
    .Select(s => new SongListItemDto(
        s.Id,
        s.Title,
        s.Artist,
        s.Key,
        s.UpdatedAt
    ))
    .ToListAsync(ct);
```

### DTO / Record

```csharp
// 不変データには record を使用
public record SongDto(
    Guid Id,
    string Title,
    string? Artist,
    DateTime UpdatedAt
);

// 可変データには class を使用
public class UpdateSongCommand
{
    public string Title { get; set; }
    public string? Artist { get; set; }
}
```

---

## Git コミットメッセージ

### 形式

```
<type>: <subject>

<body>（オプション）
```

### Type

| Type | 説明 |
|------|------|
| feat | 新機能 |
| fix | バグ修正 |
| docs | ドキュメント |
| style | コードスタイル（フォーマット等） |
| refactor | リファクタリング |
| test | テスト |
| chore | ビルド・CI 設定等 |

### 例

```
feat: 楽曲の共有リンク機能を追加

- SongShare エンティティを追加
- 共有トークン生成ロジックを実装
- 有効期限の検証機能を追加
```

```
fix: 楽曲更新時にUpdatedAtが更新されない問題を修正
```

---

## コメント

### いつ書くか

- 「なぜ」そうしたかを説明する場合
- 複雑なビジネスロジック
- TODO / FIXME / HACK

### いつ書かないか

- コードを読めば分かること
- 関数名や変数名で説明できること

```typescript
// Bad: コードを読めば分かる
// タイトルを取得する
const title = song.title

// Good: なぜそうするかを説明
// BPM が未設定の場合はデフォルト値を使用（メトロノーム機能で必要）
const bpm = song.bpm ?? 120
```

## 関連ドキュメント

- [Git運用ルール](./git-workflow.md)
- [テスト](./testing.md)
