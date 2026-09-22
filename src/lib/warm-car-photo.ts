import { getImageProps } from 'next/image'
import type { Car } from './types'

const warmed = new Set<string>()
export function warmCarPhoto(car: Car, sizes: string) {
  const src = car.featuredImage || car.images[0]?.src
  if (!src || typeof window === 'undefined' || warmed.has(src + sizes)) return
  warmed.add(src + sizes)
  const { props } = getImageProps({ src, alt: '', fill: true, sizes })
  const image = new window.Image()
  image.decoding = 'async'
  image.sizes = props.sizes || sizes
  image.srcset = props.srcSet || ''
  image.src = props.src
}
