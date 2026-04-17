import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { useStore } from '../../store'
import { cn } from '../../lib/utils'

export function TurnosTab() {
  const shifts = useStore((s) => s.shifts)
  const addShift = useStore((s) => s.addShift)
  const updateShift = useStore((s) => s.updateShift)
  const deleteShift = useStore((s) => s.deleteShift)
  const toggleOnline = useStore((s) => s.toggleShiftOnline)

  const [name, setName] = useState('')
  const [start, setStart] = useState('12:30')
  const [end, setEnd] = useState('16:30')

  const input =
    'w-full px-2.5 py-1.5 bg-[#1a2330] border border-[#2a3441] focus:border-amber-400 rounded text-sm text-white outline-none'

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-white mb-1">Turnos de servicio</h2>
        <p className="text-xs text-gray-500">
          Crea los turnos del restaurante (Comida, Cena, Brunch...). Cada uno tiene un toggle ON/OFF
          que abre o cierra las reservas online de ese turno.
        </p>
      </div>

      <div className="grid grid-cols-4 gap-3 items-end bg-[#1a2330] p-3 rounded-lg border border-[#2a3441]">
        <div>
          <label className="block text-[10px] font-medium text-gray-400 uppercase mb-1">
            Nombre del turno
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={input}
            placeholder="Comida"
          />
        </div>
        <div>
          <label className="block text-[10px] font-medium text-gray-400 uppercase mb-1">Inicio</label>
          <input type="time" value={start} onChange={(e) => setStart(e.target.value)} className={input} />
        </div>
        <div>
          <label className="block text-[10px] font-medium text-gray-400 uppercase mb-1">Fin</label>
          <input type="time" value={end} onChange={(e) => setEnd(e.target.value)} className={input} />
        </div>
        <button
          onClick={() => {
            if (name.trim()) {
              addShift({
                name: name.trim(),
                startTime: start,
                endTime: end,
                online: true,
                order: shifts.length,
              })
              setName('')
            }
          }}
          className="bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold text-xs py-2 rounded uppercase flex items-center justify-center gap-2"
        >
          <Plus size={14} /> Nuevo turno
        </button>
      </div>

      <div className="space-y-2">
        {shifts.map((s) => (
          <div
            key={s.id}
            className="flex items-center gap-3 p-3 bg-[#1a2330] rounded-lg border border-[#2a3441]"
          >
            <input
              type="text"
              value={s.name}
              onChange={(e) => updateShift(s.id, { name: e.target.value })}
              className={cn(input, 'flex-1')}
            />
            <div className="flex items-center gap-2">
              <input
                type="time"
                value={s.startTime}
                onChange={(e) => updateShift(s.id, { startTime: e.target.value })}
                className={cn(input, 'w-28')}
              />
              <span className="text-gray-500">–</span>
              <input
                type="time"
                value={s.endTime}
                onChange={(e) => updateShift(s.id, { endTime: e.target.value })}
                className={cn(input, 'w-28')}
              />
            </div>
            <button
              onClick={() => toggleOnline(s.id)}
              className={cn(
                'relative w-14 h-7 rounded-full transition-colors flex items-center',
                s.online ? 'bg-emerald-500' : 'bg-gray-700'
              )}
            >
              <span
                className={cn(
                  'absolute w-5 h-5 rounded-full bg-white transition-transform',
                  s.online ? 'translate-x-8' : 'translate-x-1'
                )}
              />
              <span
                className={cn(
                  'absolute text-[10px] font-bold',
                  s.online ? 'text-white left-2' : 'text-gray-400 right-1.5'
                )}
              >
                {s.online ? 'ON' : 'OFF'}
              </span>
            </button>
            <button
              onClick={() => {
                if (confirm(`¿Eliminar el turno "${s.name}"?`)) deleteShift(s.id)
              }}
              className="px-3 py-1.5 bg-red-500/80 hover:bg-red-500 text-white text-xs font-bold rounded"
            >
              <Trash2 size={12} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
