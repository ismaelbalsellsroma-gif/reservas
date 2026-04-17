import { useState } from 'react'
import { cn } from '../lib/utils'
import { PlantasZonasTab } from '../components/settings/PlantasZonasTab'
import { CombinacionesTab } from '../components/settings/CombinacionesTab'
import { StaffTab } from '../components/settings/StaffTab'
import { TurnosTab } from '../components/settings/TurnosTab'
import { GeneralTab } from '../components/settings/GeneralTab'
import { EtiquetasTab } from '../components/settings/EtiquetasTab'

type Tab = 'general' | 'plantas' | 'combinaciones' | 'staff' | 'turnos' | 'etiquetas'

const tabs: { id: Tab; label: string }[] = [
  { id: 'general', label: 'General' },
  { id: 'plantas', label: 'Plantas / Zonas' },
  { id: 'combinaciones', label: 'Combinación de mesas' },
  { id: 'turnos', label: 'Turnos' },
  { id: 'staff', label: 'Staff' },
  { id: 'etiquetas', label: 'Etiquetas' },
]

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('general')

  return (
    <div className="flex flex-col h-full">
      {/* Tabs header */}
      <div className="flex items-center gap-1 px-4 py-2 border-b border-[#1f2936] bg-[#0b111a]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'px-4 py-2 rounded-t text-sm font-semibold transition-colors',
              activeTab === tab.id
                ? 'text-amber-300 border-b-2 border-amber-400 bg-[#1a2330]'
                : 'text-gray-400 hover:text-gray-200'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'general' && <GeneralTab />}
        {activeTab === 'plantas' && <PlantasZonasTab />}
        {activeTab === 'combinaciones' && <CombinacionesTab />}
        {activeTab === 'staff' && <StaffTab />}
        {activeTab === 'turnos' && <TurnosTab />}
        {activeTab === 'etiquetas' && <EtiquetasTab />}
      </div>
    </div>
  )
}
