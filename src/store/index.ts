import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  Reservation,
  Table,
  Zone,
  Planta,
  Decoration,
  TableCombination,
  Guest,
  StaffMember,
  Shift,
  RestaurantSettings,
  ServiceState,
} from '../types'
import { generateId, generateCode, getTodayString } from '../lib/utils'
import { seed } from './seed'

interface AppState {
  // Data
  reservations: Reservation[]
  tables: Table[]
  zones: Zone[]
  plantas: Planta[]
  decorations: Decoration[]
  combinations: TableCombination[]
  guests: Guest[]
  staff: StaffMember[]
  shifts: Shift[]
  settings: RestaurantSettings
  tags: string[] // Etiquetas disponibles

  // UI state
  service: ServiceState

  // Actions - Reservations
  addReservation: (r: Omit<Reservation, 'id' | 'code' | 'createdAt' | 'updatedAt'>) => string
  updateReservation: (id: string, data: Partial<Reservation>) => void
  deleteReservation: (id: string) => void
  setReservationStatus: (id: string, status: Reservation['status']) => void
  moveReservationTables: (id: string, tableIds: string[]) => void

  // Actions - Tables
  addTable: (t: Omit<Table, 'id'>) => string
  updateTable: (id: string, data: Partial<Table>) => void
  deleteTable: (id: string) => void
  toggleTableWebBlock: (id: string) => void

  // Actions - Zones / Plantas
  addPlanta: (name: string) => string
  updatePlanta: (id: string, data: Partial<Planta>) => void
  deletePlanta: (id: string) => void
  addZone: (name: string, plantaId: string) => string
  updateZone: (id: string, data: Partial<Zone>) => void
  deleteZone: (id: string) => void

  // Decorations
  addDecoration: (d: Omit<Decoration, 'id'>) => string
  updateDecoration: (id: string, data: Partial<Decoration>) => void
  deleteDecoration: (id: string) => void

  // Combinations
  addCombination: (c: Omit<TableCombination, 'id'>) => string
  updateCombination: (id: string, data: Partial<TableCombination>) => void
  deleteCombination: (id: string) => void

  // Guests
  addGuest: (g: Omit<Guest, 'id' | 'visits' | 'noShows' | 'cancellations' | 'lastVisit' | 'createdAt'>) => string
  updateGuest: (id: string, data: Partial<Guest>) => void
  deleteGuest: (id: string) => void
  findGuestByPhone: (phone: string) => Guest | undefined
  mergeGuests: (keepId: string, removeId: string) => void

  // Staff
  addStaff: (s: Omit<StaffMember, 'id'>) => string
  updateStaff: (id: string, data: Partial<StaffMember>) => void
  deleteStaff: (id: string) => void

  // Shifts
  addShift: (s: Omit<Shift, 'id'>) => string
  updateShift: (id: string, data: Partial<Shift>) => void
  deleteShift: (id: string) => void
  toggleShiftOnline: (id: string) => void

  // Tags
  addTag: (tag: string) => void
  removeTag: (tag: string) => void

  // Settings
  updateSettings: (data: Partial<RestaurantSettings>) => void

  // Service UI
  setServiceDate: (date: string) => void
  setServiceShift: (shiftId: string | null) => void
  setServicePlanta: (plantaId: string | null) => void

  // Reset
  resetAll: () => void
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...seed(),
      service: {
        currentDate: getTodayString(),
        currentShiftId: null,
        currentPlantaId: null,
      },

      // Reservations
      addReservation: (r) => {
        const id = generateId()
        const code = generateCode()
        const now = new Date().toISOString()
        set((state) => {
          const existingGuest = state.guests.find((g) => g.phone === r.guestPhone && r.guestPhone)
          const updatedGuests = existingGuest
            ? state.guests.map((g) =>
                g.id === existingGuest.id
                  ? { ...g, visits: g.visits + 1, lastVisit: r.date }
                  : g
              )
            : state.guests
          const newReservation: Reservation = {
            ...r,
            id,
            code,
            createdAt: now,
            updatedAt: now,
          }
          return {
            reservations: [...state.reservations, newReservation],
            guests: updatedGuests,
          }
        })
        return id
      },

      updateReservation: (id, data) =>
        set((state) => ({
          reservations: state.reservations.map((r) =>
            r.id === id ? { ...r, ...data, updatedAt: new Date().toISOString() } : r
          ),
        })),

      deleteReservation: (id) =>
        set((state) => ({
          reservations: state.reservations.filter((r) => r.id !== id),
        })),

      setReservationStatus: (id, status) =>
        set((state) => ({
          reservations: state.reservations.map((r) =>
            r.id === id ? { ...r, status, updatedAt: new Date().toISOString() } : r
          ),
        })),

      moveReservationTables: (id, tableIds) =>
        set((state) => ({
          reservations: state.reservations.map((r) =>
            r.id === id ? { ...r, tableIds, updatedAt: new Date().toISOString() } : r
          ),
        })),

      // Tables
      addTable: (t) => {
        const id = generateId()
        set((state) => ({ tables: [...state.tables, { ...t, id }] }))
        return id
      },
      updateTable: (id, data) =>
        set((state) => ({
          tables: state.tables.map((t) => (t.id === id ? { ...t, ...data } : t)),
        })),
      deleteTable: (id) =>
        set((state) => ({ tables: state.tables.filter((t) => t.id !== id) })),
      toggleTableWebBlock: (id) =>
        set((state) => ({
          tables: state.tables.map((t) =>
            t.id === id ? { ...t, webBlocked: !t.webBlocked } : t
          ),
        })),

