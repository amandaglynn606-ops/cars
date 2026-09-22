'use client'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import type { EventExperience } from '@/lib/event-experiences'
export default function EventGallery({ images }: { images: EventExperience['gallery'] }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const [selected, setSelected] = useState(0)
  const [open, setOpen] = useState(false)
  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [open])
  const move = (direction: number) =>
    setSelected((value) => (value + direction + images.length) % images.length)
  return (
    <>
      <div className="z-event-photo-grid">
        {images.map((photo, index) => (
          <figure key={photo.src}>
            <button
              type="button"
              aria-label={'Enlarge: ' + photo.alt}
              onClick={() => {
                setSelected(index)
                dialog.current?.showModal()
                setOpen(true)
              }}
            >
              <Image src={photo.src} alt={photo.alt} fill sizes="(max-width:700px) 100vw,50vw" />
              <span aria-hidden="true">↗</span>
            </button>
            <figcaption>{photo.caption}</figcaption>
          </figure>
        ))}
      </div>
      <dialog
        ref={dialog}
        className="z-event-lightbox"
        aria-label="Event photo gallery"
        onClose={() => setOpen(false)}
        onClick={(event) => {
          if (event.target === dialog.current) dialog.current.close()
        }}
        onKeyDown={(event) => {
          if (event.key === 'ArrowRight') move(1)
          if (event.key === 'ArrowLeft') move(-1)
        }}
      >
        {open && (
          <div className="z-event-lightbox-inner">
            <button
              type="button"
              autoFocus
              className="z-event-lightbox-close"
              aria-label="Close photo gallery"
              onClick={() => dialog.current?.close()}
            >
              ×
            </button>
            <div className="z-event-lightbox-image">
              <Image src={images[selected].src} alt={images[selected].alt} fill sizes="92vw" />
            </div>
            <div className="z-event-lightbox-controls">
              <button type="button" aria-label="Previous photo" onClick={() => move(-1)}>
                ←
              </button>
              <p>
                {images[selected].caption}
                <small>
                  {selected + 1} / {images.length}
                </small>
              </p>
              <button type="button" aria-label="Next photo" onClick={() => move(1)}>
                →
              </button>
            </div>
          </div>
        )}
      </dialog>
    </>
  )
}
