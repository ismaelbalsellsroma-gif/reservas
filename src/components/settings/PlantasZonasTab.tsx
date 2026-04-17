import { useState } from 'react'
import { Plus, Trash2, Save } from 'lucide-react'
import { useStore } from '../../store'
import { cn } from '../../lib/utils'

export function PlantasZonasTab() {
  const plantas = useStore((s) => s.plantas)
  const zones = useStore((s) => s.zones)
  const tables = useStore((s) => s.tables)
  const addPlanta = useStore((s) => s.addPlanta)
  const updatePlanta = useStore((s) => s.updatePlanta)
  const deletePlanta = useStore((s) => s.deletePlanta)
  const addZone = useStore((s) => s.addZone)
  const updateZone = useStore((s) => s.updateZone)
  const deleteZone = useStore((s) => s.deleteZone)

  const [newPlantaName, setNewPlantaName] = useState('')
  const [newZoneName, setNewZoneName] = useState('')
  const [newZonePlantaId, setNewZonePlantaId] = useState(plantas[0]?.id || '')

  const input =
    'w-full px-2.5 py-1.5 bg-[#1a2330] border border-[#2a3441] focus:border-amber-400 rounded text-sm text-white outline-none'
  const btnSave =
    'px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-900 text-xs font-bold rounded uppercase flex items-center gap-1'
  const btnDel = 'px-3 py-1.5 bg-red-500/80 hover:bg-red-500 text-white text-xs font-bold rounded uppercase flex items-center gap-1'

  return (
    <div className="max-w-5xl space-y-8">
      {/* Plantas */}
      <section>
        <h2 className="text-lg font-semibold text-white mb-1">Plantas</h2>
        <p className="text-xs text-gray-500 mb-4">
          Cada planta es una vista independiente del plano (COMEDOR, TERRAZA, PRIVADO...)
        </p>

        <div className="flex items-end gap-3 bg-[#1a2330] p-3 rounded-lg mb-4 border border-[#2a3441]">
          <div className="flex-1">
            <label className="block text-[10px] font-medium text-gray-400 uppercase mb-1">
              Nombre de la nueva planta
            </label>
            <input
              type="text"
              value={newPlantaName}
              onChange={(e) => setNewPlantaName(e.target.value)}
              className={input}
              placeholder="Ej: COMEDOR"
            />
          </div>
          <button
            onClick={() => {
              if (newPlantaName.trim()) {
                addPlanta(newPlantaName.toUpperCase())
                setNewPlantaName('')
              }
            }}
            className="bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold text-xs px-4 py-2 rounded uppercase flex items-center gap-2"
          >
            <Plus size={14} /> Nueva planta
          </button>
        </div>

        <div className="space-y-2">
          {plantas.map((p) => {
            const plantaZones = zones.filter((z) => z.plantaId === p.id)
            const plantaTableCount = tables.filter((t) => plantaZones.some((z) => z.id === t.zoneId)).length
            return (
              <div
                key={p.id}
                className="flex items-center gap-3 p-3 bg-[#1a2330] rounded-lg border border-[#2a3441]"
              >
                <input
                  type="text"
                  value={p.name}
                  onChange={(e) => updatePlanta(p.id, { name: e.target.value })}
                  className={cn(input, 'flex-1 uppercase')}
                />
                <span className="text-xs text-gray-500">
                  {plantaZones.length} zonas · {plantaTableCount} mesas
                </span>
                <button
                  className={btnSave}
                  onClick={() => updatePlanta(p.id, { name: p.name })}
                  title="Guardar"
                >
                  <Save size={12} /> Actualizar
                </button>
                <button
                  className={btnDel}
                  onClick={() => {
                    if (
                      confirm(
                        `¿Eliminar la planta "${p.name}"? Se perderán sus ${plantaZones.length} zonas y ${plantaTableCount} mesas.`
                      )
                    )
                      deletePlanta(p.id)
                  }}
                >
                  <Trash2 size={12} /> Borrar
                </button>
              </div>
            )
          })}
        </div>
      </section>

      {/* Zones */}
      <section>
        <h2 className="text-lg font-semibold text-white mb-1">Zonas</h2>
        <p className="text-xs text-gray-500 mb-4">
          Cada zona agrupa mesas dentro de una planta (Salón, Barra, Terraza interior, etc.)
        </p>

        <div className="flex items-end gap-3 bg-[#1a2330] p-3 rounded-lg mb-4 border border-[#2a3441]">
          <div className="flex-1">
            <label className="block text-[10px] font-medium text-gray-400 uppercase mb-1">
              Nombre de la nueva zona
            </label>
            <input
              type="text"
              value={newZoneName}
              onChange={(e) => setNewZoneName(e.target.value)}
              className={input}
              placeholder="Ej: Barra"
            />
          </div>
          <div className="w-48">
            <label className="block text-[10px] font-medium text-gray-400 uppercase mb-1">Planta</label>
            <select value={newZonePlantaId} onChange={(e) => setNewZonePlantaId(e.target.value)} className={input}>
              {plantas.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={() => {
              if (newZoneName.trim() && newZonePlantaId) {
                addZone(newZoneName, newZonePlantaId)
                setNewZoneName('')
              }
            }}
            className="bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold text-xs px-4 py-2 rounded uppercase flex items-center gap-2"
          >
            <Plus size={14} /> Nueva zona
          </button>
        </div>

        <div className="space-y-2">
          {zones.map((z) => {
            const zoneTables = tables.filter((t) => t.zoneId === z.id).length
            return (
              <div
                key={z.id}
                className="flex items-center gap-3 p-3 bg-[#1a2330] rounded-lg border border-[#2a3441]"
              >
                <input
                  type="text"
                  value={z.name}
                  onChange={(e) => updateZone(z.id, { name: e.target.value })}
                  className={cn(input, 'flex-1')}
                />
                <select
                  value={z.plantaId}
                  onChange={(e) => updateZone(z.id, { plantaId: e.target.value })}
                  className={cn(input, 'w-48')}
                >
                  {plantas.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                <span className="text-xs text-gray-500">{zoneTables} mesas</span>
                <button
                  className={btnDel}
                  onClick={() => {
                    if (
                      confirm(`¿Eliminar la zona "${z.name}"? Se perderán sus ${zoneTables} mesas.`)
                    )
                      deleteZone(z.id)
                  }}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
