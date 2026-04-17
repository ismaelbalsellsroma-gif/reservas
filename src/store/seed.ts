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
} from '../types'
import { getTodayString, generateCode } from '../lib/utils'

export function seed(): {
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
  tags: string[]
} {
  const today = getTodayString()

  const plantas: Planta[] = [
    { id: 'p-comedor', name: 'COMEDOR', order: 0 },
    { id: 'p-terraza', name: 'TERRASSA', order: 1 },
    { id: 'p-privat', name: 'PRIVAT', order: 2 },
  ]

  const zones: Zone[] = [
    { id: 'z-comedor', name: 'Comedor', plantaId: 'p-comedor' },
    { id: 'z-barra', name: 'Barra', plantaId: 'p-comedor' },
    { id: 'z-terraza', name: 'Terrassa', plantaId: 'p-terraza' },
    { id: 'z-privat', name: 'Privat', plantaId: 'p-privat' },
  ]

  const tables: Table[] = [
    // Comedor
    { id: 't1', name: '1', capacityMin: 1, capacityMax: 4, shape: 'rectangle-narrow', isHigh: false, x: 80, y: 150, width: 90, height: 70, zoneId: 'z-comedor', webBlocked: false, blockedDates: [], active: true},
    { id: 't2', name: '2', capacityMin: 1, capacityMax: 4, shape: 'rectangle-narrow', isHigh: false, x: 80, y: 250, width: 90, height: 70, zoneId: 'z-comedor', webBlocked: false, blockedDates: [], active: true},
    { id: 't3', name: '3', capacityMin: 2, capacityMax: 6, shape: 'rectangle-narrow', isHigh: false, x: 80, y: 350, width: 90, height: 70, zoneId: 'z-comedor', webBlocked: false, blockedDates: [], active: true},
    { id: 't4', name: '4', capacityMin: 2, capacityMax: 6, shape: 'rectangle-narrow', isHigh: false, x: 80, y: 450, width: 90, height: 70, zoneId: 'z-comedor', webBlocked: false, blockedDates: [], active: true},
    { id: 't5', name: '5', capacityMin: 1, capacityMax: 2, shape: 'square', isHigh: false, x: 240, y: 550, width: 60, height: 60, zoneId: 'z-comedor', webBlocked: false, blockedDates: [], active: true},
    { id: 't6', name: '6', capacityMin: 1, capacityMax: 2, shape: 'square', isHigh: false, x: 320, y: 620, width: 60, height: 60, zoneId: 'z-comedor', webBlocked: false, blockedDates: [], active: true},
    { id: 't7', name: '7', capacityMin: 1, capacityMax: 4, shape: 'square', isHigh: false, x: 340, y: 460, width: 70, height: 70, zoneId: 'z-comedor', webBlocked: false, blockedDates: [], active: true},
    { id: 't8', name: '8', capacityMin: 1, capacityMax: 4, shape: 'square', isHigh: false, x: 450, y: 460, width: 70, height: 70, zoneId: 'z-comedor', webBlocked: false, blockedDates: [], active: true},
    { id: 't9', name: '9', capacityMin: 1, capacityMax: 2, shape: 'square', isHigh: false, x: 340, y: 370, width: 70, height: 70, zoneId: 'z-comedor', webBlocked: false, blockedDates: [], active: true},
    { id: 't10', name: '10', capacityMin: 1, capacityMax: 4, shape: 'square', isHigh: false, x: 450, y: 370, width: 70, height: 70, zoneId: 'z-comedor', webBlocked: false, blockedDates: [], active: true},
    { id: 't11', name: '11', capacityMin: 2, capacityMax: 4, shape: 'rectangle-narrow', isHigh: false, x: 80, y: 70, width: 90, height: 70, zoneId: 'z-comedor', webBlocked: false, blockedDates: [], active: true},
    // Barra
    { id: 't100', name: '100', capacityMin: 1, capacityMax: 2, shape: 'square', isHigh: true, x: 500, y: 100, width: 50, height: 50, zoneId: 'z-barra', webBlocked: true, blockedDates: [], active: true},
    { id: 't101', name: '101', capacityMin: 1, capacityMax: 2, shape: 'square', isHigh: true, x: 440, y: 100, width: 50, height: 50, zoneId: 'z-barra', webBlocked: true, blockedDates: [], active: true},
    // Terrassa
    { id: 't20', name: '20', capacityMin: 4, capacityMax: 10, shape: 'square', isHigh: false, x: 120, y: 120, width: 80, height: 80, zoneId: 'z-terraza', webBlocked: false, blockedDates: [], active: true},
    { id: 't21', name: '21', capacityMin: 2, capacityMax: 4, shape: 'square', isHigh: false, x: 240, y: 120, width: 70, height: 70, zoneId: 'z-terraza', webBlocked: false, blockedDates: [], active: true},
    { id: 't22', name: '22', capacityMin: 2, capacityMax: 4, shape: 'round', isHigh: false, x: 360, y: 120, width: 70, height: 70, zoneId: 'z-terraza', webBlocked: false, blockedDates: [], active: true},
    // Privat
    { id: 't301', name: '301', capacityMin: 4, capacityMax: 12, shape: 'rectangle-wide', isHigh: false, x: 120, y: 120, width: 200, height: 80, zoneId: 'z-privat', webBlocked: false, blockedDates: [], active: true},
    { id: 't302', name: '302', capacityMin: 4, capacityMax: 8, shape: 'rectangle-wide', isHigh: false, x: 120, y: 240, width: 200, height: 80, zoneId: 'z-privat', webBlocked: false, blockedDates: [], active: true},
  ]

  const decorations: Decoration[] = [
    // Pared central del comedor
    { id: 'd1', type: 'wall-v', x: 220, y: 70, width: 16, height: 500, plantaId: 'p-comedor' },
    { id: 'd2', type: 'wall-h', x: 220, y: 250, width: 200, height: 16, plantaId: 'p-comedor' },
    { id: 'd3', type: 'bar', x: 430, y: 80, width: 140, height: 30, plantaId: 'p-comedor' },
  ]

  const combinations: TableCombination[] = [
    { id: 'c1', tableIds: ['t9', 't10'], capacityMin: 3, capacityMax: 6, subcombinable: false },
    { id: 'c2', tableIds: ['t7', 't8'], capacityMin: 4, capacityMax: 8, subcombinable: false },
    { id: 'c3', tableIds: ['t301', 't302'], capacityMin: 8, capacityMax: 20, subcombinable: true },
  ]

  const guests: Guest[] = [
    { id: 'g1', name: 'Carlos', surname: 'García López', phone: '612345678', phoneCountry: '+34', email: 'carlos@email.com', language: 'es', company: '', notes: 'Prefiere vino tinto', tags: ['VIP', 'Habitual'], vip: true, visits: 12, noShows: 0, cancellations: 1, lastVisit: today, marketingConsent: true, createdAt: today },
    { id: 'g2', name: 'María', surname: 'López Serra', phone: '623456789', phoneCountry: '+34', email: 'maria@email.com', language: 'ca', company: '', notes: 'Alergia al gluten', tags: ['Celíaco'], vip: false, visits: 5, noShows: 0, cancellations: 0, lastVisit: today, marketingConsent: false, createdAt: today },
    { id: 'g3', name: 'Pedro', surname: 'Martínez', phone: '634567890', phoneCountry: '+34', email: 'pedro@bluehat.es', language: 'es', company: 'Blue Hat S.L.', notes: 'Cliente corporativo', tags: ['VIP', 'Empresa'], vip: true, visits: 8, noShows: 0, cancellations: 0, lastVisit: today, marketingConsent: true, createdAt: today },
    { id: 'g4', name: 'Ana', surname: 'Fernández', phone: '645678901', phoneCountry: '+34', email: '', language: 'es', company: '', notes: '', tags: [], vip: false, visits: 3, noShows: 1, cancellations: 0, lastVisit: today, marketingConsent: false, createdAt: today },
    { id: 'g5', name: 'Luis', surname: 'Rodríguez', phone: '656789012', phoneCountry: '+34', email: 'luis@email.com', language: 'es', company: '', notes: 'Cliente desde 2020', tags: ['VIP', 'Habitual'], vip: true, visits: 20, noShows: 0, cancellations: 2, lastVisit: today, marketingConsent: true, createdAt: today },
    { id: 'g6', name: 'Josep', surname: 'Maria', phone: '611111111', phoneCountry: '+34', email: '', language: 'ca', company: '', notes: '', tags: [], vip: false, visits: 2, noShows: 0, cancellations: 0, lastVisit: today, marketingConsent: false, createdAt: today },
    { id: 'g7', name: 'Jordi', surname: 'Cordobés', phone: '622222222', phoneCountry: '+34', email: '', language: 'ca', company: '', notes: '', tags: [], vip: false, visits: 1, noShows: 0, cancellations: 0, lastVisit: today, marketingConsent: false, createdAt: today },
  ]

  const staff: StaffMember[] = [
    { id: 's1', name: 'Ismael', role: 'Maître', active: true },
    { id: 's2', name: 'Laura', role: 'Recepción', active: true },
    { id: 's3', name: 'Marc', role: 'Camarero', active: true },
  ]

  const shifts: Shift[] = [
    { id: 'sh-comida', name: 'Comida', startTime: '12:30', endTime: '16:30', online: true, order: 0 },
    { id: 'sh-cena', name: 'Cena', startTime: '20:00', endTime: '23:30', online: false, order: 1 },
  ]

  const reservations: Reservation[] = [
    {
      id: 'r1', code: generateCode(), guestId: 'g1', guestName: 'Carlos', guestSurname: 'García López',
      guestPhone: '612345678', guestPhoneCountry: '+34', guestEmail: 'carlos@email.com', guestLanguage: 'es', guestCompany: '',
      date: today, time: '13:00', partySize: 2, tableIds: ['t1'], status: 'confirmed', channel: 'phone', type: 'free',
      prescriptor: '', notes: 'Aniversario', guestNotes: '', tags: [], takenBy: 's1',
      createdAt: today, updatedAt: today, reconfirmationStatus: 'confirmed', shiftId: 'sh-comida',
    },
    {
      id: 'r2', code: generateCode(), guestId: 'g2', guestName: 'María', guestSurname: 'López Serra',
      guestPhone: '623456789', guestPhoneCountry: '+34', guestEmail: 'maria@email.com', guestLanguage: 'ca', guestCompany: '',
      date: today, time: '14:00', partySize: 4, tableIds: ['t3'], status: 'confirmed', channel: 'google', type: 'free',
      prescriptor: '', notes: 'Sin gluten, alergia confirmada', guestNotes: 'R: volen al raco de la barra', tags: ['Celíaco'], takenBy: 's2',
      createdAt: today, updatedAt: today, reconfirmationStatus: 'confirmed', shiftId: 'sh-comida',
    },
    {
      id: 'r3', code: generateCode(), guestId: 'g6', guestName: 'Josep', guestSurname: 'Maria',
      guestPhone: '611111111', guestPhoneCountry: '+34', guestEmail: '', guestLanguage: 'ca', guestCompany: '',
      date: today, time: '14:30', partySize: 6, tableIds: ['t3'], status: 'confirmed', channel: 'phone', type: 'free',
      prescriptor: '', notes: '', guestNotes: '', tags: [], takenBy: 's1',
      createdAt: today, updatedAt: today, reconfirmationStatus: 'pending', shiftId: 'sh-comida',
    },
    {
      id: 'r4', code: generateCode(), guestId: 'g3', guestName: 'Pedro', guestSurname: 'Martínez',
      guestPhone: '634567890', guestPhoneCountry: '+34', guestEmail: 'pedro@bluehat.es', guestLanguage: 'es', guestCompany: 'Blue Hat S.L.',
      date: today, time: '14:00', partySize: 8, tableIds: ['t7', 't8'], status: 'pending', channel: 'phone', type: 'menu',
      prescriptor: 'Laura', notes: 'Cena de negocios, menú cerrado', guestNotes: '', tags: ['Empresa'], takenBy: 's1',
      createdAt: today, updatedAt: today, reconfirmationStatus: 'pending', shiftId: 'sh-comida',
    },
    {
      id: 'r5', code: generateCode(), guestId: 'g4', guestName: 'Ana', guestSurname: 'Fernández',
      guestPhone: '645678901', guestPhoneCountry: '+34', guestEmail: '', guestLanguage: 'es', guestCompany: '',
      date: today, time: '13:30', partySize: 2, tableIds: ['t2'], status: 'confirmed', channel: 'walk-in', type: 'free',
      prescriptor: '', notes: '', guestNotes: '', tags: [], takenBy: 's2',
      createdAt: today, updatedAt: today, reconfirmationStatus: 'confirmed', shiftId: 'sh-comida',
    },
    {
      id: 'r6', code: generateCode(), guestId: 'g5', guestName: 'Luis', guestSurname: 'Rodríguez',
      guestPhone: '656789012', guestPhoneCountry: '+34', guestEmail: 'luis@email.com', guestLanguage: 'es', guestCompany: '',
      date: today, time: '21:00', partySize: 12, tableIds: ['t301'], status: 'confirmed', channel: 'phone', type: 'menu',
      prescriptor: '', notes: 'Celebración de cumpleaños, tarta', guestNotes: 'Necesita trona', tags: ['VIP'], takenBy: 's1',
      createdAt: today, updatedAt: today, reconfirmationStatus: 'pending', shiftId: 'sh-cena',
    },
    {
      id: 'r7', code: generateCode(), guestId: 'g7', guestName: 'Jordi', guestSurname: 'Cordobés',
      guestPhone: '622222222', guestPhoneCountry: '+34', guestEmail: '', guestLanguage: 'ca', guestCompany: '',
      date: today, time: '15:00', partySize: 3, tableIds: ['t9', 't10'], status: 'seated', channel: 'phone', type: 'free',
      prescriptor: '', notes: '', guestNotes: '', tags: [], takenBy: 's1',
      createdAt: today, updatedAt: today, reconfirmationStatus: 'confirmed', shiftId: 'sh-comida',
    },
    {
      id: 'r8', code: generateCode(), guestId: 'walk-in', guestName: 'WALK', guestSurname: 'IN',
      guestPhone: '', guestPhoneCountry: '+34', guestEmail: '', guestLanguage: 'es', guestCompany: '',
      date: today, time: '14:15', partySize: 1, tableIds: ['t5'], status: 'seated', channel: 'walk-in', type: 'free',
      prescriptor: '', notes: '', guestNotes: '', tags: [], takenBy: 's2',
      createdAt: today, updatedAt: today, reconfirmationStatus: 'confirmed', shiftId: 'sh-comida',
    },
  ]

  const settings: RestaurantSettings = {
    name: 'Braseria Isidro',
    doubleBookingEnabled: true,
    averageReservationMinutes: 90,
    defaultReservationDuration: 105,
    maxPartySize: 20,
    darkMode: true,
    reconfirmationEnabled: true,
    reconfirmationChannel: 'both',
  }

  const tags = ['VIP', 'Habitual', 'Empresa', 'Celíaco', 'Alergia', 'Cumpleaños', 'Influencer']

  return {
    reservations,
    tables,
    zones,
    plantas,
    decorations,
    combinations,
    guests,
    staff,
    shifts,
    settings,
    tags,
  }
}
