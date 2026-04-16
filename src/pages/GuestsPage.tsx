import { useState, useMemo } from 'react'
import {
  Search,
  Plus,
  Star,
  Edit3,
  Trash2,
  Phone,
  Mail,
  Calendar,
  Users as UsersIcon,
} from 'lucide-react'
import { useStore } from '../store'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Modal } from '../components/ui/Modal'
import { EmptyState } from '../components/ui/EmptyState'
import { cn, formatDate } from '../lib/utils'
import type { Guest } from '../types'

function GuestForm({
  guest,
  onSubmit,
  onCancel,
}: {
  guest?: Guest
  onSubmit: (data: Omit<Guest, 'id' | 'visits' | 'lastVisit'>) => void
  onCancel: () => void
}) {
  const [name, setName] = useState(guest?.name || '')
  const [phone, setPhone] = useState(guest?.phone || '')
  const [email, setEmail] = useState(guest?.email || '')
  const [vip, setVip] = useState(guest?.vip || false)
  const [notes, setNotes] = useState(guest?.notes || '')
  const [tags, setTags] = useState(guest?.tags.join(', ') || '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      name,
      phone,
      email,
      vip,
      notes,
      tags: tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    })
  }

  const inputClass = 'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500'
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1'

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className={labelClass}>Nombre *</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} required />
        </div>
        <div>
          <label className={labelClass}>Teléfono</label>
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass}>Etiquetas (separadas por coma)</label>
          <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} className={inputClass} placeholder="VIP, Alergia, Regular..." />
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass}>Notas</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className={inputClass} rows={2} />
        </div>
        <div className="sm:col-span-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={vip} onChange={(e) => setVip(e.target.checked)} className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
            <span className="text-sm font-medium text-gray-700">Cliente VIP</span>
          </label>
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
          Cancelar
        </button>
        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">
          {guest ? 'Guardar' : 'Crear cliente'}
        </button>
      </div>
    </form>
  )
}

export function GuestsPage() {
  const guests = useStore((s) => s.guests)
  const reservations = useStore((s) => s.reservations)
  const addGuest = useStore((s) => s.addGuest)
  const updateGuest = useStore((s) => s.updateGuest)
  const deleteGuest = useStore((s) => s.deleteGuest)

  const [search, setSearch] = useState('')
  const [vipOnly, setVipOnly] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null)
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null)

  const filtered = useMemo(() => {
    let result = [...guests]
    if (vipOnly) result = result.filter((g) => g.vip)
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (g) => g.name.toLowerCase().includes(q) || g.phone.includes(q) || g.email.toLowerCase().includes(q)
      )
    }
    return result.sort((a, b) => a.name.localeCompare(b.name))
  }, [guests, search, vipOnly])

  const guestReservations = useMemo(
    () =>
      selectedGuest
        ? reservations
            .filter((r) => r.guestId === selectedGuest.id)
            .sort((a, b) => b.date.localeCompare(a.date))
        : [],
    [selectedGuest, reservations]
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar cliente..."
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            onClick={() => setVipOnly(!vipOnly)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              vipOnly ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            <Star size={14} />
            VIP
          </button>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700"
        >
          <Plus size={18} />
          Nuevo cliente
        </button>
      </div>

      <p className="text-sm text-gray-500">{filtered.length} clientes</p>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-2">
          {filtered.length === 0 ? (
            <EmptyState
              icon={<UsersIcon size={48} />}
              title="No hay clientes"
              description="Añade tu primer cliente para empezar a gestionar tu base de datos."
              action={
                <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">
                  <Plus size={18} /> Nuevo cliente
                </button>
              }
            />
          ) : (
            filtered.map((g) => (
              <Card
                key={g.id}
                onClick={() => setSelectedGuest(g)}
                className={cn('p-4', selectedGuest?.id === g.id && 'ring-2 ring-indigo-500')}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn('w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold', g.vip ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600')}>
                      {g.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{g.name}</span>
                        {g.vip && <Star size={14} className="text-amber-500 fill-amber-500" />}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                        {g.phone && <span className="flex items-center gap-1"><Phone size={10} /> {g.phone}</span>}
                        {g.email && <span className="flex items-center gap-1"><Mail size={10} /> {g.email}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">{g.visits} visitas</span>
                    <button onClick={(e) => { e.stopPropagation(); setEditingGuest(g) }} className="p-1.5 hover:bg-gray-100 rounded-lg">
                      <Edit3 size={14} className="text-gray-400" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); if (confirm('¿Eliminar este cliente?')) deleteGuest(g.id) }} className="p-1.5 hover:bg-red-50 rounded-lg">
                      <Trash2 size={14} className="text-red-400" />
                    </button>
                  </div>
                </div>
                {g.tags.length > 0 && (
                  <div className="flex gap-1.5 mt-2">
                    {g.tags.map((tag) => (
                      <Badge key={tag} className="bg-gray-100 text-gray-600">{tag}</Badge>
                    ))}
                  </div>
                )}
              </Card>
            ))
          )}
        </div>

        {/* Guest detail panel */}
        <div>
          {selectedGuest ? (
            <Card>
              <div className="p-5 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className={cn('w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold', selectedGuest.vip ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600')}>
                    {selectedGuest.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{selectedGuest.name}</h3>
                      {selectedGuest.vip && <Star size={16} className="text-amber-500 fill-amber-500" />}
                    </div>
                    <p className="text-xs text-gray-500">{selectedGuest.visits} visitas</p>
                  </div>
                </div>
              </div>
              <div className="p-5 space-y-3 text-sm">
                {selectedGuest.phone && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone size={14} /> {selectedGuest.phone}
                  </div>
                )}
                {selectedGuest.email && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail size={14} /> {selectedGuest.email}
                  </div>
                )}
                {selectedGuest.lastVisit && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar size={14} /> Última visita: {formatDate(selectedGuest.lastVisit)}
                  </div>
                )}
                {selectedGuest.notes && (
                  <p className="text-gray-500 italic text-xs bg-gray-50 p-3 rounded-lg">"{selectedGuest.notes}"</p>
                )}
              </div>
              <div className="border-t border-gray-100">
                <div className="p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Historial de reservas</h4>
                </div>
                {guestReservations.length === 0 ? (
                  <div className="px-4 pb-4 text-xs text-gray-400">Sin reservas registradas</div>
                ) : (
                  <div className="divide-y divide-gray-50 max-h-60 overflow-y-auto">
                    {guestReservations.map((r) => (
                      <div key={r.id} className="px-4 py-2.5">
                        <div className="flex justify-between text-xs">
                          <span className="font-medium text-gray-700">{formatDate(r.date)} · {r.time}</span>
                          <span className="text-gray-400">{r.partySize} pax</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          ) : (
            <Card className="p-8 text-center">
              <UsersIcon size={40} className="mx-auto text-gray-300 mb-3" />
              <p className="text-sm text-gray-500">Selecciona un cliente para ver su perfil</p>
            </Card>
          )}
        </div>
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Nuevo cliente">
        <GuestForm
          onSubmit={(data) => {
            addGuest(data)
            setShowForm(false)
          }}
          onCancel={() => setShowForm(false)}
        />
      </Modal>

      <Modal open={!!editingGuest} onClose={() => setEditingGuest(null)} title="Editar cliente">
        {editingGuest && (
          <GuestForm
            guest={editingGuest}
            onSubmit={(data) => {
              updateGuest(editingGuest.id, data)
              setEditingGuest(null)
            }}
            onCancel={() => setEditingGuest(null)}
          />
        )}
      </Modal>
    </div>
  )
}
