import { api } from '@/lib/api'
import { mockSongsApi } from '@/lib/mockSongs'
import { generateId } from '@/lib/utils'
import type {
  BarLine,
  LyricsChordLine,
  Section,
  Song,
  SongListItem,
  SongMeta,
  SongVisibility,
} from '@/types/song'
import type { PaginatedResponse } from '@/types/api'

type ApiChordPosition = {
  chord: string
  position: number
}

type ApiLyricsChordLine = {
  lyrics: string
  chords: ApiChordPosition[]
}

type ApiBarLine = {
  bars: string[]
}

type ApiSection = {
  id: string
  name: string
  type: 'lyrics-chord' | 'bar'
  lines: Array<ApiLyricsChordLine | ApiBarLine>
}

type ApiSongDto = {
  id: string
  title: string
  artist: string | null
  key: string | null
  bpm: number | null
  timeSignature: string
  content: ApiSection[]
  visibility: number | string | null
  createdAt: string
  updatedAt: string
}

type ApiSongListItemDto = {
  id: string
  title: string
  artist: string | null
  key: string | null
  updatedAt: string
}

type ApiSongListResponse = PaginatedResponse<ApiSongListItemDto>

const apiMode = process.env.NEXT_PUBLIC_API_MODE ?? 'mock'

const mapVisibility = (value: ApiSongDto['visibility']): SongVisibility => {
  if (typeof value === 'string') {
    if (value.toLowerCase().includes('url')) return 'url-only'
    if (value.toLowerCase().includes('specific')) return 'specific-users'
    if (value.toLowerCase().includes('public')) return 'public'
    return 'private'
  }
  switch (value) {
    case 1:
      return 'url-only'
    case 2:
      return 'specific-users'
    case 3:
      return 'public'
    default:
      return 'private'
  }
}

const normalizeLyricsLine = (line: ApiLyricsChordLine): LyricsChordLine => ({
  id: generateId(),
  lyrics: line.lyrics ?? '',
  chords: (line.chords ?? [])
    .map((chord) => ({
      id: generateId(),
      chord: chord.chord ?? '',
      position: Math.max(0, Math.floor(chord.position ?? 0)),
    }))
    .sort((a, b) => a.position - b.position),
})

const normalizeBarLine = (line: ApiBarLine): BarLine => ({
  id: generateId(),
  bars: Array.isArray(line.bars) ? line.bars.filter((bar) => typeof bar === 'string') : [],
})

const normalizeSection = (section: ApiSection): Section => ({
  id: section.id,
  name: section.name,
  type: section.type,
  lines: (section.lines ?? []).map((line) =>
    section.type === 'bar'
      ? normalizeBarLine(line as ApiBarLine)
      : normalizeLyricsLine(line as ApiLyricsChordLine)
  ),
})

const toSong = (dto: ApiSongDto): Song => {
  return {
    id: dto.id,
    title: dto.title,
    artist: dto.artist ?? '',
    key: dto.key ?? '',
    bpm: dto.bpm ?? undefined,
    timeSignature: dto.timeSignature ?? '4/4',
    sections: (dto.content ?? []).map(normalizeSection),
    visibility: mapVisibility(dto.visibility),
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  }
}

const toSongListItem = (dto: ApiSongListItemDto): SongListItem => ({
  id: dto.id,
  title: dto.title,
  artist: dto.artist ?? '',
  key: dto.key ?? '',
  updatedAt: dto.updatedAt,
})

const toApiSection = (section: Section): ApiSection => {
  if (section.type === 'bar') {
    return {
      id: section.id,
      name: section.name,
      type: 'bar',
      lines: section.lines.map((line) => ({
        bars: Array.isArray((line as BarLine).bars)
          ? (line as BarLine).bars.filter((bar) => typeof bar === 'string')
          : [],
      })),
    }
  }
  return {
    id: section.id,
    name: section.name,
    type: 'lyrics-chord',
    lines: section.lines.map((line) => ({
      lyrics: (line as LyricsChordLine).lyrics ?? '',
      chords: ((line as LyricsChordLine).chords ?? []).map((chord) => ({
        chord: chord.chord,
        position: Math.max(0, Math.floor(chord.position)),
      })),
    })),
  }
}

const toApiContent = (sections: Section[]) => sections.map(toApiSection)

export const songApi = {
  async list(params?: {
    page?: number
    limit?: number
    sort?: 'updatedAt' | 'title'
    order?: 'asc' | 'desc'
  }): Promise<PaginatedResponse<SongListItem>> {
    if (apiMode === 'mock') {
      return mockSongsApi.list(params)
    }
    const query = new URLSearchParams()
    if (params?.page) query.set('page', String(params.page))
    if (params?.limit) query.set('limit', String(params.limit))
    if (params?.sort) query.set('sort', params.sort)
    if (params?.order) query.set('order', params.order)
    const suffix = query.toString()
    const response = await api.get<ApiSongListResponse>(`/songs${suffix ? `?${suffix}` : ''}`)
    return {
      ...response,
      items: response.items.map(toSongListItem),
    }
  },

  async get(id: string): Promise<Song> {
    if (apiMode === 'mock') {
      return mockSongsApi.get(id)
    }
    const dto = await api.get<ApiSongDto>(`/songs/${id}`)
    return toSong(dto)
  },

  async create(meta: SongMeta, visibility?: SongVisibility): Promise<Song> {
    if (apiMode === 'mock') {
      return mockSongsApi.create(meta, visibility)
    }
    const dto = await api.post<ApiSongDto>('/songs', {
      title: meta.title,
      artist: meta.artist ?? null,
      key: meta.key ?? null,
      bpm: meta.bpm ?? null,
      timeSignature: meta.timeSignature || '4/4',
    })
    return toSong(dto)
  },

  async update(id: string, updates: Song): Promise<Song> {
    if (apiMode === 'mock') {
      return mockSongsApi.update(id, updates)
    }
    await api.put<void>(`/songs/${id}`, {
      title: updates.title ?? '',
      artist: updates.artist ?? null,
      key: updates.key ?? null,
      bpm: updates.bpm ?? null,
      timeSignature: updates.timeSignature ?? '4/4',
      content: toApiContent(updates.sections ?? []),
    })
    const dto = await api.get<ApiSongDto>(`/songs/${id}`)
    return toSong(dto)
  },

  async remove(id: string): Promise<void> {
    if (apiMode === 'mock') {
      return mockSongsApi.remove(id)
    }
    await api.delete(`/songs/${id}`)
  },
}
