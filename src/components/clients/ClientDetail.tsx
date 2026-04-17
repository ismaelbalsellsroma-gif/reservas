import { useState, useMemo } from 'react'
import { ArrowLeft, Mail, Phone, CalendarPlus, Edit3, Trash2, GitMerge, X } from 'lucide-react'
import { useStore } from '../../store'
import type { Guest } from '../../types'
import { cn, getStatusColor, getStatusLabel, formatDate } from '../../lib/utils'

interface ClientDetailProps {
  guest: Guest
  onClose: () => void
  onEdit: () => void
}

export function ClientDetail({ guest, onClose, onEdit }: ClientDetailProps) {
  const reservations = useStore((s) => s.reservations)
  const tables = useStore((s) => s.tables)
  const guests = useStore((s) => s.guests)
  const deleteGuest = useStore((s) => s.deleteGuest)
  const mergeGuests = useStore((s) => s.mergeGuests)

  const [showMerge, setShowMerge] = useState(false)

  const guestReservations = useMemo(
    () =>
      reservations
        .filter((r) => r.guestId === guest.id)
        .sort((a, b) => b.date.localeCompare(a.date) || b.time.localeCompare(a.time)),
    [reservations, guest.id]
  )

  const totalCovers = guestReservations.reduce((s, r) => s + r.partySize, 0)
  const avgCovers = guestReservations.length > 0 ? (totalCovers / guestReservations.length).toFixed(1) : '-'

  const initials = (guest.name + ' ' + guest.surname)
    .split(' ')
    .filter(Boolean)
    .map((s) => s[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="fixed inset-0 z-40 bg-black/50 flex items-stretch justify-end">
      <div className="bg-[#0f1620] w-full max-w-5xl border-l border-[#1f2936] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center gap-3 p-4 bg-[#0f1620] border-b border-[#1f2936]">
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-3 py-1.5 bg-[#1a2330] hover:bg-[#243040] text-gray-300 rounded text-sm"
          >
            <ArrowLeft size={14} /> Volver
          </button>
          <div className="flex-1" />
          <button
            className="flex items-center gap-2 px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-900 rounded text-xs font-bold uppercase"
          >
            <CalendarPlus size={13} /> Añadir reserva
          </button>
          {guest.email && (
            <button className="flex items-center gap-2 px-3 py-1.5 bg-[#1a2330] hover:bg-[#243040] text-gray-300 rounded text-xs font-semibold uppercase">
              <Mail size={13} /> Enviar email
            </button>
          )}
          {guest.phone && (
            <button className="flex items-center gap-2 px-3 py-1.5 bg-[#1a2330] hover:bg-[#243040] text-gray-300 rounded text-xs font-semibold uppercase">
              <Phone size={13} /> Enviar WhatsApp
            </button>
          )}
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center hover:bg-[#1a2330] rounded"
          >
            <X size={16} className="text-gray-400" />
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left: profile card */}
          <aside className="lg:col-span-1 space-y-3">
            <div className="bg-[#1a2330] border border-[#2a3441] rounded-lg p-5 text-center">
              <div
                className={cn(
                  'w-20 h-20 rounded-full mx-auto flex items-center justify-center font-bold text-xl',
                  guest.vip ? 'bg-amber-400 text-slate-900' : 'bg-emerald-600 text-white'
                )}
              >
                {initials}
              </div>
              <h2 className="text-lg font-semibold text-white mt-3">
                {guest.name} {guest.surname}
                {guest.vip && <span className="ml-2 text-yellow-400">★</span>}
              </h2>
              <div className="mt-2 text-xs text-gray-400 space-y-1">
                <div>País: España</div>
                <div>Idioma: {guest.language.toUpperCase()}</div>
                {guest.company && <div>Empresa: {guest.company}</div>}
              </div>
            </div>

            <button
              onClick={onEdit}
              className="w-full bg-[#1a2330] hover:bg-[#243040] text-gray-300 py-2 rounded text-xs font-semibold uppercase flex items-center justify-center gap-2"
            >
              <Edit3 size={12} /> Editar datos
            </button>
            <button
              onClick={() => setShowMerge(true)}
              className="w-full bg-[#1a2330] hover:bg-[#243040] text-gray-300 py-2 rounded text-xs font-semibold uppercase flex items-center justify-center gap-2"
            >
              <GitMerge size={12} /> Unificar cliente
            </button>
            <button
              onClick={() => {
                if (confirm(`¿Eliminar al cliente ${guest.name} ${guest.surname}?`)) {
                  deleteGuest(guest.id)
                  onClose()
                }
              }}
              className="w-full bg-red-500/80 hover:bg-red-500 text-white py-2 rounded text-xs font-semibold uppercase flex items-center justify-center gap-2"
            >
              <Trash2 size={12} /> Eliminar cliente
            </button>
          </aside>

          {/* Right: summary and history */}
          <div className="lg:col-span-3 space-y-4">
            <section className="bg-[#1a2330] border border-[#2a3441] rounded-lg p-5">
              <h3 className="text-[11px] font-semibold text-gray-400 uppercase mb-4">
                Resumen de comportamiento
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Stat label="Última visita" value={guest.lastVisit ? formatDate(guest.lastVisit) : '-'} />
                <Stat label="Gasto total" value="-" />
                <Stat label="Gasto por visita" value="-" />
                <Stat label="Gasto por persona" value="-" />
                <Stat label="Visitas" value={String(guest.visits)} big />
                <Stat label="No-shows" value={String(guest.noShows)} big />
                <Stat label="Canceladas" value={String(guest.cancellations)} big />
                <Stat label="Media de valoraciones" value="-" />
                <Stat label="Media comensales / reserva" value={avgCovers} />
                <Stat label="Reservas como invitado" value="0" />
                <Stat label="Listas de espera" value="0" />
                <Stat label="Etiquetas" value={String(guest.tags.length)} />
              </div>
              {guest.tags.length > 0 && (
                <div className="mt-4 pt-4 border-t border-[#2a3441] flex flex-wrap gap-1.5">
                  {guest.tags.map((t) => (
                    <span
                      key={t}
                      className="px-2 py-0.5 bg-amber-400/10 text-amber-300 rounded-full text-xs font-medium border border-amber-400/30"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}
              {guest.notes && (
                <div className="mt-4 pt-4 border-t border-[#2a3441]">
                  <p className="text-[11px] font-semibold text-gray-400 uppercase mb-1">Notas</p>
                  <p className="text-sm text-gray-300 italic">{guest.notes}</p>
                </div>
              )}
            </section>

            <section className="bg-[#1a2330] border border-[#2a3441] rounded-lg">
              <div className="p-5 border-b border-[#2a3441]">
                <h3 className="text-[11px] font-semibold text-gray-400 uppercase">
                  Histórico de comportamientos
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-[#0b111a] text-[10px] uppercase text-gray-500">
                    <tr>
                      <th className="px-3 py-2 text-left">Estado</th>
                      <th className="px-3 py-2 text-left">Fecha</th>
                      <th className="px-3 py-2 text-left">Hora</th>
                      <th className="px-3 py-2 text-left">Personas</th>
                      <th className="px-3 py-2 text-left">Mesa(s)</th>
                      <th className="px-3 py-2 text-left">Notas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {guestReservations.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-3 py-8 text-center text-sm text-gray-500">
                          Sin reservas registradas
                        </td>
                      </tr>
                    ) : (
                      guestReservations.map((r) => {
                        const tableNames = r.tableIds
                          .map((id) => tables.find((t) => t.id === id)?.name)
                          .filter(Boolean)
                          .join(', ')
                        return (
                          <tr key={r.id} className="border-t border-[#2a3441]">
                            <td className="px-3 py-2">
                              <span
                                className={cn(
                                  'px-2 py-0.5 rounded-full text-[10px] font-semibold',
                                  getStatusColor(r.status)
                                )}
                              >
                                {getStatusLabel(r.status)}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-gray-300">{r.date}</td>
                            <td className="px-3 py-2 text-gray-300">{r.time}</td>
                            <td className="px-3 py-2 text-gray-300">{r.partySize}</td>
                            <td className="px-3 py-2 text-gray-300">{tableNames || '—'}</td>
                            <td className="px-3 py-2 text-xs text-gray-400 italic">
                              {r.notes || r.guestNotes || '—'}
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </div>
      </div>

      {showMerge && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-[#0f1620] border border-[#1f2936] rounded-xl w-full max-w-md p-5">
            <h3 className="text-base font-semibold text-white mb-2">Unificar con otro cliente</h3>
            <p className="text-xs text-gray-500 mb-4">
              Selecciona el cliente que quieres fusionar con <strong className="text-white">{guest.name} {guest.surname}</strong>. Las reservas del cliente fusionado se transferirán a este y el otro registro se eliminará.
            </p>
            <div className="max-h-80 overflow-y-auto space-y-1">
              {guests
                .filter((g) => g.id !== guest.id)
                .map((g) => (
                  <button
                    key={g.id}
                    onClick={() => {
                      if (confirm(`¿Unificar "${g.name} ${g.surname}" en "${guest.name} ${guest.surname}"?`)) {
                        mergeGuests(guest.id, g.id)
                        setShowMerge(false)
                      }
                    }}
                    className="w-full text-left px-3 py-2 bg-[#1a2330] hover:bg-[#243040] rounded text-sm text-white flex justify-between"
                  >
                    <span>{g.name} {g.surname}</span>
                    <span className="text-xs text-gray-500">{g.phoneCountry} {g.phone}</span>
                  </button>
                ))}
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowMerge(false)}
                className="px-4 py-2 text-sm text-gray-300 hover:text-white"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Stat({ label, value, big }: { label: string; value: string; big?: boolean }) {
  return (
    <div>
      <div className={cn('text-white font-semibold', big ? 'text-2xl' : 'text-sm')}>{value}</div>
      <div className="text-[10px] text-gray-500 uppercase mt-0.5">{label}</div>
    </div>
  )
}
