import { useMemo } from 'react'
import { useStore } from '../../store'
import { cn, getStatusColor, timeToMinutes } from '../../lib/utils'
import type { Reservation } from '../../types'

interface CronogramaProps {
  onSelectReservation: (r: Reservation) => void
  onNewReservation: (tableId: string, time: string) => void
}

export function Cronograma({ onSelectReservation, onNewReservation }: CronogramaProps) {
  const tables = useStore((s) => s.tables)
  const zones = useStore((s) => s.zones)
  const plantas = useStore((s) => s.plantas)
  const reservations = useStore((s) => s.reservations)
  const shifts = useStore((s) => s.shifts)
  const service = useStore((s) => s.service)
  const settings = useStore((s) => s.settings)
  const setPlanta = useStore((s) => s.setServicePlanta)

  const currentPlantaId = service.currentPlantaId || plantas[0]?.id
  const plantaZoneIds = useMemo(
    () => new Set(zones.filter((z) => z.plantaId === currentPlantaId).map((z) => z.id)),
    [zones, currentPlantaId]
  )
  const plantaTables = useMemo(
    () =>
      [...tables]
        .filter((t) => plantaZoneIds.has(t.zoneId) && t.active)
        .sort((a, b) => {
          const nA = parseInt(a.name) || 9999
          const nB = parseInt(b.name) || 9999
          return nA - nB
        }),
    [tables, plantaZoneIds]
  )

  // Time range: min of all shift starts to max of all shift ends
  const { startMin, endMin } = useMemo(() => {
    if (shifts.length === 0) return { startMin: 12 * 60, endMin: 23 * 60 }
    let s = Infinity
    let e = -Infinity
    for (const sh of shifts) {
      s = Math.min(s, timeToMinutes(sh.startTime))
      e = Math.max(e, timeToMinutes(sh.endTime))
    }
    return { startMin: s, endMin: e }
  }, [shifts])

  const slotSize = 15 // minutes per column
  const pxPerMin = 3
  const totalMins = endMin - startMin
  const gridWidth = totalMins * pxPerMin

  const slots = useMemo(() => {
    const out: { mins: number; label: string; isHour: boolean }[] = []
    for (let m = startMin; m < endMin; m += slotSize) {
      const h = Math.floor(m / 60)
      const mm = m % 60
      out.push({
        mins: m,
        label: `${String(h).padStart(2, '0')}:${String(mm).padStart(2, '0')}`,
        isHour: mm === 0,
      })
    }
    return out
  }, [startMin, endMin])

  const dayReservations = useMemo(
    () =>
      reservations.filter(
        (r) =>
          r.date === service.currentDate &&
          !['cancelled', 'cancelled-client', 'no-show'].includes(r.status)
      ),
    [reservations, service.currentDate]
  )

  return (
    <div className="flex-1 flex flex-col bg-[#0f1620] min-h-0">
      {/* Planta tabs */}
      <div className="flex items-center gap-1 px-4 py-2 border-b border-[#1f2936]">
        {plantas.map((p) => (
          <button
            key={p.id}
            onClick={() => setPlanta(p.id)}
            className={cn(
              'px-4 py-1.5 rounded-t text-xs font-semibold transition-colors',
              p.id === currentPlantaId
                ? 'bg-[#1a2330] text-amber-300 border-b-2 border-amber-400'
                : 'text-gray-500 hover:text-gray-300'
            )}
          >
            {p.name}
          </button>
        ))}
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-auto">
        <div
          className="relative"
          style={{ minWidth: gridWidth + 120, minHeight: plantaTables.length * 48 + 40 }}
        >
          {/* Hour header */}
          <div className="sticky top-0 z-10 bg-[#0b111a] border-b border-[#1f2936] flex">
            <div className="w-24 shrink-0 border-r border-[#1f2936] px-3 py-2 text-[11px] font-semibold text-gray-500 uppercase">
              Mesa
            </div>
            <div className="relative" style={{ width: gridWidth, height: 40 }}>
              {slots.map((s) =>
                s.isHour ? (
                  <div
                    key={s.mins}
                    className="absolute top-0 bottom-0 border-l border-[#1f2936] text-[10px] text-gray-400 pl-1"
                    style={{ left: (s.mins - startMin) * pxPerMin, width: 60 * pxPerMin }}
                  >
                    {s.label}
                  </div>
                ) : null
              )}
            </div>
          </div>

          {/* Rows per table */}
          {plantaTables.map((t) => {
            const tableRes = dayReservations.filter((r) => r.tableIds.includes(t.id))
            return (
              <div key={t.id} className="flex border-b border-[#1f2936]" style={{ height: 48 }}>
                <div className="w-24 shrink-0 border-r border-[#1f2936] px-3 py-2 flex flex-col justify-center">
                  <span className="text-sm font-semibold text-white">{t.name}</span>
                  <span className="text-[10px] text-gray-500">{t.capacityMax} pax</span>
                </div>

                <div
                  className="relative bg-[#0f1620] hover:bg-[#11192a] cursor-cell"
                  style={{ width: gridWidth }}
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect()
                    const x = e.clientX - rect.left
                    const mins = Math.floor(x / pxPerMin) + startMin
                    const snapped = Math.round(mins / slotSize) * slotSize
                    const h = Math.floor(snapped / 60)
                    const mm = snapped % 60
                    onNewReservation(
                      t.id,
                      `${String(h).padStart(2, '0')}:${String(mm).padStart(2, '0')}`
                    )
                  }}
                >
                  {/* Vertical slot lines */}
                  {slots.map((s) => (
                    <div
                      key={s.mins}
                      className={cn(
                        'absolute top-0 bottom-0 border-l',
                        s.isHour ? 'border-[#1f2936]' : 'border-[#14202e]'
                      )}
                      style={{ left: (s.mins - startMin) * pxPerMin }}
                    />
                  ))}

                  {/* Shift boundary markers */}
                  {shifts.map((sh) => (
                    <div
                      key={sh.id}
                      className="absolute top-0 bottom-0 bg-amber-900/10 pointer-events-none"
                      style={{
                        left: (timeToMinutes(sh.startTime) - startMin) * pxPerMin,
                        width: (timeToMinutes(sh.endTime) - timeToMinutes(sh.startTime)) * pxPerMin,
                      }}
                    />
                  ))}

                  {/* Reservations */}
                  {tableRes.map((r) => {
                    const startM = timeToMinutes(r.time)
                    const left = (startM - startMin) * pxPerMin
                    const width = settings.averageReservationMinutes * pxPerMin
                    return (
                      <button
                        key={r.id}
                        onClick={(e) => {
                          e.stopPropagation()
                          onSelectReservation(r)
                        }}
                        className={cn(
                          'absolute top-1 bottom-1 rounded px-2 text-[11px] font-semibold text-white overflow-hidden hover:ring-2 hover:ring-amber-300 transition-all',
                          getStatusColor(r.status)
                        )}
                        style={{ left, width }}
                        title={`${r.time} · ${r.guestName} ${r.guestSurname} · ${r.partySize} pax`}
                      >
                        <span className="truncate block">
                          {r.time} {r.guestName} {r.guestSurname} ({r.partySize})
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
