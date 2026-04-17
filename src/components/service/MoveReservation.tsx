import { useState, useMemo } from 'react'
import { X, Move, Users, Lock } from 'lucide-react'
import { useStore } from '../../store'
import type { Reservation } from '../../types'
import { cn, timeToMinutes } from '../../lib/utils'

interface MoveReservationProps {
  reservation: Reservation
  onClose: () => void
}

export function MoveReservation({ reservation, onClose }: MoveReservationProps) {
  const tables = useStore((s) => s.tables)
  const zones = useStore((s) => s.zones)
  const plantas = useStore((s) => s.plantas)
  const reservations = useStore((s) => s.reservations)
  const moveReservationTables = useStore((s) => s.moveReservationTables)
  const settings = useStore((s) => s.settings)

  const [selectedTableIds, setSelectedTableIds] = useState<string[]>([...reservation.tableIds])
  const [plantaId, setPlantaId] = useState<string>(plantas[0]?.id || '')

  const plantaZoneIds = useMemo(
    () => new Set(zones.filter((z) => z.plantaId === plantaId).map((z) => z.id)),
    [zones, plantaId]
  )

  const plantaTables = useMemo(
    () =>
      tables
        .filter((t) => plantaZoneIds.has(t.zoneId) && t.active)
        .sort((a, b) => (parseInt(a.name) || 0) - (parseInt(b.name) || 0)),
    [tables, plantaZoneIds]
  )

  // Detect if tables have overlap
  const tableOccupied = useMemo(() => {
    const map = new Map<string, Reservation[]>()
    const start = timeToMinutes(reservation.time)
    const end = start + settings.averageReservationMinutes
    for (const r of reservations) {
      if (r.id === reservation.id) continue
      if (r.date !== reservation.date) continue
      if (['cancelled', 'cancelled-client', 'no-show', 'completed'].includes(r.status)) continue
      const rS = timeToMinutes(r.time)
      const rE = rS + settings.averageReservationMinutes
      if (Math.max(start, rS) < Math.min(end, rE)) {
        for (const tid of r.tableIds) {
          if (!map.has(tid)) map.set(tid, [])
          map.get(tid)!.push(r)
        }
      }
    }
    return map
  }, [reservations, reservation, settings.averageReservationMinutes])

  const toggle = (id: string) => {
    setSelectedTableIds((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]))
  }

  const handleConfirm = () => {
    if (selectedTableIds.length === 0) {
      alert('Selecciona al menos una mesa')
      return
    }
    const hasConflicts = selectedTableIds.some((id) => tableOccupied.has(id))
    if (hasConflicts && !settings.doubleBookingEnabled) {
      alert('Hay mesas ocupadas en ese horario. Activa doblaje para poder hacerlo.')
      return
    }
    if (hasConflicts) {
      if (!confirm('Ojo con el tiempo. Alguna mesa ya tiene reserva a esta hora. ¿Continuar?')) return
    }
    moveReservationTables(reservation.id, selectedTableIds)
    onClose()
  }

  const totalCap = selectedTableIds.reduce(
    (s, id) => s + (tables.find((t) => t.id === id)?.capacityMax || 0),
    0
  )
  const selectedZones = useMemo(() => {
    const names = new Set<string>()
    for (const id of selectedTableIds) {
      const t = tables.find((t) => t.id === id)
      if (!t) continue
      const z = zones.find((z) => z.id === t.zoneId)
      if (z) names.add(z.name)
    }
    return Array.from(names).join(', ')
  }, [selectedTableIds, tables, zones])

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className="bg-[#0f1620] border border-[#1f2936] rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-[#1f2936]">
          <div className="flex items-center gap-2">
            <Move size={18} className="text-amber-300" />
            <h2 className="text-base font-semibold text-white">Desplazar reserva</h2>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-[#1a2330] rounded">
            <X size={18} className="text-gray-400" />
          </button>
        </div>

        <div className="p-4 bg-[#0b111a] border-b border-[#1f2936]">
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div>
              <span className="text-gray-500 text-xs uppercase mr-2">Cliente</span>
              <span className="text-white font-semibold">
                {reservation.guestName} {reservation.guestSurname}
              </span>
            </div>
            <div>
              <span className="text-gray-500 text-xs uppercase mr-2">Hora</span>
              <span className="text-white font-semibold">{reservation.time}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users size={14} className="text-emerald-400" />
              <span className="text-white font-semibold">{reservation.partySize} pax</span>
            </div>
            <div className="flex-1" />
            <div className="text-xs text-amber-300">
              Seleccionadas: {selectedTableIds.length} mesas · cap. {totalCap}
              {selectedZones && <span className="text-gray-400"> · {selectedZones}</span>}
            </div>
          </div>
        </div>

        {/* Planta tabs */}
        <div className="flex items-center gap-1 px-4 pt-3 border-b border-[#1f2936]">
          {plantas.map((p) => (
            <button
              key={p.id}
              onClick={() => setPlantaId(p.id)}
              className={cn(
                'px-4 py-1.5 rounded-t text-xs font-semibold',
                p.id === plantaId
                  ? 'bg-[#1a2330] text-amber-300 border-b-2 border-amber-400'
                  : 'text-gray-500 hover:text-gray-300'
              )}
            >
              {p.name}
            </button>
          ))}
        </div>

        {/* Tables grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-6 md:grid-cols-8 gap-2">
            {plantaTables.map((t) => {
              const selected = selectedTableIds.includes(t.id)
              const conflicts = tableOccupied.get(t.id) || []
              const currentlyOn = reservation.tableIds.includes(t.id)
              return (
                <button
                  key={t.id}
                  onClick={() => toggle(t.id)}
                  className={cn(
                    'relative aspect-square rounded-lg p-2 flex flex-col items-center justify-center transition-all border-2',
                    selected
                      ? 'bg-emerald-600 border-emerald-300 text-white ring-2 ring-emerald-400'
                      : conflicts.length > 0
                      ? 'bg-red-600/40 border-red-500/60 text-red-100 hover:bg-red-600/60'
                      : 'bg-[#1a2330] border-[#2a3441] text-gray-200 hover:border-amber-400',
                    currentlyOn && !selected && 'ring-2 ring-amber-300'
                  )}
                >
                  {t.webBlocked && <Lock size={10} className="absolute top-1 right-1 text-amber-300" />}
                  <span className="text-lg font-bold">{t.name}</span>
                  <span className="text-[10px] opacity-70">cap {t.capacityMax}</span>
                  {conflicts.length > 0 && (
                    <span className="text-[9px] text-red-200 mt-0.5">· {conflicts[0].time}</span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-4 border-t border-[#1f2936] bg-[#0b111a]">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-300 hover:text-white"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            className="px-6 py-2 bg-amber-400 hover:bg-amber-300 text-slate-900 font-semibold text-sm rounded uppercase"
          >
            Desplazar a {selectedTableIds.length} mesa(s)
          </button>
        </div>
      </div>
    </div>
  )
}
