'use client'
import { useEffect, useRef } from 'react'
import { useRegional } from './RegionalProvider'

export default function SingleLineHeading({
  text,
  as: Tag = 'h1',
  maxSize = 76,
}: {
  text: string
  as?: 'h1' | 'h2'
  maxSize?: number
}) {
  const ref = useRef<HTMLHeadingElement>(null)
  const { t } = useRegional()
  const title = t(text)
  useEffect(() => {
    const element = ref.current
    if (!element) return
    let active = true
    const fit = () => {
      if (!active || !element.clientWidth) return
      element.style.fontSize = maxSize + 'px'
      const range = document.createRange()
      range.selectNodeContents(element)
      const width = range.getBoundingClientRect().width
      if (width > element.clientWidth)
        element.style.fontSize =
          Math.max(12, Math.floor((maxSize * element.clientWidth) / width)) + 'px'
    }
    const observer = new ResizeObserver(fit)
    observer.observe(element.parentElement || element)
    void document.fonts.ready.then(fit)
    fit()
    return () => {
      active = false
      observer.disconnect()
    }
  }, [title, maxSize])
  return (
    <Tag
      ref={ref}
      className="z-one-line-heading"
      style={{
        whiteSpace: 'nowrap',
        textAlign: 'center',
        width: '100%',
        fontSize: `min(${maxSize}px, 4vw)`,
      }}
    >
      {title}
    </Tag>
  )
}