      // Plantas / Zones
      addPlanta: (name) => {
        const id = generateId()
        set((state) => ({
          plantas: [...state.plantas, { id, name, order: state.plantas.length }],
        }))
        return id
      },
      updatePlanta: (id, data) =>
        set((state) => ({
          plantas: state.plantas.map((p) => (p.id === id ? { ...p, ...data } : p)),
        })),
      deletePlanta: (id) =>
        set((state) => {
          const zonesToRemove = state.zones.filter((z) => z.plantaId === id).map((z) => z.id)
          return {
            plantas: state.plantas.filter((p) => p.id !== id),
            zones: state.zones.filter((z) => z.plantaId !== id),
            tables: state.tables.filter((t) => !zonesToRemove.includes(t.zoneId)),
            decorations: state.decorations.filter((d) => d.plantaId !== id),
          }
        }),

      addZone: (name, plantaId) => {
        const id = generateId()
        set((state) => ({ zones: [...state.zones, { id, name, plantaId }] }))
        return id
      },
      updateZone: (id, data) =>
        set((state) => ({
          zones: state.zones.map((z) => (z.id === id ? { ...z, ...data } : z)),
        })),
      deleteZone: (id) =>
        set((state) => ({
          zones: state.zones.filter((z) => z.id !== id),
          tables: state.tables.filter((t) => t.zoneId !== id),
        })),

      // Decorations
      addDecoration: (d) => {
        const id = generateId()
        set((state) => ({ decorations: [...state.decorations, { ...d, id }] }))
        return id
      },
      updateDecoration: (id, data) =>
        set((state) => ({
          decorations: state.decorations.map((d) => (d.id === id ? { ...d, ...data } : d)),
        })),
      deleteDecoration: (id) =>
        set((state) => ({ decorations: state.decorations.filter((d) => d.id !== id) })),

      // Combinations
      addCombination: (c) => {
        const id = generateId()
        set((state) => ({ combinations: [...state.combinations, { ...c, id }] }))
        return id
      },
      updateCombination: (id, data) =>
        set((state) => ({
          combinations: state.combinations.map((c) => (c.id === id ? { ...c, ...data } : c)),
        })),
      deleteCombination: (id) =>
        set((state) => ({ combinations: state.combinations.filter((c) => c.id !== id) })),

      // Guests
      addGuest: (g) => {
        const id = generateId()
        set((state) => ({
          guests: [
            ...state.guests,
            {
              ...g,
              id,
              visits: 0,
              noShows: 0,
              cancellations: 0,
              lastVisit: null,
              createdAt: new Date().toISOString(),
            },
          ],
        }))
        return id
      },
      updateGuest: (id, data) =>
        set((state) => ({
          guests: state.guests.map((g) => (g.id === id ? { ...g, ...data } : g)),
        })),
      deleteGuest: (id) =>
        set((state) => ({ guests: state.guests.filter((g) => g.id !== id) })),
      findGuestByPhone: (phone) => get().guests.find((g) => g.phone === phone && phone),
      mergeGuests: (keepId, removeId) =>
        set((state) => {
          const keep = state.guests.find((g) => g.id === keepId)
          const remove = state.guests.find((g) => g.id === removeId)
          if (!keep || !remove) return state
          const merged: Guest = {
            ...keep,
            visits: keep.visits + remove.visits,
            noShows: keep.noShows + remove.noShows,
            cancellations: keep.cancellations + remove.cancellations,
            tags: Array.from(new Set([...keep.tags, ...remove.tags])),
            notes: [keep.notes, remove.notes].filter(Boolean).join('\n'),
          }
          return {
            guests: state.guests.filter((g) => g.id !== removeId).map((g) => (g.id === keepId ? merged : g)),
            reservations: state.reservations.map((r) =>
              r.guestId === removeId ? { ...r, guestId: keepId } : r
            ),
          }
        }),

      // Staff
      addStaff: (s) => {
        const id = generateId()
        set((state) => ({ staff: [...state.staff, { ...s, id }] }))
        return id
      },
      updateStaff: (id, data) =>
        set((state) => ({
          staff: state.staff.map((s) => (s.id === id ? { ...s, ...data } : s)),
        })),
      deleteStaff: (id) =>
        set((state) => ({ staff: state.staff.filter((s) => s.id !== id) })),

      // Shifts
      addShift: (s) => {
        const id = generateId()
        set((state) => ({ shifts: [...state.shifts, { ...s, id }] }))
        return id
      },
      updateShift: (id, data) =>
        set((state) => ({
          shifts: state.shifts.map((s) => (s.id === id ? { ...s, ...data } : s)),
        })),
      deleteShift: (id) =>
        set((state) => ({ shifts: state.shifts.filter((s) => s.id !== id) })),
      toggleShiftOnline: (id) =>
        set((state) => ({
          shifts: state.shifts.map((s) => (s.id === id ? { ...s, online: !s.online } : s)),
        })),

      // Tags
      addTag: (tag) =>
        set((state) => ({
          tags: state.tags.includes(tag) ? state.tags : [...state.tags, tag],
        })),
      removeTag: (tag) =>
        set((state) => ({ tags: state.tags.filter((t) => t !== tag) })),

      updateSettings: (data) =>
        set((state) => ({ settings: { ...state.settings, ...data } })),

      setServiceDate: (currentDate) =>
        set((state) => ({ service: { ...state.service, currentDate } })),
      setServiceShift: (currentShiftId) =>
        set((state) => ({ service: { ...state.service, currentShiftId } })),
      setServicePlanta: (currentPlantaId) =>
        set((state) => ({ service: { ...state.service, currentPlantaId } })),

      resetAll: () => {
        localStorage.removeItem('reservas-pro-storage')
        window.location.reload()
      },
    }),
    {
      name: 'reservas-pro-storage',
      version: 2,
      migrate: () => seed(),
    }
  )
)
