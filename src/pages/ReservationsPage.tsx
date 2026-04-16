import { useState, useMemo } from 'react'
import {
  Plus,
  Search,
  Filter,
  Trash2,
  Edit3,
  Phone,
  Mail,
  Users,
  ChevronDown,
  BookOpen,
} from 'lucide-react'
import { useStore } from '../store'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Modal } from '../components/ui/Modal'
import { EmptyState } from '../components/ui/EmptyState'
import { ReservationForm } from '../components/reservations/ReservationForm'
import { getTodayString, getStatusColor, getStatusLabel, formatDate } from '../lib/utils'
import type { Reservation, ReservationStatus } from '../types'

export function ReservationsPage() {
  const reservations = useStore((s) => s.reservations)
  const tables = useStore((s) => s.tables)
  const addReservation = useStore((s) => s.addReservation)
  const updateReservation = useStore((s) => s.updateReservation)
  const deleteReservation = useStore((s) => s.deleteReservation)

  const [showForm, setShowForm] = useState(false)
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<ReservationStatus | 'all'>('all')
  const [dateFilter, setDateFilter] = useState(getTodayString())
  const [showFilters, setShowFilters] = useState(false)

  const filtered = useMemo(() => {
    let result = [...reservations]
    if (dateFilter) {
      result = result.filter((r) => r.date === dateFilter)
    }
    if (statusFilter !== 'all') {
      result = result.filter((r) => r.status === statusFilter)
    }
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (r) =>
          r.guestName.toLowerCase().includes(q) ||
          r.guestPhone.includes(q) ||
          r.guestEmail.toLowerCase().includes(q)
      )
    }
    return result.sort((a, b) => a.time.localeCompare(b.time))
  }, [reservations, dateFilter, statusFilter, search])

  const handleCreate = (data: Omit<Reservation, 'id' | 'createdAt'>) => {
    addReservation(data)
    setShowForm(false)
  }

  const handleUpdate = (data: Omit<Reservation, 'id' | 'createdAt'>) => {
    if (editingReservation) {
      updateReservation(editingReservation.id, data)
      setEditingReservation(null)
    }
  }

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de eliminar esta reserva?')) {
      deleteReservation(id)
    }
  }

  const handleQuickStatus = (id: string, status: ReservationStatus) => {
    updateReservation(id, { status })
  }

  return (
    <div className="space-y-4">
      {/* Actions bar */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre, teléfono..."
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50"
          >
            <Filter size={16} />
            Filtros
            <ChevronDown size={14} className={showFilters ? 'rotate-180 transition-transform' : 'transition-transform'} />
          </button>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          <Plus size={18} />
          Nueva reserva
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card className="p-4">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Fecha</label>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Estado</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as ReservationStatus | 'all')}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm"
              >
                <option value="all">Todos</option>
                <option value="pending">Pendiente</option>
                <option value="confirmed">Confirmada</option>
                <option value="seated">Sentados</option>
                <option value="completed">Completada</option>
                <option value="cancelled">Cancelada</option>
                <option value="no-show">No presentado</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setDateFilter('')
                  setStatusFilter('all')
                  setSearch('')
                }}
                className="text-sm text-indigo-600 hover:text-indigo-800"
              >
                Limpiar filtros
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* Results count */}
      <p className="text-sm text-gray-500">
        {filtered.length} {filtered.length === 1 ? 'reserva' : 'reservas'}
        {dateFilter && ` · ${formatDate(dateFilter)}`}
      </p>

      {/* Reservation list */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<BookOpen size={48} />}
          title="No hay reservas"
          description="No se encontraron reservas con los filtros seleccionados."
          action={
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700"
            >
              <Plus size={18} />
              Crear reserva
            </button>
          }
        />
      ) : (
        <div className="space-y-2">
          {filtered.map((r) => (
            <Card key={r.id} className="p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-4">
                  <div className="text-center min-w-[52px] py-1 bg-gray-50 rounded-lg">
                    <p className="text-lg font-bold text-gray-900">{r.time}</p>
                    <p className="text-[10px] text-gray-500 uppercase">{formatDate(r.date)}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900">{r.guestName}</p>
                      <Badge className={getStatusColor(r.status)}>{getStatusLabel(r.status)}</Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Users size={12} />
                        {r.partySize} pax
                      </span>
                      {r.guestPhone && (
                        <span className="flex items-center gap-1">
                          <Phone size={12} />
                          {r.guestPhone}
                        </span>
                      )}
                      {r.guestEmail && (
                        <span className="flex items-center gap-1">
                          <Mail size={12} />
                          {r.guestEmail}
                        </span>
                      )}
                      {r.tableId && (
                        <span className="font-medium text-indigo-600">
                          {tables.find((t) => t.id === r.tableId)?.name || 'Mesa asignada'}
                        </span>
                      )}
                    </div>
                    {r.notes && <p className="text-xs text-gray-400 mt-1 italic">"{r.notes}"</p>}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {r.status === 'pending' && (
                    <button
                      onClick={() => handleQuickStatus(r.id, 'confirmed')}
                      className="px-3 py-1.5 text-xs font-medium bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100"
                    >
                      Confirmar
                    </button>
                  )}
                  {r.status === 'confirmed' && (
                    <button
                      onClick={() => handleQuickStatus(r.id, 'seated')}
                      className="px-3 py-1.5 text-xs font-medium bg-green-50 text-green-700 rounded-lg hover:bg-green-100"
                    >
                      Sentar
                    </button>
                  )}
                  {r.status === 'seated' && (
                    <button
                      onClick={() => handleQuickStatus(r.id, 'completed')}
                      className="px-3 py-1.5 text-xs font-medium bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100"
                    >
                      Completar
                    </button>
                  )}
                  <button
                    onClick={() => setEditingReservation(r)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <Edit3 size={16} className="text-gray-500" />
                  </button>
                  <button
                    onClick={() => handleDelete(r.id)}
                    className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 size={16} className="text-red-400" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create modal */}
      <Modal open={showForm} onClose={() => setShowForm(false)} title="Nueva reserva" size="lg">
        <ReservationForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
      </Modal>

      {/* Edit modal */}
      <Modal
        open={!!editingReservation}
        onClose={() => setEditingReservation(null)}
        title="Editar reserva"
        size="lg"
      >
        {editingReservation && (
          <ReservationForm
            reservation={editingReservation}
            onSubmit={handleUpdate}
            onCancel={() => setEditingReservation(null)}
          />
        )}
      </Modal>
    </div>
  )
}
