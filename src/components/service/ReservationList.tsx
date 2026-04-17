import { useMemo, useState } from 'react'
import { Search, Bell, MessageSquare, Filter, Clock, Printer } from 'lucide-react'
import { useStore } from '../../store'
import type { Reservation } from '../../types'
import { cn, getStatusColor, getStatusLabel } from '../../lib/utils'

type StatusFilter = 'all' | 'confirmed' | 'pending' | 'waiting'

interface ReservationListProps {
  onSelectReservation: (r: Reservation) => void
  onOpenWaitlist: () => void
  onPrint: () => void
  searchQuery: string
  onSearchQueryChange: (q: string) => void
}

export function ReservationList({
  onSelectReservation,
  onOpenWaitlist,
  onPrint,
  searchQuery,
  onSearchQueryChange,
}: ReservationListProps) {
  const reservations = useStore((s) => s.reservations)
  const tables = useStore((s) => s.tables)
  const guests = useStore((s) => s.guests)
  const shifts = useStore((s) => s.shifts)
  const waitlist = useStore((s) => s.waitlist)
  const service = useStore((s) => s.service)
  const settings = useStore((s) => s.settings)
  const updateReservation = useStore((s) => s.updateReservation)

  const waitlistCount = waitlist.filter(
    (w) => w.date === service.currentDate && (w.status === 'waiting' || w.status === 'notified')
  ).length

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [shiftFilter, setShiftFilter] = useState<string | 'all'>('all')

  const filtered = useMemo(() => {
    let result = reservations.filter((r) => r.date === service.currentDate)
    if (shiftFilter !== 'all') result = result.filter((r) => r.shiftId === shiftFilter)
    if (statusFilter === 'confirmed') {
      result = result.filter((r) => ['confirmed', 'seated', 'eating', 'dessert', 'check'].includes(r.status))
    } else if (statusFilter === 'pending') {
      result = result.filter((r) => r.status === 'pending')
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (r) =>
          r.guestName.toLowerCase().includes(q) ||
          r.guestSurname.toLowerCase().includes(q) ||
          r.guestPhone.includes(q) ||
          r.code.toLowerCase().includes(q)
      )
    }
    return result.sort((a, b) => a.time.localeCompare(b.time))
  }, [reservations, service.currentDate, shiftFilter, statusFilter, searchQuery])

  const counts = useMemo(() => {
    const dayRes = reservations.filter((r) => r.date === service.currentDate)
    const total = dayRes.length
    const confirmed = dayRes.filter((r) =>
      ['confirmed', 'seated', 'eating', 'dessert', 'check'].includes(r.status)
    ).length
    const pending = dayRes.filter((r) => r.status === 'pending').length
    return { total, confirmed, pending }
  }, [reservations, service.currentDate])

  return (
    <div className="w-[380px] min-w-[380px] border-r border-[#1f2936] bg-[#0b111a] flex flex-col">
      {/* Shift filter */}
      <div className="flex gap-1 p-2 border-b border-[#1f2936]">
        <button
          onClick={() => setShiftFilter('all')}
          className={cn(
            'px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors',
            shiftFilter === 'all' ? 'bg-amber-400 text-slate-900' : 'bg-[#1a2330] text-gray-300 hover:bg-[#243040]'
          )}
        >
          DÍA COMPLETO
        </button>
        {shifts.map((shift) => (
          <button
            key={shift.id}
            onClick={() => setShiftFilter(shift.id)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors uppercase',
              shiftFilter === shift.id ? 'bg-amber-400 text-slate-900' : 'bg-[#1a2330] text-gray-300 hover:bg-[#243040]'
            )}
          >
            {shift.name}
          </button>
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex gap-1 p-2 border-b border-[#1f2936]">
        <button
          onClick={onOpenWaitlist}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-900 rounded text-xs font-bold uppercase relative"
          title="Lista de espera"
        >
          <Clock size={12} />
          Lista de espera
          {waitlistCount > 0 && (
            <span className="absolute top-0 right-1 translate-y-[-50%] w-5 h-5 bg-red-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center">
              {waitlistCount}
            </span>
          )}
        </button>
        {settings.reconfirmationEnabled && (
          <button
            onClick={() => {
              const pending = reservations.filter(
                (r) =>
                  r.date === service.currentDate &&
                  r.reconfirmationStatus === 'pending' &&
                  ['pending', 'confirmed'].includes(r.status) &&
                  (r.guestPhone || r.guestEmail)
              )
              if (pending.length === 0) {
                alert('No hay reservas pendientes de reconfirmar.')
                return
              }
              if (
                confirm(
                  `Enviar reconfirmación por ${settings.reconfirmationChannel === 'email' ? 'Email' : settings.reconfirmationChannel === 'whatsapp' ? 'WhatsApp' : 'WhatsApp y Email'} a ${pending.length} clientes?`
                )
              ) {
                pending.forEach((r) =>
                  updateReservation(r.id, { reconfirmationStatus: 'confirmed' })
                )
                alert(`Reconfirmación enviada a ${pending.length} clientes.`)
              }
            }}
            className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded flex items-center gap-1.5 text-xs font-bold uppercase"
            title="Enviar reconfirmación a todos"
          >
            <Bell size={12} />
          </button>
        )}
        <button
          onClick={onPrint}
          className="px-3 py-1.5 bg-[#1a2330] hover:bg-[#243040] text-gray-300 rounded flex items-center gap-1.5 text-xs"
          title="Imprimir turno"
        >
          <Printer size={12} />
        </button>
      </div>

      {/* Status filters */}
      <div className="flex items-center gap-1 px-2 py-2 border-b border-[#1f2936] overflow-x-auto">
        <button
          onClick={() => setStatusFilter('all')}
          className={cn(
            'px-2.5 py-1 rounded text-[11px] font-medium whitespace-nowrap flex items-center gap-1.5',
            statusFilter === 'all' ? 'bg-[#243040] text-white' : 'text-gray-400 hover:text-white'
          )}
        >
          <Filter size={10} />
          Todas ({counts.total})
        </button>
        <button
          onClick={() => setStatusFilter('confirmed')}
          className={cn(
            'px-2.5 py-1 rounded text-[11px] font-medium whitespace-nowrap flex items-center gap-1.5',
            statusFilter === 'confirmed' ? 'bg-emerald-800/40 text-emerald-200' : 'text-gray-400 hover:text-emerald-300'
          )}
        >
          <span className="w-2 h-2 rounded-sm bg-emerald-500" />
          Re/Confirmadas ({counts.confirmed})
        </button>
        <button
          onClick={() => setStatusFilter('pending')}
          className={cn(
            'px-2.5 py-1 rounded text-[11px] font-medium whitespace-nowrap flex items-center gap-1.5',
            statusFilter === 'pending' ? 'bg-amber-800/40 text-amber-200' : 'text-gray-400 hover:text-amber-300'
          )}
        >
          <span className="w-2 h-2 rounded-sm bg-amber-500" />
          Pend ({counts.pending})
        </button>
      </div>

      {/* Search */}
      <div className="relative p-2 border-b border-[#1f2936]">
        <Search size={14} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchQueryChange(e.target.value)}
          placeholder="Buscar por nombre, apellido, teléfono..."
          className="w-full pl-8 pr-3 py-2 bg-[#1a2330] border border-transparent focus:border-amber-400 rounded-lg text-xs text-white placeholder-gray-500 outline-none"
        />
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-xs text-gray-500">No hay reservas para este filtro</div>
        ) : (
          filtered.map((r) => {
            const tableNames = r.tableIds
              .map((id) => tables.find((t) => t.id === id)?.name)
              .filter(Boolean)
              .join(', ')
            const guest = guests.find((g) => g.id === r.guestId)
            return (
              <button
                key={r.id}
                onClick={() => onSelectReservation(r)}
                className="w-full text-left px-3 py-2.5 border-b border-[#1f2936] hover:bg-[#11192a] transition-colors relative"
              >
                {/* Left status bar */}
                <span className={cn('absolute left-0 top-2 bottom-2 w-0.5 rounded', getStatusColor(r.status))} />
                <div className="flex items-start gap-2 pl-1.5">
                  <span className="text-[11px] font-bold text-gray-400 w-10 pt-0.5">{tableNames || '-'}</span>
                  <span className="text-[11px] font-bold text-amber-300 w-10 pt-0.5">{r.time}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-medium text-white truncate">
                        {r.guestName} {r.guestSurname}
                      </span>
                      {guest && guest.visits > 1 && (
                        <span className="text-[9px] bg-sky-600 text-white font-bold px-1 rounded">{guest.visits}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-gray-500">{r.partySize} pax</span>
                      {r.channel !== 'phone' && (
                        <span className="text-[10px] text-gray-500">· CH: {r.channel}</span>
                      )}
                      <span className="text-[10px] text-gray-600 truncate">{getStatusLabel(r.status)}</span>
                    </div>
                    {(r.notes || r.guestNotes) && (
                      <p className="text-[10px] text-amber-400/80 mt-1 truncate italic">
                        {r.notes || r.guestNotes}
                      </p>
                    )}
                  </div>
                  {r.reconfirmationStatus === 'confirmed' ? (
                    <Bell size={12} className="text-emerald-400 shrink-0 mt-1" />
                  ) : (
                    <MessageSquare size={12} className="text-gray-600 shrink-0 mt-1" />
                  )}
                </div>
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}
