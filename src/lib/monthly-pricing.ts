import type { Car, CarPricing } from './types'

export const MONTHLY_DAYS = 30
export const MONTHLY_DISCOUNT = 20

/** Fill missing period totals without replacing a separately listed rental rate. */
export function rentalPeriodRates(pricing: CarPricing) {
  const valid = (value: number | null | undefined): value is number =>
    typeof value === 'number' && Number.isFinite(value) && value > 0
  const periods = [
    [1, pricing.daily],
    [3, pricing.threeDays],
    [7, pricing.weekly],
    [14, pricing.fortnightly],
    [21, null],
    [30, pricing.monthly],
  ] as const
  return periods.map(([days, listed]) => ({
    days,
    amount: valid(listed)
      ? listed
      : valid(pricing.daily)
        ? Math.round(pricing.daily * days * (days === 30 ? 0.8 : 1) * 100) / 100
        : null,
  }))
}

/** Public monthly offer: 30 days at the current daily rate, less 20%. */
export function withMonthlyOffer(car: Car): Car {
  const daily = car.pricing.daily
  if (daily === null || !Number.isFinite(daily) || daily <= 0) return car
  const equivalent = Math.round(daily * MONTHLY_DAYS * 100) / 100
  return {
    ...car,
    pricing: {
      ...car.pricing,
      monthly: Math.round(equivalent * (100 - MONTHLY_DISCOUNT)) / 100,
      monthlyWas: equivalent,
    },
  }
}
