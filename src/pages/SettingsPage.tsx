import { useState } from 'react'
import { Save, Plus, Trash2, RotateCcw } from 'lucide-react'
import { useStore } from '../store'
import { Card } from '../components/ui/Card'
import { cn } from '../lib/utils'
import type { Table, TableShape } from '../types'
import { generateId } from '../lib/utils'

type Tab = 'general' | 'tables' | 'zones'

export function SettingsPage() {
  const settings = useStore((s) => s.settings)
  const tables = useStore((s) => s.tables)
  const updateSettings = useStore((s) => s.updateSettings)
  const addTable = useStore((s) => s.addTable)
  const updateTable = useStore((s) => s.updateTable)
  const deleteTable = useStore((s) => s.deleteTable)

  const [activeTab, setActiveTab] = useState<Tab>('general')
  const [saved, setSaved] = useState(false)

  // General settings form
  const [name, setName] = useState(settings.name)
  const [openTime, setOpenTime] = useState(settings.openTime)
  const [closeTime, setCloseTime] = useState(settings.closeTime)
  const [slotDuration, setSlotDuration] = useState(settings.slotDuration)
  const [maxPartySize, setMaxPartySize] = useState(settings.maxPartySize)
  const [defaultDuration, setDefaultDuration] = useState(settings.defaultReservationDuration)

  // New table form
  const [newTableName, setNewTableName] = useState('')
  const [newTableCapacity, setNewTableCapacity] = useState(4)
  const [newTableShape, setNewTableShape] = useState<TableShape>('square')
  const [newTableZone, setNewTableZone] = useState(settings.zones[0] || '')

  // New zone
  const [newZone, setNewZone] = useState('')

  const handleSaveGeneral = () => {
    updateSettings({
      name,
      openTime,
      closeTime,
      slotDuration,
      maxPartySize,
      defaultReservationDuration: defaultDuration,
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleAddTable = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTableName) return
    addTable({
      name: newTableName,
      capacity: newTableCapacity,
      shape: newTableShape,
      x: Math.random() * 400 + 50,
      y: Math.random() * 300 + 50,
      zone: newTableZone,
    })
    setNewTableName('')
    setNewTableCapacity(4)
  }

  const handleAddZone = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newZone || settings.zones.includes(newZone)) return
    updateSettings({ zones: [...settings.zones, newZone] })
    setNewZone('')
  }

  const handleRemoveZone = (zone: string) => {
    updateSettings({ zones: settings.zones.filter((z) => z !== zone) })
  }

  const handleResetData = () => {
    if (confirm('¿Estás seguro? Esto eliminará todos los datos y volverá a la configuración inicial.')) {
      localStorage.removeItem('reservas-pro-storage')
      window.location.reload()
    }
  }

  const inputClass = 'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500'
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1'

  const tabs: { id: Tab; label: string }[] = [
    { id: 'general', label: 'General' },
    { id: 'tables', label: 'Mesas' },
    { id: 'zones', label: 'Zonas' },
  ]

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'px-4 py-2 rounded-md text-sm font-medium transition-colors',
              activeTab === tab.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* General settings */}
      {activeTab === 'general' && (
        <Card className="p-6">
          <h3 className="font-semibold text-gray-900 mb-6">Configuración general</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
            <div className="sm:col-span-2">
              <label className={labelClass}>Nombre del restaurante</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Hora de apertura</label>
              <input type="time" value={openTime} onChange={(e) => setOpenTime(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Hora de cierre</label>
              <input type="time" value={closeTime} onChange={(e) => setCloseTime(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Duración del slot (min)</label>
              <input type="number" value={slotDuration} onChange={(e) => setSlotDuration(Number(e.target.value))} className={inputClass} min={15} step={15} />
            </div>
            <div>
              <label className={labelClass}>Duración por defecto de reserva (min)</label>
              <input type="number" value={defaultDuration} onChange={(e) => setDefaultDuration(Number(e.target.value))} className={inputClass} min={30} step={15} />
            </div>
            <div>
              <label className={labelClass}>Tamaño máximo de grupo</label>
              <input type="number" value={maxPartySize} onChange={(e) => setMaxPartySize(Number(e.target.value))} className={inputClass} min={1} />
            </div>
          </div>
          <div className="flex items-center gap-3 mt-6">
            <button
              onClick={handleSaveGeneral}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700"
            >
              <Save size={16} />
              Guardar
            </button>
            {saved && <span className="text-sm text-green-600 font-medium">Guardado correctamente</span>}
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <h4 className="font-medium text-gray-900 mb-2">Zona de peligro</h4>
            <p className="text-sm text-gray-500 mb-3">Restablecer todos los datos a los valores iniciales.</p>
            <button
              onClick={handleResetData}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100"
            >
              <RotateCcw size={16} />
              Restablecer datos
            </button>
          </div>
        </Card>
      )}

      {/* Tables management */}
      {activeTab === 'tables' && (
        <div className="space-y-4">
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Añadir mesa</h3>
            <form onSubmit={handleAddTable} className="flex flex-wrap gap-3 items-end">
              <div>
                <label className={labelClass}>Nombre</label>
                <input
                  type="text"
                  value={newTableName}
                  onChange={(e) => setNewTableName(e.target.value)}
                  className={inputClass}
                  placeholder="Mesa 11"
                  required
                />
              </div>
              <div>
                <label className={labelClass}>Capacidad</label>
                <input
                  type="number"
                  value={newTableCapacity}
                  onChange={(e) => setNewTableCapacity(Number(e.target.value))}
                  className={inputClass}
                  min={1}
                />
              </div>
              <div>
                <label className={labelClass}>Forma</label>
                <select value={newTableShape} onChange={(e) => setNewTableShape(e.target.value as TableShape)} className={inputClass}>
                  <option value="round">Redonda</option>
                  <option value="square">Cuadrada</option>
                  <option value="rectangle">Rectangular</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Zona</label>
                <select value={newTableZone} onChange={(e) => setNewTableZone(e.target.value)} className={inputClass}>
                  {settings.zones.map((z) => (
                    <option key={z} value={z}>{z}</option>
                  ))}
                </select>
              </div>
              <button type="submit" className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">
                <Plus size={16} /> Añadir
              </button>
            </form>
          </Card>

          <Card>
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Mesas ({tables.length})</h3>
            </div>
            <div className="divide-y divide-gray-50">
              {tables.map((t) => (
                <div key={t.id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <span className="font-medium text-sm text-gray-900">{t.name}</span>
                    <span className="text-xs text-gray-500 ml-3">
                      Cap. {t.capacity} · {t.zone} · {t.shape === 'round' ? 'Redonda' : t.shape === 'rectangle' ? 'Rectangular' : 'Cuadrada'}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm(`¿Eliminar ${t.name}?`)) deleteTable(t.id)
                    }}
                    className="p-1.5 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 size={14} className="text-red-400" />
                  </button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Zones management */}
      {activeTab === 'zones' && (
        <Card className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Zonas del restaurante</h3>
          <form onSubmit={handleAddZone} className="flex gap-3 items-end mb-6">
            <div className="flex-1 max-w-xs">
              <label className={labelClass}>Nueva zona</label>
              <input
                type="text"
                value={newZone}
                onChange={(e) => setNewZone(e.target.value)}
                className={inputClass}
                placeholder="Ej: Barra, Jardín..."
              />
            </div>
            <button type="submit" className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">
              <Plus size={16} /> Añadir
            </button>
          </form>
          <div className="space-y-2">
            {settings.zones.map((zone) => (
              <div key={zone} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-900">{zone}</span>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500">
                    {tables.filter((t) => t.zone === zone).length} mesas
                  </span>
                  <button onClick={() => handleRemoveZone(zone)} className="p-1 hover:bg-red-100 rounded">
                    <Trash2 size={14} className="text-red-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
