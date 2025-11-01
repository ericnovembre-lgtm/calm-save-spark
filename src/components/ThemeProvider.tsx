'use client'
import { PropsWithChildren, useEffect } from 'react'
import { applyTheme, getTheme, listenOSChange } from '@/lib/theme'

export function ThemeProvider({ children }: PropsWithChildren) {
  useEffect(() => {
    applyTheme(getTheme())
    const stop = listenOSChange(() => {
      if (getTheme() === 'system') applyTheme('system')
    })
    return stop
  }, [])
  return <>{children}</>
}
