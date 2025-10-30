'use client'
import { useEffect, PropsWithChildren } from 'react'
import { applyTheme, getTheme, listenOSChange } from '@/lib/theme'

export function ThemeProvider({ children }: PropsWithChildren) {
  useEffect(() => {
    const mode = getTheme()
    applyTheme(mode)
    const cleanup = listenOSChange(() => {
      if (getTheme() === 'system') applyTheme('system')
    })
    return cleanup
  }, [])
  return <>{children}</>
}
