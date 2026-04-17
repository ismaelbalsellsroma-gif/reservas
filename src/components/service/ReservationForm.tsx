import { useState, useMemo, useEffect } from 'react'
import { X, Lock, Users } from 'lucide-react'
import type { Reservation, ReservationStatus, ReservationType, ReservationChannel } from '../../types'
import { useStore } from '../../store'
import { cn, timeToMinutes } from '../../lib/utils'

interface ReservationFormProps {
  reservation?: Reservation
  initialTableId?: string
  walkIn?: boolean
  prefillGuest?: {
    name: string
    phone: string
    phoneCountry: string
    partySize: number
    notes: string
  }
  onClose: () => void
}

const languages = [
  { v: 'es', l: 'Español' },
  { v: 'ca', l: 'Catalán' },
  { v: 'en', l: 'Inglés' },
  { v: 'fr', l: 'Francés' },
  { v: 'de', l: 'Alemán' },
]
const countries = [
  { v: '+34', l: 'ESPAÑA (+34)' },
  { v: '+33', l: 'FRANCIA (+33)' },
  { v: '+44', l: 'REINO UNIDO (+44)' },
  { v: '+49', l: 'ALEMANIA (+49)' },
  { v: '+39', l: 'ITALIA (+39)' },
]

export function ReservationForm({ reservation, initialTableId, walkIn, prefillGuest, onClose }: ReservationFormProps) {
  const tables = useStore((s) => s.tables)
  const zones = useStore((s) => s.zones)
  const plantas = useStore((s) => s.plantas)
  const staff = useStore((s) => s.staff)
  const shifts = useStore((s) => s.shifts)
  const guests = useStore((s) => s.guests)
  const tagsList = useStore((s) => s.tags)
  const settings = useStore((s) => s.settings)
  const reservations = useStore((s) => s.reservations)
  const addReservation = useStore((s) => s.addReservation)
  const updateReservation = useStore((s) => s.updateReservation)
  const findGuestByPhone = useStore((s) => s.findGuestByPhone)
  const service = useStore((s) => s.service)

  const walkInDefault = walkIn || reservation?.channel === 'walk-in'

  const [date, setDate] = useState(reservation?.date || service.currentDate)
  const [time, setTime] = useState(reservation?.time || '13:30')
  const [partySize, setPartySize] = useState(reservation?.partySize || prefillGuest?.partySize || 2)
  const [duration, setDuration] = useState(settings.defaultReservationDuration)
  const [zoneId, setZoneId] = useState<string>('')
  const [tableIds, setTableIds] = useState<string[]>(
    reservation?.tableIds || (initialTableId ? [initialTableId] : [])
  )
  const [status, setStatus] = useState<ReservationStatus>(reservation?.status || 'confirmed')
  const [channel, setChannel] = useState<ReservationChannel>(
    reservation?.channel || (walkInDefault ? 'walk-in' : 'phone')
  )
  const [type, setType] = useState<ReservationType>(reservation?.type || 'free')
  const [takenBy, setTakenBy] = useState(reservation?.takenBy || staff[0]?.id || '')
  const [code, setCode] = useState(reservation?.code || '')
  const [reference] = useState('')
  const [prescriptor, setPrescriptor] = useState(reservation?.prescriptor || '')
  const [reservationTags, setReservationTags] = useState<string[]>(reservation?.tags || [])
  const [notes, setNotes] = useState(reservation?.notes || prefillGuest?.notes || '')
  const [guestNotes, setGuestNotes] = useState(reservation?.guestNotes || '')

  // Guest data
  const [guestName, setGuestName] = useState(
    reservation?.guestName || prefillGuest?.name || (walkInDefault ? 'WALK' : '')
  )
  const [guestSurname, setGuestSurname] = useState(
    reservation?.guestSurname || (walkInDefault && !prefillGuest ? 'IN' : '')
  )
  const [guestPhoneCountry, setGuestPhoneCountry] = useState(
    reservation?.guestPhoneCountry || prefillGuest?.phoneCountry || '+34'
  )
  const [guestPhone, setGuestPhone] = useState(reservation?.guestPhone || prefillGuest?.phone || '')
  const [guestEmail, setGuestEmail] = useState(reservation?.guestEmail || '')
  const [guestLanguage, setGuestLanguage] = useState(reservation?.guestLanguage || 'es')
  const [guestCompany, setGuestCompany] = useState(reservation?.guestCompany || '')
  const [marketingConsent, setMarketingConsent] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)

  const [notifyClient, setNotifyClient] = useState(false)

  // Auto-match guest by phone
  useEffect(() => {
    if (guestPhone.length >= 8) {
      const g = findGuestByPhone(guestPhone)
      if (g && g.id !== reservation?.guestId) {
        setGuestName(g.name)
        setGuestSurname(g.surname)
        setGuestEmail(g.email)
        setGuestLanguage(g.language)
        setGuestCompany(g.company)
        setMarketingConsent(g.marketingConsent)
      }
    }
  }, [guestPhone, findGuestByPhone, reservation?.guestId])

  const filteredGuests = useMemo(() => {
    if (!guestName || guestName.length < 2) return []
    const q = guestName.toLowerCase()
    return guests.filter((g) => g.name.toLowerCase().includes(q) || g.surname.toLowerCase().includes(q)).slice(0, 6)
  }, [guestName, guests])

  // Zone → filtered tables
  const zonesAvailable = useMemo(() => zones.filter((z) => !zoneId || z.id === zoneId), [zones, zoneId])
  const availableTables = useMemo(() => {
    const zoneIds = zonesAvailable.map((z) => z.id)
    return tables.filter((t) => t.active && zoneIds.includes(t.zoneId))
  }, [tables, zonesAvailable])

  // Shift auto-detect
  const currentShiftId = useMemo(() => {
    const m = timeToMinutes(time)
    for (const shift of shifts) {
      if (m >= timeToMinutes(shift.startTime) && m <= timeToMinutes(shift.endTime)) return shift.id
    }
    return shifts[0]?.id || ''
  }, [time, shifts])

  // Warning: double booking
  const overlapWarning = useMemo(() => {
    if (!settings.doubleBookingEnabled || tableIds.length === 0) return null
    const startMin = timeToMinutes(time)
    const endMin = startMin + settings.averageReservationMinutes
    const conflicts = reservations.filter((r) => {
      if (r.id === reservation?.id) return false
      if (r.date !== date) return false
      if (!r.tableIds.some((id) => tableIds.includes(id))) return false
      if (['cancelled', 'cancelled-client', 'no-show', 'completed'].includes(r.status)) return false
      const rStart = timeToMinutes(r.time)
      const rEnd = rStart + settings.averageReservationMinutes
      return Math.max(startMin, rStart) < Math.min(endMin, rEnd)
    })
    return conflicts.length > 0 ? conflicts : null
  }, [tableIds, time, date, reservations, settings.averageReservationMinutes, settings.doubleBookingEnabled, reservation?.id])

  const toggleTable = (id: string) => {
    setTableIds((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]))
  }

  const handleSelectGuest = (g: (typeof guests)[0]) => {
    setGuestName(g.name)
    setGuestSurname(g.surname)
    setGuestPhone(g.phone)
    setGuestPhoneCountry(g.phoneCountry)
    setGuestEmail(g.email)
    setGuestLanguage(g.language)
    setGuestCompany(g.company)
    setMarketingConsent(g.marketingConsent)
    setShowSuggestions(false)
  }

  const handleSubmit = (andNotify: boolean) => {
    if (!guestName || !guestSurname || !takenBy) {
      alert('Faltan campos obligatorios: Nombre, Apellido y Anotado por')
      return
    }
    if (overlapWarning) {
      if (!confirm('Ojo con el tiempo. Ya hay una reserva en esta mesa a esa hora. ¿Deseas continuar con la reserva?')) {
        return
      }
    }

    const existing = findGuestByPhone(guestPhone)
    const guestId = existing?.id || reservation?.guestId || 'new-' + guestPhone

    const data = {
      guestId,
      guestName,
      guestSurname,
      guestPhone,
      guestPhoneCountry,
      guestEmail,
      guestLanguage,
      guestCompany,
      date,
      time,
      partySize,
      tableIds,
      status,
      channel,
      type,
      prescriptor,
      notes,
      guestNotes,
      tags: reservationTags,
      takenBy,
      reconfirmationStatus: 'pending' as const,
      shiftId: currentShiftId,
    }

    if (reservation) {
      updateReservation(reservation.id, data)
    } else {
      addReservation(data)
    }

    if (andNotify) {
      // En una app real, se enviaría email/SMS. Aquí solo simulamos.
      console.log('Notificar al cliente:', guestPhone, guestEmail)
    }

    onClose()
  }

  const input =
    'w-full px-2 py-1.5 bg-[#1a2330] border border-[#2a3441] focus:border-amber-400 rounded text-sm text-white outline-none'
  const label = 'block text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1'

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-[#0f1620] rounded-xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col border border-[#1f2936]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#1f2936]">
          <h2 className="text-base font-semibold text-white">
            {reservation ? 'Editar reserva' : 'Nueva Reserva'}{' '}
            <span className="text-amber-400">en {settings.name}</span>
          </h2>
          <div className="flex items-center gap-2">
            <div>
              <span className={label}>Anotado por *</span>
              <select value={takenBy} onChange={(e) => setTakenBy(e.target.value)} className={cn(input, 'min-w-[160px]')} required>
                <option value="">Seleccionar...</option>
                {staff.filter((s) => s.active).map((s) => (
                  <option key={s.id} value={s.id}>{s.name} ({s.role})</option>
                ))}
              </select>
            </div>
            <button onClick={onClose} className="p-1.5 hover:bg-[#1a2330] rounded mt-4">
              <X size={18} className="text-gray-400" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* LEFT: Reservation details */}
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className={label}>Día</label>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={input} />
              </div>
              <div>
                <label className={label}>Hora</label>
                <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className={input} step={900} />
              </div>
              <div>
                <label className={label}>Personas</label>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setPartySize(Math.max(1, partySize - 1))}
                    className="w-7 h-8 bg-[#1a2330] hover:bg-[#243040] text-white rounded"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={partySize}
                    onChange={(e) => setPartySize(Number(e.target.value))}
                    className={cn(input, 'text-center')}
                    min={1}
                  />
                  <button
                    type="button"
                    onClick={() => setPartySize(partySize + 1)}
                    className="w-7 h-8 bg-[#1a2330] hover:bg-[#243040] text-white rounded"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className={label}>Duración (min)</label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className={input}
                  step={15}
                />
              </div>
              <div>
                <label className={label}>Referencia</label>
                <input type="text" value={reference} readOnly className={input} placeholder="—" />
              </div>
              <div>
                <label className={label}>Código</label>
                <input type="text" value={code} onChange={(e) => setCode(e.target.value)} className={input} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className={label}>Zona</label>
                <select value={zoneId} onChange={(e) => setZoneId(e.target.value)} className={input}>
                  <option value="">Todas</option>
                  {plantas.map((p) => (
                    <optgroup key={p.id} label={p.name}>
                      {zones
                        .filter((z) => z.plantaId === p.id)
                        .map((z) => (
                          <option key={z.id} value={z.id}>{z.name}</option>
                        ))}
                    </optgroup>
                  ))}
                </select>
              </div>
              <div>
                <label className={label}>Mesas seleccionadas</label>
                <div className="bg-[#1a2330] border border-[#2a3441] rounded px-2 py-1.5 text-sm text-white min-h-[32px] flex flex-wrap gap-1">
                  {tableIds.length === 0 ? (
                    <span className="text-gray-500 text-xs">Ninguna</span>
                  ) : (
                    tableIds.map((id) => {
                      const t = tables.find((t) => t.id === id)
                      return (
                        <span key={id} className="bg-emerald-600 px-1.5 rounded text-[11px] font-semibold">
                          {t?.name}
                        </span>
                      )
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Table grid */}
            <div>
              <label className={label}>
                <Users size={10} className="inline" /> Seleccionar mesas ({tableIds.length}){' '}
                {tableIds.length > 0 && (
                  <span className="text-gray-500 normal-case">
                    cap. {tableIds.reduce((s, id) => s + (tables.find((t) => t.id === id)?.capacityMax || 0), 0)} pax
                  </span>
                )}
              </label>
              <div className="grid grid-cols-8 gap-1 p-2 bg-[#1a2330] rounded max-h-40 overflow-y-auto">
                {availableTables.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => toggleTable(t.id)}
                    className={cn(
                      'px-1.5 py-1.5 rounded text-[11px] font-bold transition-colors relative',
                      tableIds.includes(t.id)
                        ? 'bg-emerald-600 text-white ring-2 ring-emerald-300'
                        : t.webBlocked
                        ? 'bg-amber-900/40 text-amber-300 hover:bg-amber-900/60'
                        : 'bg-[#2a3441] text-gray-200 hover:bg-[#344157]'
                    )}
                    title={`${t.name} cap ${t.capacityMin}-${t.capacityMax}`}
                  >
                    {t.webBlocked && <Lock size={8} className="absolute top-0.5 right-0.5" />}
                    {t.name}
                    <span className="block text-[8px] opacity-60">{t.capacityMax}p</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className={label}>Estado</label>
                <select value={status} onChange={(e) => setStatus(e.target.value as ReservationStatus)} className={input}>
                  <option value="pending">Pendiente</option>
                  <option value="confirmed">Confirmada</option>
                  <option value="seated">Sentados</option>
                  <option value="eating">Comiendo</option>
                  <option value="dessert">Postre</option>
                  <option value="check">Cuenta</option>
                  <option value="completed">Completada</option>
                  <option value="cancelled">Cancelada</option>
                  <option value="no-show">No-show</option>
                </select>
              </div>
              <div>
                <label className={label}>Tipo de reserva</label>
                <select value={type} onChange={(e) => setType(e.target.value as ReservationType)} className={input}>
                  <option value="free">Reserva Gratis</option>
                  <option value="menu">Con Menú</option>
                  <option value="prepaid">Con Prepago</option>
                  <option value="event">Evento</option>
                </select>
              </div>
              <div>
                <label className={label}>Canal</label>
                <select value={channel} onChange={(e) => setChannel(e.target.value as ReservationChannel)} className={input}>
                  <option value="phone">Teléfono</option>
                  <option value="walk-in">Walk-in</option>
                  <option value="google">Google</option>
                  <option value="web">Web</option>
                  <option value="other">Otro</option>
                </select>
              </div>
            </div>

            <div>
              <label className={label}>Prescriptor</label>
              <input type="text" value={prescriptor} onChange={(e) => setPrescriptor(e.target.value)} className={input} placeholder="¿Quién recomendó al cliente?" />
            </div>

            <div>
              <label className={label}>Etiquetas de la reserva</label>
              <div className="flex flex-wrap gap-1">
                {tagsList.map((tag) => (
                  <button
                    type="button"
                    key={tag}
                    onClick={() =>
                      setReservationTags((prev) =>
                        prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
                      )
                    }
                    className={cn(
                      'px-2 py-0.5 rounded-full text-[10px] font-medium border transition-colors',
                      reservationTags.includes(tag)
                        ? 'bg-amber-400 text-slate-900 border-amber-400'
                        : 'bg-[#1a2330] text-gray-400 border-[#2a3441] hover:border-amber-400'
                    )}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className={label}>Notas de la reserva hechas por el establecimiento</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className={cn(input, 'min-h-[80px]')} />
            </div>

            {overlapWarning && (
              <div className="bg-amber-950/60 border border-amber-700 text-amber-200 text-xs p-3 rounded-lg">
                <strong>⚠️ Ojo con el tiempo:</strong> ya hay {overlapWarning.length}{' '}
                {overlapWarning.length === 1 ? 'reserva' : 'reservas'} en la(s) misma(s) mesa(s) a una hora cercana.
                Se te volverá a pedir confirmación al guardar.
              </div>
            )}
          </div>

          {/* RIGHT: Guest data */}
          <div className="space-y-3 lg:border-l lg:border-[#1f2936] lg:pl-5">
            <div>
              <label className={label}>Empresa</label>
              <input type="text" value={guestCompany} onChange={(e) => setGuestCompany(e.target.value)} className={input} />
            </div>

            <h3 className="text-sm font-semibold text-white mt-2">Datos del cliente</h3>

            <div className="grid grid-cols-2 gap-2">
              <div className="relative">
                <label className={label}>Nombre *</label>
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => {
                    setGuestName(e.target.value)
                    setShowSuggestions(true)
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  className={input}
                  required
                />
                {showSuggestions && filteredGuests.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-[#1a2330] border border-[#2a3441] rounded-lg shadow-xl max-h-40 overflow-y-auto">
                    {filteredGuests.map((g) => (
                      <button
                        type="button"
                        key={g.id}
                        onMouseDown={() => handleSelectGuest(g)}
                        className="w-full text-left px-2 py-1.5 text-xs text-white hover:bg-[#243040] flex justify-between"
                      >
                        <span className="font-medium">
                          {g.name} {g.surname}
                        </span>
                        <span className="text-gray-500">{g.phoneCountry} {g.phone}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className={label}>Apellidos *</label>
                <input type="text" value={guestSurname} onChange={(e) => setGuestSurname(e.target.value)} className={input} required />
              </div>
            </div>

            <div>
              <label className={label}>Idioma</label>
              <select value={guestLanguage} onChange={(e) => setGuestLanguage(e.target.value)} className={input}>
                {languages.map((l) => (
                  <option key={l.v} value={l.v}>{l.l}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className={label}>Prefijo</label>
                <select value={guestPhoneCountry} onChange={(e) => setGuestPhoneCountry(e.target.value)} className={input}>
                  {countries.map((c) => (
                    <option key={c.v} value={c.v}>{c.l}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={label}>Teléfono</label>
                <input type="tel" value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)} className={input} />
              </div>
              <div>
                <label className={label}>Email</label>
                <input type="email" value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} className={input} />
              </div>
            </div>

            <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer">
              <input type="checkbox" checked={marketingConsent} onChange={(e) => setMarketingConsent(e.target.checked)} className="rounded" />
              Da consentimiento para recibir información comercial por e-mail y SMS
            </label>

            <div>
              <label className={label}>Notas del cliente / Información adicional</label>
              <textarea value={guestNotes} onChange={(e) => setGuestNotes(e.target.value)} className={cn(input, 'min-h-[80px]')} />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 p-4 border-t border-[#1f2936] bg-[#0b111a]">
          <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer">
            <input type="checkbox" checked={notifyClient} onChange={(e) => setNotifyClient(e.target.checked)} className="rounded" />
            Notificar al cliente por Email / WhatsApp
          </label>
          <div className="flex-1" />
          <button
            type="button"
            onClick={() => handleSubmit(false)}
            className="px-6 py-2 bg-amber-400 hover:bg-amber-300 text-slate-900 font-semibold text-sm rounded uppercase"
          >
            Reservar
          </button>
          <button
            type="button"
            onClick={() => handleSubmit(true)}
            className="px-6 py-2 bg-amber-400 hover:bg-amber-300 text-slate-900 font-semibold text-sm rounded uppercase"
          >
            Reservar y notificar
          </button>
        </div>
      </div>
    </div>
  )
}
