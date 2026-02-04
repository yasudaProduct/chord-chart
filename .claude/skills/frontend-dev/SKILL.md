---
name: frontend-dev
description: Next.js 14 + TypeScript + Tailwind CSS + Zustand を使ったフロントエンド開発。コンポーネント作成、ページ実装、状態管理、スタイリングの際に使用。
---

# フロントエンド開発スキル

ChordBook フロントエンド開発のためのガイドラインです。

## 技術スタック
- **フレームワーク:** Next.js 14 (App Router)
- **言語:** TypeScript
- **スタイリング:** Tailwind CSS
- **状態管理:** Zustand
- **ユーティリティ:** clsx, tailwind-merge

## ディレクトリ構造

```
apps/frontend/src/
├── app/          # Next.js App Router (ページ・レイアウト)
├── lib/          # API通信、ユーティリティ
├── stores/       # Zustand ストア
└── types/        # TypeScript型定義
```

## コーディング規約

### コンポーネント
- **命名:** PascalCase
- **形式:** 関数コンポーネント（アロー関数）
- **インデント:** スペース2

```typescript
// 良い例
const MyComponent = ({ title, onClick }: MyComponentProps) => {
  return (
    <div className="p-4">
      <h1>{title}</h1>
      <button onClick={onClick}>Click</button>
    </div>
  );
};
```

### インポート順序
1. React/Next.js
2. 外部ライブラリ
3. 内部モジュール (@/ エイリアス)
4. 型定義
5. 相対パス

```typescript
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { clsx } from 'clsx';
import { useAuthStore } from '@/stores/authStore';
import type { User } from '@/types';
import { formatDate } from './utils';
```

### Zustand ストア

```typescript
import { create } from 'zustand';

interface EditorState {
  currentSong: Song | null;
  setCurrentSong: (song: Song) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  currentSong: null,
  setCurrentSong: (song) => set({ currentSong: song }),
}));
```

### Tailwind CSS
- ユーティリティクラスを直接使用
- 複雑な条件付きスタイルには `clsx` + `tailwind-merge` を使用

```typescript
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

<button className={cn('px-4 py-2', isActive && 'bg-blue-500')}>
```

## コマンド

```bash
cd apps/frontend
pnpm dev          # 開発サーバー起動 (localhost:3000)
pnpm build        # 本番ビルド
pnpm lint         # ESLint実行
pnpm lint --fix   # ESLint自動修正
```

## 型定義

`types/` ディレクトリに共通の型を定義：

```typescript
// types/song.ts
export interface Song {
  id: string;
  title: string;
  artist: string;
  key: string;
  bpm: number;
  sections: Section[];
}
```
