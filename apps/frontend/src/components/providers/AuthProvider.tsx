'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/stores/authStore'

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const hydrate = useAuthStore((s) => s.hydrate)

  useEffect(() => {
    void hydrate()
  }, [hydrate])

  return <>{children}</>
}
