import type { SWRConfiguration } from 'swr'

export const swrConfig: SWRConfiguration = {
  revalidateOnFocus: false,
  dedupingInterval: 2000,
}
