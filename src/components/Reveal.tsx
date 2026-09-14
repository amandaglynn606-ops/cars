'use client'

import { useRef, type ElementType, type ReactNode } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger, useGSAP)

/**
 * Fades and lifts its children into view once, when they reach the viewport.
 * Pass `stagger` to animate direct children in sequence instead of as one block.
 */
export default function Reveal({
  children,
  className,
  as: Tag = 'div',
  delay = 0,
  stagger = false,
  y = 34,
}: {
  children: ReactNode
  className?: string
  as?: ElementType
  delay?: number
  stagger?: boolean
  y?: number
}) {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const el = root.current
      if (!el) return
      const targets = stagger ? Array.from(el.children) : [el]
      if (targets.length === 0) return

      gsap.from(targets, {
        opacity: 0,
        y,
        duration: 1,
        delay,
        ease: 'power3.out',
        stagger: stagger ? 0.11 : 0,
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      })
    },
    { scope: root },
  )

  return (
    <Tag ref={root} className={className}>
      {children}
    </Tag>
  )
}
