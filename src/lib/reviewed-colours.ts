import type { Car, CarImage } from './types'
export type ColourReview = { photos: Record<string, string | null>; featuredImage?: string }
export function applyReviewedColours(car: Car, review: ColourReview): Car {
  if (car.images.some((image) => !Object.hasOwn(review.photos, image.src)))
    throw new Error('New photographs require colour review: ' + car.id)
  const images: CarImage[] = car.images.map(({ colorSlug: _, ...image }) => {
    const colour = review.photos[image.src]
    return colour
      ? {
          ...image,
          colorSlug: colour,
          alt: car.name + ' in ' + colour.replaceAll('-', ' '),
        }
      : image
  })
  const featuredImage = review.featuredImage || car.featuredImage
  const featured = images.find((image) => image.src === featuredImage && image.colorSlug)
  if (!featured) throw new Error('Featured image needs an exterior colour: ' + car.id)
  const colors = [
    ...new Set(images.map((image) => image.colorSlug).filter((value): value is string => !!value)),
  ].map((slug) => ({
    slug,
    name: slug
      .split('-')
      .map((word) => (word === 'and' ? word : word[0].toUpperCase() + word.slice(1)))
      .join(' '),
    default: slug === featured.colorSlug,
  }))
  return { ...car, images, colors, featuredImage }
}
