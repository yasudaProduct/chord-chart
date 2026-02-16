# フロントエンド コンポーネント設計方針

本ドキュメントでは、ChordBook フロントエンドにおけるコンポーネント設計の原則・構造・分割方針を定義する。

## 1. 設計原則

### 1.1 単一責任原則 (Single Responsibility Principle)

各コンポーネントは **ひとつの役割** のみを持つ。UI の描画、状態管理、データ取得を同一コンポーネント内で行わない。

### 1.2 Presentational / Container 分離

| 区分 | 役割 | 特徴 |
|------|------|------|
| **Presentational** | UIの描画に専念 | Props を受け取り JSX を返す。状態・副作用を持たない |
| **Container** | ロジック・状態管理 | カスタムフック・ストアを通じてデータを取得し Presentational に渡す |

Page コンポーネント（`app/*/page.tsx`）が Container の役割を担い、`components/` 内のコンポーネントは原則 Presentational とする。

### 1.3 Composition（合成）

Props でコンポーネントをカスタマイズするのではなく、小さなコンポーネントを合成して複雑な UI を構築する。`children` や Render Props を活用する。

### 1.4 コロケーション

関連するコンポーネント・フック・型定義は **同じディレクトリに配置** する。機能をまたぐ共有コンポーネントのみ上位ディレクトリに昇格させる。

### 1.5 Props の型安全性

- すべてのコンポーネントに明示的な Props 型を定義する
- `type` を使用し、`ComponentNameProps` の命名規則に従う
- コールバック Props は `onXxx` で統一する

```typescript
type SectionEditorProps = {
  section: Section
  onUpdate: (section: Section) => void
  onDelete: (sectionId: string) => void
}
```

## 2. ディレクトリ構成

```
src/
├── app/                          # Next.js App Router（Container 層）
│   ├── layout.tsx
│   ├── page.tsx
│   ├── login/page.tsx
│   ├── register/page.tsx
│   ├── songs/
│   │   ├── page.tsx
│   │   ├── [id]/page.tsx
│   │   └── new/page.tsx
│   ├── editor/[id]/page.tsx
│   ├── search/page.tsx
│   ├── profile/page.tsx
│   └── share/[token]/page.tsx
│
├── components/                   # Presentational コンポーネント
│   ├── ui/                       # 汎用UIプリミティブ
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   ├── Toggle.tsx
│   │   ├── Dialog.tsx
│   │   └── Toast.tsx
│   │
│   ├── layout/                   # レイアウトコンポーネント
│   │   └── SiteHeader.tsx
│   │
│   ├── song/                     # 楽曲関連コンポーネント
│   │   ├── SongPreview.tsx
│   │   ├── SongCard.tsx
│   │   └── SongSearchInput.tsx
│   │
│   └── editor/                   # エディタ機能コンポーネント
│       ├── EditorHeader.tsx
│       ├── MetadataPanel.tsx
│       ├── SectionEditor.tsx
│       ├── SectionHeader.tsx
│       ├── LineEditor.tsx
│       ├── ChordRow.tsx
│       ├── ChordDialog.tsx
│       ├── PreviewPanel.tsx
│       └── SectionAddButtons.tsx
│
├── hooks/                        # カスタムフック
│   ├── useEditorActions.ts
│   ├── useChordDrag.ts
│   └── useSectionDrag.ts
│
├── stores/                       # Zustand ストア
│   ├── authStore.ts
│   └── editorStore.ts
│
├── lib/                          # ユーティリティ・API
│   ├── api.ts
│   ├── songApi.ts
│   ├── sectionContent.ts
│   ├── mockSongs.ts
│   └── utils.ts
│
├── types/                        # 型定義
│   ├── api.ts
│   └── song.ts
│
└── styles/
    └── globals.css
```

## 3. コンポーネント分類

### 3.1 UIプリミティブ (`components/ui/`)

アプリ全体で再利用される最小単位のUIコンポーネント。ビジネスロジックを一切含まない。

| コンポーネント | 責務 | Props 概要 |
|---------------|------|-----------|
| `Button` | ボタン描画 | `variant`, `size`, `disabled`, `onClick`, `children` |
| `Input` | テキスト入力 | `label`, `value`, `onChange`, `placeholder`, `type` |
| `Select` | セレクトボックス | `label`, `value`, `onChange`, `options` |
| `Toggle` | ON/OFF 切替 | `checked`, `onChange`, `label` |
| `Dialog` | モーダルダイアログ | `open`, `onClose`, `position`, `children` |
| `Toast` | 一時的な通知メッセージ | `message`, `visible` |

