import React, { useEffect, useRef } from 'react'

export default function NeutralBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const reduceMotionRef = useRef(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || typeof window === 'undefined') return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Respect reduced motion
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    reduceMotionRef.current = mq.matches
    const onMQ = () => (reduceMotionRef.current = mq.matches)
    mq.addEventListener?.('change', onMQ)

    // Size
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.floor(window.innerWidth * dpr)
      canvas.height = Math.floor(window.innerHeight * dpr)
      canvas.style.width = '100%'
      canvas.style.height = '100%'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize, { passive: true })

    // Palette from CSS vars
    const getVar = (name: string, fallback: string) =>
      getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback

    let stars: { x: number; y: number; r: number; a: number; sp: number; ph: number }[] = []
    const seed = () => {
      const count = reduceMotionRef.current ? 60 : 120
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.6 + 0.4,
        a: Math.random() * 0.4 + 0.2,
        sp: Math.random() * 0.02 + 0.005,
        ph: Math.random() * Math.PI * 2,
      }))
    }
    seed()

    let raf = 0
    let t = 0
    let lastVisible = !document.hidden
    const onVis = () => {
      lastVisible = !document.hidden
    }
    document.addEventListener('visibilitychange', onVis)

    const loop = () => {
      if (!ctx) return
      // Clear with soft BG veil
      const bg = getVar('--background', '#F8F6F0')
      ctx.fillStyle = bg
      ctx.globalAlpha = 0.06
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.globalAlpha = 1

      // Optional gentle haze using accent
      const accentRaw = getVar('--accent', '40 20% 55%')
      if (!reduceMotionRef.current) {
        const grd = ctx.createRadialGradient(
          canvas.width * 0.7, canvas.height * 0.3, 0,
          canvas.width * 0.7, canvas.height * 0.3, Math.max(canvas.width, canvas.height) * 0.6
        )
        // Convert HSL values to proper rgba format for canvas
        // Parse HSL values: "40 20% 55%" or "hsl(40, 20%, 55%)"
        const hslMatch = accentRaw.match(/(\d+)\s+(\d+)%\s+(\d+)%/)
        if (hslMatch) {
          const [, h, s, l] = hslMatch
          grd.addColorStop(0, `hsla(${h}, ${s}%, ${l}%, 0.2)`)
          grd.addColorStop(1, `hsla(${h}, ${s}%, ${l}%, 0)`)
        } else {
          // Fallback to transparent gradient
          grd.addColorStop(0, 'rgba(214, 200, 162, 0.2)')
          grd.addColorStop(1, 'rgba(214, 200, 162, 0)')
        }
        ctx.fillStyle = grd
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }

      // Stars (twinkle in black, low alpha)
      const text = getVar('--foreground', '#000000')
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i]
        const tw = reduceMotionRef.current ? 1 : (Math.sin(t * s.sp + s.ph) * 0.25 + 0.75)
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fillStyle = text
        ctx.globalAlpha = s.a * tw
        ctx.fill()
      }
      ctx.globalAlpha = 1

      t += 1
      // Skip frames if tab hidden to reduce CPU
      if (lastVisible) raf = requestAnimationFrame(loop)
      else raf = requestAnimationFrame(() => {}) // noop to keep minimal work
    }

    raf = requestAnimationFrame(loop)

    // Cleanup
    return () => {
      window.removeEventListener('resize', resize)
      document.removeEventListener('visibilitychange', onVis)
      mq.removeEventListener?.('change', onMQ)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 'var(--z-background)' } as React.CSSProperties}
      aria-hidden="true"
    />
  )
}
