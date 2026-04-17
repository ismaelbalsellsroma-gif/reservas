import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { useStore } from '../../store'
import { cn } from '../../lib/utils'

export function CombinacionesTab() {
  const tables = useStore((s) => s.tables)
  const combinations = useStore((s) => s.combinations)
  const addCombination = useStore((s) => s.addCombination)
  const updateCombination = useStore((s) => s.updateCombination)
  const deleteCombination = useStore((s) => s.deleteCombination)

  const [selectedTables, setSelectedTables] = useState<string[]>([])
  const [maxPax, setMaxPax] = useState(8)
  const [minPax, setMinPax] = useState(4)
  const [subcombinable, setSubcombinable] = useState(false)

  const toggleTable = (id: string) => {
    setSelectedTables((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    )
  }

  const handleAdd = () => {
    if (selectedTables.length < 2) {
      alert('Selecciona al menos 2 mesas para combinar')
      return
    }
    addCombination({
      tableIds: [...selectedTables],
      capacityMin: minPax,
      capacityMax: maxPax,
      subcombinable,
    })
    setSelectedTables([])
    setMaxPax(8)
    setMinPax(4)
    setSubcombinable(false)
  }

  const input =
    'w-full px-2.5 py-1.5 bg-[#1a2330] border border-[#2a3441] focus:border-amber-400 rounded text-sm text-white outline-none'

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-white mb-1">Combinaciones de mesas</h2>
        <p className="text-xs text-gray-500">
          Define combinaciones de varias mesas para gestionar grupos grandes. El sistema las asignará
          automáticamente a reservas online según el tamaño del grupo.
        </p>
      </div>

      {/* Add new combination */}
      <div className="bg-[#1a2330] p-4 rounded-lg border border-[#2a3441] space-y-4">
        <h3 className="text-sm font-semibold text-white">Añadir combinación</h3>

        <div>
          <label className="block text-[10px] font-medium text-gray-400 uppercase mb-2">
            Mesas seleccionadas ({selectedTables.length})
          </label>
          <div className="grid grid-cols-10 gap-1 p-2 bg-[#0b111a] rounded">
            {tables.map((t) => (
              <button
                key={t.id}
                onClick={() => toggleTable(t.id)}
                className={cn(
                  'px-1.5 py-1 rounded text-[11px] font-bold',
                  selectedTables.includes(t.id)
                    ? 'bg-emerald-600 text-white ring-2 ring-emerald-300'
                    : 'bg-[#2a3441] text-gray-200 hover:bg-[#344157]'
                )}
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 items-end">
          <div>
            <label className="block text-[10px] font-medium text-gray-400 uppercase mb-1">
              Mínimo Pax
            </label>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setMinPax(Math.max(1, minPax - 1))}
                className="w-8 h-8 bg-[#2a3441] text-white rounded"
              >
                -
              </button>
              <input
                type="number"
                value={minPax}
                onChange={(e) => setMinPax(Number(e.target.value))}
                className={cn(input, 'text-center')}
              />
              <button
                onClick={() => setMinPax(minPax + 1)}
                className="w-8 h-8 bg-[#2a3441] text-white rounded"
              >
                +
              </button>
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-medium text-gray-400 uppercase mb-1">
              Máximo Pax
            </label>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setMaxPax(Math.max(1, maxPax - 1))}
                className="w-8 h-8 bg-[#2a3441] text-white rounded"
              >
                -
              </button>
              <input
                type="number"
                value={maxPax}
                onChange={(e) => setMaxPax(Number(e.target.value))}
                className={cn(input, 'text-center')}
              />
              <button
                onClick={() => setMaxPax(maxPax + 1)}
                className="w-8 h-8 bg-[#2a3441] text-white rounded"
              >
                +
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
              <input
                type="checkbox"
                checked={subcombinable}
                onChange={(e) => setSubcombinable(e.target.checked)}
                className="rounded"
              />
              Subcombinable
            </label>
            <button
              onClick={handleAdd}
              className="ml-auto bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold text-xs px-4 py-2 rounded uppercase flex items-center gap-2"
            >
              <Plus size={14} /> Añadir
            </button>
          </div>
        </div>
      </div>

      {/* List combinations */}
      <div className="space-y-2">
        {combinations.length === 0 ? (
          <p className="text-center text-sm text-gray-500 py-8">
            No hay combinaciones creadas todavía
          </p>
        ) : (
          combinations.map((c) => {
            const tableNames = c.tableIds
              .map((id) => tables.find((t) => t.id === id)?.name)
              .filter(Boolean)
              .join(', ')
            return (
              <div
                key={c.id}
                className="flex items-center gap-3 p-3 bg-[#1a2330] rounded-lg border border-[#2a3441]"
              >
                <div className="flex-1">
                  <div className="text-sm font-semibold text-white">Mesas: {tableNames}</div>
                  <div className="text-xs text-gray-500 mt-1 flex items-center gap-3">
                    <span>Pax {c.capacityMin} - {c.capacityMax}</span>
                    {c.subcombinable && <span className="text-sky-400">· Subcombinable</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={c.capacityMin}
                    onChange={(e) =>
                      updateCombination(c.id, { capacityMin: Number(e.target.value) })
                    }
                    className={cn(input, 'w-16 text-center')}
                  />
                  <span className="text-gray-500">-</span>
                  <input
                    type="number"
                    value={c.capacityMax}
                    onChange={(e) =>
                      updateCombination(c.id, { capacityMax: Number(e.target.value) })
                    }
                    className={cn(input, 'w-16 text-center')}
                  />
                </div>
                <button
                  onClick={() => {
                    if (confirm(`¿Eliminar esta combinación (mesas ${tableNames})?`))
                      deleteCombination(c.id)
                  }}
                  className="px-3 py-1.5 bg-red-500/80 hover:bg-red-500 text-white text-xs font-bold rounded"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
