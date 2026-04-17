import { useState, useRef, useMemo } from 'react'
import { Plus, Trash2, Move, Lock, Unlock } from 'lucide-react'
import { useStore } from '../store'
import { cn } from '../lib/utils'
import type { TableShape, DecorationType } from '../types'

type DraggingItem =
  | { kind: 'table'; id: string; offsetX: number; offsetY: number }
  | { kind: 'decoration'; id: string; offsetX: number; offsetY: number }
  | null

const shapePresets: { shape: TableShape; label: string; w: number; h: number }[] = [
  { shape: 'square', label: '■', w: 70, h: 70 },
  { shape: 'round', label: '●', w: 70, h: 70 },
  { shape: 'rectangle-wide', label: '▬', w: 140, h: 60 },
  { shape: 'rectangle-narrow', label: '▭', w: 90, h: 70 },
  { shape: 'rectangle-small', label: '▪', w: 60, h: 40 },
]

const decorationPresets: { type: DecorationType; label: string; w: number; h: number; icon: string }[] = [
  { type: 'wall-h', label: 'Pared horizontal', w: 200, h: 16, icon: '━' },
  { type: 'wall-v', label: 'Pared vertical', w: 16, h: 200, icon: '┃' },
  { type: 'bar', label: 'Barra', w: 180, h: 40, icon: '🍺' },
  { type: 'plant', label: 'Planta', w: 50, h: 50, icon: '🌿' },
  { type: 'star', label: 'Decoración', w: 40, h: 40, icon: '✦' },
  { type: 'umbrella-blue', label: 'Sombrilla azul', w: 60, h: 60, icon: '☂' },
  { type: 'umbrella-yellow', label: 'Sombrilla amarilla', w: 60, h: 60, icon: '☂' },
  { type: 'door', label: 'Puerta', w: 40, h: 60, icon: '🚪' },
  { type: 'bathroom', label: 'Baño', w: 50, h: 50, icon: '🚻' },
]

