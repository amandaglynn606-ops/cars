'use client'
import { useEffect, useRef } from 'react'

/** Keep the complete model name visible on one line without truncating it. */
export default function VehicleTitle({ name }: { name: string }) {
  const ref = useRef<HTMLHeadingElement>(null)
  useEffect(() => {
    const heading = ref.current
    if (!heading) return
    let active = true
    const fit = () => {
      if (!active || !heading.clientWidth) return
      heading.style.fontSize = '28px'
      const text = document.createRange()
      text.selectNodeContents(heading)
      const textWidth = text.getBoundingClientRect().width
      if (textWidth > heading.clientWidth) {
        let size = Math.max(10, Math.floor((28 * heading.clientWidth) / textWidth))
        heading.style.fontSize = size + 'px'
        while (size > 10 && text.getBoundingClientRect().width > heading.clientWidth) {
          heading.style.fontSize = --size + 'px'
        }
      }
    }
    let measuredWidth = 0
    const observer = new ResizeObserver(([entry]) => {
      if (entry.contentRect.width === measuredWidth) return
      measuredWidth = entry.contentRect.width
      fit()
    })
    observer.observe(heading.parentElement || heading)
    void document.fonts.ready.then(fit)
    fit()
    return () => {
      active = false
      observer.disconnect()
    }
  }, [name])
  return (
    <h1 ref={ref} className="z-vehicle-title">
      {name}
    </h1>
  )
}
