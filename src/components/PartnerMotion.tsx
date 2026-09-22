'use client'

import { useRef, type ComponentPropsWithoutRef, type ElementType } from 'react'
import { usePathname } from 'next/navigation'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger, useGSAP)

/** Motion is scoped to this section; server-rendered content starts fully visible. */
export default function PartnerMotion({
  as: Tag = 'div',
  children,
  ...props
}: ComponentPropsWithoutRef<'div'> & { as?: ElementType }) {
  const root = useRef<HTMLElement>(null)
  const pathname = usePathname()

  useGSAP(
    () => {
      const element = root.current
      if (!element) return
      const media = gsap.matchMedia()
      media.add('(prefers-reduced-motion: no-preference)', () => {
        const select = gsap.utils.selector(element)
        const reveals: { element: HTMLElement; tween: gsap.core.Tween }[] = []
        const cleanup: (() => void)[] = []

        const reveal = (selector: string, stagger = false) => {
          select(selector).forEach((target: HTMLElement) => {
            const targets = stagger ? Array.from(target.children) : target
            const tween = gsap.from(targets, {
              opacity: 0,
              y: 24,
              duration: 0.8,
              stagger: stagger ? 0.09 : 0,
              ease: 'power3.out',
              clearProps: 'opacity,transform',
              scrollTrigger: { trigger: target, start: 'top 92%', once: true },
            })
            reveals.push({ element: target, tween })
          })
        }

        reveal('.z-earn-heading > div:first-child, .z-partner-hero', true)
        reveal('.z-partner-path', true)
        reveal('.z-partner-offers article, .z-partner-process ol > li')
        reveal('.z-partner-application > aside', true)
        reveal('.z-partner-process > h2, .z-partner-faq > h2, .z-earn-foot')
        reveal('.z-monthly-grid > article, .z-event-card')
        reveal('.z-event-intro', true)
        reveal(
          '.z-event-cover, .z-event-section-heading, .z-event-artist, .z-event-timeline article, .z-event-photo-grid figure, .z-event-visit-grid article, .z-event-closing',
        )

        // Keyboard users should never land on a link still waiting for its reveal.
        const finishFocusedReveal = (event: FocusEvent) => {
          if (!(event.target instanceof Node)) return
          for (const item of reveals) {
            if (item.element.contains(event.target)) item.tween.progress(1)
          }
        }
        element.addEventListener('focusin', finishFocusedReveal)
        cleanup.push(() => element.removeEventListener('focusin', finishFocusedReveal))

        // Animate only the decorative image; its container keeps the layout stable.
        const image = element.querySelector('.z-earn-image img')
        if (image) {
          gsap.fromTo(
            image,
            { scale: 1.08 },
            {
              scale: 1,
              ease: 'none',
              scrollTrigger: {
                trigger: image.parentElement,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 0.8,
              },
            },
          )
        }

        select(
          '.z-partner-path .z-button, .z-partner-hero .z-button, .z-partner-switch .z-text-link',
        ).forEach((link: HTMLElement) => {
          const arrow = link.querySelector('svg')
          if (!arrow) return
          const move = gsap.quickTo(arrow, 'x', { duration: 0.25, ease: 'power2.out' })
          let hovered = false
          const update = () => move(hovered || link.matches(':focus-visible') ? 5 : 0)
          const enter = (event: PointerEvent) => {
            if (event.pointerType === 'mouse') {
              hovered = true
              update()
            }
          }
          const leave = () => {
            hovered = false
            update()
          }
          link.addEventListener('pointerenter', enter)
          link.addEventListener('pointerleave', leave)
          link.addEventListener('focus', update)
          link.addEventListener('blur', update)
          cleanup.push(() => {
            link.removeEventListener('pointerenter', enter)
            link.removeEventListener('pointerleave', leave)
            link.removeEventListener('focus', update)
            link.removeEventListener('blur', update)
          })
        })

        // Font swaps can change heading height after ScrollTrigger measured the page.
        let active = true
        void document.fonts.ready.then(() => {
          if (active) ScrollTrigger.refresh()
        })
        return () => {
          active = false
          cleanup.forEach((dispose) => dispose())
        }
      })
      return () => media.revert()
    },
    { scope: root, dependencies: [pathname], revertOnUpdate: true },
  )

  return (
    <Tag ref={root} {...props}>
      {children}
    </Tag>
  )
}
