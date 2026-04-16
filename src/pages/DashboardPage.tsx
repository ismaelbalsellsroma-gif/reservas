import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CalendarDays,
  Users,
  Clock,
  TrendingUp,
  Plus,
  MapPin,
  AlertCircle,
} from 'lucide-react'
import { useStore } from '../store'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { getTodayString, getStatusColor, getStatusLabel, formatDate } from '../lib/utils'

export function DashboardPage() {
  const reservations = useStore((s) => s.reservations)
  const tables = useStore((s) => s.tables)
  const navigate = useNavigate()
  const today = getTodayString()

  const todayReservations = useMemo(
    () =>
      reservations
        .filter((r) => r.date === today && r.status !== 'cancelled')
        .sort((a, b) => a.time.localeCompare(b.time)),
    [reservations, today]
  )

  const upcomingReservations = useMemo(
    () =>
      reservations
        .filter((r) => r.date >= today && r.status !== 'cancelled')
        .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
        .slice(0, 10),
    [reservations, today]
  )

  const totalCovers = todayReservations.reduce((sum, r) => sum + r.partySize, 0)
  const confirmedCount = todayReservations.filter((r) => r.status === 'confirmed').length
  const pendingCount = todayReservations.filter((r) => r.status === 'pending').length
  const occupiedTables = new Set(todayReservations.filter((r) => r.tableId).map((r) => r.tableId)).size

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Bienvenido</h2>
          <p className="text-gray-500 text-sm mt-1">Resumen del día de hoy</p>
        </div>
        <button
          onClick={() => navigate('/reservations')}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          <Plus size={18} />
          Nueva reserva
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <CalendarDays size={20} className="text-indigo-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{todayReservations.length}</p>
              <p className="text-xs text-gray-500">Reservas hoy</p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Users size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalCovers}</p>
              <p className="text-xs text-gray-500">Comensales</p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <Clock size={20} className="text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
              <p className="text-xs text-gray-500">Pendientes</p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp size={20} className="text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {occupiedTables}/{tables.length}
              </p>
              <p className="text-xs text-gray-500">Mesas ocupadas</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Today's reservations */}
        <Card className="lg:col-span-2">
          <div className="p-5 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Reservas de hoy</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {todayReservations.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm">
                No hay reservas para hoy
              </div>
            ) : (
              todayReservations.map((r) => (
                <div key={r.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50">
                  <div className="flex items-center gap-4">
                    <div className="text-center min-w-[50px]">
                      <p className="text-sm font-semibold text-gray-900">{r.time}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{r.guestName}</p>
                      <p className="text-xs text-gray-500">
                        {r.partySize} {r.partySize === 1 ? 'persona' : 'personas'}
                        {r.tableId && ` · ${tables.find((t) => t.id === r.tableId)?.name || ''}`}
                      </p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(r.status)}>{getStatusLabel(r.status)}</Badge>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Quick actions & stats */}
        <div className="space-y-4">
          <Card className="p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Acciones rápidas</h3>
            <div className="space-y-2">
              <button
                onClick={() => navigate('/reservations')}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-left rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Plus size={18} className="text-indigo-500" />
                <span>Nueva reserva</span>
              </button>
              <button
                onClick={() => navigate('/floor-plan')}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-left rounded-lg hover:bg-gray-50 transition-colors"
              >
                <MapPin size={18} className="text-green-500" />
                <span>Ver mapa de mesas</span>
              </button>
              <button
                onClick={() => navigate('/calendar')}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-left rounded-lg hover:bg-gray-50 transition-colors"
              >
                <CalendarDays size={18} className="text-amber-500" />
                <span>Ver calendario</span>
              </button>
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Estado del servicio</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Confirmadas</span>
                <span className="font-medium text-blue-600">{confirmedCount}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Pendientes</span>
                <span className="font-medium text-amber-600">{pendingCount}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Mesas libres</span>
                <span className="font-medium text-green-600">{tables.length - occupiedTables}</span>
              </div>
              {pendingCount > 0 && (
                <div className="mt-3 p-3 bg-amber-50 rounded-lg flex items-start gap-2">
                  <AlertCircle size={16} className="text-amber-500 mt-0.5 shrink-0" />
                  <p className="text-xs text-amber-700">
                    Tienes {pendingCount} {pendingCount === 1 ? 'reserva pendiente' : 'reservas pendientes'} por confirmar
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Upcoming */}
          <Card>
            <div className="p-5 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Próximas reservas</h3>
            </div>
            <div className="divide-y divide-gray-50 max-h-64 overflow-y-auto">
              {upcomingReservations.filter((r) => r.date > today).length === 0 ? (
                <div className="p-6 text-center text-gray-400 text-sm">
                  Sin reservas futuras
                </div>
              ) : (
                upcomingReservations
                  .filter((r) => r.date > today)
                  .map((r) => (
                    <div key={r.id} className="px-5 py-3 hover:bg-gray-50">
                      <p className="text-sm font-medium text-gray-900">{r.guestName}</p>
                      <p className="text-xs text-gray-500">
                        {formatDate(r.date)} · {r.time} · {r.partySize} pax
                      </p>
                    </div>
                  ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
