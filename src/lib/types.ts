export type RentalPeriod = 'daily' | 'monthly'
export type Availability = 'available' | 'reserved' | 'unavailable' | 'maintenance'
export interface CarColor {
  name: string
  slug: string
  default: boolean
}
export interface CarImage {
  src: string
  thumbnail: string
  alt: string
  colorSlug?: string
}
export interface CarSpecs {
  engine?: string
  horsepower?: number
  zeroToHundredKph?: number
  topSpeedKph?: number
  torqueLbFt?: number
}
export interface CarPricing {
  currency: string
  daily: number | null
  dailyWas: number | null
  monthly: number | null
  monthlyWas: number | null
  threeDays?: number | null
  weekly?: number | null
  fortnightly?: number | null
}
export interface Car {
  id: string
  name: string
  slug: string
  brand: string | null
  model: string
  brandSlug: string
  modelSlug: string
  bodyType: string | null
  categories: string[]
  year: number | null
  seats: number | null
  transmission: string | null
  drivetrain: string | null
  exteriorColour: string | null
  interiorColour: string | null
  pricing: CarPricing
  colors: CarColor[]
  specs: CarSpecs
  images: CarImage[]
  featuredImage: string
  featured: boolean
  availability: Availability
  publicationStatus: 'draft' | 'published'
  imagePermission: string
  features: string[]
  keywords: string[]
  locations: string[]
  mileage: string | null
  deposit: string | null
  source?: { url: string; ids: number[]; retrievedAt: string; pricingVerifiedForLaunch: boolean }
  updatedAt: string
  revision: number
}
export interface Reservation {
  documents?: { id: string; name: string; mime: string; size: number; expiresAt: string }[]
  id: string
  vehicleId: string
  start: string
  end: string
  location: string
  name: string
  email: string
  phone: string
  notes: string
  status: 'pending' | 'confirmed' | 'cancelled'
  createdAt: string
}
export interface ReservedDates {
  vehicleId: string
  start: string
  end: string
}
