export type ReservationStatus =
  | 'pending' // Pendiente
  | 'confirmed' // Confirmada
  | 'seated' // Sentados
  | 'eating' // Comiendo
  | 'dessert' // Postre
  | 'check' // Cuenta
  | 'completed' // Completada
  | 'cancelled' // Cancelada
  | 'cancelled-client' // Cancelada por el cliente
  | 'no-show' // No-show

export type ReconfirmationStatus = 'pending' | 'confirmed' | 'cancelled'

export type ReservationChannel = 'phone' | 'walk-in' | 'google' | 'web' | 'other'

export type ReservationType = 'free' | 'menu' | 'prepaid' | 'event'

export interface Reservation {
  id: string
  code: string // Referencia corta visible
  guestId: string
  guestName: string
  guestSurname: string
  guestPhone: string
  guestPhoneCountry: string // +34, +33, ...
  guestEmail: string
  guestLanguage: string // es, ca, en, fr...
  guestCompany: string
  date: string // YYYY-MM-DD
  time: string // HH:mm
  partySize: number
  tableIds: string[] // Soporta múltiples mesas (combinaciones)
  status: ReservationStatus
  channel: ReservationChannel
  type: ReservationType
  prescriptor: string // Quién recomendó al cliente
  notes: string
  guestNotes: string // Notas del cliente / información adicional
  tags: string[] // Etiquetas de la reserva
  takenBy: string // ID del staff "anotado por"
  createdAt: string
  updatedAt: string
  reconfirmationStatus: ReconfirmationStatus
  shiftId: string // Turno al que pertenece
}

export type TableShape = 'square' | 'round' | 'rectangle-wide' | 'rectangle-narrow' | 'rectangle-small'

export interface Table {
  id: string
  name: string // Número o nombre visible (ej: "9", "101")
  capacityMin: number
  capacityMax: number
  shape: TableShape
  isHigh: boolean // Mesa alta/baja
  x: number
  y: number
  width: number
  height: number
  zoneId: string
  webBlocked: boolean // Candado: solo reservable por staff
  active: boolean
}

export interface Zone {
  id: string
  name: string
  plantaId: string
}

export interface Planta {
  id: string
  name: string
  order: number
}

export type DecorationType =
  | 'wall-h' // Pared horizontal
  | 'wall-v' // Pared vertical
  | 'plant'
  | 'star'
  | 'umbrella-blue'
  | 'umbrella-yellow'
  | 'door'
  | 'bar'
  | 'bathroom'

export interface Decoration {
  id: string
  type: DecorationType
  x: number
  y: number
  width: number
  height: number
  plantaId: string
  rotation?: number
}

export interface TableCombination {
  id: string
  tableIds: string[]
  capacityMin: number
  capacityMax: number
  subcombinable: boolean
}

export interface Guest {
  id: string
  name: string
  surname: string
  phone: string // matching key
  phoneCountry: string
  email: string
  language: string
  company: string
  notes: string
  tags: string[]
  vip: boolean
  visits: number
  noShows: number
  cancellations: number
  lastVisit: string | null
  marketingConsent: boolean
  createdAt: string
}

export interface StaffMember {
  id: string
  name: string
  role: string // maître, camarero, recepción...
  active: boolean
}

export interface Shift {
  id: string
  name: string // "Comida", "Cena", "Brunch"...
  startTime: string // HH:mm
  endTime: string // HH:mm
  online: boolean // Toggle ON/OFF para reservas online
  order: number
}

export interface RestaurantSettings {
  name: string
  doubleBookingEnabled: boolean // Doblaje opcional
  averageReservationMinutes: number // Para calcular aviso de solape (1,5h por defecto)
  defaultReservationDuration: number // En minutos (sugerencia en formulario)
  maxPartySize: number
  darkMode: boolean
  reconfirmationEnabled: boolean
  reconfirmationChannel: 'whatsapp' | 'email' | 'both'
}

// Estado de la UI del servicio
export interface ServiceState {
  currentDate: string // YYYY-MM-DD
  currentShiftId: string | null // Null = día completo
  currentPlantaId: string | null // Null = primera planta
}
