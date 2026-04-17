import { useState, useMemo } from 'react'
import { X, Plus, Bell, UserCheck, Trash2, Clock, Phone, Users } from 'lucide-react'
import { useStore } from '../../store'
import { cn } from '../../lib/utils'

interface WaitlistPanelProps {
  onClose: () => void
  onConvertToReservation: (name: string, phone: string, phoneCountry: string, partySize: number, notes: string) => void
}

export function WaitlistPanel({ onClose, onConvertToReservation }: WaitlistPanelProps) {
  const waitlist = useStore((s) => s.waitlist)
  const service = useStore((s) => s.service)
  const addEntry = useStore((s) => s.addWaitlistEntry)
  const updateEntry = useStore((s) => s.updateWaitlistEntry)
  const deleteEntry = useStore((s) => s.deleteWaitlistEntry)
  const setStatus = useStore((s) => s.setWaitlistStatus)

  const [showNew, setShowNew] = useState(false)
  const [newName, setNewName] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [newPhoneCountry, setNewPhoneCountry] = useState('+34')
  const [newParty, setNewParty] = useState(2)
  const [newNotes, setNewNotes] = useState('')
  const [newEta, setNewEta] = useState(20)

  const dayEntries = useMemo(
    () =>
      waitlist
        .filter((w) => w.date === service.currentDate)
        .sort((a, b) => a.arrivedAt.localeCompare(b.arrivedAt)),
    [waitlist, service.currentDate]
  )

  const byStatus = useMemo(() => {
    const w = dayEntries.filter((e) => e.status === 'waiting')
    const n = dayEntries.filter((e) => e.status === 'notified')
    const s = dayEntries.filter((e) => e.status === 'seated')
    return { waiting: w, notified: n, seated: s }
  }, [dayEntries])

  const handleAdd = () => {
    if (!newName.trim()) {
      alert('El nombre es obligatorio')
      return
    }
    addEntry({
      name: newName.trim(),
      phone: newPhone.trim(),
      phoneCountry: newPhoneCountry,
      partySize: newParty,
      date: service.currentDate,
      notes: newNotes,
      estimatedWaitMinutes: newEta,
    })
    setNewName('')
    setNewPhone('')
    setNewParty(2)
    setNewNotes('')
    setNewEta(20)
    setShowNew(false)
  }

  const input =
    'w-full px-2 py-1.5 bg-[#1a2330] border border-[#2a3441] focus:border-amber-400 rounded text-sm text-white outline-none'
  const label = 'block text-[10px] font-medium text-gray-400 uppercase mb-1'

  const minutesAgo = (iso: string) => {
    const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
    if (diff < 1) return 'ahora'
    if (diff < 60) return `${diff}m`
    const h = Math.floor(diff / 60)
    return `${h}h ${diff % 60}m`
  }

  return (
    <div className="fixed inset-0 z-40 bg-black/50 flex items-stretch justify-end">
      <div className="bg-[#0f1620] w-full max-w-md border-l border-[#1f2936] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#1f2936]">
          <div>
            <h2 className="text-base font-semibold text-white">Lista de espera</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {byStatus.waiting.length} esperando · {byStatus.notified.length} avisados
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-[#1a2330] rounded">
            <X size={18} className="text-gray-400" />
          </button>
        </div>

        {/* New entry */}
        {showNew ? (
          <div className="p-4 border-b border-[#1f2936] bg-[#0b111a] space-y-3">
            <h3 className="text-sm font-semibold text-white">Nueva entrada</h3>
            <div>
              <label className={label}>Nombre *</label>
              <input value={newName} onChange={(e) => setNewName(e.target.value)} className={input} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className={label}>Prefijo</label>
                <select
                  value={newPhoneCountry}
                  onChange={(e) => setNewPhoneCountry(e.target.value)}
                  className={input}
                >
                  <option value="+34">+34</option>
                  <option value="+33">+33</option>
                  <option value="+44">+44</option>
                </select>
              </div>
              <div>
                <label className={label}>Teléfono</label>
                <input type="tel" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} className={input} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className={label}>Personas</label>
                <input
                  type="number"
                  value={newParty}
                  onChange={(e) => setNewParty(Number(e.target.value))}
                  className={input}
                  min={1}
                />
              </div>
              <div>
                <label className={label}>Espera estimada (min)</label>
                <input
                  type="number"
                  value={newEta}
                  onChange={(e) => setNewEta(Number(e.target.value))}
                  className={input}
                  min={5}
                  step={5}
                />
              </div>
            </div>
            <div>
              <label className={label}>Notas</label>
              <input value={newNotes} onChange={(e) => setNewNotes(e.target.value)} className={input} />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowNew(false)}
                className="flex-1 py-2 bg-[#1a2330] hover:bg-[#243040] text-gray-300 text-xs font-semibold rounded uppercase"
              >
                Cancelar
              </button>
              <button
                onClick={handleAdd}
                className="flex-1 py-2 bg-amber-400 hover:bg-amber-300 text-slate-900 text-xs font-bold rounded uppercase"
              >
                Añadir a la cola
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 border-b border-[#1f2936]">
            <button
              onClick={() => setShowNew(true)}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold text-xs rounded uppercase"
            >
              <Plus size={14} /> Añadir a la lista
            </button>
          </div>
        )}

        {/* Entries */}
        <div className="flex-1 overflow-y-auto">
          {dayEntries.length === 0 ? (
            <p className="p-8 text-center text-sm text-gray-500">La cola está vacía</p>
          ) : (
            dayEntries.map((e, idx) => (
              <div
                key={e.id}
                className={cn(
                  'px-4 py-3 border-b border-[#1f2936]',
                  e.status === 'notified' && 'bg-amber-950/20',
                  e.status === 'seated' && 'bg-emerald-950/20 opacity-60',
                  e.status === 'cancelled' && 'opacity-40'
                )}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-6 h-6 flex items-center justify-center bg-[#1a2330] rounded text-xs font-bold text-amber-300">
                    {idx + 1}
                  </span>
                  <span className="text-sm font-medium text-white">{e.name}</span>
                  {e.status === 'notified' && (
                    <Bell size={12} className="text-amber-300 ml-auto" />
                  )}
                  {e.status === 'seated' && (
                    <UserCheck size={12} className="text-emerald-400 ml-auto" />
                  )}
                </div>
                <div className="flex items-center gap-3 text-[11px] text-gray-400 pl-8">
                  <span className="flex items-center gap-1">
                    <Users size={10} /> {e.partySize}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={10} /> {minutesAgo(e.arrivedAt)}
                  </span>
                  <span className="text-gray-500">· Est. {e.estimatedWaitMinutes}m</span>
                  {e.phone && (
                    <span className="flex items-center gap-1">
                      <Phone size={10} /> {e.phoneCountry} {e.phone}
                    </span>
                  )}
                </div>
                {e.notes && <p className="pl-8 mt-1 text-[11px] text-gray-500 italic">{e.notes}</p>}

                <div className="mt-2 pl-8 flex gap-1.5">
                  {e.status === 'waiting' && (
                    <button
                      onClick={() => setStatus(e.id, 'notified')}
                      className="px-2 py-1 bg-amber-400 hover:bg-amber-300 text-slate-900 text-[10px] font-bold rounded uppercase flex items-center gap-1"
                      title="Avisar al cliente"
                    >
                      <Bell size={10} /> Avisar
                    </button>
                  )}
                  {(e.status === 'waiting' || e.status === 'notified') && (
                    <button
                      onClick={() => {
                        onConvertToReservation(e.name, e.phone, e.phoneCountry, e.partySize, e.notes)
                        setStatus(e.id, 'seated')
                      }}
                      className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold rounded uppercase flex items-center gap-1"
                    >
                      <UserCheck size={10} /> Sentar
                    </button>
                  )}
                  {e.status === 'waiting' || e.status === 'notified' ? (
                    <button
                      onClick={() => updateEntry(e.id, { status: 'cancelled' })}
                      className="px-2 py-1 bg-[#1a2330] hover:bg-[#243040] text-gray-400 text-[10px] font-bold rounded uppercase"
                    >
                      Se fue
                    </button>
                  ) : null}
                  <div className="flex-1" />
                  <button
                    onClick={() => {
                      if (confirm(`¿Eliminar a ${e.name} de la lista?`)) deleteEntry(e.id)
                    }}
                    className="p-1 text-red-400 hover:text-red-300"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
