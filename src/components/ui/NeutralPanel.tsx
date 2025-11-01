import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

type NeutralPanelProps = React.HTMLAttributes<HTMLDivElement> & {
  floating?: boolean
  glowing?: boolean   // kept for API compatibility; rendered as subtle shadow only
  animated?: boolean
}

function NeutralPanel({
  children,
  className = '',
  floating = false,
  glowing = false,
  animated = true,
  ...props
}: NeutralPanelProps) {
  const base =
    'relative overflow-hidden rounded-2xl md:rounded-3xl ' +
    'bg-[hsl(var(--background))] text-[hsl(var(--foreground))] ' +
    'border border-[hsl(var(--border))] ' +
    'shadow-sm'

  const floatingCls = floating ? 'shadow-lg md:shadow-xl' : ''
  // Subtle "glow" using neutral shadow; no neon
  const glowingCls = glowing ? 'shadow-[0_12px_32px_rgba(0,0,0,.12)]' : ''

  const classes = cn(base, floatingCls, glowingCls, className)

  if (!animated) {
    return (
      <div className={classes} {...props}>
        {children}
      </div>
    )
  }

  return (
    <motion.div
      className={classes}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      onClick={props.onClick}
      onMouseEnter={props.onMouseEnter}
      onMouseLeave={props.onMouseLeave}
      style={props.style}
      id={props.id}
      role={props.role}
      aria-label={props['aria-label']}
      aria-labelledby={props['aria-labelledby']}
      aria-describedby={props['aria-describedby']}
    >
      {children}
    </motion.div>
  )
}

export default NeutralPanel
export { NeutralPanel }
