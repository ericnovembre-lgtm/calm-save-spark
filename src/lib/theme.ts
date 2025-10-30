'use client'

/**
 * Theme utilities for $ave+
 */

export type ThemeMode = 'light' | 'dark' | 'system'
const KEY = 'saveplus_theme'

export function getTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'system'
  const raw = localStorage.getItem(KEY)
  if (raw === 'light' || raw === 'dark' || raw === 'system') return raw
  return 'system'
}

export function setTheme(mode: ThemeMode) {
  if (typeof window === 'undefined') return
  localStorage.setItem(KEY, mode)
  applyTheme(mode)
}

export function applyTheme(mode: ThemeMode) {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches
  const isDark = mode === 'dark' || (mode === 'system' && prefersDark)
  root.classList.toggle('dark', !!isDark)
  root.dataset.theme = mode
}

export function listenOSChange(onChange: () => void) {
  if (typeof window === 'undefined') return () => {}
  const mq = window.matchMedia('(prefers-color-scheme: dark)')
  const handler = () => onChange()
  mq.addEventListener?.('change', handler)
  return () => mq.removeEventListener?.('change', handler)
}
