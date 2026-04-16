import { useState, useMemo } from 'react'
import { useStore } from '../store'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Modal } from '../components/ui/Modal'
import { ReservationForm } from '../components/reservations/ReservationForm'
import { getTodayString, getStatusColor, getStatusLabel, cn } from '../lib/utils'
import { Plus, Users, Clock, Info } from 'lucide-react'
import type { Reservation, Table } from '../types'

function getTableStatus(table: Table, reservations: Reservation[]): 'free' | 'reserved' | 'occupied' {
  const now = new Date()
  const currentMinutes = now.getHours() * 60 + now.getMinutes()

  for (const r of reservations) {
    if (r.tableId !== table.id || r.status === 'cancelled' || r.status === 'no-show') continue

    const [h, m] = r.time.split(':').map(Number)
    const startMinutes = h * 60 + m
    const endMinutes = startMinutes + 90

    if (r.status === 'seated') return 'occupied'
    if (r.status === 'confirmed' && currentMinutes >= startMinutes - 30 && currentMinutes <= endMinutes) {
      return 'reserved'
    }
  }
  return 'free'
}

const statusConfig = {
  free: { color: 'bg-green-500', border: 'border-green-600', label: 'Libre', textColor: 'text-white' },
  reserved: { color: 'bg-amber-500', border: 'border-amber-600', label: 'Reservada', textColor: 'text-white' },
  occupied: { color: 'bg-red-500', border: 'border-red-600', label: 'Ocupada', textColor: 'text-white' },
}

