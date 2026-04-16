import { useMemo } from 'react'
import { ChevronLeft, ChevronRight, Users, Grid3x3 } from 'lucide-react'
import { useStore } from '../../store'
import { cn, addDays, getTodayString } from '../../lib/utils'

export function ServiceBar() {
  const shifts = useStore((s) => s.shifts)
  const reservations = useStore((s) => s.reservations)
  const tables = useStore((s) => s.tables)
  const service = useStore((s) => s.service)
  const setServiceDate = useStore((s) => s.setServiceDate)
  const toggleShiftOnline = useStore((s) => s.toggleShiftOnline)

  const activeReservations = useMemo(
    () =>
      reservations.filter(
        (r) => r.date === service.currentDate && !['cancelled', 'cancelled-client', 'no-show'].includes(r.status)
      ),
    [reservations, service.currentDate]
  )

  const covers = activeReservations.reduce((s, r) => s + r.partySize, 0)
  const capacity = tables.reduce((s, t) => s + t.capacityMax, 0)
  const occupiedTables = new Set(activeReservations.flatMap((r) => r.tableIds)).size

  const dateObj = new Date(service.currentDate + 'T00:00:00')
  const dateLabel = dateObj
    .toLocaleDateString('es-ES', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })
    .toUpperCase()
  const isToday = service.currentDate === getTodayString()

  return (
    <div className="h-14 bg-[#0f1620] border-b border-[#1f2936] flex items-center gap-3 px-4 shrink-0">
      {/* Shift toggles */}
      <div className="flex items-center gap-2">
        {shifts.map((shift) => (
          <div
            key={shift.id}
            className="flex items-center gap-2 bg-[#1a2330] px-3 py-1.5 rounded-lg"
          >
            <span className="text-sm font-medium text-gray-300">{shift.name}</span>
            <button
              onClick={() => toggleShiftOnline(shift.id)}
              className={cn(
                'relative w-11 h-6 rounded-full transition-colors flex items-center',
                shift.online ? 'bg-emerald-500' : 'bg-gray-700'
              )}
              title={shift.online ? 'Abierto para reservas online' : 'Cerrado'}
            >
              <span
                className={cn(
                  'absolute w-4 h-4 rounded-full bg-white transition-transform',
                  shift.online ? 'translate-x-6' : 'translate-x-1'
                )}
              />
              <span
                className={cn(
                  'absolute text-[9px] font-bold',
                  shift.online ? 'text-white left-1.5' : 'text-gray-400 right-1'
                )}
              >
                {shift.online ? 'ON' : 'OFF'}
              </span>
            </button>
            {!shift.online && <span className="text-[10px] text-gray-500">Cerrado</span>}
          </div>
        ))}
      </div>

      {/* Live counters */}
      <div className="flex items-center gap-1.5 bg-[#1a2330] px-3 py-1.5 rounded-lg">
        <Users size={14} className="text-emerald-400" />
        <span className="text-sm font-semibold text-white">
          {covers} <span className="text-gray-500 font-normal">/ {capacity}</span>
        </span>
      </div>
      <div className="flex items-center gap-1.5 bg-[#1a2330] px-3 py-1.5 rounded-lg">
        <Grid3x3 size={14} className="text-sky-400" />
        <span className="text-sm font-semibold text-white">
          {occupiedTables} <span className="text-gray-500 font-normal">/ {tables.length}</span>
        </span>
      </div>

      <div className="flex-1" />

      {/* Date navigation */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setServiceDate(addDays(service.currentDate, -1))}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#1a2330] hover:bg-[#243040] text-gray-300"
        >
          <ChevronLeft size={16} />
        </button>
        <div className="bg-[#1a2330] px-4 py-1.5 rounded-lg text-sm font-medium text-white">
          {dateLabel}
        </div>
        <button
          onClick={() => setServiceDate(addDays(service.currentDate, 1))}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#1a2330] hover:bg-[#243040] text-gray-300"
        >
          <ChevronRight size={16} />
        </button>
        <button
          onClick={() => setServiceDate(getTodayString())}
          className={cn(
            'px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors',
            isToday
              ? 'bg-amber-400 text-black'
              : 'bg-[#1a2330] text-gray-300 hover:bg-[#243040]'
          )}
        >
          HOY
        </button>
      </div>
    </div>
  )
}
