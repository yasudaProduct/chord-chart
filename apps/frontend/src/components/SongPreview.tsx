'use client'

import type { Section, Song } from '@/types/song'

type SongPreviewProps = {
  song: Song
  className?: string
}

const renderSection = (section: Section) => (
  <div key={section.id} className="rounded-2xl border border-slate-200 bg-white/80 p-4">
    <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-slate-400">
      <span>{section.name}</span>
      <span>{section.type === 'lyrics-chord' ? 'Lyrics' : 'Bars'}</span>
    </div>
    <pre className="mt-3 whitespace-pre-wrap font-mono text-sm text-slate-700">
      {section.content || '（未入力）'}
    </pre>
  </div>
)

export const SongPreview = ({ song, className }: SongPreviewProps) => {
  if (song.sections.length === 0) {
    return (
      <div
        className={`rounded-2xl border border-dashed border-slate-200 bg-white/60 p-6 text-center text-sm text-slate-500 ${
          className ?? ''
        }`}
      >
        まだセクションがありません。
      </div>
    )
  }
  return (
    <div className={className}>
      <div className="space-y-4">{song.sections.map(renderSection)}</div>
    </div>
  )
}
