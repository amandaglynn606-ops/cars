'use client'
import { createContext, useContext, useState, type ReactNode } from 'react'
export type BookingContact = { name: string; email: string; phone: string; vehicleId: string }
const Context = createContext<{
  contact: BookingContact | null
  setContact: (contact: BookingContact | null) => void
} | null>(null)
export default function BookingContactProvider({ children }: { children: ReactNode }) {
  const [contact, setContact] = useState<BookingContact | null>(null)
  return <Context.Provider value={{ contact, setContact }}>{children}</Context.Provider>
}
export function useBookingContact() {
  const value = useContext(Context)
  if (!value) throw new Error('Booking contact provider is missing.')
  return value
}
