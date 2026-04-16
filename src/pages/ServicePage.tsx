import { useState } from 'react'
import { ServiceBar } from '../components/layout/ServiceBar'
import { FloorPlan } from '../components/service/FloorPlan'
import type { Reservation } from '../types'

export function ServicePage() {
  const [_prefilledTable, setPrefilledTable] = useState<string | null>(null)
  const [_walkIn, setWalkIn] = useState(false)
  const [_editing, setEditing] = useState<Reservation | null>(null)
  const [_moving, setMoving] = useState<Reservation | null>(null)

  return (
    <div className="flex flex-col h-full min-h-0">
      <ServiceBar />
      <div className="flex-1 flex min-h-0">
        {/* Reservation list panel (Bloque D) */}
        <div className="w-[360px] border-r border-[#1f2936] bg-[#0b111a] flex items-center justify-center text-xs text-gray-500">
          Panel de reservas (Bloque D)
        </div>

        {/* Floor plan */}
        <FloorPlan
          onNewReservation={(tableId, walkIn) => {
            setPrefilledTable(tableId)
            setWalkIn(!!walkIn)
          }}
          onEditReservation={setEditing}
          onMoveReservation={setMoving}
        />
      </div>
    </div>
  )
}
