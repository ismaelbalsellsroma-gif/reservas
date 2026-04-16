import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Reservation, Table, Guest, RestaurantSettings } from '../types'
import { generateId, getTodayString } from '../lib/utils'

interface AppState {
  reservations: Reservation[]
  tables: Table[]
  guests: Guest[]
  settings: RestaurantSettings

  addReservation: (reservation: Omit<Reservation, 'id' | 'createdAt'>) => void
  updateReservation: (id: string, data: Partial<Reservation>) => void
  deleteReservation: (id: string) => void

  addTable: (table: Omit<Table, 'id'>) => void
  updateTable: (id: string, data: Partial<Table>) => void
  deleteTable: (id: string) => void

  addGuest: (guest: Omit<Guest, 'id' | 'visits' | 'lastVisit'>) => void
  updateGuest: (id: string, data: Partial<Guest>) => void
  deleteGuest: (id: string) => void

  updateSettings: (settings: Partial<RestaurantSettings>) => void
}

const today = getTodayString()

const defaultTables: Table[] = [
  { id: 't1', name: 'Mesa 1', capacity: 2, shape: 'round', x: 80, y: 80, zone: 'Terraza' },
  { id: 't2', name: 'Mesa 2', capacity: 2, shape: 'round', x: 200, y: 80, zone: 'Terraza' },
  { id: 't3', name: 'Mesa 3', capacity: 4, shape: 'square', x: 320, y: 80, zone: 'Terraza' },
  { id: 't4', name: 'Mesa 4', capacity: 4, shape: 'square', x: 80, y: 220, zone: 'Salón principal' },
  { id: 't5', name: 'Mesa 5', capacity: 6, shape: 'rectangle', x: 220, y: 220, zone: 'Salón principal' },
  { id: 't6', name: 'Mesa 6', capacity: 6, shape: 'rectangle', x: 400, y: 220, zone: 'Salón principal' },
  { id: 't7', name: 'Mesa 7', capacity: 8, shape: 'rectangle', x: 80, y: 360, zone: 'Salón privado' },
  { id: 't8', name: 'Mesa 8', capacity: 4, shape: 'round', x: 280, y: 360, zone: 'Salón privado' },
  { id: 't9', name: 'Mesa 9', capacity: 2, shape: 'round', x: 440, y: 80, zone: 'Terraza' },
  { id: 't10', name: 'Mesa 10', capacity: 10, shape: 'rectangle', x: 400, y: 360, zone: 'Salón privado' },
]

const defaultGuests: Guest[] = [
  { id: 'g1', name: 'Carlos García', phone: '+34 612 345 678', email: 'carlos@email.com', visits: 12, lastVisit: today, vip: true, notes: 'Prefiere vino tinto', tags: ['VIP', 'Regular'] },
  { id: 'g2', name: 'María López', phone: '+34 623 456 789', email: 'maria@email.com', visits: 5, lastVisit: today, vip: false, notes: 'Alergia al gluten', tags: ['Alergia'] },
  { id: 'g3', name: 'Pedro Martínez', phone: '+34 634 567 890', email: 'pedro@email.com', visits: 8, lastVisit: today, vip: true, notes: '', tags: ['VIP', 'Empresa'] },
  { id: 'g4', name: 'Ana Fernández', phone: '+34 645 678 901', email: 'ana@email.com', visits: 3, lastVisit: today, vip: false, notes: 'Cumpleaños en mayo', tags: [] },
  { id: 'g5', name: 'Luis Rodríguez', phone: '+34 656 789 012', email: 'luis@email.com', visits: 20, lastVisit: today, vip: true, notes: 'Cliente desde 2020', tags: ['VIP', 'Regular'] },
]

const defaultReservations: Reservation[] = [
  { id: 'r1', guestId: 'g1', guestName: 'Carlos García', guestPhone: '+34 612 345 678', guestEmail: 'carlos@email.com', date: today, time: '13:00', partySize: 2, tableId: 't1', status: 'confirmed', notes: 'Aniversario', createdAt: today },
  { id: 'r2', guestId: 'g2', guestName: 'María López', guestPhone: '+34 623 456 789', guestEmail: 'maria@email.com', date: today, time: '14:00', partySize: 4, tableId: 't4', status: 'confirmed', notes: 'Sin gluten', createdAt: today },
  { id: 'r3', guestId: 'g3', guestName: 'Pedro Martínez', guestPhone: '+34 634 567 890', guestEmail: 'pedro@email.com', date: today, time: '21:00', partySize: 6, tableId: 't5', status: 'pending', notes: 'Cena de negocios', createdAt: today },
  { id: 'r4', guestId: 'g4', guestName: 'Ana Fernández', guestPhone: '+34 645 678 901', guestEmail: 'ana@email.com', date: today, time: '20:30', partySize: 2, tableId: 't2', status: 'confirmed', notes: '', createdAt: today },
  { id: 'r5', guestId: 'g5', guestName: 'Luis Rodríguez', guestPhone: '+34 656 789 012', guestEmail: 'luis@email.com', date: today, time: '22:00', partySize: 8, tableId: 't7', status: 'pending', notes: 'Celebración', createdAt: today },
]

const defaultSettings: RestaurantSettings = {
  name: 'Mi Restaurante',
  openTime: '12:00',
  closeTime: '00:00',
  slotDuration: 30,
  maxPartySize: 12,
  defaultReservationDuration: 90,
  zones: ['Terraza', 'Salón principal', 'Salón privado'],
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      reservations: defaultReservations,
      tables: defaultTables,
      guests: defaultGuests,
      settings: defaultSettings,

      addReservation: (reservation) =>
        set((state) => {
          const newReservation: Reservation = {
            ...reservation,
            id: generateId(),
            createdAt: new Date().toISOString(),
          }
          const guest = state.guests.find((g) => g.id === reservation.guestId)
          const updatedGuests = guest
            ? state.guests.map((g) =>
                g.id === guest.id ? { ...g, visits: g.visits + 1, lastVisit: reservation.date } : g
              )
            : state.guests
          return {
            reservations: [...state.reservations, newReservation],
            guests: updatedGuests,
          }
        }),

      updateReservation: (id, data) =>
        set((state) => ({
          reservations: state.reservations.map((r) => (r.id === id ? { ...r, ...data } : r)),
        })),

      deleteReservation: (id) =>
        set((state) => ({
          reservations: state.reservations.filter((r) => r.id !== id),
        })),

      addTable: (table) =>
        set((state) => ({
          tables: [...state.tables, { ...table, id: generateId() }],
        })),

      updateTable: (id, data) =>
        set((state) => ({
          tables: state.tables.map((t) => (t.id === id ? { ...t, ...data } : t)),
        })),

      deleteTable: (id) =>
        set((state) => ({
          tables: state.tables.filter((t) => t.id !== id),
        })),

      addGuest: (guest) =>
        set((state) => ({
          guests: [...state.guests, { ...guest, id: generateId(), visits: 0, lastVisit: null }],
        })),

      updateGuest: (id, data) =>
        set((state) => ({
          guests: state.guests.map((g) => (g.id === id ? { ...g, ...data } : g)),
        })),

      deleteGuest: (id) =>
        set((state) => ({
          guests: state.guests.filter((g) => g.id !== id),
        })),

      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),
    }),
    {
      name: 'reservas-pro-storage',
    }
  )
)
