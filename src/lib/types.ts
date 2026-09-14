export type RentalPeriod = 'daily' | 'monthly'

export interface CarColor {
  name: string
  slug: string
  default: boolean
}

export interface CarImage {
  src: string
  thumbnail: string
  alt: string
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
  monthly: number | null
  dailyWas: number | null
  monthlyWas: number | null
}

export interface Car {
  id: string
  name: string
  slug: string
  brand: string | null
  bodyType: string | null
  pricing: CarPricing
  colors: CarColor[]
  specs: CarSpecs
  description: string
  images: CarImage[]
  featured: boolean
}
