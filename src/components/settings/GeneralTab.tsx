import { useState } from 'react'
import { Save, RotateCcw, AlertTriangle } from 'lucide-react'
import { useStore } from '../../store'

export function GeneralTab() {
  const settings = useStore((s) => s.settings)
  const updateSettings = useStore((s) => s.updateSettings)
  const resetAll = useStore((s) => s.resetAll)

  const [name, setName] = useState(settings.name)
  const [doubleBooking, setDoubleBooking] = useState(settings.doubleBookingEnabled)
  const [avgMin, setAvgMin] = useState(settings.averageReservationMinutes)
  const [defDur, setDefDur] = useState(settings.defaultReservationDuration)
  const [maxPax, setMaxPax] = useState(settings.maxPartySize)
  const [reconfEnabled, setReconfEnabled] = useState(settings.reconfirmationEnabled)
  const [reconfChannel, setReconfChannel] = useState(settings.reconfirmationChannel)
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    updateSettings({
      name,
      doubleBookingEnabled: doubleBooking,
      averageReservationMinutes: avgMin,
      defaultReservationDuration: defDur,
      maxPartySize: maxPax,
      reconfirmationEnabled: reconfEnabled,
      reconfirmationChannel: reconfChannel,
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const input =
    'w-full px-2.5 py-1.5 bg-[#1a2330] border border-[#2a3441] focus:border-amber-400 rounded text-sm text-white outline-none'
  const label = 'block text-xs font-medium text-gray-400 mb-1.5'

  return (
    <div className="max-w-3xl space-y-8">
      <section>
        <h2 className="text-lg font-semibold text-white mb-4">Configuración general</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className={label}>Nombre del restaurante</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={input} />
          </div>
          <div>
            <label className={label}>Duración media por grupo (min)</label>
            <input
              type="number"
              value={avgMin}
              onChange={(e) => setAvgMin(Number(e.target.value))}
              className={input}
              min={30}
              step={15}
            />
            <p className="text-[11px] text-gray-500 mt-1">
              Usado para calcular el aviso de solape al doblar mesas
            </p>
          </div>
          <div>
            <label className={label}>Duración sugerida en formulario (min)</label>
            <input
              type="number"
              value={defDur}
              onChange={(e) => setDefDur(Number(e.target.value))}
              className={input}
              min={30}
              step={15}
            />
          </div>
          <div>
            <label className={label}>Tamaño máximo de grupo</label>
            <input
              type="number"
              value={maxPax}
              onChange={(e) => setMaxPax(Number(e.target.value))}
              className={input}
              min={1}
            />
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-base font-semibold text-white mb-3">Doblaje de mesas</h3>
        <label className="flex items-start gap-3 p-3 bg-[#1a2330] rounded-lg cursor-pointer border border-[#2a3441]">
          <input
            type="checkbox"
            checked={doubleBooking}
            onChange={(e) => setDoubleBooking(e.target.checked)}
            className="mt-0.5"
          />
          <div>
            <div className="text-sm font-medium text-white">Permitir doblar mesas</div>
            <p className="text-xs text-gray-400 mt-1">
              Si está activado, puedes crear reservas que se solapen con otras existentes. El sistema
              mostrará un aviso "Ojo con el tiempo..." y tú decides si continuar. Si está desactivado,
              el sistema bloquea los solapes.
            </p>
          </div>
        </label>
      </section>

      <section>
        <h3 className="text-base font-semibold text-white mb-3">Reconfirmación</h3>
        <label className="flex items-start gap-3 p-3 bg-[#1a2330] rounded-lg cursor-pointer border border-[#2a3441] mb-3">
          <input
            type="checkbox"
            checked={reconfEnabled}
            onChange={(e) => setReconfEnabled(e.target.checked)}
            className="mt-0.5"
          />
          <div>
            <div className="text-sm font-medium text-white">Enviar recordatorio la mañana del servicio</div>
            <p className="text-xs text-gray-400 mt-1">
              El cliente recibe un mensaje con link para confirmar o cancelar la reserva en un click.
            </p>
          </div>
        </label>
        <div className="max-w-xs">
          <label className={label}>Canal de reconfirmación</label>
          <select
            value={reconfChannel}
            onChange={(e) => setReconfChannel(e.target.value as 'whatsapp' | 'email' | 'both')}
            className={input}
          >
            <option value="both">WhatsApp y Email</option>
            <option value="whatsapp">Solo WhatsApp</option>
            <option value="email">Solo Email</option>
          </select>
        </div>
      </section>

      <div className="flex items-center gap-3 pt-4 border-t border-[#1f2936]">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-900 font-semibold text-sm px-4 py-2 rounded"
        >
          <Save size={16} />
          Guardar cambios
        </button>
        {saved && <span className="text-sm text-emerald-400 font-medium">Guardado correctamente</span>}
      </div>

      <section className="pt-6 border-t border-red-900/30">
        <h3 className="text-base font-semibold text-red-400 mb-2 flex items-center gap-2">
          <AlertTriangle size={16} /> Zona de peligro
        </h3>
        <p className="text-xs text-gray-500 mb-3">
          Elimina todos los datos guardados (reservas, clientes, mesas, turnos...) y restaura la
          configuración de ejemplo inicial.
        </p>
        <button
          onClick={() => {
            if (confirm('¿Estás seguro? Se eliminarán todos los datos.')) resetAll()
          }}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-300 bg-red-950/30 border border-red-900/50 rounded hover:bg-red-950/50"
        >
          <RotateCcw size={14} /> Restablecer datos
        </button>
      </section>
    </div>
  )
}
