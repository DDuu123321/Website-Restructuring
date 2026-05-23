'use client'

import { ReactNode, ElementType, CSSProperties } from 'react'
import { useReveal, useCounter } from '@/hooks/useReveal'

interface RevealProps {
  children: ReactNode
  as?: ElementType
  className?: string
  style?: CSSProperties
  delay?: number
}

export function Reveal({ children, as: Tag = 'div', className = '', style, delay }: RevealProps) {
  const ref = useReveal<HTMLDivElement>()
  const finalStyle: CSSProperties = delay !== undefined
    ? { ...style, transitionDelay: `${delay}ms` }
    : style || {}
  return (
    <Tag ref={ref} className={className} style={finalStyle}>
      {children}
    </Tag>
  )
}

export function AnimatedCounter({ to, duration, className }: { to: number; duration?: number; className?: string }) {
  const ref = useCounter(to, duration)
  return <span ref={ref} className={className}>0</span>
}
