import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ServiceBar } from '../components/layout/ServiceBar'
import { FloorPlan } from '../components/service/FloorPlan'
import { ReservationList } from '../components/service/ReservationList'
import { ReservationForm } from '../components/service/ReservationForm'
import type { Reservation } from '../types'

export function ServicePage() {
  const [params, setParams] = useSearchParams()
  const [prefilledTable, setPrefilledTable] = useState<string | null>(null)
  const [walkIn, setWalkIn] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Reservation | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (params.get('newReservation')) {
      setShowForm(true)
      setPrefilledTable(null)
      setWalkIn(false)
      params.delete('newReservation')
      setParams(params, { replace: true })
    }
  }, [params, setParams])

  const handleCloseForm = () => {
    setShowForm(false)
    setEditing(null)
    setPrefilledTable(null)
    setWalkIn(false)
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      <ServiceBar />
      <div className="flex-1 flex min-h-0">
        <ReservationList
          onSelectReservation={(r) => setEditing(r)}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
        />
        <FloorPlan
          onNewReservation={(tableId, isWalkIn) => {
            setPrefilledTable(tableId)
            setWalkIn(!!isWalkIn)
            setShowForm(true)
          }}
          onEditReservation={(r) => setEditing(r)}
          onMoveReservation={(r) => setEditing(r)}
        />
      </div>

      {(showForm || editing) && (
        <ReservationForm
          reservation={editing || undefined}
          initialTableId={prefilledTable || undefined}
          walkIn={walkIn}
          onClose={handleCloseForm}
        />
      )}
    </div>
  )
}