export function FloorEditorPage() {
  const plantas = useStore((s) => s.plantas)
  const zones = useStore((s) => s.zones)
  const tables = useStore((s) => s.tables)
  const decorations = useStore((s) => s.decorations)
  const addTable = useStore((s) => s.addTable)
  const updateTable = useStore((s) => s.updateTable)
  const deleteTable = useStore((s) => s.deleteTable)
  const toggleWebBlock = useStore((s) => s.toggleTableWebBlock)
  const addDecoration = useStore((s) => s.addDecoration)
  const updateDecoration = useStore((s) => s.updateDecoration)
  const deleteDecoration = useStore((s) => s.deleteDecoration)

  const [currentPlantaId, setCurrentPlantaId] = useState<string>(plantas[0]?.id || '')
  const [selectedShape, setSelectedShape] = useState<TableShape>('square')
  const [newZoneId, setNewZoneId] = useState<string>('')
  const [newTableName, setNewTableName] = useState('')
  const [newTableMin, setNewTableMin] = useState(1)
  const [newTableMax, setNewTableMax] = useState(4)
  const [isHigh, setIsHigh] = useState(false)
  const [selectedItem, setSelectedItem] = useState<{ kind: 'table' | 'decoration'; id: string } | null>(null)

  const svgRef = useRef<SVGSVGElement>(null)
  const [dragging, setDragging] = useState<DraggingItem>(null)

  const plantaZones = useMemo(() => zones.filter((z) => z.plantaId === currentPlantaId), [zones, currentPlantaId])
  const plantaZoneIds = useMemo(() => new Set(plantaZones.map((z) => z.id)), [plantaZones])
  const plantaTables = useMemo(() => tables.filter((t) => plantaZoneIds.has(t.zoneId)), [tables, plantaZoneIds])
  const plantaDecorations = useMemo(() => decorations.filter((d) => d.plantaId === currentPlantaId), [decorations, currentPlantaId])

  // Set default zone if not set
  useMemo(() => {
    if (!newZoneId && plantaZones[0]) setNewZoneId(plantaZones[0].id)
  }, [newZoneId, plantaZones])

  const handleAddTable = () => {
    if (!newTableName.trim() || !newZoneId) {
      alert('Define nombre y zona para la mesa')
      return
    }
    const preset = shapePresets.find((s) => s.shape === selectedShape)!
    addTable({
      name: newTableName,
      capacityMin: newTableMin,
      capacityMax: newTableMax,
      shape: selectedShape,
      isHigh,
      x: 300,
      y: 300,
      width: preset.w,
      height: preset.h,
      zoneId: newZoneId,
      webBlocked: false,
      blockedDates: [],
      active: true,
    })
    setNewTableName(String(Number(newTableName) + 1) || '')
  }

  const handleAddDecoration = (type: DecorationType) => {
    const preset = decorationPresets.find((d) => d.type === type)!
    addDecoration({
      type,
      x: 250,
      y: 250,
      width: preset.w,
      height: preset.h,
      plantaId: currentPlantaId,
    })
  }

  const startDrag = (
    e: React.MouseEvent,
    kind: 'table' | 'decoration',
    id: string,
    itemX: number,
    itemY: number,
  ) => {
    if (!svgRef.current) return
    const pt = svgRef.current.createSVGPoint()
    pt.x = e.clientX
    pt.y = e.clientY
    const svgPoint = pt.matrixTransform(svgRef.current.getScreenCTM()!.inverse())
    setDragging({ kind, id, offsetX: svgPoint.x - itemX, offsetY: svgPoint.y - itemY })
    setSelectedItem({ kind, id })
    e.stopPropagation()
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging || !svgRef.current) return
    const pt = svgRef.current.createSVGPoint()
    pt.x = e.clientX
    pt.y = e.clientY
    const svgPoint = pt.matrixTransform(svgRef.current.getScreenCTM()!.inverse())
    const newX = Math.max(0, Math.round(svgPoint.x - dragging.offsetX))
    const newY = Math.max(0, Math.round(svgPoint.y - dragging.offsetY))
    if (dragging.kind === 'table') {
      updateTable(dragging.id, { x: newX, y: newY })
    } else {
      updateDecoration(dragging.id, { x: newX, y: newY })
    }
  }

  const handleMouseUp = () => setDragging(null)

  const selectedTable = selectedItem?.kind === 'table' ? tables.find((t) => t.id === selectedItem.id) : null
  const selectedDeco = selectedItem?.kind === 'decoration' ? decorations.find((d) => d.id === selectedItem.id) : null

  return (
    <div className="flex flex-col h-full">
      {/* Planta tabs */}
      <div className="flex items-center gap-1 px-4 py-2 border-b border-[#1f2936] bg-[#0b111a]">
        {plantas.map((p) => (
          <button
            key={p.id}
            onClick={() => setCurrentPlantaId(p.id)}
            className={cn(
              'px-4 py-1.5 rounded-t text-xs font-semibold transition-colors',
              currentPlantaId === p.id
                ? 'bg-[#1a2330] text-amber-300 border-b-2 border-amber-400'
                : 'text-gray-500 hover:text-gray-300'
            )}
          >
            {p.name}
          </button>
        ))}
      </div>

      <div className="flex-1 flex min-h-0">
        {/* Left: tool panel */}
        <aside className="w-80 bg-[#0b111a] border-r border-[#1f2936] p-4 overflow-y-auto space-y-5">
          <section>
            <h3 className="text-sm font-semibold text-white mb-3">Añadir mesa</h3>

            <div className="flex gap-2 mb-3">
              {shapePresets.map((s) => (
                <button
                  key={s.shape}
                  onClick={() => setSelectedShape(s.shape)}
                  className={cn(
                    'flex-1 h-14 rounded border flex items-center justify-center text-amber-700 text-2xl transition-colors',
                    selectedShape === s.shape
                      ? 'bg-amber-900/60 border-amber-400'
                      : 'bg-[#1a2330] border-[#2a3441] hover:border-amber-400'
                  )}
                  title={s.shape}
                >
                  {s.label}
                </button>
              ))}
            </div>

            <div className="space-y-2">
              <div>
                <label className="block text-[10px] font-medium text-gray-400 uppercase mb-1">Zona</label>
                <select
                  value={newZoneId}
                  onChange={(e) => setNewZoneId(e.target.value)}
                  className="w-full px-2 py-1.5 bg-[#1a2330] border border-[#2a3441] rounded text-sm text-white"
                >
                  {plantaZones.map((z) => (
                    <option key={z.id} value={z.id}>
                      {z.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] font-medium text-gray-400 uppercase mb-1">Nº</label>
                  <input
                    value={newTableName}
                    onChange={(e) => setNewTableName(e.target.value)}
                    className="w-full px-2 py-1.5 bg-[#1a2330] border border-[#2a3441] rounded text-sm text-white"
                    placeholder="12"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-gray-400 uppercase mb-1">Min</label>
                  <input
                    type="number"
                    value={newTableMin}
                    onChange={(e) => setNewTableMin(Number(e.target.value))}
                    className="w-full px-2 py-1.5 bg-[#1a2330] border border-[#2a3441] rounded text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-gray-400 uppercase mb-1">Max</label>
                  <input
                    type="number"
                    value={newTableMax}
                    onChange={(e) => setNewTableMax(Number(e.target.value))}
                    className="w-full px-2 py-1.5 bg-[#1a2330] border border-[#2a3441] rounded text-sm text-white"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer">
                <input type="checkbox" checked={isHigh} onChange={(e) => setIsHigh(e.target.checked)} />
                Mesa alta
              </label>

              <button
                onClick={handleAddTable}
                className="w-full bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold text-xs py-2 rounded uppercase flex items-center justify-center gap-2"
              >
                <Plus size={14} /> Añadir mesa
              </button>
            </div>
          </section>

          <section>
            <h3 className="text-sm font-semibold text-white mb-3">Elementos decorativos</h3>
            <div className="grid grid-cols-3 gap-2">
              {decorationPresets.map((d) => (
                <button
                  key={d.type}
                  onClick={() => handleAddDecoration(d.type)}
                  className="h-16 rounded bg-[#1a2330] border border-[#2a3441] hover:border-amber-400 flex flex-col items-center justify-center text-gray-300 hover:text-amber-300"
                  title={d.label}
                >
                  <span className="text-xl">{d.icon}</span>
                  <span className="text-[9px] mt-0.5 text-gray-500">{d.label.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </section>

          {selectedTable && (
            <section className="p-3 bg-amber-900/20 border border-amber-700/50 rounded space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-amber-300">Mesa {selectedTable.name}</h4>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="text-xs text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] text-gray-400 uppercase mb-1">Nº</label>
                  <input
                    value={selectedTable.name}
                    onChange={(e) => updateTable(selectedTable.id, { name: e.target.value })}
                    className="w-full px-2 py-1 bg-[#0b111a] border border-[#2a3441] rounded text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-400 uppercase mb-1">Min</label>
                  <input
                    type="number"
                    value={selectedTable.capacityMin}
                    onChange={(e) =>
                      updateTable(selectedTable.id, { capacityMin: Number(e.target.value) })
                    }
                    className="w-full px-2 py-1 bg-[#0b111a] border border-[#2a3441] rounded text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-400 uppercase mb-1">Max</label>
                  <input
                    type="number"
                    value={selectedTable.capacityMax}
                    onChange={(e) =>
                      updateTable(selectedTable.id, { capacityMax: Number(e.target.value) })
                    }
                    className="w-full px-2 py-1 bg-[#0b111a] border border-[#2a3441] rounded text-sm text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-gray-400 uppercase mb-1">Ancho</label>
                  <input
                    type="number"
                    value={selectedTable.width}
                    onChange={(e) => updateTable(selectedTable.id, { width: Number(e.target.value) })}
                    className="w-full px-2 py-1 bg-[#0b111a] border border-[#2a3441] rounded text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-400 uppercase mb-1">Alto</label>
                  <input
                    type="number"
                    value={selectedTable.height}
                    onChange={(e) =>
                      updateTable(selectedTable.id, { height: Number(e.target.value) })
                    }
                    className="w-full px-2 py-1 bg-[#0b111a] border border-[#2a3441] rounded text-sm text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] text-gray-400 uppercase mb-1">Zona</label>
                <select
                  value={selectedTable.zoneId}
                  onChange={(e) => updateTable(selectedTable.id, { zoneId: e.target.value })}
                  className="w-full px-2 py-1 bg-[#0b111a] border border-[#2a3441] rounded text-sm text-white"
                >
                  {plantaZones.map((z) => (
                    <option key={z.id} value={z.id}>
                      {z.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleWebBlock(selectedTable.id)}
                  className={cn(
                    'flex-1 py-1.5 text-xs font-semibold rounded flex items-center justify-center gap-1',
                    selectedTable.webBlocked
                      ? 'bg-amber-400 text-slate-900'
                      : 'bg-[#2a3441] text-gray-300 hover:bg-[#344157]'
                  )}
                >
                  {selectedTable.webBlocked ? <Lock size={12} /> : <Unlock size={12} />}
                  {selectedTable.webBlocked ? 'Web bloqueada' : 'Bloquear web'}
                </button>
                <button
                  onClick={() => {
                    if (confirm(`¿Eliminar mesa ${selectedTable.name}?`)) {
                      deleteTable(selectedTable.id)
                      setSelectedItem(null)
                    }
                  }}
                  className="px-3 py-1.5 bg-red-500/80 hover:bg-red-500 text-white text-xs font-bold rounded"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </section>
          )}

          {selectedDeco && (
            <section className="p-3 bg-indigo-900/20 border border-indigo-700/50 rounded space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-indigo-300">Decoración</h4>
                <button onClick={() => setSelectedItem(null)} className="text-xs text-gray-400 hover:text-white">
                  ✕
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-gray-400 uppercase mb-1">Ancho</label>
                  <input
                    type="number"
                    value={selectedDeco.width}
                    onChange={(e) =>
                      updateDecoration(selectedDeco.id, { width: Number(e.target.value) })
                    }
                    className="w-full px-2 py-1 bg-[#0b111a] border border-[#2a3441] rounded text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-400 uppercase mb-1">Alto</label>
                  <input
                    type="number"
                    value={selectedDeco.height}
                    onChange={(e) =>
                      updateDecoration(selectedDeco.id, { height: Number(e.target.value) })
                    }
                    className="w-full px-2 py-1 bg-[#0b111a] border border-[#2a3441] rounded text-sm text-white"
                  />
                </div>
              </div>
              <button
                onClick={() => {
                  deleteDecoration(selectedDeco.id)
                  setSelectedItem(null)
                }}
                className="w-full py-1.5 bg-red-500/80 hover:bg-red-500 text-white text-xs font-bold rounded flex items-center justify-center gap-1"
              >
                <Trash2 size={12} /> Eliminar decoración
              </button>
            </section>
          )}

          <div className="pt-3 border-t border-[#1f2936] text-[10px] text-gray-500">
            <p className="flex items-center gap-1">
              <Move size={10} /> Arrastra mesas y decoración en el plano
            </p>
            <p>Haz click en una mesa para editarla.</p>
          </div>
        </aside>

        {/* Right: canvas */}
        <div className="flex-1 overflow-auto p-4 bg-[#0f1620]">
          <div className="bg-[#1a2330] rounded-lg relative" style={{ width: 900, height: 720 }}>
            <svg
              ref={svgRef}
              viewBox="0 0 900 720"
              className="w-full h-full select-none"
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onClick={() => setSelectedItem(null)}
            >
              <defs>
                <pattern id="editor-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="900" height="720" fill="url(#editor-grid)" />

              {/* Decorations */}
              {plantaDecorations.map((d) => {
                const isWall = d.type === 'wall-h' || d.type === 'wall-v'
                const isBar = d.type === 'bar'
                const selected = selectedItem?.kind === 'decoration' && selectedItem.id === d.id
                return (
                  <g
                    key={d.id}
                    onMouseDown={(e) => startDrag(e, 'decoration', d.id, d.x, d.y)}
                    style={{ cursor: dragging ? 'grabbing' : 'grab' }}
                  >
                    <rect
                      x={d.x}
                      y={d.y}
                      width={d.width}
                      height={d.height}
                      rx={isBar ? 4 : isWall ? 0 : 8}
                      fill={isWall ? '#0b111a' : isBar ? '#1a2330' : '#1f2936'}
                      stroke={selected ? '#fbbf24' : isBar ? '#fbbf24' : '#2a3441'}
                      strokeWidth={selected ? 2 : isBar ? 1 : 0.5}
                      strokeDasharray={isBar ? '4 2' : undefined}
                    />
                    {isBar && (
                      <text
                        x={d.x + d.width / 2}
                        y={d.y + d.height / 2 + 4}
                        textAnchor="middle"
                        fontSize="11"
                        fontWeight="700"
                        fill="#fbbf24"
                        style={{ pointerEvents: 'none' }}
                      >
                        Barra
                      </text>
                    )}
                    {!isWall && !isBar && (
                      <text
                        x={d.x + d.width / 2}
                        y={d.y + d.height / 2 + 6}
                        textAnchor="middle"
                        fontSize="20"
                        style={{ pointerEvents: 'none' }}
                      >
                        {decorationPresets.find((p) => p.type === d.type)?.icon || '·'}
                      </text>
                    )}
                  </g>
                )
              })}

              {/* Tables */}
              {plantaTables.map((t) => {
                const selected = selectedItem?.kind === 'table' && selectedItem.id === t.id
                return (
                  <g
                    key={t.id}
                    onMouseDown={(e) => startDrag(e, 'table', t.id, t.x, t.y)}
                    style={{ cursor: dragging ? 'grabbing' : 'grab' }}
                  >
                    {t.shape === 'round' ? (
                      <circle
                        cx={t.x + t.width / 2}
                        cy={t.y + t.height / 2}
                        r={Math.min(t.width, t.height) / 2}
                        fill="#6b3f1b"
                        stroke={selected ? '#fbbf24' : t.webBlocked ? '#f59e0b' : 'rgba(0,0,0,0.3)'}
                        strokeWidth={selected ? 3 : t.webBlocked ? 2 : 1}
                      />
                    ) : (
                      <rect
                        x={t.x}
                        y={t.y}
                        width={t.width}
                        height={t.height}
                        rx={8}
                        fill="#6b3f1b"
                        stroke={selected ? '#fbbf24' : t.webBlocked ? '#f59e0b' : 'rgba(0,0,0,0.3)'}
                        strokeWidth={selected ? 3 : t.webBlocked ? 2 : 1}
                      />
                    )}
                    <text
                      x={t.x + t.width / 2}
                      y={t.y + t.height / 2 + 4}
                      textAnchor="middle"
                      fontSize="13"
                      fontWeight="700"
                      fill="#fed7aa"
                      style={{ pointerEvents: 'none' }}
                    >
                      {t.name}
                    </text>
                    {t.webBlocked && (
                      <text
                        x={t.x + 4}
                        y={t.y + 12}
                        fontSize="10"
                        fill="#fbbf24"
                        style={{ pointerEvents: 'none' }}
                      >
                        🔒
                      </text>
                    )}
                  </g>
                )
              })}
            </svg>

            <div className="absolute top-3 right-3 bg-black/60 text-[10px] text-amber-300 px-2 py-1 rounded font-bold uppercase">
              {plantas.find((p) => p.id === currentPlantaId)?.name}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
