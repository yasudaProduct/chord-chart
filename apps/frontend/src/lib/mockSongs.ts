import type { Song, SongListItem, SongMeta, SongVisibility } from '@/types/song'

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
        content: '| Am | F | C | G |',
      },
      {
        id: createId(),
        name: 'Aメロ',
        type: 'lyrics-chord',
        content: 'Am        F        C        G\n夜の風が うたう',
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
        type: 'bar',
        content: '| C | G | Am | F |',
      },
    ],
    createdAt: nowIso(),
    updatedAt: nowIso(),
  },
]

const readSongs = (): Song[] => {
  if (typeof window === 'undefined') return []
  const stored = safeParse<Song[]>(localStorage.getItem(STORAGE_KEY), [])
  if (stored.length > 0) return stored
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
  async list(): Promise<SongListItem[]> {
    const songs = readSongs()
    return songs
      .slice()
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .map(toListItem)
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
