'use client'

import { useEffect, useMemo, useState } from 'react'
import { SongCard } from '@/components/song/SongCard'
import { SongSearchInput } from '@/components/song/SongSearchInput'
import { songApi } from '@/lib/songApi'
import type { SongListItem } from '@/types/song'

export const SongListContent = () => {
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
    <>
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
    </>
  )
}
