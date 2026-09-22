export const emirateLocations = [
  'Dubai',
  'Abu Dhabi',
  'Sharjah',
  'Ajman',
  'Umm Al Quwain',
  'Ras Al Khaimah',
  'Fujairah',
]
// Emirates offered by Zavi, plus any more specific delivery points for this car.
export const deliveryLocations = (car?: { locations: string[] }) => [
  ...new Set([...(car?.locations || []), ...emirateLocations]),
]
