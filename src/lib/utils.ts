import type { ReservationStatus } from '../types'

export function generateId(): string {
  return Math.random().toString(36).substring(2, 11) + Date.now().toString(36)
}

export function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

export function formatDate(date: string): string {
  return new Date(date + 'T00:00:00').toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function formatDateShort(date: string): string {
  return new Date(date + 'T00:00:00').toLocaleDateString('es-ES', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

export function getTodayString(): string {
  const d = new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function addDays(date: string, days: number): string {
  const d = new Date(date + 'T00:00:00')
  d.setDate(d.getDate() + days)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function cn(...classes: (string | false | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

export function minutesToTime(mins: number): string {
  const h = Math.floor(mins / 60) % 24
  const m = mins % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export const statusColors: Record<ReservationStatus, string> = {
  pending: 'bg-amber-500 text-white',
  confirmed: 'bg-emerald-600 text-white',
  seated: 'bg-emerald-700 text-white',
  eating: 'bg-sky-600 text-white',
  dessert: 'bg-sky-400 text-white',
  check: 'bg-indigo-500 text-white',
  completed: 'bg-slate-500 text-white',
  cancelled: 'bg-slate-600 text-white',
  'cancelled-client': 'bg-slate-400 text-white',
  'no-show': 'bg-red-500 text-white',
}

export const statusLabels: Record<ReservationStatus, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  seated: 'Sentados',
  eating: 'Comiendo',
  dessert: 'Postre',
  check: 'Cuenta',
  completed: 'Completada',
  cancelled: 'Cancelada',
  'cancelled-client': 'Cancelada cliente',
  'no-show': 'No show',
}

export function getStatusColor(status: ReservationStatus): string {
  return statusColors[status] || 'bg-slate-500 text-white'
}

export function getStatusLabel(status: ReservationStatus): string {
  return statusLabels[status] || status
}

// Color del fondo de la mesa en el plano según estado de su reserva actual
export function getTableBgForStatus(status: ReservationStatus | null): string {
  if (!status) return 'bg-amber-900/60' // libre (marrón)
  const map: Record<ReservationStatus, string> = {
    pending: 'bg-amber-500',
    confirmed: 'bg-emerald-600',
    seated: 'bg-emerald-700',
    eating: 'bg-sky-600',
    dessert: 'bg-sky-400',
    check: 'bg-indigo-500',
    completed: 'bg-slate-500',
    cancelled: 'bg-slate-700',
    'cancelled-client': 'bg-slate-600',
    'no-show': 'bg-red-600',
  }
  return map[status]
}
