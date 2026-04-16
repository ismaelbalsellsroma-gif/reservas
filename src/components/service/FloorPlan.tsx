import { useMemo, useState } from 'react'
import type { Table, Reservation, Decoration } from '../../types'
import { useStore } from '../../store'
import { cn } from '../../lib/utils'
import { TablePopup } from './TablePopup'

interface FloorPlanProps {
  onNewReservation: (tableId: string, walkIn?: boolean) => void
  onEditReservation: (reservation: Reservation) => void
  onMoveReservation: (reservation: Reservation) => void
}

function getReservationForTable(table: Table, reservations: Reservation[]): Reservation[] {
  return reservations.filter((r) => r.tableIds.includes(table.id))
}

function getTableBackground(reservations: Reservation[]): {
  bg: string
  text: string
} {
  if (reservations.length === 0) return { bg: '#6b3f1b', text: '#fed7aa' } // marrón libre
  const r = reservations[0]
  const colors: Record<string, { bg: string; text: string }> = {
    pending: { bg: '#d97706', text: '#ffffff' },
    confirmed: { bg: '#16a34a', text: '#ffffff' },
    seated: { bg: '#15803d', text: '#ffffff' },
    eating: { bg: '#0284c7', text: '#ffffff' },
    dessert: { bg: '#38bdf8', text: '#0c4a6e' },
    check: { bg: '#6366f1', text: '#ffffff' },
    completed: { bg: '#64748b', text: '#ffffff' },
    cancelled: { bg: '#475569', text: '#ffffff' },
    'cancelled-client': { bg: '#475569', text: '#ffffff' },
    'no-show': { bg: '#dc2626', text: '#ffffff' },
  }
  return colors[r.status] ?? colors.confirmed
}

function TableShape({
  table,
  reservations,
  onClick,
}: {
  table: Table
  reservations: Reservation[]
  onClick: (e: React.MouseEvent) => void
}) {
  const { bg, text } = getTableBackground(reservations)
  const r = reservations[0]
  const isCombined = r && r.tableIds.length > 1
  const roundRadius = table.shape === 'round' ? Math.min(table.width, table.height) / 2 : 10

  return (
    <g onClick={onClick} style={{ cursor: 'pointer' }}>
      {table.shape === 'round' ? (
        <circle
          cx={table.x + table.width / 2}
          cy={table.y + table.height / 2}
          r={roundRadius}
          fill={bg}
          stroke="rgba(0,0,0,0.3)"
          strokeWidth={1}
        />
      ) : (
        <rect
          x={table.x}
          y={table.y}
          width={table.width}
          height={table.height}
          rx={8}
          ry={8}
          fill={bg}
          stroke="rgba(0,0,0,0.3)"
          strokeWidth={1}
        />
      )}
      {/* Combined indicator (star-like cluster) */}
      {isCombined && (
        <text
          x={table.x + 4}
          y={table.y + 12}
          fontSize="12"
          fill="#fde047"
        >
          ★
        </text>
      )}
      {/* Web-blocked lock */}
      {table.webBlocked && (
        <text
          x={table.x + table.width / 2 - 20}
          y={table.y + 14}
          fontSize="10"
          fill="#fef3c7"
        >
          🔒
        </text>
      )}
      {/* Text content */}
      <text
        x={table.x + table.width / 2}
        y={table.y + 16}
        textAnchor="middle"
        fontSize="11"
        fontWeight="700"
        fill={text}
      >
        {table.name} ({table.capacityMax}p)
      </text>
      {r && (
        <>
          <text
            x={table.x + table.width / 2}
            y={table.y + 30}
            textAnchor="middle"
            fontSize="10"
            fontWeight="600"
            fill={text}
          >
            {r.time}
          </text>
          <text
            x={table.x + table.width / 2}
            y={table.y + 44}
            textAnchor="middle"
            fontSize="9"
            fill={text}
            style={{ pointerEvents: 'none' }}
          >
            {`${r.guestName} ${r.guestSurname}`.slice(0, Math.max(8, Math.floor(table.width / 6)))}
          </text>
        </>
      )}
    </g>
  )
}

function DecorationShape({ d }: { d: Decoration }) {
  const isWall = d.type === 'wall-h' || d.type === 'wall-v'
  if (isWall) {
    return (
      <rect
        x={d.x}
        y={d.y}
        width={d.width}
        height={d.height}
        fill="#0b111a"
        stroke="#1f2936"
        strokeWidth={0.5}
      />
    )
  }
  if (d.type === 'bar') {
    return (
      <g>
        <rect
          x={d.x}
          y={d.y}
          width={d.width}
          height={d.height}
          rx={4}
          fill="#1a2330"
          stroke="#fbbf24"
          strokeWidth={1}
          strokeDasharray="4 2"
        />
        <text
          x={d.x + d.width / 2}
          y={d.y + d.height / 2 + 4}
          textAnchor="middle"
          fontSize="11"
          fontWeight="700"
          fill="#fbbf24"
        >
          Barra
        </text>
      </g>
    )
  }
  return null
}

