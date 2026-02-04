import { generateId } from '@/lib/utils'
import type { Section, SectionType } from '@/types/song'

export type ChordBlock = {
  id: string
  chord: string
  offset: number
}

export type SectionLine = {
  id: string
  lyrics: string
  chords: ChordBlock[]
}

export type SectionContent = {
  lines: SectionLine[]
}

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value))

const normalizeChord = (chord: unknown) => (typeof chord === 'string' ? chord : '')

const normalizeOffset = (offset: unknown) => {
  if (typeof offset === 'number') return clamp(offset)
  if (typeof offset === 'string') {
    const parsed = Number(offset)
    return Number.isNaN(parsed) ? 0 : clamp(parsed)
  }
  return 0
}

const normalizeLine = (line: Partial<SectionLine>): SectionLine => ({
  id: line.id ?? generateId(),
  lyrics: line.lyrics ?? '',
  chords: (line.chords ?? []).map((chord) => ({
    id: chord.id ?? generateId(),
    chord: normalizeChord(chord.chord),
    offset: normalizeOffset(chord.offset),
  })),
})

const parseLegacyContent = (content: string): SectionLine[] => {
  const rows = content.split('\n')
  const result: SectionLine[] = []

  for (let index = 0; index < rows.length; index += 2) {
    const chordLine = rows[index] ?? ''
    const lyricLine = rows[index + 1] ?? ''
    if (!chordLine.trim() && !lyricLine.trim()) continue

    const chords: ChordBlock[] = []
    const tokens = chordLine.split(/\s+/).filter(Boolean)
    let searchFrom = 0
    const maxLen = Math.max(chordLine.length, lyricLine.length, 20)

    tokens.forEach((token) => {
      const found = chordLine.indexOf(token, searchFrom)
      const startIndex = found === -1 ? searchFrom : found
      const offset = clamp(startIndex / maxLen)
      chords.push({ id: generateId(), chord: token, offset })
      searchFrom = startIndex + token.length
    })

    result.push({
      id: generateId(),
      lyrics: lyricLine,
      chords,
    })
  }

  return result
}

export const createEmptyLine = (): SectionLine => ({
  id: generateId(),
  lyrics: '',
  chords: [],
})

export const parseSectionContent = (content: string | null | undefined): SectionContent => {
  if (!content) {
    return { lines: [] }
  }

  const trimmed = content.trim()
  if (trimmed.startsWith('{')) {
    try {
      const parsed = JSON.parse(trimmed) as Partial<SectionContent>
      if (parsed && Array.isArray(parsed.lines)) {
        return {
          lines: parsed.lines.map((line) => normalizeLine(line)).map((line) => ({
            ...line,
            chords: line.chords.slice().sort((a, b) => a.offset - b.offset),
          })),
        }
      }
    } catch {
      return { lines: parseLegacyContent(content) }
    }
  }

  return { lines: parseLegacyContent(content) }
}

export const serializeSectionContent = (lines: SectionLine[]): string => {
  return JSON.stringify({
    lines: lines.map((line) => ({
      id: line.id,
      lyrics: line.lyrics,
      chords: line.chords.map((chord) => ({
        id: chord.id,
        chord: chord.chord,
        offset: clamp(chord.offset),
      })),
    })),
  })
}

export const createSection = (name: string, type: SectionType): Section => ({
  id: generateId(),
  name,
  type,
  content: serializeSectionContent([createEmptyLine()]),
})
