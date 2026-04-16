import { useState, useEffect } from 'react'
import type { Reservation, ReservationStatus } from '../../types'
import { useStore } from '../../store'
import { getTodayString } from '../../lib/utils'

interface ReservationFormProps {
  reservation?: Reservation
  onSubmit: (data: Omit<Reservation, 'id' | 'createdAt'>) => void
  onCancel: () => void
}

export function ReservationForm({ reservation, onSubmit, onCancel }: ReservationFormProps) {
  const tables = useStore((s) => s.tables)
  const guests = useStore((s) => s.guests)

  const [guestName, setGuestName] = useState(reservation?.guestName || '')
  const [guestPhone, setGuestPhone] = useState(reservation?.guestPhone || '')
  const [guestEmail, setGuestEmail] = useState(reservation?.guestEmail || '')
  const [guestId, setGuestId] = useState(reservation?.guestId || '')
  const [date, setDate] = useState(reservation?.date || getTodayString())
  const [time, setTime] = useState(reservation?.time || '20:00')
  const [partySize, setPartySize] = useState(reservation?.partySize || 2)
  const [tableId, setTableId] = useState(reservation?.tableId || '')
  const [status, setStatus] = useState<ReservationStatus>(reservation?.status || 'confirmed')
  const [notes, setNotes] = useState(reservation?.notes || '')
  const [showSuggestions, setShowSuggestions] = useState(false)

  const filteredGuests = guests.filter(
    (g) => guestName.length > 1 && g.name.toLowerCase().includes(guestName.toLowerCase())
  )

  useEffect(() => {
    if (guestId) {
      const guest = guests.find((g) => g.id === guestId)
      if (guest) {
        setGuestPhone(guest.phone)
        setGuestEmail(guest.email)
      }
    }
  }, [guestId, guests])

  const handleSelectGuest = (guest: typeof guests[0]) => {
    setGuestId(guest.id)
    setGuestName(guest.name)
    setGuestPhone(guest.phone)
    setGuestEmail(guest.email)
    setShowSuggestions(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      guestId: guestId || 'walk-in',
      guestName,
      guestPhone,
      guestEmail,
      date,
      time,
      partySize,
      tableId: tableId || null,
      status,
      notes,
    })
  }

  const availableTables = tables.filter((t) => t.capacity >= partySize)

  const inputClass = 'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1'

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Guest name with autocomplete */}
        <div className="relative sm:col-span-2">
          <label className={labelClass}>Nombre del cliente *</label>
          <input
            type="text"
            value={guestName}
            onChange={(e) => {
              setGuestName(e.target.value)
              setGuestId('')
              setShowSuggestions(true)
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            className={inputClass}
            required
            placeholder="Buscar o escribir nombre..."
          />
          {showSuggestions && filteredGuests.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
              {filteredGuests.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  className="w-full text-left px-3 py-2 text-sm hover:bg-indigo-50 flex justify-between"
                  onMouseDown={() => handleSelectGuest(g)}
                >
                  <span className="font-medium">{g.name}</span>
                  <span className="text-gray-400">{g.phone}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className={labelClass}>Teléfono</label>
          <input
            type="tel"
            value={guestPhone}
            onChange={(e) => setGuestPhone(e.target.value)}
            className={inputClass}
            placeholder="+34 600 000 000"
          />
        </div>

        <div>
          <label className={labelClass}>Email</label>
          <input
            type="email"
            value={guestEmail}
            onChange={(e) => setGuestEmail(e.target.value)}
            className={inputClass}
            placeholder="email@ejemplo.com"
          />
        </div>

        <div>
          <label className={labelClass}>Fecha *</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={inputClass}
            required
          />
        </div>

        <div>
          <label className={labelClass}>Hora *</label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className={inputClass}
            required
          />
        </div>

        <div>
          <label className={labelClass}>Personas *</label>
          <input
            type="number"
            value={partySize}
            onChange={(e) => setPartySize(Number(e.target.value))}
            className={inputClass}
            min={1}
            max={20}
            required
          />
        </div>

        <div>
          <label className={labelClass}>Mesa</label>
          <select
            value={tableId}
            onChange={(e) => setTableId(e.target.value)}
            className={inputClass}
          >
            <option value="">Sin asignar</option>
            {availableTables.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} (cap. {t.capacity}) - {t.zone}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Estado</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as ReservationStatus)}
            className={inputClass}
          >
            <option value="pending">Pendiente</option>
            <option value="confirmed">Confirmada</option>
            <option value="seated">Sentados</option>
            <option value="completed">Completada</option>
            <option value="cancelled">Cancelada</option>
            <option value="no-show">No presentado</option>
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className={labelClass}>Notas</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className={inputClass}
            rows={2}
            placeholder="Alergias, celebraciones, peticiones especiales..."
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          {reservation ? 'Guardar cambios' : 'Crear reserva'}
        </button>
      </div>
    </form>
  )
}
