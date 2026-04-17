import { useMemo } from 'react'
import { X, Copy, Move, Unlock, Ban, Edit3, StickyNote } from 'lucide-react'
import type { Table, Reservation, ReservationStatus } from '../../types'
import { useStore } from '../../store'
import { cn, getStatusColor } from '../../lib/utils'

interface TablePopupProps {
  table: Table
  reservations: Reservation[]
  position: { x: number; y: number }
  onClose: () => void
  onNewReservation: (tableId: string, walkIn?: boolean) => void
  onEditReservation: (reservation: Reservation) => void
  onMoveReservation: (reservation: Reservation) => void
}

const quickStates: { status: ReservationStatus; label: string; className: string }[] = [
  { status: 'cancelled-client', label: 'CANCELADA CLIENTE', className: 'bg-slate-500 hover:bg-slate-400' },
  { status: 'seated', label: 'LLEGADA', className: 'bg-pink-500 hover:bg-pink-400' },
  { status: 'dessert', label: 'POSTRE', className: 'bg-sky-400 hover:bg-sky-300' },
  { status: 'eating', label: 'SENTADA', className: 'bg-emerald-600 hover:bg-emerald-500' },
  { status: 'no-show', label: 'NO SHOW', className: 'bg-red-500 hover:bg-red-400' },
]

