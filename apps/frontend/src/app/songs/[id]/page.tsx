'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { SongPreview } from '@/components/song/SongPreview'
import { songApi } from '@/lib/songApi'
import type { Song } from '@/types/song'

export default function SongDetailPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const [song, setSong] = useState<Song | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await songApi.get(params.id)
        setSong(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : '読み込みに失敗しました')
      }
    }
    load()
  }, [params.id])

  if (error) {
    return (
      <main className="min-h-screen">
        <SiteHeader variant="app" />
        <div className="mx-auto max-w-4xl px-6 py-16 text-sm text-red-600">
          {error}
        </div>
      </main>
    )
  }

  if (!song) {
    return (
      <main className="min-h-screen">
        <SiteHeader variant="app" />
        <div className="mx-auto max-w-4xl px-6 py-16 text-sm text-slate-500">
          読み込み中...
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen">
      <SiteHeader variant="app" />
      <section className="mx-auto max-w-4xl px-6 py-10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-semibold text-slate-900">
              {song.title}
            </h1>
            <p className="text-sm text-slate-500">
              {song.artist || 'アーティスト未設定'} · Key {song.key || '-'} · BPM{' '}
              {song.bpm ?? '-'} · {song.timeSignature}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 print:hidden">
            <Link
              href={`/editor/${song.id}`}
              className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
            >
              編集
            </Link>
            <button
              type="button"
              onClick={() => window.print()}
              className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-400"
            >
              印刷
            </button>
            <button
              type="button"
              onClick={() => router.push('/songs')}
              className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-400"
            >
              一覧へ戻る
            </button>
          </div>
        </div>

        <div className="mt-8 rounded-3xl border border-white/60 bg-white/80 p-6 shadow-[0_30px_80px_-50px_rgba(15,23,42,0.5)] print:border-none print:bg-white print:shadow-none">
          <SongPreview song={song} />
        </div>
      </section>
    </main>
  )
}
