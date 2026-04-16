import { Search, Utensils, Hand, Info, Globe, ChevronDown } from 'lucide-react'
import { useStore } from '../../store'

interface HeaderProps {
  onNewReservation: () => void
  searchQuery: string
  onSearchChange: (q: string) => void
}

export function Header({ onNewReservation, searchQuery, onSearchChange }: HeaderProps) {
  const settings = useStore((s) => s.settings)

  return (
    <header className="h-14 bg-[#0f1620] border-b border-[#1f2936] flex items-center gap-3 px-4 shrink-0">
      {/* Restaurant selector */}
      <button className="flex items-center gap-2 text-sm font-semibold text-white hover:bg-[#1a2330] px-2.5 py-1.5 rounded-lg">
        <span className="uppercase tracking-wide">{settings.name}</span>
        <ChevronDown size={16} className="text-gray-400" />
      </button>

      {/* Search */}
      <div className="relative flex-1 max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar cliente o ref reserva"
          className="w-full pl-9 pr-3 py-2 bg-[#1a2330] border border-transparent focus:border-amber-400 rounded-lg text-sm text-white placeholder-gray-500 outline-none"
        />
      </div>

      <div className="flex-1" />

      {/* Action icons */}
      <button title="Turnos" className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-amber-300 hover:bg-[#1a2330] rounded-lg">
        <Utensils size={18} />
      </button>
      <button title="Walk-in" className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-amber-300 hover:bg-[#1a2330] rounded-lg">
        <Hand size={18} />
      </button>

      <button
        onClick={onNewReservation}
        className="bg-amber-400 hover:bg-amber-300 text-black font-semibold text-sm uppercase tracking-wide px-4 py-2 rounded-lg transition-colors"
      >
        Nueva reserva
      </button>

      <button title="Info" className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-amber-300 hover:bg-[#1a2330] rounded-lg">
        <Info size={18} />
      </button>
      <button title="Idioma" className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-amber-300 hover:bg-[#1a2330] rounded-lg">
        <Globe size={18} />
      </button>

      {/* User */}
      <button className="flex items-center gap-2 text-xs text-gray-400 hover:text-white hover:bg-[#1a2330] px-2 py-1.5 rounded-lg">
        <div className="w-7 h-7 bg-emerald-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
          IB
        </div>
        <span className="hidden md:inline uppercase">ismaelbalsellsroma@gmail.com</span>
        <ChevronDown size={14} />
      </button>
    </header>
  )
}
