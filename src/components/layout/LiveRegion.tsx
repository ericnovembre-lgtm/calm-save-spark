'use client'

import { useEffect } from 'react'

let announcer: HTMLDivElement | null = null

function ensureAnnouncer() {
  if (typeof document === 'undefined') return null
  if (announcer) return announcer
  announcer = document.createElement('div')
  announcer.setAttribute('role', 'status')
  announcer.setAttribute('aria-live', 'polite')
  announcer.setAttribute('aria-atomic', 'true')
  announcer.className = 'sr-only absolute w-px h-px p-0 m-0 overflow-hidden whitespace-nowrap border-0'
  document.body.appendChild(announcer)
  return announcer
}

export function announce(message: string, priority: 'polite' | 'assertive' = 'polite') {
  if (typeof document === 'undefined') return
  const node = ensureAnnouncer()
  if (!node) return
  try {
    node.setAttribute('aria-live', priority)
    node.textContent = message
    setTimeout(() => {
      if (node) node.textContent = ''
    }, 1000)
  } catch (e) {
    console.error('Announce error:', e)
  }
}

/**
 * React component to guarantee announcer creation when mounted.
 * Place once at app root (e.g., inside App.tsx).
 */
export default function LiveRegion() {
  useEffect(() => {
    ensureAnnouncer()
  }, [])
  return null
}
