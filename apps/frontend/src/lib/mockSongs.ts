import type {
  BarLine,
  ChordPosition,
  LyricsChordLine,
  Song,
  SongListItem,
  SongMeta,
  SongVisibility,
} from '@/types/song'
import type { PaginatedResponse } from '@/types/api'

const STORAGE_KEY = 'chordbook:songs'

const nowIso = () => new Date().toISOString()

const createId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `song_${Math.random().toString(36).slice(2, 10)}`
}

const safeParse = <T>(value: string | null, fallback: T): T => {
  if (!value) return fallback
  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

const toPosition = (offset: number, lyrics: string) =>
  Math.max(0, Math.round(offset * Math.max(lyrics.length, 1)))

const createLyricsLine = (
  lyrics: string,
  chords: Array<{ chord: string; offset: number }>
): LyricsChordLine => ({
  id: createId(),
  lyrics,
  chords: chords.map((item) => ({
    id: createId(),
    chord: item.chord,
    position: toPosition(item.offset, lyrics),
  })),
})

const createBarLine = (bars: string[]): BarLine => ({
  id: createId(),
  bars,
})

const normalizeChordPositions = (
  chords: Array<{ chord?: string; position?: number | string }> | undefined
): ChordPosition[] =>
  (chords ?? []).map((item) => ({
    id: createId(),
    chord: typeof item.chord === 'string' ? item.chord : '',
    position:
      typeof item.position === 'number'
        ? Math.max(0, Math.floor(item.position))
        : typeof item.position === 'string'
          ? Math.max(0, Math.floor(Number(item.position)))
          : 0,
  }))

const normalizeStoredSongs = (songs: Song[]): Song[] =>
  songs.map((song) => ({
    ...song,
    sections: song.sections.map((section) => {
      if ('lines' in section && Array.isArray(section.lines)) {
        if (section.type === 'bar') {
          return {
            ...section,
            lines: section.lines.map((line) => ({
              id: line.id ?? createId(),
              bars: Array.isArray((line as BarLine).bars)
                ? (line as BarLine).bars.filter((bar) => typeof bar === 'string')
                : [],
            })),
          }
        }
        return {
          ...section,
          lines: section.lines.map((line) => ({
            id: line.id ?? createId(),
            lyrics: (line as LyricsChordLine).lyrics ?? '',
            chords: normalizeChordPositions((line as LyricsChordLine).chords),
          })),
        }
      }
      if (!('content' in section)) return section
      const legacyContent = (section as { content?: string }).content
      if (typeof legacyContent !== 'string') return section
      try {
        const parsed = JSON.parse(legacyContent) as {
          lines?: Array<{
            lyrics?: string
            chords?: Array<{ chord?: string; offset?: number }>
          }>
        }
        const lines = (parsed.lines ?? []).map((line) => {
          const lyrics = line.lyrics ?? ''
          const legacyChords = line.chords ?? []
          const chords = legacyChords.map((item) => ({
            id: createId(),
            chord: typeof item.chord === 'string' ? item.chord : '',
            position: toPosition(item.offset ?? 0, lyrics),
          }))
          return { id: createId(), lyrics, chords }
        })
        if ((section as { type: string }).type === 'chord-only') {
          return {
            ...section,
            type: 'bar',
            lines: [
              {
                id: createId(),
                bars: lines.flatMap((line) =>
                  line.chords.map((chord) => chord.chord)
                ),
              },
            ],
          }
        }
        return {
          ...section,
          type: 'lyrics-chord',
          lines,
        }
      } catch {
        return {
          ...section,
          type: 'lyrics-chord',
          lines: [{ id: createId(), lyrics: '', chords: [] }],
        }
      }
    }),
  }))

const seedSongs = (): Song[] => [
  {
    id: createId(),
    title: '夜のグルーヴ',
    artist: 'ChordBook',
    key: 'Am',
    bpm: 96,
    timeSignature: '4/4',
    visibility: 'private',
    sections: [
      {
        id: createId(),
        name: 'Intro',
        type: 'bar',
        lines: [
          createBarLine(['Am', 'F', 'C', 'G']),
        ],
      },
      {
        id: createId(),
        name: 'Aメロ',
        type: 'lyrics-chord',
        lines: [
          createLyricsLine('夜の風が うたう', [
            { chord: 'Am', offset: 0.05 },
            { chord: 'F', offset: 0.35 },
            { chord: 'C', offset: 0.6 },
            { chord: 'G', offset: 0.85 },
          ]),
        ],
      },
    ],
    createdAt: nowIso(),
    updatedAt: nowIso(),
  },
  {
    id: createId(),
    title: 'Sunrise Road',
    artist: 'Demo Band',
    key: 'C',
    bpm: 120,
    timeSignature: '4/4',
    visibility: 'public',
    sections: [
      {
        id: createId(),
        name: 'Chorus',
        type: 'lyrics-chord',
        lines: [
          createLyricsLine('Shine on, shine on', [
            { chord: 'C', offset: 0.05 },
            { chord: 'G', offset: 0.35 },
            { chord: 'Am', offset: 0.6 },
            { chord: 'F', offset: 0.85 },
          ]),
        ],
      },
    ],
    createdAt: nowIso(),
    updatedAt: nowIso(),
  },
]

const readSongs = (): Song[] => {
  if (typeof window === 'undefined') return []
  const stored = safeParse<Song[]>(localStorage.getItem(STORAGE_KEY), [])
  if (stored.length > 0) {
    const normalized = normalizeStoredSongs(stored)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized))
    return normalized
  }
  const seeded = seedSongs()
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded))
  return seeded
}

