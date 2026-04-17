import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, X, Lock, Sun, Moon, Users, Grid3x3 } from 'lucide-react'
import { useStore } from '../../store'
import { cn, getTodayString, timeToMinutes } from '../../lib/utils'

interface CalendarModalProps {
  onClose: () => void
  onSelectDay: (date: string) => void
}

function isWithinShift(time: string, startTime: string, endTime: string): boolean {
  const t = timeToMinutes(time)
  const s = timeToMinutes(startTime)
  const e = timeToMinutes(endTime)
  return t >= s && t <= e
}

function shiftIcon(shiftName: string) {
  const n = shiftName.toLowerCase()
  if (n.includes('comida') || n.includes('lunch') || n.includes('brunch')) return 'sun'
  if (n.includes('cena') || n.includes('dinner') || n.includes('noche')) return 'moon'
  return 'sun'
}

export function CalendarModal({ onClose, onSelectDay }: CalendarModalProps) {
  const reservations = useStore((s) => s.reservations)
  const tables = useStore((s) => s.tables)
  const shifts = useStore((s) => s.shifts)
  const service = useStore((s) => s.service)

  const today = getTodayString()
  const selected = service.currentDate
  const [year, setYear] = useState(() => new Date(selected + 'T00:00:00').getFullYear())
  const [month, setMonth] = useState(() => new Date(selected + 'T00:00:00').getMonth())

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDayOfWeek = (new Date(year, month, 1).getDay() + 6) % 7 // lunes = 0
  const prevMonthDays = new Date(year, month, 0).getDate()

  const monthName = new Date(year, month, 1).toLocaleDateString('es-ES', {
    month: 'long',
    year: 'numeric',
  })

  // Pre-compute reservation stats per date+shift
  const stats = useMemo(() => {
    const map = new Map<string, { covers: number; tableIds: Set<string> }>()
    for (const r of reservations) {
      if (['cancelled', 'cancelled-client', 'no-show'].includes(r.status)) continue
      const shift = shifts.find((s) => isWithinShift(r.time, s.startTime, s.endTime))
      if (!shift) continue
      const key = `${r.date}|${shift.id}`
      const cur = map.get(key) || { covers: 0, tableIds: new Set<string>() }
      cur.covers += r.partySize
      r.tableIds.forEach((t) => cur.tableIds.add(t))
      map.set(key, cur)
    }
    return map
  }, [reservations, shifts])

  const totals = useMemo(() => {
    let tableOccupations = 0
    let covers = 0
    for (const [key, v] of stats.entries()) {
      const [dateStr] = key.split('|')
      const d = new Date(dateStr + 'T00:00:00')
      if (d.getFullYear() === year && d.getMonth() === month) {
        tableOccupations += v.tableIds.size
        covers += v.covers
      }
    }
    return { tableOccupations, covers }
  }, [stats, year, month])

  const totalTables = tables.length

  // Build cells
  type Cell = { date: string; day: number; inMonth: boolean }
  const cells: Cell[] = []
  for (let i = 0; i < firstDayOfWeek; i++) {
    const day = prevMonthDays - firstDayOfWeek + i + 1
    const d = new Date(year, month - 1, day)
    cells.push({
      date: d.toISOString().split('T')[0],
      day,
      inMonth: false,
    })
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d)
    cells.push({ date: date.toISOString().split('T')[0], day: d, inMonth: true })
  }
  const remaining = 7 - (cells.length % 7)
  if (remaining < 7) {
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i)
      cells.push({ date: d.toISOString().split('T')[0], day: i, inMonth: false })
    }
  }

  const goPrev = () => {
    if (month === 0) {
      setYear(year - 1)
      setMonth(11)
    } else setMonth(month - 1)
  }
  const goNext = () => {
    if (month === 11) {
      setYear(year + 1)
      setMonth(0)
    } else setMonth(month + 1)
  }
  const goToday = () => {
    const t = new Date()
    setYear(t.getFullYear())
    setMonth(t.getMonth())
    onSelectDay(today)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-stretch">
      <div className="bg-[#0f1620] w-full h-full flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-start gap-3 p-5 border-b border-[#1f2936]">
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center hover:bg-[#1a2330] rounded"
          >
            <X size={20} className="text-gray-400" />
          </button>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white">Calendario de reservas</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Consulta las reservas por fecha, turnos, mesas ocupadas y comensales.
            </p>
          </div>
        </div>

        {/* Month total */}
        <div className="px-5 pt-4">
          <div className="bg-[#1a2330] rounded-lg px-4 py-3 flex items-center justify-between">
            <span className="text-sm text-gray-300">Ocupación total del mes</span>
            <div className="flex items-center gap-5 text-sm">
              <span className="flex items-center gap-1.5 text-amber-300 font-semibold">
                <Grid3x3 size={14} /> {totals.tableOccupations}
              </span>
              <span className="text-gray-600">|</span>
              <span className="flex items-center gap-1.5 text-amber-300 font-semibold">
                <Users size={14} /> {totals.covers}
              </span>
            </div>
          </div>
        </div>

        {/* Month nav */}
        <div className="flex items-center gap-3 px-5 py-3">
          <button
            onClick={goPrev}
            className="w-9 h-9 flex items-center justify-center bg-[#1a2330] hover:bg-[#243040] rounded text-gray-300"
          >
            <ChevronLeft size={16} />
          </button>
          <div className="flex-1 text-center text-base font-semibold text-white capitalize">
            {monthName}
          </div>
          <button
            onClick={goNext}
            className="w-9 h-9 flex items-center justify-center bg-[#1a2330] hover:bg-[#243040] rounded text-gray-300"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 px-5 pb-1 text-center text-[11px] uppercase text-gray-500">
          {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-auto px-5 pb-5">
          <div className="grid grid-cols-7 gap-1 auto-rows-fr">
            {cells.map((cell, i) => {
              const isToday = cell.date === today
              const isSelected = cell.date === selected
              const cellDate = new Date(cell.date + 'T00:00:00')
              const sameMonth = cellDate.getMonth() === month && cellDate.getFullYear() === year

              return (
                <button
                  key={i}
                  onClick={() => {
                    onSelectDay(cell.date)
                    onClose()
                  }}
                  className={cn(
                    'bg-[#1a2330] rounded flex flex-col overflow-hidden transition-colors hover:bg-[#243040] min-h-[110px]',
                    !sameMonth && 'opacity-40',
                    isSelected && 'ring-2 ring-amber-400'
                  )}
                >
                  <div
                    className={cn(
                      'text-center text-xs font-semibold py-1',
                      isToday
                        ? 'bg-amber-400 text-slate-900'
                        : !cell.inMonth
                        ? 'text-gray-600'
                        : 'text-gray-300'
                    )}
                  >
                    {cell.day}
                  </div>

                  {/* Shift rows */}
                  <div className="flex-1 flex flex-col">
                    {shifts.map((s) => {
                      const key = `${cell.date}|${s.id}`
                      const st = stats.get(key)
                      const hasData = !!st && st.covers > 0
                      const occ = st ? st.tableIds.size : 0
                      const cov = st ? st.covers : 0
                      const pct = totalTables > 0 ? occ / totalTables : 0
                      const highOcc = pct >= 0.5
                      const Icon = shiftIcon(s.name) === 'moon' ? Moon : Sun
                      return (
                        <div
                          key={s.id}
                          className={cn(
                            'flex-1 flex flex-col items-center justify-center gap-0.5 py-1 border-t border-[#0f1620]',
                            !s.online && 'bg-[#0b111a]'
                          )}
                        >
                          {!s.online ? (
                            <>
                              <Lock size={12} className="text-gray-500" />
                              <span className="text-[10px] text-gray-600">-</span>
                            </>
                          ) : hasData ? (
                            <>
                              <Icon size={12} className={highOcc ? 'text-red-400' : 'text-amber-300'} />
                              <span
                                className={cn(
                                  'text-[11px] font-semibold',
                                  highOcc ? 'text-red-400' : 'text-gray-200'
                                )}
                              >
                                {occ}|{cov}
                              </span>
                            </>
                          ) : (
                            <>
                              <Icon size={12} className="text-gray-600" />
                              <span className="text-[10px] text-gray-600">0|0</span>
                            </>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#1f2936]">
          <button
            onClick={goToday}
            className="w-full bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold py-3 rounded-lg text-sm uppercase"
          >
            Ahora
          </button>
        </div>
      </div>
    </div>
  )
}
