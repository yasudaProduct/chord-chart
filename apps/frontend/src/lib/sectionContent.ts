import { generateId } from '@/lib/utils'
import type {
  BarLine,
  ChordPosition,
  LyricsChordLine,
  Section,
  SectionLine,
  SectionType,
} from '@/types/song'

export type ChordBlock = {
  id: string
  chord: string
  position: number
}

export type LyricsLine = {
  id: string
  lyrics: string
  chords: ChordBlock[]
}

export type BarSectionLine = {
  id: string
  bars: string[]
}

export type SectionContent = {
  lines: Array<LyricsLine | BarSectionLine>
}

const normalizeChord = (chord: unknown) => (typeof chord === 'string' ? chord : '')

const normalizePosition = (position: unknown) => {
  const value =
    typeof position === 'number'
      ? position
      : typeof position === 'string'
        ? Number(position)
        : 0
  if (Number.isNaN(value) || !Number.isFinite(value)) return 0
  return Math.max(0, Math.floor(value))
}

const normalizeChordPosition = (chord: ChordPosition): ChordBlock => ({
  id: chord.id ?? generateId(),
  chord: normalizeChord(chord.chord),
  position: normalizePosition(chord.position),
})

const normalizeLyricsLine = (line: LyricsChordLine): LyricsLine => ({
  id: line.id ?? generateId(),
  lyrics: line.lyrics ?? '',
  chords: (line.chords ?? [])
    .map((chord) => normalizeChordPosition(chord))
    .sort((a, b) => a.position - b.position),
})

const normalizeBarLine = (line: BarLine): BarSectionLine => ({
  id: line.id ?? generateId(),
  bars: Array.isArray(line.bars) ? line.bars.filter((bar) => typeof bar === 'string') : [],
})

export const createEmptyLine = (type: SectionType): LyricsLine | BarSectionLine =>
  type === 'bar'
    ? { id: generateId(), bars: [] }
    : { id: generateId(), lyrics: '', chords: [] }

export const parseSectionContent = (
  lines: SectionLine[] | null | undefined,
  type: SectionType
): SectionContent => {
  const safeLines = Array.isArray(lines) ? lines : []
  if (type === 'bar') {
    return { lines: safeLines.map((line) => normalizeBarLine(line as BarLine)) }
  }
  return { lines: safeLines.map((line) => normalizeLyricsLine(line as LyricsChordLine)) }
}

export const createSection = (name: string, type: SectionType): Section => ({
  id: generateId(),
  name,
  type,
  lines: [createEmptyLine(type)],
})