export function FloorPlanPage() {
  const tables = useStore((s) => s.tables)
  const reservations = useStore((s) => s.reservations)
  const addReservation = useStore((s) => s.addReservation)
  const settings = useStore((s) => s.settings)

  const today = getTodayString()
  const [selectedTable, setSelectedTable] = useState<Table | null>(null)
  const [selectedZone, setSelectedZone] = useState<string>('all')
  const [showNewReservation, setShowNewReservation] = useState(false)

  const todayReservations = useMemo(
    () => reservations.filter((r) => r.date === today && r.status !== 'cancelled'),
    [reservations, today]
  )

  const filteredTables = selectedZone === 'all' ? tables : tables.filter((t) => t.zone === selectedZone)

  const tableReservations = useMemo(
    () =>
      selectedTable
        ? todayReservations
            .filter((r) => r.tableId === selectedTable.id)
            .sort((a, b) => a.time.localeCompare(b.time))
        : [],
    [selectedTable, todayReservations]
  )

  const stats = useMemo(() => {
    let free = 0, reserved = 0, occupied = 0
    for (const t of filteredTables) {
      const status = getTableStatus(t, todayReservations)
      if (status === 'free') free++
      else if (status === 'reserved') reserved++
      else occupied++
    }
    return { free, reserved, occupied }
  }, [filteredTables, todayReservations])

  const getTableDimensions = (table: Table) => {
    if (table.shape === 'round') return { w: 70, h: 70 }
    if (table.shape === 'rectangle') return { w: 120, h: 60 }
    return { w: 70, h: 70 }
  }

  return (
    <div className="space-y-4">
      {/* Zone filter & legend */}
      <div className="flex flex-col sm:flex-row justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setSelectedZone('all')}
            className={cn(
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
              selectedZone === 'all' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            Todas
          </button>
          {settings.zones.map((zone) => (
            <button
              key={zone}
              onClick={() => setSelectedZone(zone)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                selectedZone === zone ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              {zone}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-green-500" /> Libre ({stats.free})
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-500" /> Reservada ({stats.reserved})
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500" /> Ocupada ({stats.occupied})
          </span>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Floor plan SVG */}
        <Card className="lg:col-span-2 p-4">
          <svg viewBox="0 0 600 480" className="w-full h-auto bg-gray-50 rounded-lg">
            {/* Grid lines */}
            {Array.from({ length: 12 }).map((_, i) => (
              <line key={`v${i}`} x1={i * 50} y1={0} x2={i * 50} y2={480} stroke="#f3f4f6" strokeWidth={1} />
            ))}
            {Array.from({ length: 10 }).map((_, i) => (
              <line key={`h${i}`} x1={0} y1={i * 50} x2={600} y2={i * 50} stroke="#f3f4f6" strokeWidth={1} />
            ))}

            {filteredTables.map((table) => {
              const status = getTableStatus(table, todayReservations)
              const config = statusConfig[status]
              const dim = getTableDimensions(table)
              const isSelected = selectedTable?.id === table.id

              return (
                <g
                  key={table.id}
                  onClick={() => setSelectedTable(selectedTable?.id === table.id ? null : table)}
                  className="cursor-pointer"
                >
                  {table.shape === 'round' ? (
                    <circle
                      cx={table.x + dim.w / 2}
                      cy={table.y + dim.h / 2}
                      r={dim.w / 2}
                      className={cn(
                        status === 'free' ? 'fill-green-500' : status === 'reserved' ? 'fill-amber-500' : 'fill-red-500',
                        isSelected ? 'stroke-indigo-600 stroke-[3]' : 'stroke-white stroke-2'
                      )}
                      opacity={0.9}
                    />
                  ) : (
                    <rect
                      x={table.x}
                      y={table.y}
                      width={dim.w}
                      height={dim.h}
                      rx={8}
                      className={cn(
                        status === 'free' ? 'fill-green-500' : status === 'reserved' ? 'fill-amber-500' : 'fill-red-500',
                        isSelected ? 'stroke-indigo-600 stroke-[3]' : 'stroke-white stroke-2'
                      )}
                      opacity={0.9}
                    />
                  )}
                  <text
                    x={table.x + dim.w / 2}
                    y={table.y + dim.h / 2 - 6}
                    textAnchor="middle"
                    className="fill-white text-[11px] font-bold pointer-events-none"
                  >
                    {table.name}
                  </text>
                  <text
                    x={table.x + dim.w / 2}
                    y={table.y + dim.h / 2 + 10}
                    textAnchor="middle"
                    className="fill-white/80 text-[10px] pointer-events-none"
                  >
                    {table.capacity} pax
                  </text>
                </g>
              )
            })}
          </svg>
        </Card>

        {/* Side panel */}
        <div className="space-y-4">
          {selectedTable ? (
            <>
              <Card className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 text-lg">{selectedTable.name}</h3>
                  <Badge className={statusConfig[getTableStatus(selectedTable, todayReservations)].color + ' text-white'}>
                    {statusConfig[getTableStatus(selectedTable, todayReservations)].label}
                  </Badge>
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Users size={14} />
                    Capacidad: {selectedTable.capacity} personas
                  </div>
                  <div className="flex items-center gap-2">
                    <Info size={14} />
                    Zona: {selectedTable.zone}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="capitalize">Forma: {selectedTable.shape === 'round' ? 'Redonda' : selectedTable.shape === 'rectangle' ? 'Rectangular' : 'Cuadrada'}</span>
                  </div>
                </div>
                <button
                  onClick={() => setShowNewReservation(true)}
                  className="mt-4 w-full flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700"
                >
                  <Plus size={16} />
                  Reservar esta mesa
                </button>
              </Card>

              <Card>
                <div className="p-4 border-b border-gray-100">
                  <h4 className="font-medium text-gray-900 text-sm">Reservas de hoy</h4>
                </div>
                {tableReservations.length === 0 ? (
                  <div className="p-6 text-center text-gray-400 text-sm">Sin reservas</div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {tableReservations.map((r) => (
                      <div key={r.id} className="px-4 py-3">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">{r.guestName}</span>
                          <Badge className={getStatusColor(r.status) + ' text-[10px]'}>{getStatusLabel(r.status)}</Badge>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                          <span className="flex items-center gap-1"><Clock size={10} /> {r.time}</span>
                          <span className="flex items-center gap-1"><Users size={10} /> {r.partySize} pax</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </>
          ) : (
            <Card className="p-8 text-center">
              <div className="text-gray-300 mb-3">
                <Info size={40} className="mx-auto" />
              </div>
              <p className="text-sm text-gray-500">Selecciona una mesa para ver sus detalles y reservas</p>
            </Card>
          )}
        </div>
      </div>

      <Modal
        open={showNewReservation}
        onClose={() => setShowNewReservation(false)}
        title={`Reservar ${selectedTable?.name || ''}`}
        size="lg"
      >
        <ReservationForm
          onSubmit={(data) => {
            addReservation({ ...data, tableId: selectedTable?.id || null })
            setShowNewReservation(false)
          }}
          onCancel={() => setShowNewReservation(false)}
        />
      </Modal>
    </div>
  )
}
