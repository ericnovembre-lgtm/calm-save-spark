import React, { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type Props = {
  show: boolean
  onComplete?: () => void
  duration?: number // ms, default 2000
  count?: number    // pieces, default 28
}

export default function NeutralConfetti({
  show,
  onComplete,
  duration = 2000,
  count = 28,
}: Props) {
  const [pieces, setPieces] = useState<
    { id: number; x: number; rot: number; color: string; delay: number }[]
  >([])
  const [vh, setVh] = useState(0)
  const [vw, setVw] = useState(0)
  const [reduceMotion, setReduceMotion] = useState(false)

  // mount-only: detect motion + viewport
  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)')
    setReduceMotion(!!mq?.matches)
    const onMQ = () => setReduceMotion(!!mq?.matches)
    mq?.addEventListener?.('change', onMQ)

    const measure = () => {
      setVh(window.innerHeight)
      setVw(window.innerWidth)
    }
    measure()
    window.addEventListener('resize', measure, { passive: true })

    return () => {
      mq?.removeEventListener?.('change', onMQ)
      window.removeEventListener('resize', measure)
    }
  }, [])

  // build once per show
  useEffect(() => {
    if (!show) return
    if (reduceMotion) {
      // Skip heavy animation
      const t = setTimeout(() => onComplete?.(), Math.min(duration, 600))
      return () => clearTimeout(t)
    }

    // neutral colors from CSS vars - use HSL tokens
    const colors = ['hsl(var(--foreground))', 'hsl(var(--accent))']
    const next = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * Math.max(vw, 1),
      rot: Math.random() * 360,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 0.25,
    }))
    setPieces(next)

    const timer = setTimeout(() => {
      setPieces([])
      onComplete?.()
    }, duration)

    return () => clearTimeout(timer)
  }, [show, duration, count, vw, reduceMotion, onComplete])

  const fallTo = useMemo(() => vh + 24, [vh])

  if (!show || reduceMotion) {
    return null
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999]" aria-hidden="true">
      <AnimatePresence>
        {pieces.map((p) => (
          <motion.div
            key={p.id}
            initial={{ x: p.x, y: -24, rotate: 0, opacity: 1 }}
            animate={{ y: fallTo, rotate: p.rot + 540, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: duration / 1000, delay: p.delay, ease: 'easeIn' }}
            style={{
              position: 'absolute',
              width: '10px',
              height: '10px',
              backgroundColor: p.color,   // neutral token
              borderRadius: '2px',
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}

export { NeutralConfetti }
