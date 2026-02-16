'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { SongPreview } from '@/components/song/SongPreview'
import { songApi } from '@/lib/songApi'
import type { Song } from '@/types/song'

export default function SharePage() {
  const params = useParams<{ token: string }>()
  const [song, setSong] = useState<Song | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await songApi.get(params.token)
        setSong(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : '読み込みに失敗しました')
      }
    }
    load()
  }, [params.token])

  return (
    <main className="min-h-screen">
      <SiteHeader variant="public" />
      <section className="mx-auto max-w-4xl px-6 py-10">
        <div className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-[0_30px_80px_-50px_rgba(15,23,42,0.5)]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl font-semibold text-slate-900">
                共有コード譜
              </h1>
              <p className="text-sm text-slate-500">
                このページはURL共有で閲覧できる想定です（MVP）。
              </p>
            </div>
            <Link
              href="/login"
              className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-400"
            >
              ログインして編集
            </Link>
          </div>

          {error ? (
            <div className="mt-6 text-sm text-red-600">{error}</div>
          ) : !song ? (
            <div className="mt-6 text-sm text-slate-500">読み込み中...</div>
          ) : (
            <div className="mt-6">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-slate-900">
                  {song.title}
                </h2>
                <p className="text-sm text-slate-500">
                  {song.artist || 'アーティスト未設定'} · Key {song.key || '-'}
                </p>
              </div>
              <SongPreview song={song} />
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
