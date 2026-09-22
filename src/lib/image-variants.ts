import type { Car, CarImage } from './types'
const normalize = (value: string) =>
  value
    .toLowerCase()
    .replace(/grey/g, 'gray')
    .replace(/[^a-z0-9]/g, '')
const families = [
  'black',
  'white',
  'gray',
  'silver',
  'blue',
  'green',
  'red',
  'yellow',
  'orange',
  'purple',
  'pink',
  'brown',
  'beige',
  'gold',
  'bronze',
]
export function inferImageColours(car: Car): Car {
  const candidates = car.colors.map((c) => ({
    ...c,
    key: normalize(c.name),
    reversed: normalize(c.name.split(/\s+/).reverse().join(' ')),
    family: families.find((f) => normalize(c.name).includes(f)),
  }))
  const modelNames = [car.name, car.model, car.slug, ...car.keywords]
    .map(normalize)
    .filter(Boolean)
    .sort((a, b) => b.length - a.length)
  const images: CarImage[] = car.images.map((image) => {
    if (image.colorSlug && car.colors.some((c) => c.slug === image.colorSlug)) return image
    let label = normalize(
      image.src
        .split('/')
        .pop()
        ?.replace(/\.[^.]+$/, '') || '',
    )
    // Trim names describe editions, not paint (including the source's Badge typo).
    label = label.replace(/blackbadg(?:e|he)|blackseries/g, '')
    for (const name of modelNames) label = label.replace(name, '')
    const exact = candidates
      .filter((c) => c.key && (label.includes(c.key) || label.includes(c.reversed)))
      .sort((a, b) => b.key.length - a.key.length)
    let match = exact[0]
    if (!match) {
      const matches = candidates.filter(
        (c) =>
          c.family &&
          label.includes(c.family) &&
          candidates.filter((other) => other.family === c.family).length === 1,
      )
      if (matches.length === 1) match = matches[0]
    }
    const { colorSlug: _, ...rest } = image
    return match ? { ...rest, colorSlug: match.slug } : rest
  })
  const colors = car.colors.filter((c) => images.some((i) => i.colorSlug === c.slug))
  return { ...car, images, colors }
}
export const photographedColours = (car: Car) =>
  car.colors.filter((c) => car.images.some((i) => i.colorSlug === c.slug))
export const imagesForColour = (car: Car, slug: string) =>
  slug ? car.images.filter((i) => i.colorSlug === slug) : car.images
export function colourPreview(car: Car, requested = '') {
  const colours = photographedColours(car)
  const featured = car.images.find((image) => image.src === car.featuredImage)
  const colour =
    colours.find((item) => item.slug === requested)?.slug ||
    colours.find((item) => item.slug === featured?.colorSlug)?.slug ||
    colours.find((item) => item.default)?.slug ||
    colours[0]?.slug ||
    ''
  const matching = imagesForColour(car, colour)
  return { colour, image: matching.find((image) => image.src === car.featuredImage) || matching[0] }
}
export function colourSwatch(slug: string) {
  const shades: Record<string, string> = {
    'light-blue': '#74bde2',
    'dark-blue': '#182c50',
    'light-green': '#69bd37',
    'lime-green': '#b4d91e',
    'light-gray': '#b9bdc0',
    'dark-gray': '#42464a',
    'matte-gray': '#6a6c6d',
    turquoise: '#3ccac5',
    teal: '#28837e',
    'metallic-emerald-green': '#244c39',
    'black-and-yellow': 'linear-gradient(135deg, #191919 50%, #e2be38 50%)',
    'black-and-white': 'linear-gradient(135deg, #191919 50%, #eeeae3 50%)',
    'black-and-gold': 'linear-gradient(135deg, #191919 50%, #bd944e 50%)',
    'teal-and-black': 'linear-gradient(135deg, #28837e 50%, #191919 50%)',
  }
  if (shades[slug]) return shades[slug]
  const key = normalize(slug)
  const family = families.find((f) => key.includes(f))
  const palette: Record<string, string> = {
    black: '#191919',
    white: '#eeeae3',
    gray: '#898887',
    silver: '#b6b7b9',
    blue: '#537a9c',
    green: '#537d37',
    red: '#af3737',
    yellow: '#e2be38',
    orange: '#d48040',
    purple: '#755c8c',
    pink: '#dbafb4',
    brown: '#715040',
    beige: '#c4ae88',
    gold: '#bd944e',
    bronze: '#93724c',
  }
  return family ? palette[family] : '#968575'
}
