'use client'

import { parseSectionContent } from '@/lib/sectionContent'
import type { BarLine, LyricsChordLine, Song } from '@/types/song'

type SongPreviewProps = {
  song: Song
  className?: string
}

export const SongPreview = ({ song, className }: SongPreviewProps) => {
  const clamp = (value: number, min = 0, max = 1) =>
    Math.min(max, Math.max(min, value))
  const toOffset = (position: number, lyrics: string) =>
    clamp(position / Math.max(lyrics.length, 1))

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
      <div className="space-y-4">
        {song.sections.map((section) => {
          const content = parseSectionContent(section.lines, section.type)
          const isBar = section.type === 'bar'
          return (
            <div
              key={section.id}
              className="rounded-2xl border border-slate-200 bg-white/80 p-4"
            >
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-slate-400">
                <span>{section.name}</span>
                <span>{section.type === 'lyrics-chord' ? 'Lyrics' : 'Bar'}</span>
              </div>
              <div className="mt-4 space-y-3">
                {content.lines.map((line) => {
                  if (isBar) {
                    const barLine = line as BarLine
                    const bars = barLine.bars ?? []
                    return (
                      <div key={barLine.id} className="space-y-1">
                        <div className="relative h-6">
                          {bars.map((bar, index) => (
                            <span
                              key={`${barLine.id}-${index}`}
                              className="absolute rounded-md bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-primary"
                              style={{
                                left: `${((index + 1) / (bars.length + 1)) * 100}%`,
                                transform: 'translateX(-50%)',
                              }}
                            >
                              {bar}
                            </span>
                          ))}
                        </div>
                      </div>
                    )
                  }

                  const lyricsLine = line as LyricsChordLine
                  return (
                    <div key={lyricsLine.id} className="space-y-1">
                      <div className="relative h-6">
                        {lyricsLine.chords.map((chord) => (
                          <span
                            key={chord.id}
                            className="absolute rounded-md bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-primary"
                            style={{
                              left: `${toOffset(chord.position, lyricsLine.lyrics) * 100}%`,
                              transform: 'translateX(-50%)',
                            }}
                          >
                            {chord.chord}
                          </span>
                        ))}
                      </div>
                      <div className="text-sm text-slate-700">
                        {lyricsLine.lyrics || '　'}
                      </div>
                    </div>
                  )
                })}
                {content.lines.length === 0 && (
                  <div className="text-sm text-slate-400">（未入力）</div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
