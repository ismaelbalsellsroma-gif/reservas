export type ReservationStatus = 'pending' | 'confirmed' | 'seated' | 'completed' | 'cancelled' | 'no-show'

export interface Reservation {
  id: string
  guestId: string
  guestName: string
  guestPhone: string
  guestEmail: string
  date: string // YYYY-MM-DD
  time: string // HH:mm
  partySize: number
  tableId: string | null
  status: ReservationStatus
  notes: string
  createdAt: string
}

export type TableShape = 'round' | 'square' | 'rectangle'

export interface Table {
  id: string
  name: string
  capacity: number
  shape: TableShape
  x: number
  y: number
  zone: string
}

export interface Guest {
  id: string
  name: string
  phone: string
  email: string
  visits: number
  lastVisit: string | null
  vip: boolean
  notes: string
  tags: string[]
}

export interface RestaurantSettings {
  name: string
  openTime: string
  closeTime: string
  slotDuration: number // minutes
  maxPartySize: number
  defaultReservationDuration: number // minutes
  zones: string[]
}

export interface TimeSlot {
  time: string
  available: boolean
}
