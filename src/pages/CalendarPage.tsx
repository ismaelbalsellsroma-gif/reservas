import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import { Card } from '../components/ui/Card'
import { cn, getTodayString } from '../lib/utils'

export function CalendarPage() {
  const reservations = useStore((s) => s.reservations)
  const navigate = useNavigate()
  const today = getTodayString()

  const [currentDate, setCurrentDate] = useState(new Date())
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDayOfWeek = (new Date(year, month, 1).getDay() + 6) % 7 // Monday start
  const prevMonthDays = new Date(year, month, 0).getDate()

  const reservationsByDate = useMemo(() => {
    const map: Record<string, number> = {}
    const coversByDate: Record<string, number> = {}
    for (const r of reservations) {
      if (r.status === 'cancelled') continue
      map[r.date] = (map[r.date] || 0) + 1
      coversByDate[r.date] = (coversByDate[r.date] || 0) + r.partySize
    }
    return { counts: map, covers: coversByDate }
  }, [reservations])

  const goToPrev = () => setCurrentDate(new Date(year, month - 1, 1))
  const goToNext = () => setCurrentDate(new Date(year, month + 1, 1))
  const goToToday = () => setCurrentDate(new Date())

  const monthName = currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
  const weekDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

  const cells: { day: number; dateStr: string; isCurrentMonth: boolean }[] = []

  for (let i = 0; i < firstDayOfWeek; i++) {
    const day = prevMonthDays - firstDayOfWeek + i + 1
    const d = new Date(year, month - 1, day)
    cells.push({ day, dateStr: d.toISOString().split('T')[0], isCurrentMonth: false })
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d)
    cells.push({ day: d, dateStr: date.toISOString().split('T')[0], isCurrentMonth: true })
  }
  const remaining = 7 - (cells.length % 7)
  if (remaining < 7) {
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i)
      cells.push({ day: i, dateStr: d.toISOString().split('T')[0], isCurrentMonth: false })
    }
  }

  const getIntensity = (count: number) => {
    if (count === 0) return ''
    if (count <= 2) return 'bg-indigo-100 text-indigo-800'
    if (count <= 5) return 'bg-indigo-200 text-indigo-900'
    return 'bg-indigo-300 text-indigo-900'
  }

  // Selected day detail
  const [selectedDate, setSelectedDate] = useState(today)
  const selectedReservations = useMemo(
    () =>
      reservations
        .filter((r) => r.date === selectedDate && r.status !== 'cancelled')
        .sort((a, b) => a.time.localeCompare(b.time)),
    [reservations, selectedDate]
  )

  return (
    <div className="space-y-4">
      {/* Calendar header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={goToPrev} className="p-2 hover:bg-gray-100 rounded-lg">
            <ChevronLeft size={20} />
          </button>
          <h2 className="text-lg font-semibold text-gray-900 capitalize min-w-[180px] text-center">
            {monthName}
          </h2>
          <button onClick={goToNext} className="p-2 hover:bg-gray-100 rounded-lg">
            <ChevronRight size={20} />
          </button>
        </div>
        <button onClick={goToToday} className="px-3 py-1.5 text-sm bg-gray-100 rounded-lg hover:bg-gray-200">
          Hoy
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Calendar grid */}
        <Card className="lg:col-span-2 p-4">
          <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
            {weekDays.map((d) => (
              <div key={d} className="bg-gray-50 py-2 text-center text-xs font-medium text-gray-500">
                {d}
              </div>
            ))}
            {cells.map((cell, i) => {
              const count = reservationsByDate.counts[cell.dateStr] || 0
              const covers = reservationsByDate.covers[cell.dateStr] || 0
              const isToday = cell.dateStr === today
              const isSelected = cell.dateStr === selectedDate

              return (
                <div
                  key={i}
                  onClick={() => setSelectedDate(cell.dateStr)}
                  className={cn(
                    'bg-white p-2 min-h-[80px] cursor-pointer hover:bg-gray-50 transition-colors',
                    !cell.isCurrentMonth && 'opacity-40',
                    isSelected && 'ring-2 ring-indigo-500 ring-inset'
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={cn(
                        'text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full',
                        isToday && 'bg-indigo-600 text-white',
                        !isToday && cell.isCurrentMonth && 'text-gray-900',
                        !isToday && !cell.isCurrentMonth && 'text-gray-400'
                      )}
                    >
                      {cell.day}
                    </span>
                  </div>
                  {count > 0 && (
                    <div className={cn('rounded-md px-1.5 py-0.5 text-[10px] font-medium', getIntensity(count))}>
                      {count} res · {covers} pax
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </Card>

        {/* Day detail */}
        <div>
          <Card>
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                <CalendarDays size={16} />
                {new Date(selectedDate + 'T00:00:00').toLocaleDateString('es-ES', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                })}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                {selectedReservations.length} reservas · {selectedReservations.reduce((s, r) => s + r.partySize, 0)} comensales
              </p>
            </div>
            {selectedReservations.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm">Sin reservas este día</div>
            ) : (
              <div className="divide-y divide-gray-50 max-h-[500px] overflow-y-auto">
                {selectedReservations.map((r) => (
                  <div
                    key={r.id}
                    onClick={() => navigate('/reservations')}
                    className="px-4 py-3 hover:bg-gray-50 cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">{r.time}</span>
                      <span
                        className={cn(
                          'text-[10px] font-medium px-2 py-0.5 rounded-full',
                          r.status === 'confirmed' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
                        )}
                      >
                        {r.status === 'confirmed' ? 'Confirmada' : 'Pendiente'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{r.guestName}</p>
                    <p className="text-xs text-gray-400">{r.partySize} personas</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
