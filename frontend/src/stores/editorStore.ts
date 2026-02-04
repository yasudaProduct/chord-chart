import { create } from 'zustand'

export interface Section {
  id: string
  name: string
  type: 'lyrics-chord' | 'bar'
  content: string
}

export interface Song {
  id: string
  title: string
  artist: string
  key: string
  bpm: number
  timeSignature: string
  sections: Section[]
}

interface EditorState {
  song: Song | null
  isPreviewVisible: boolean
  isDirty: boolean
  setSong: (song: Song) => void
  updateSong: (updates: Partial<Song>) => void
  togglePreview: () => void
  setDirty: (dirty: boolean) => void
}

export const useEditorStore = create<EditorState>((set) => ({
  song: null,
  isPreviewVisible: true,
  isDirty: false,
  setSong: (song) => set({ song, isDirty: false }),
  updateSong: (updates) =>
    set((state) => ({
      song: state.song ? { ...state.song, ...updates } : null,
      isDirty: true,
    })),
  togglePreview: () =>
    set((state) => ({ isPreviewVisible: !state.isPreviewVisible })),
  setDirty: (dirty) => set({ isDirty: dirty }),
}))
