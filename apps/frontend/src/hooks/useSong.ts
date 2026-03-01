import useSWR from 'swr'
import { songApi } from '@/lib/songApi'

export const useSongList = () => {
  const { data, error, isLoading, mutate } = useSWR('songs', () => songApi.list())
  return { songs: data ?? [], error, isLoading, mutate }
}

export const useSong = (id: string | undefined) => {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `songs/${id}` : null,
    () => songApi.get(id!)
  )
  return { song: data, error, isLoading, mutate }
}

export const useSongSearch = (query?: string) => {
  const { data, error, isLoading } = useSWR(
    `songs/search?q=${query ?? ''}`,
    () => songApi.search(query)
  )
  return { results: data ?? [], error, isLoading }
}