export function TablePopup({
  table,
  reservations,
  position,
  onClose,
  onNewReservation,
  onEditReservation,
  onMoveReservation,
}: TablePopupProps) {
  const toggleWebBlock = useStore((s) => s.toggleTableWebBlock)
  const toggleBlockDate = useStore((s) => s.toggleTableBlockDate)
  const setReservationStatus = useStore((s) => s.setReservationStatus)
  const addReservation = useStore((s) => s.addReservation)
  const deleteReservation = useStore((s) => s.deleteReservation)
  const serviceDate = useStore((s) => s.service.currentDate)
  const isBlockedToday = table.blockedDates.includes(serviceDate)

  const tableReservations = useMemo(
    () => reservations.sort((a, b) => a.time.localeCompare(b.time)),
    [reservations]
  )
  const currentReservation = tableReservations[0]

  const handleLiberate = (r: Reservation) => {
    setReservationStatus(r.id, 'completed')
    onClose()
  }

  const handleCopy = (r: Reservation) => {
    addReservation({
      guestId: r.guestId,
      guestName: r.guestName,
      guestSurname: r.guestSurname,
      guestPhone: r.guestPhone,
      guestPhoneCountry: r.guestPhoneCountry,
      guestEmail: r.guestEmail,
      guestLanguage: r.guestLanguage,
      guestCompany: r.guestCompany,
      date: r.date,
      time: r.time,
      partySize: r.partySize,
      tableIds: r.tableIds,
      status: 'pending',
      channel: r.channel,
      type: r.type,
      prescriptor: r.prescriptor,
      notes: r.notes,
      guestNotes: r.guestNotes,
      tags: r.tags,
      takenBy: r.takenBy,
      reconfirmationStatus: 'pending',
      shiftId: r.shiftId,
    })
  }

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        className="fixed z-50 w-[640px] max-w-[calc(100vw-2rem)] bg-[#eef2f7] text-slate-800 rounded-xl shadow-2xl border border-slate-300"
        style={{
          left: Math.min(position.x, window.innerWidth - 660),
          top: Math.min(position.y, window.innerHeight - 400),
        }}
      >
        {/* Header with top actions */}
        <div className="flex items-center gap-2 p-3 border-b border-slate-300 bg-slate-100 rounded-t-xl">
          <span className="font-semibold text-sm px-2">
            Mesa: {table.name} de {table.capacityMax} Pax
          </span>
          <div className="flex-1" />
          <button
            onClick={() => {
              onNewReservation(table.id, false)
              onClose()
            }}
            className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 rounded text-xs font-semibold text-slate-700"
          >
            NUEVA RESERVA
          </button>
          <button
            onClick={() => {
              onNewReservation(table.id, true)
              onClose()
            }}
            className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 rounded text-xs font-semibold text-slate-700"
          >
            WALK IN
          </button>
          <button
            onClick={() => {
              toggleWebBlock(table.id)
              onClose()
            }}
            className={cn(
              'px-3 py-1.5 border rounded text-xs font-semibold',
              table.webBlocked
                ? 'bg-amber-100 border-amber-300 text-amber-900'
                : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
            )}
            title={table.webBlocked ? 'Desbloquear web' : 'Bloquear para reservas web'}
          >
            BLOQUEAR WEB
          </button>
          <button
            onClick={() => {
              toggleBlockDate(table.id, serviceDate)
              onClose()
            }}
            className={cn(
              'px-3 py-1.5 border rounded text-xs font-semibold',
              isBlockedToday
                ? 'bg-red-100 border-red-300 text-red-900'
                : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
            )}
            title={isBlockedToday ? 'Desbloquear para hoy' : 'Bloquear mesa para hoy'}
          >
            {isBlockedToday ? 'DESBLOQUEAR' : 'BLOQUEAR'}
          </button>
          <a
            href="#/floor-editor"
            className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 rounded text-xs font-semibold text-slate-700"
          >
            MODIFICAR
          </a>
          <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded">
            <X size={18} className="text-slate-500" />
          </button>
        </div>

        {/* Reservation list for this table */}
        {tableReservations.length > 0 ? (
          <div className="p-3 space-y-2">
            {tableReservations.map((r, idx) => (
              <div key={r.id} className="flex items-center gap-2 bg-white rounded-lg border border-slate-200 p-2">
                <div
                  className={cn(
                    'w-3 h-3 rounded-sm',
                    getStatusColor(r.status)
                  )}
                />
                <span className="flex-1 text-sm font-medium text-slate-700">
                  {r.time} {r.guestName.toUpperCase()} {r.guestSurname.toUpperCase()} · {r.partySize} PAX
                  {r.tableIds.length > 1 && (
                    <span className="text-slate-500"> · MESAS {r.tableIds.map((tid) => {
                      const t = useStore.getState().tables.find((t) => t.id === tid)
                      return t?.name
                    }).join(',')}</span>
                  )}
                </span>
                <button
                  onClick={() => handleCopy(r)}
                  className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-[10px] font-semibold text-slate-700"
                >
                  COPIAR
                </button>
                <span className="text-xs text-slate-400 font-bold w-6 text-center">{idx + 1}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 text-center text-sm text-slate-500">
            No hay reservas en esta mesa
          </div>
        )}

        {currentReservation && (
          <>
            {/* Reservation actions row 1 */}
            <div className="grid grid-cols-4 gap-2 px-3 pb-2">
              <button
                onClick={() => {
                  onMoveReservation(currentReservation)
                  onClose()
                }}
                className="py-2 bg-white hover:bg-slate-50 border border-slate-300 rounded font-semibold text-xs text-slate-700 flex items-center justify-center gap-1.5"
              >
                <Move size={14} /> DESPLAZAR
              </button>
              <button
                onClick={() => handleLiberate(currentReservation)}
                className="py-2 bg-amber-400 hover:bg-amber-300 border border-amber-500 rounded font-semibold text-xs text-slate-900 flex items-center justify-center gap-1.5"
              >
                <Unlock size={14} /> LIBERAR
              </button>
              <button className="py-2 bg-white hover:bg-slate-50 border border-slate-300 rounded font-semibold text-xs text-slate-700 flex items-center justify-center gap-1.5">
                <Ban size={14} /> BLOQUEAR
              </button>
              <button
                onClick={() => handleCopy(currentReservation)}
                className="py-2 bg-white hover:bg-slate-50 border border-slate-300 rounded font-semibold text-xs text-slate-700 flex items-center justify-center gap-1.5"
              >
                <Copy size={14} /> COPIAR
              </button>
            </div>

            {/* Quick status change */}
            <div className="grid grid-cols-6 gap-2 px-3 pb-3">
              {quickStates.map((s) => (
                <button
                  key={s.status}
                  onClick={() => {
                    setReservationStatus(currentReservation.id, s.status)
                    onClose()
                  }}
                  className={cn(
                    'py-2 rounded font-bold text-[10px] text-white',
                    s.className
                  )}
                >
                  {s.label}
                </button>
              ))}
              <button
                onClick={() => {
                  onEditReservation(currentReservation)
                  onClose()
                }}
                className="py-2 bg-indigo-700 hover:bg-indigo-600 rounded text-white flex items-center justify-center"
                title="Añadir nota / editar"
              >
                <StickyNote size={14} />
              </button>
            </div>

            {/* Secondary actions */}
            <div className="flex gap-2 px-3 pb-3 border-t border-slate-200 pt-3">
              <button
                onClick={() => {
                  onEditReservation(currentReservation)
                  onClose()
                }}
                className="flex-1 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 rounded text-xs text-slate-600 flex items-center justify-center gap-1"
              >
                <Edit3 size={12} /> Editar reserva
              </button>
              <button
                onClick={() => {
                  if (confirm(`¿Eliminar la reserva de ${currentReservation.guestName}?`)) {
                    deleteReservation(currentReservation.id)
                    onClose()
                  }
                }}
                className="px-3 py-1.5 bg-red-50 hover:bg-red-100 border border-red-200 rounded text-xs text-red-700 font-medium"
              >
                Eliminar reserva
              </button>
            </div>
          </>
        )}
      </div>
    </>
  )
}
