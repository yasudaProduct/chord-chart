export type SectionType = 'lyrics-chord' | 'bar'

export interface ChordPosition {
  chord: string
  position: number // Character position in lyrics
}

export interface LyricsChordLine {
  lyrics: string
  chords: ChordPosition[]
}

export interface BarLine {
  bars: string[] // Array of chord names per bar
}

export interface Section {
  id: string
  name: string
  type: SectionType
  lines: LyricsChordLine[] | BarLine[]
}

export interface SongMeta {
  title: string
  artist: string
  key: string
  bpm: number
  timeSignature: string
}

export interface Song extends SongMeta {
  id: string
  sections: Section[]
  createdAt: string
  updatedAt: string
}

export interface SongListItem {
  id: string
  title: string
  artist: string
  key: string
  updatedAt: string
}