### 3.2 レイアウトコンポーネント (`components/layout/`)

ページ共通のレイアウト構造を提供する。

| コンポーネント | 責務 |
|---------------|------|
| `SiteHeader` | ナビゲーションヘッダー（`variant: 'public' \| 'app'`） |

### 3.3 楽曲コンポーネント (`components/song/`)

楽曲の表示・一覧に関するコンポーネント。

| コンポーネント | 責務 | 使用箇所 |
|---------------|------|---------|
| `SongPreview` | 楽曲の読み取り専用プレビュー | 楽曲詳細、共有ページ |
| `SongCard` | 一覧での楽曲カード表示 | 楽曲一覧、検索結果 |
| `SongSearchInput` | 検索入力フィールド + ヒット件数表示 | 楽曲一覧、検索ページ |

### 3.4 エディタコンポーネント (`components/editor/`)

エディタページの各領域を個別コンポーネントに分割する。

| コンポーネント | 責務 | 行数目安 |
|---------------|------|---------|
| `EditorHeader` | ツールバー（保存・共有・印刷・プレビュー切替） | ~70行 |
| `MetadataPanel` | 曲名・アーティスト・キー・BPM・拍子の入力 | ~70行 |
| `SectionEditor` | 1つのセクション全体（ヘッダー + 行リスト） | ~50行 |
| `SectionHeader` | セクション名・タイプ切替・操作ボタン群 | ~70行 |
| `LineEditor` | 1行分（コード配置エリア + 歌詞入力） | ~40行 |
| `ChordRow` | コード配置エリア（クリックで追加、ドラッグで移動） | ~40行 |
| `ChordDialog` | コード入力ダイアログ（候補・予測・代理コード） | ~100行 |
| `PreviewPanel` | 右側プレビューパネル | ~60行 |
| `SectionAddButtons` | セクション追加プリセットボタン群 | ~40行 |

## 4. エディタ分割の詳細設計

現在の `editor/[id]/page.tsx`（1013行）を以下のように分割する。

### 4.1 コンポーネント階層

```
EditorPage (app/editor/[id]/page.tsx)  ← Container（データ取得・ストア接続）
├── EditorHeader                        ← ツールバー
├── MetadataPanel                       ← メタデータ入力
├── SectionEditor[]                     ← セクション毎にループ
│   ├── SectionHeader                   ← セクション操作
│   ├── LineEditor[]                    ← 行毎にループ
│   │   ├── ChordRow                    ← コード配置
│   │   └── <input>（歌詞入力）
│   └── 「行を追加」ボタン
├── SectionAddButtons                   ← セクション追加
├── PreviewPanel                        ← 右側プレビュー
├── ChordDialog                         ← コード入力（条件表示）
└── Toast                               ← 共有メッセージ（条件表示）
```

### 4.2 状態管理方針

`editorStore`（Zustand）をエディタ状態の一元管理に使用する。

```typescript
interface EditorState {
  // データ
  song: Song | null
  // UI状態
  isPreviewVisible: boolean
  isDirty: boolean
  isSaving: boolean
  dialog: ChordDialogState | null
  shareMessage: string
  // アクション
  setSong: (song: Song) => void
  updateSong: (updater: (song: Song) => Song) => void
  updateSection: (sectionId: string, updater: (section: Section) => Section) => void
  setDirty: (dirty: boolean) => void
  setSaving: (saving: boolean) => void
  setDialog: (dialog: ChordDialogState | null) => void
  setShareMessage: (message: string) => void
  togglePreview: () => void
}
```

### 4.3 カスタムフック

| フック | 責務 | 依存 |
|--------|------|------|
| `useEditorActions` | 楽曲・セクション・行・コードの CRUD 操作 | `editorStore` |
| `useChordDrag` | コードブロックのドラッグ＆ドロップ | `editorStore`, PointerEvent |
| `useSectionDrag` | セクションのドラッグ並び替え | `editorStore`, DragEvent |

### 4.4 データフロー

