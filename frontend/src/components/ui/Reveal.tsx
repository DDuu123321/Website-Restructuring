'use client'

import { ReactNode, CSSProperties } from 'react'
import { useReveal, useCounter } from '@/hooks/useReveal'

interface RevealProps {
  children: ReactNode
  className?: string
  style?: CSSProperties
  delay?: number
}

export function Reveal({ children, className = '', style, delay }: RevealProps) {
  const ref = useReveal<HTMLDivElement>()
  const finalStyle: CSSProperties = delay !== undefined
    ? { ...style, transitionDelay: `${delay}ms` }
    : style || {}
  return (
    <div ref={ref} className={className} style={finalStyle}>
      {children}
    </div>
  )
}

export function AnimatedCounter({ to, duration, className }: { to: number; duration?: number; className?: string }) {
  const ref = useCounter(to, duration)
  return <span ref={ref} className={className}>0</span>
}
