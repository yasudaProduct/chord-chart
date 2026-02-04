export type SectionType = 'lyrics-chord' | 'chord-only'

export type SongVisibility = 'private' | 'url-only' | 'specific-users' | 'public'

export interface Section {
  id: string
  name: string
  type: SectionType
  content: string
}

export interface SongMeta {
  title: string
  artist?: string
  key?: string
  bpm?: number
  timeSignature: string
}

export interface Song extends SongMeta {
  id: string
  sections: Section[]
  visibility: SongVisibility
  createdAt: string
  updatedAt: string
}

export interface SongListItem {
  id: string
  title: string
  artist?: string
  key?: string
  updatedAt: string
}