```
editorStore (Zustand)
    │
    ├── EditorPage（useEffect で songApi.get → setSong）
    │
    ├── useEditorActions（updateSong / updateSection / addChord / ...）
    │   └── 各子コンポーネントのコールバック Props 経由で呼び出し
    │
    ├── useChordDrag（PointerEvent → updateChordOffset）
    │   └── ChordRow の onPointerDown から開始
    │
    └── useSectionDrag（DragEvent → セクション並び替え）
        └── SectionHeader の draggable から開始
```

## 5. Props 設計一覧

### EditorHeader

```typescript
type EditorHeaderProps = {
  title: string
  isDirty: boolean
  isSaving: boolean
  isPreview: boolean
  onSave: () => void
  onShare: () => void
  onPrint: () => void
  onTogglePreview: () => void
  onBack: () => void
}
```

### MetadataPanel

```typescript
type MetadataPanelProps = {
  song: Song
  onChange: (field: keyof SongMeta, value: string | number | undefined) => void
}
```

### SectionEditor

```typescript
type SectionEditorProps = {
  section: Section
  index: number
  totalSections: number
  onUpdate: (updater: (section: Section) => Section) => void
  onDuplicate: () => void
  onMove: (direction: -1 | 1) => void
  onDelete: () => void
  onAddLine: () => void
  onChordRowClick: (event: React.MouseEvent, lineId: string) => void
  onChordPointerDown: (event: React.PointerEvent, lineId: string, chord: ChordBlock) => void
  onLineLyricsChange: (lineId: string, lyrics: string) => void
  isDragging: boolean
  onDragStart: (event: React.DragEvent) => void
  onDragOver: (event: React.DragEvent) => void
  onDragEnd: () => void
}
```

### ChordDialog

```typescript
type ChordDialogProps = {
  state: ChordDialogState
  onValueChange: (value: string) => void
  onConfirm: () => void
  onDelete: () => void
  onClose: () => void
}
```

### PreviewPanel

```typescript
type PreviewPanelProps = {
  song: Song
}
```

### SectionAddButtons

```typescript
type SectionAddButtonsProps = {
  onAddSection: (name: string, type: SectionType) => void
  hasSections: boolean
}
```

## 6. 命名規則

| 対象 | 規則 | 例 |
|------|------|-----|
| コンポーネントファイル | PascalCase | `SectionEditor.tsx` |
| カスタムフック | `use` + PascalCase | `useEditorActions.ts` |
| Props 型 | コンポーネント名 + `Props` | `SectionEditorProps` |
| コールバック Props | `on` + 動詞 | `onUpdate`, `onDelete` |
| 状態更新 Props | `is` / `has` + 形容詞 | `isDirty`, `hasSections` |

## 7. 実装ガイドライン

### 7.1 コンポーネントの書き方

```typescript
'use client'

import { cn } from '@/lib/utils'

type ExampleProps = {
  title: string
  isActive: boolean
  onAction: () => void
}

export const Example = ({ title, isActive, onAction }: ExampleProps) => {
  return (
    <div className={cn('base-class', isActive && 'active-class')}>
      <h2>{title}</h2>
      <button type="button" onClick={onAction}>
        アクション
      </button>
    </div>
  )
}
```

### 7.2 カスタムフックの書き方

```typescript
import { useCallback } from 'react'
import { useEditorStore } from '@/stores/editorStore'

export const useEditorActions = () => {
  const { updateSong } = useEditorStore()

  const addSection = useCallback(
    (name: string, type: SectionType) => {
      updateSong((prev) => ({
        ...prev,
        sections: [...prev.sections, createSection(name, type)],
      }))
    },
    [updateSong]
  )

  return { addSection }
}
```

### 7.3 インポート順序

```typescript
// 1. React / Next.js
import { useState, useCallback } from 'react'
import Link from 'next/link'

// 2. 外部ライブラリ（なし or 最小限）

// 3. 内部モジュール
import { cn } from '@/lib/utils'
import { useEditorStore } from '@/stores/editorStore'

// 4. コンポーネント
import { Button } from '@/components/ui/Button'
import { SectionEditor } from '@/components/editor/SectionEditor'

// 5. 型定義
import type { Song, Section } from '@/types/song'
```

## 8. 関連ドキュメント

- [フロントエンドアーキテクチャ](./frontend.md) - 技術スタック・全体構成
- [コーディング規約](../development/coding-standards.md) - コード規約詳細
- [画面仕様](../ui/screens.md) - UI 仕様
