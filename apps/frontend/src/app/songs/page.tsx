'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { SongCard } from '@/components/song/SongCard'
import { SongSearchInput } from '@/components/song/SongSearchInput'
import { songApi } from '@/lib/songApi'
import type { SongListItem } from '@/types/song'

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

        <SongSearchInput
          query={query}
          onChange={setQuery}
          resultCount={filtered.length}
        />

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
              <SongCard key={song.id} song={song} onDelete={handleDelete} />
            ))
          )}
        </div>
      </section>
    </main>
  )
}
