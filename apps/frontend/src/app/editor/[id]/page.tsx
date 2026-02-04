'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { SiteHeader } from '@/components/SiteHeader'
import { SongPreview } from '@/components/SongPreview'
import { songApi } from '@/lib/songApi'
import { generateId, KEYS, SECTION_PRESETS, TIME_SIGNATURES } from '@/lib/utils'
import type { Section, SectionType, Song } from '@/types/song'

const CHORD_SUGGESTIONS = ['C', 'Dm', 'Em', 'F', 'G', 'Am', 'Bm7b5', 'F#m7']

const createSection = (name = 'セクション', type: SectionType = 'lyrics-chord'): Section => ({
  id: generateId(),
  name,
  type,
  content: '',
})

export default function EditorPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const [song, setSong] = useState<Song | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isPreview, setIsPreview] = useState(true)
  const [isDirty, setIsDirty] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await songApi.get(params.id)
        setSong(data)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [params.id])

  const handleMetaChange = (field: keyof Song, value: string | number | undefined) => {
    setSong((prev) => (prev ? { ...prev, [field]: value } : prev))
    setIsDirty(true)
  }

  const handleSectionChange = (id: string, updates: Partial<Section>) => {
    setSong((prev) =>
      prev
        ? {
            ...prev,
            sections: prev.sections.map((section) =>
              section.id === id ? { ...section, ...updates } : section
            ),
          }
        : prev
    )
    setIsDirty(true)
  }

  const moveSection = (index: number, direction: -1 | 1) => {
    setSong((prev) => {
      if (!prev) return prev
      const next = [...prev.sections]
      const target = index + direction
      if (target < 0 || target >= next.length) return prev
      const [removed] = next.splice(index, 1)
      next.splice(target, 0, removed)
      return { ...prev, sections: next }
    })
    setIsDirty(true)
  }

  const deleteSection = (id: string) => {
    setSong((prev) =>
      prev ? { ...prev, sections: prev.sections.filter((section) => section.id !== id) } : prev
    )
    setIsDirty(true)
  }

  const addSection = (name: string, type: SectionType) => {
    setSong((prev) =>
      prev ? { ...prev, sections: [...prev.sections, createSection(name, type)] } : prev
    )
    setIsDirty(true)
  }

  const handleSave = async () => {
    if (!song) return
    setIsSaving(true)
    try {
      const updated = await songApi.update(song.id, song)
      setSong(updated)
      setIsDirty(false)
    } finally {
      setIsSaving(false)
    }
  }

  const hasSections = useMemo(() => (song?.sections.length ?? 0) > 0, [song])

  if (isLoading) {
    return (
      <main className="min-h-screen">
        <SiteHeader variant="app" />
        <div className="mx-auto max-w-4xl px-6 py-16 text-sm text-slate-500">
          読み込み中...
        </div>
      </main>
    )
  }

  if (!song) {
    return (
      <main className="min-h-screen">
        <SiteHeader variant="app" />
        <div className="mx-auto max-w-4xl px-6 py-16 text-sm text-slate-500">
          楽曲が見つかりませんでした。
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen">
      <SiteHeader variant="app" />

      <section className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-6 py-10 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <div className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-[0_30px_80px_-50px_rgba(15,23,42,0.5)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="font-display text-2xl font-semibold text-slate-900">
                  エディタ
                </h1>
                <p className="text-sm text-slate-500">
                  {isDirty ? '未保存の変更があります' : 'すべて保存済み'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPreview((prev) => !prev)}
                  className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:border-slate-400"
                >
                  {isPreview ? 'プレビューを隠す' : 'プレビューを表示'}
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
                >
                  {isSaving ? '保存中...' : '保存'}
                </button>
                <button
                  type="button"
                  onClick={() => router.push(`/songs/${song.id}`)}
                  className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:border-slate-400"
                >
                  詳細へ
                </button>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <label className="text-sm text-slate-600">
                曲名
                <input
                  type="text"
                  value={song.title}
                  onChange={(event) => handleMetaChange('title', event.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                />
              </label>
              <label className="text-sm text-slate-600">
                アーティスト
                <input
                  type="text"
                  value={song.artist ?? ''}
                  onChange={(event) => handleMetaChange('artist', event.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                />
              </label>
              <label className="text-sm text-slate-600">
                キー
                <select
                  value={song.key || 'C'}
                  onChange={(event) => handleMetaChange('key', event.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                >
                  {KEYS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm text-slate-600">
                BPM
                <input
                  type="number"
                  value={song.bpm ?? ''}
                  onChange={(event) =>
                    handleMetaChange(
                      'bpm',
                      event.target.value === '' ? undefined : Number(event.target.value)
                    )
                  }
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                  min={40}
                  max={240}
                />
              </label>
              <label className="text-sm text-slate-600">
                拍子
                <select
                  value={song.timeSignature}
                  onChange={(event) => handleMetaChange('timeSignature', event.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                >
                  {TIME_SIGNATURES.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <div className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-[0_30px_80px_-50px_rgba(15,23,42,0.5)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-lg font-semibold text-slate-900">
                  セクション
                </h2>
                <p className="text-sm text-slate-500">
                  歌詞+コード形式と小節形式を切り替えられます。
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {SECTION_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => addSection(preset, 'lyrics-chord')}
                    className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:border-slate-400"
                  >
                    {preset}追加
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => addSection('小節', 'bar')}
                  className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white transition hover:bg-slate-800"
                >
                  小節追加
                </button>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {!hasSections && (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white/60 p-6 text-center text-sm text-slate-500">
                  セクションを追加して編集を開始してください。
                </div>
              )}
              {song.sections.map((section, index) => (
                <div
                  key={section.id}
                  className="rounded-2xl border border-slate-200 bg-white/80 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        type="text"
                        value={section.name}
                        onChange={(event) =>
                          handleSectionChange(section.id, { name: event.target.value })
                        }
                        className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                      />
                      <select
                        value={section.type}
                        onChange={(event) =>
                          handleSectionChange(section.id, {
                            type: event.target.value as SectionType,
                          })
                        }
                        className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600"
                      >
                        <option value="lyrics-chord">歌詞+コード</option>
                        <option value="bar">小節</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <button
                        type="button"
                        onClick={() => moveSection(index, -1)}
                        className="rounded-full border border-slate-200 px-2 py-1 transition hover:border-slate-400"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => moveSection(index, 1)}
                        className="rounded-full border border-slate-200 px-2 py-1 transition hover:border-slate-400"
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteSection(section.id)}
                        className="rounded-full border border-red-200 px-2 py-1 text-red-600 transition hover:border-red-400"
                      >
                        削除
                      </button>
                    </div>
                  </div>

                  <textarea
                    value={section.content}
                    onChange={(event) =>
                      handleSectionChange(section.id, { content: event.target.value })
                    }
                    className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 font-mono text-sm text-slate-700 outline-none transition focus:border-slate-400"
                    rows={section.type === 'bar' ? 3 : 4}
                    placeholder={
                      section.type === 'bar'
                        ? '| C | G | Am | F |'
                        : 'C        G        Am       F\nきょうも いちにち がんばった'
                    }
                  />

                  <div className="mt-3 flex flex-wrap gap-2">
                    {CHORD_SUGGESTIONS.map((chord) => (
                      <button
                        key={chord}
                        type="button"
                        onClick={() =>
                          handleSectionChange(section.id, {
                            content: section.content
                              ? `${section.content} ${chord}`.trim()
                              : chord,
                          })
                        }
                        className="rounded-full border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-600 transition hover:border-slate-400"
                      >
                        {chord}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          {isPreview && (
            <div className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-[0_30px_80px_-50px_rgba(15,23,42,0.5)]">
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-slate-400">
                <span>Live Preview</span>
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] text-amber-700">
                  Draft
                </span>
              </div>
              <div className="mt-4">
                <SongPreview song={song} />
              </div>
            </div>
          )}
          <div className="rounded-3xl border border-white/60 bg-white/80 p-6 text-sm text-slate-600 shadow-[0_30px_80px_-50px_rgba(15,23,42,0.5)]">
            <h3 className="font-display text-base font-semibold text-slate-900">
              入力サポート
            </h3>
            <p className="mt-2">
              セクションごとにコード候補をタップして追加できます。後から自由に編集してください。
            </p>
          </div>
        </aside>
      </section>
    </main>
  )
}
