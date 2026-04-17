import { useMemo, useEffect } from 'react'
import { X, Printer } from 'lucide-react'
import { useStore } from '../../store'
import { formatDate, getStatusLabel, timeToMinutes } from '../../lib/utils'

interface PrintShiftProps {
  onClose: () => void
}

export function PrintShift({ onClose }: PrintShiftProps) {
  const reservations = useStore((s) => s.reservations)
  const tables = useStore((s) => s.tables)
  const guests = useStore((s) => s.guests)
  const shifts = useStore((s) => s.shifts)
  const staff = useStore((s) => s.staff)
  const settings = useStore((s) => s.settings)
  const service = useStore((s) => s.service)

  const grouped = useMemo(() => {
    const list = reservations
      .filter(
        (r) =>
          r.date === service.currentDate &&
          !['cancelled', 'cancelled-client'].includes(r.status)
      )
      .sort((a, b) => a.time.localeCompare(b.time))

    const byShift: Record<string, typeof list> = {}
    for (const r of list) {
      const shift = shifts.find(
        (s) =>
          timeToMinutes(r.time) >= timeToMinutes(s.startTime) &&
          timeToMinutes(r.time) <= timeToMinutes(s.endTime)
      )
      const key = shift?.id || 'unknown'
      if (!byShift[key]) byShift[key] = []
      byShift[key].push(r)
    }
    return byShift
  }, [reservations, shifts, service.currentDate])

  // Escape key
  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])

  const handlePrint = () => {
    window.print()
  }

  const totalCovers = Object.values(grouped)
    .flat()
    .reduce((sum, r) => sum + r.partySize, 0)

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 print:bg-white print:p-0 print:static">
      <div className="bg-white text-slate-900 rounded-lg shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col print:max-h-full print:rounded-none print:shadow-none">
        {/* Toolbar - hidden when printing */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 print:hidden">
          <div className="flex items-center gap-3">
            <Printer size={18} className="text-slate-600" />
            <h2 className="text-base font-semibold">Imprimir turno</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold text-xs rounded uppercase flex items-center gap-2"
            >
              <Printer size={14} /> Imprimir
            </button>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable content */}
        <div className="flex-1 overflow-y-auto p-6 print:p-0">
          <div className="print:p-8">
            <div className="flex items-center justify-between border-b-2 border-slate-900 pb-3 mb-4">
              <div>
                <h1 className="text-2xl font-bold">{settings.name}</h1>
                <p className="text-sm text-slate-600 capitalize">{formatDate(service.currentDate)}</p>
              </div>
              <div className="text-right text-sm">
                <p className="font-semibold">
                  {Object.values(grouped).flat().length} reservas · {totalCovers} comensales
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Generado: {new Date().toLocaleString('es-ES')}
                </p>
              </div>
            </div>

            {shifts.map((shift) => {
              const list = grouped[shift.id] || []
              if (list.length === 0) return null
              const covers = list.reduce((s, r) => s + r.partySize, 0)
              return (
                <section key={shift.id} className="mb-6">
                  <h2 className="text-lg font-bold bg-slate-900 text-white px-3 py-1.5 uppercase">
                    {shift.name} · {shift.startTime} - {shift.endTime}
                    <span className="ml-3 text-sm font-normal opacity-70">
                      ({list.length} reservas · {covers} pax)
                    </span>
                  </h2>
                  <table className="w-full text-sm border-collapse">
                    <thead className="bg-slate-100 text-[10px] uppercase text-slate-600">
                      <tr>
                        <th className="px-2 py-1.5 text-left border border-slate-200 w-14">Hora</th>
                        <th className="px-2 py-1.5 text-left border border-slate-200 w-14">Mesa</th>
                        <th className="px-2 py-1.5 text-left border border-slate-200 w-12">Pax</th>
                        <th className="px-2 py-1.5 text-left border border-slate-200">Cliente</th>
                        <th className="px-2 py-1.5 text-left border border-slate-200 w-24">Estado</th>
                        <th className="px-2 py-1.5 text-left border border-slate-200 w-20">Anotado</th>
                        <th className="px-2 py-1.5 text-left border border-slate-200">Notas</th>
                      </tr>
                    </thead>
                    <tbody>
                      {list.map((r) => {
                        const tableNames = r.tableIds
                          .map((id) => tables.find((t) => t.id === id)?.name)
                          .filter(Boolean)
                          .join(', ')
                        const guest = guests.find((g) => g.id === r.guestId)
                        const tk = staff.find((s) => s.id === r.takenBy)
                        return (
                          <tr key={r.id} className="border-b border-slate-200">
                            <td className="px-2 py-1.5 border border-slate-200 font-bold">{r.time}</td>
                            <td className="px-2 py-1.5 border border-slate-200">{tableNames || '—'}</td>
                            <td className="px-2 py-1.5 border border-slate-200">{r.partySize}</td>
                            <td className="px-2 py-1.5 border border-slate-200">
                              <div className="font-medium">
                                {r.guestName} {r.guestSurname}
                                {guest?.vip && <span className="ml-1 text-amber-600">★</span>}
                              </div>
                              {r.guestPhone && (
                                <div className="text-[10px] text-slate-500">
                                  {r.guestPhoneCountry} {r.guestPhone}
                                </div>
                              )}
                            </td>
                            <td className="px-2 py-1.5 border border-slate-200 text-xs">
                              {getStatusLabel(r.status)}
                            </td>
                            <td className="px-2 py-1.5 border border-slate-200 text-xs">
                              {tk?.name || '—'}
                            </td>
                            <td className="px-2 py-1.5 border border-slate-200 text-xs">
                              {[r.notes, r.guestNotes].filter(Boolean).join(' · ') || '—'}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </section>
              )
            })}

            {Object.values(grouped).flat().length === 0 && (
              <p className="text-center text-slate-500 py-8">No hay reservas para imprimir.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
