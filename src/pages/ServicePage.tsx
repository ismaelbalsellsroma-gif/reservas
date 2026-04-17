import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ServiceBar } from '../components/layout/ServiceBar'
import { FloorPlan } from '../components/service/FloorPlan'
import { ReservationList } from '../components/service/ReservationList'
import { ReservationForm } from '../components/service/ReservationForm'
import { WaitlistPanel } from '../components/service/WaitlistPanel'
import { PrintShift } from '../components/service/PrintShift'
import { Cronograma } from '../components/service/Cronograma'
import { MoveReservation } from '../components/service/MoveReservation'
import { cn } from '../lib/utils'
import type { Reservation } from '../types'

type View = 'plano' | 'cronograma'

export function ServicePage() {
  const [params, setParams] = useSearchParams()
  const [prefilledTable, setPrefilledTable] = useState<string | null>(null)
  const [walkIn, setWalkIn] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Reservation | null>(null)
  const [moving, setMoving] = useState<Reservation | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showWaitlist, setShowWaitlist] = useState(false)
  const [showPrint, setShowPrint] = useState(false)
  const [view, setView] = useState<View>('plano')
  const [prefillGuest, setPrefillGuest] = useState<{
    name: string
    phone: string
    phoneCountry: string
    partySize: number
    notes: string
  } | null>(null)

  useEffect(() => {
    if (params.get('newReservation')) {
      setShowForm(true)
      setPrefilledTable(null)
      setWalkIn(false)
      params.delete('newReservation')
      setParams(params, { replace: true })
    } else if (params.get('walkIn')) {
      setShowForm(true)
      setPrefilledTable(null)
      setWalkIn(true)
      params.delete('walkIn')
      setParams(params, { replace: true })
    }
  }, [params, setParams])

  const handleCloseForm = () => {
    setShowForm(false)
    setEditing(null)
    setPrefilledTable(null)
    setWalkIn(false)
    setPrefillGuest(null)
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      <ServiceBar />

      {/* View toggle */}
      <div className="flex items-center gap-1 px-4 py-2 border-b border-[#1f2936] bg-[#0b111a]">
        <button
          onClick={() => setView('plano')}
          className={cn(
            'px-4 py-1 rounded text-xs font-semibold uppercase',
            view === 'plano' ? 'text-amber-300 border-b-2 border-amber-400' : 'text-gray-500 hover:text-gray-300'
          )}
        >
          Vista plano
        </button>
        <button
          onClick={() => setView('cronograma')}
          className={cn(
            'px-4 py-1 rounded text-xs font-semibold uppercase',
            view === 'cronograma' ? 'text-amber-300 border-b-2 border-amber-400' : 'text-gray-500 hover:text-gray-300'
          )}
        >
          Cronograma
        </button>
      </div>

      <div className="flex-1 flex min-h-0">
        <ReservationList
          onSelectReservation={(r) => setEditing(r)}
          onOpenWaitlist={() => setShowWaitlist(true)}
          onPrint={() => setShowPrint(true)}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
        />

        {view === 'plano' ? (
          <FloorPlan
            onNewReservation={(tableId, isWalkIn) => {
              setPrefilledTable(tableId)
              setWalkIn(!!isWalkIn)
              setShowForm(true)
            }}
            onEditReservation={(r) => setEditing(r)}
            onMoveReservation={(r) => setMoving(r)}
          />
        ) : (
          <Cronograma
            onSelectReservation={(r) => setEditing(r)}
            onNewReservation={(tableId, time) => {
              setPrefilledTable(tableId)
              setWalkIn(false)
              setShowForm(true)
              // future: could pre-fill time via context
              void time
            }}
          />
        )}
      </div>

      {(showForm || editing) && (
        <ReservationForm
          reservation={editing || undefined}
          initialTableId={prefilledTable || undefined}
          walkIn={walkIn}
          prefillGuest={prefillGuest || undefined}
          onClose={handleCloseForm}
        />
      )}

      {showWaitlist && (
        <WaitlistPanel
          onClose={() => setShowWaitlist(false)}
          onConvertToReservation={(name, phone, phoneCountry, partySize, notes) => {
            const [first, ...rest] = name.split(' ')
            setPrefillGuest({
              name: first,
              phone,
              phoneCountry,
              partySize,
              notes: `${rest.join(' ')} ${notes}`.trim(),
            })
            setShowWaitlist(false)
            setShowForm(true)
            setWalkIn(true)
          }}
        />
      )}

      {showPrint && <PrintShift onClose={() => setShowPrint(false)} />}
      {moving && (
        <MoveReservation
          reservation={moving}
          onClose={() => setMoving(null)}
        />
      )}
    </div>
  )
}
