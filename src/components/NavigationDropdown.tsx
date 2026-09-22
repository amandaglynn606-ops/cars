'use client'
import { useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { gsap } from 'gsap'
import Icon from './Icon'
import { T } from './RegionalProvider'
import './navigation-dropdown.css'

export default function NavigationDropdown({
  label,
  mobile = false,
  dismiss = false,
  onOpen,
  children,
}: {
  label: string
  mobile?: boolean
  dismiss?: boolean
  onOpen?: () => void
  children: (close: () => void) => ReactNode
}) {
  const [expanded, setExpanded] = useState(false)
  const [present, setPresent] = useState(false)
  const root = useRef<HTMLDetailsElement>(null)
  const panel = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLElement>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const motion = useRef<gsap.core.Timeline | null>(null)
  const id = useId()
  const pathname = usePathname()
  const cancelTimer = () => {
    if (timer.current) clearTimeout(timer.current)
  }
  const close = () => {
    cancelTimer()
    if (panel.current?.contains(document.activeElement)) trigger.current?.focus()
    setExpanded(false)
  }
  const show = () => {
    cancelTimer()
    setPresent(true)
    setExpanded(true)
    onOpen?.()
  }
  useEffect(() => {
    close()
  }, [pathname])
  useEffect(() => {
    if (dismiss) close()
  }, [dismiss])
  useEffect(() => {
    const outside = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) close()
    }
    document.addEventListener('pointerdown', outside)
    return () => {
      document.removeEventListener('pointerdown', outside)
      cancelTimer()
    }
  }, [])
  useLayoutEffect(() => {
    if (!present || !panel.current) return
    const element = panel.current
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const timeline = gsap.timeline()
    motion.current = timeline
    if (expanded) {
      timeline.fromTo(
        element,
        { opacity: 0, y: mobile ? 0 : -12, ...(mobile ? { height: 0 } : {}) },
        {
          opacity: 1,
          y: 0,
          ...(mobile ? { height: 'auto' } : {}),
          duration: media.matches ? 0 : 0.32,
          ease: 'power3.out',
          clearProps: 'height,transform,opacity',
        },
      )
      if (!media.matches)
        timeline.fromTo(
          element.querySelectorAll('[data-nav-reveal]'),
          { opacity: 0, y: 9 },
          {
            opacity: 1,
            y: 0,
            duration: 0.3,
            stagger: { amount: 0.16 },
            ease: 'power2.out',
            clearProps: 'transform,opacity',
          },
          0.06,
        )
    } else {
      timeline.to(element, {
        opacity: 0,
        y: mobile ? 0 : -6,
        ...(mobile ? { height: 0 } : {}),
        duration: media.matches ? 0 : 0.16,
        onComplete: () => setPresent(false),
      })
    }
    const finish = () => timeline.progress(1)
    media.addEventListener('change', finish)
    return () => {
      timeline.kill()
      gsap.set(element.querySelectorAll('[data-nav-reveal]'), { clearProps: 'transform,opacity' })
      media.removeEventListener('change', finish)
    }
  }, [expanded, present, mobile])
  return (
    <details
      ref={root}
      open={present}
      className={'z-nav-disclosure' + (mobile ? ' z-nav-disclosure-mobile' : '')}
      data-expanded={expanded}
      onPointerEnter={(event) => {
        if (!mobile && event.pointerType === 'mouse') {
          cancelTimer()
          timer.current = setTimeout(show, 110)
        }
      }}
      onPointerLeave={(event) => {
        if (!mobile && event.pointerType === 'mouse') {
          cancelTimer()
          if (!root.current?.contains(document.activeElement))
            timer.current = setTimeout(close, 180)
        }
      }}
      onBlur={(event) => {
        if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget as Node))
          close()
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape' && present) {
          event.preventDefault()
          event.stopPropagation()
          close()
          trigger.current?.focus()
        }
        if (event.key === 'ArrowDown' && event.target === trigger.current) {
          event.preventDefault()
          show()
          requestAnimationFrame(() => {
            motion.current?.progress(1)
            panel.current?.querySelector<HTMLElement>('a,button')?.focus()
          })
        }
      }}
    >
      <summary
        ref={trigger}
        aria-expanded={expanded}
        aria-controls={id}
        onClick={(event) => {
          event.preventDefault()
          expanded ? close() : show()
        }}
      >
        <T>{label}</T>
        <Icon name="chevron" size={12} />
      </summary>
      {!mobile && (
        <div
          className="z-nav-scrim"
          hidden={!present}
          data-expanded={expanded}
          aria-hidden="true"
          onPointerDown={close}
        />
      )}
      <div
        ref={panel}
        id={id}
        className="z-nav-panel"
        hidden={!present}
        inert={!expanded}
        role="region"
        aria-label={label}
        onFocusCapture={() => motion.current?.progress(1)}
      >
        {children(close)}
      </div>
    </details>
  )
}
