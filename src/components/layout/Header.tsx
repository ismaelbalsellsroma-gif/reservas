import { Menu } from 'lucide-react'
import { useStore } from '../../store'

interface HeaderProps {
  onMenuClick: () => void
  title: string
}

export function Header({ onMenuClick, title }: HeaderProps) {
  const settings = useStore((s) => s.settings)

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 lg:px-6 shrink-0">
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="p-2 hover:bg-gray-100 rounded-lg lg:hidden">
          <Menu size={20} className="text-gray-600" />
        </button>
        <div>
          <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
          <p className="text-xs text-gray-500 hidden sm:block">{settings.name}</p>
        </div>
      </div>
      <div className="text-sm text-gray-500">
        {new Date().toLocaleDateString('es-ES', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })}
      </div>
    </header>
  )
}
