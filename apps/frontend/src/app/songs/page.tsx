'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { SiteHeader } from '@/components/SiteHeader'
import { songApi } from '@/lib/songApi'
import type { SongListItem } from '@/types/song'

const formatDate = (value: string) => {
  const date = new Date(value)
  return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(
    date.getDate()
  ).padStart(2, '0')}`
}

export default function SongsPage() {
  const [songs, setSongs] = useState<SongListItem[]>([])
  const [query, setQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await songApi.list()
        setSongs(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : '読み込みに失敗しました')
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  const filtered = useMemo(() => {
    if (!query.trim()) return songs
    const lower = query.toLowerCase()
    return songs.filter(
      (song) =>
        song.title.toLowerCase().includes(lower) ||
        (song.artist ?? '').toLowerCase().includes(lower) ||
        (song.key ?? '').toLowerCase().includes(lower)
    )
  }, [songs, query])

  const handleDelete = async (id: string) => {
    if (!confirm('この楽曲を削除しますか？')) return
    await songApi.remove(id)
    setSongs((prev) => prev.filter((song) => song.id !== id))
  }

  return (
    <main className="min-h-screen">
      <SiteHeader variant="app" />

      <section className="mx-auto w-full max-w-6xl px-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-semibold text-slate-900">
              楽曲一覧
            </h1>
            <p className="text-sm text-slate-500">
              直近の編集内容から一覧表示しています。
            </p>
          </div>
          <Link
            href="/songs/new"
            className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            + 新規作成
          </Link>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="曲名・アーティスト・キーで検索"
            className="w-full rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm outline-none transition focus:border-slate-400 md:w-80"
          />
          <span className="text-xs text-slate-500">
            {filtered.length} 件ヒット
          </span>
        </div>

        <div className="mt-8 grid gap-4">
          {isLoading ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white/60 p-8 text-center text-sm text-slate-500">
              読み込み中...
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-sm text-red-600">
              {error}
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white/60 p-8 text-center text-sm text-slate-500">
              まだ楽曲がありません。新規作成から始めましょう。
            </div>
          ) : (
            filtered.map((song) => (
              <div
                key={song.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/60 bg-white/80 p-5 shadow-[0_20px_50px_-40px_rgba(15,23,42,0.6)]"
              >
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    {song.title}
                  </h2>
                  <p className="text-sm text-slate-500">
                    {song.artist || 'アーティスト未設定'} · Key {song.key || '-'} · 更新{' '}
                    {formatDate(song.updatedAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Link
                    href={`/songs/${song.id}`}
                    className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:border-slate-400"
                  >
                    詳細
                  </Link>
                  <Link
                    href={`/editor/${song.id}`}
                    className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white transition hover:bg-slate-800"
                  >
                    編集
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(song.id)}
                    className="rounded-full border border-red-200 px-3 py-1 text-xs font-semibold text-red-600 transition hover:border-red-400"
                  >
                    削除
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  )
}