const writeSongs = (songs: Song[]) => {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(songs))
}

const toListItem = (song: Song): SongListItem => ({
  id: song.id,
  title: song.title,
  artist: song.artist,
  key: song.key,
  updatedAt: song.updatedAt,
})

const normalizeVisibility = (value?: SongVisibility): SongVisibility =>
  value ?? 'private'

export const mockSongsApi = {
  async list(params?: {
    page?: number
    limit?: number
    sort?: 'updatedAt' | 'title'
    order?: 'asc' | 'desc'
  }): Promise<PaginatedResponse<SongListItem>> {
    const songs = readSongs()
    const page = Math.max(1, params?.page ?? 1)
    const limit = Math.max(1, Math.min(100, params?.limit ?? 20))
    const sort = params?.sort ?? 'updatedAt'
    const order = params?.order ?? 'desc'

    const sorted = songs.slice().sort((a, b) => {
      const compare =
        sort === 'title'
          ? a.title.localeCompare(b.title)
          : a.updatedAt.localeCompare(b.updatedAt)
      return order === 'asc' ? compare : -compare
    })

    const total = sorted.length
    const totalPages = Math.max(1, Math.ceil(total / limit))
    const startIndex = (page - 1) * limit
    const items = sorted.slice(startIndex, startIndex + limit).map(toListItem)
    return {
      items,
      total,
      page,
      pageSize: limit,
      totalPages,
    }
  },

  async get(id: string): Promise<Song> {
    const songs = readSongs()
    const song = songs.find((item) => item.id === id)
    if (!song) {
      throw new Error('Song not found')
    }
    return song
  },

  async create(meta: SongMeta, visibility?: SongVisibility): Promise<Song> {
    const songs = readSongs()
    const timestamp = nowIso()
    const song: Song = {
      id: createId(),
      title: meta.title,
      artist: meta.artist ?? '',
      key: meta.key ?? '',
      bpm: meta.bpm,
      timeSignature: meta.timeSignature || '4/4',
      visibility: normalizeVisibility(visibility),
      sections: [],
      createdAt: timestamp,
      updatedAt: timestamp,
    }
    const next = [song, ...songs]
    writeSongs(next)
    return song
  },

  async update(id: string, updates: Partial<Song>): Promise<Song> {
    const songs = readSongs()
    const index = songs.findIndex((item) => item.id === id)
    if (index === -1) {
      throw new Error('Song not found')
    }
    const current = songs[index]
    const updated: Song = {
      ...current,
      ...updates,
      visibility: normalizeVisibility(
        (updates.visibility as SongVisibility | undefined) ?? current.visibility
      ),
      updatedAt: nowIso(),
    }
    const next = songs.slice()
    next[index] = updated
    writeSongs(next)
    return updated
  },

  async remove(id: string): Promise<void> {
    const songs = readSongs()
    const next = songs.filter((item) => item.id !== id)
    writeSongs(next)
  },
}
