'use client'

import { useEffect, useState } from 'react'
import { SongPreview } from '@/components/song/SongPreview'
import { songApi } from '@/lib/songApi'
import type { Song } from '@/types/song'

type ShareContentProps = {
  token: string
}

export const ShareContent = ({ token }: ShareContentProps) => {
  const [song, setSong] = useState<Song | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await songApi.get(token)
        setSong(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : '読み込みに失敗しました')
      }
    }
    load()
  }, [token])

  if (error) {
    return <div className="mt-6 text-sm text-red-600">{error}</div>
  }

  if (!song) {
    return <div className="mt-6 text-sm text-slate-500">読み込み中...</div>
  }

  return (
    <div className="mt-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-900">{song.title}</h2>
        <p className="text-sm text-slate-500">
          {song.artist || 'アーティスト未設定'} · Key {song.key || '-'}
        </p>
      </div>
      <SongPreview song={song} />
    </div>
  )
}