export function FloorPlan({ onNewReservation, onEditReservation, onMoveReservation }: FloorPlanProps) {
  const plantas = useStore((s) => s.plantas)
  const zones = useStore((s) => s.zones)
  const tables = useStore((s) => s.tables)
  const decorations = useStore((s) => s.decorations)
  const reservations = useStore((s) => s.reservations)
  const service = useStore((s) => s.service)
  const setServicePlanta = useStore((s) => s.setServicePlanta)

  const [popupState, setPopupState] = useState<{ table: Table; x: number; y: number } | null>(null)

  const currentPlantaId = service.currentPlantaId || plantas[0]?.id
  const currentPlanta = plantas.find((p) => p.id === currentPlantaId)

  const plantaZoneIds = useMemo(
    () => new Set(zones.filter((z) => z.plantaId === currentPlantaId).map((z) => z.id)),
    [zones, currentPlantaId]
  )

  const plantaTables = useMemo(
    () => tables.filter((t) => plantaZoneIds.has(t.zoneId) && t.active),
    [tables, plantaZoneIds]
  )

  const plantaDecorations = useMemo(
    () => decorations.filter((d) => d.plantaId === currentPlantaId),
    [decorations, currentPlantaId]
  )

  const dayReservations = useMemo(
    () =>
      reservations.filter(
        (r) =>
          r.date === service.currentDate &&
          !['cancelled', 'cancelled-client', 'no-show', 'completed'].includes(r.status)
      ),
    [reservations, service.currentDate]
  )

  const handleTableClick = (table: Table, e: React.MouseEvent) => {
    setPopupState({ table, x: e.clientX, y: e.clientY })
  }

  // Zone counters
  const plantaStats = useMemo(() => {
    return plantas.map((p) => {
      const zIds = new Set(zones.filter((z) => z.plantaId === p.id).map((z) => z.id))
      const pTables = tables.filter((t) => zIds.has(t.zoneId))
      const pTableIds = new Set(pTables.map((t) => t.id))
      const occupied = new Set(
        dayReservations.flatMap((r) => r.tableIds).filter((tid) => pTableIds.has(tid))
      ).size
      return { planta: p, occupied, total: pTables.length }
    })
  }, [plantas, zones, tables, dayReservations])

  const popupReservations = popupState
    ? dayReservations.filter((r) => r.tableIds.includes(popupState.table.id))
    : []

  return (
    <div className="flex-1 flex flex-col bg-[#0f1620] min-h-0">
      {/* Planta tabs */}
      <div className="flex items-center gap-1 px-4 py-2 border-b border-[#1f2936]">
        {plantaStats.map(({ planta, occupied, total }) => (
          <button
            key={planta.id}
            onClick={() => setServicePlanta(planta.id)}
            className={cn(
              'px-4 py-1.5 rounded-t text-xs font-semibold transition-colors',
              planta.id === currentPlantaId
                ? 'bg-[#1a2330] text-amber-300 border-b-2 border-amber-400'
                : 'text-gray-500 hover:text-gray-300'
            )}
          >
            {planta.name}
            <span className="ml-2 text-gray-500 font-normal">
              ({occupied}/{total})
            </span>
          </button>
        ))}
      </div>

      {/* Canvas */}
      <div className="flex-1 overflow-auto p-4 relative">
        <div className="relative bg-[#1a2330] rounded-lg" style={{ width: 700, height: 720, minWidth: 700 }}>
          {currentPlanta && (
            <span className="absolute top-3 left-3 z-10 bg-amber-400/90 text-slate-900 text-[10px] font-bold px-2 py-1 rounded">
              {currentPlanta.name.toUpperCase()}
            </span>
          )}
          <svg viewBox="0 0 700 720" className="w-full h-full">
            {/* Grid */}
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="700" height="720" fill="url(#grid)" />

            {/* Decorations */}
            {plantaDecorations.map((d) => (
              <DecorationShape key={d.id} d={d} />
            ))}

            {/* Tables */}
            {plantaTables.map((t) => (
              <TableShape
                key={t.id}
                table={t}
                reservations={getReservationForTable(t, dayReservations)}
                onClick={(e) => handleTableClick(t, e)}
              />
            ))}
          </svg>
        </div>
      </div>

      {popupState && (
        <TablePopup
          table={popupState.table}
          reservations={popupReservations}
          position={{ x: popupState.x, y: popupState.y }}
          onClose={() => setPopupState(null)}
          onNewReservation={onNewReservation}
          onEditReservation={onEditReservation}
          onMoveReservation={onMoveReservation}
        />
      )}
    </div>
  )
}
