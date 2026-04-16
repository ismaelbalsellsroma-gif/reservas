import { NavLink } from 'react-router-dom'
import { CalendarDays, Users, Settings, Gamepad2, Ticket, Lightbulb } from 'lucide-react'
import { cn } from '../../lib/utils'

const links = [
  { to: '/', icon: CalendarDays, label: 'Reservas' },
  { to: '/clients', icon: Users, label: 'Clientes' },
  { to: '/settings', icon: Settings, label: 'Configuración' },
  { to: '/floor-editor', icon: Gamepad2, label: 'Editor de sala' },
  { to: '/shifts', icon: Ticket, label: 'Turnos' },
]

export function Sidebar() {
  return (
    <aside className="w-14 bg-[#0b111a] border-r border-[#1f2936] flex flex-col items-center py-3 shrink-0">
      <nav className="flex-1 flex flex-col gap-1 w-full items-center">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/'}
            title={link.label}
            className={({ isActive }) =>
              cn(
                'w-10 h-10 flex items-center justify-center rounded-lg transition-colors',
                isActive
                  ? 'bg-amber-400 text-black'
                  : 'text-gray-400 hover:bg-[#1a2330] hover:text-amber-300'
              )
            }
          >
            <link.icon size={20} />
          </NavLink>
        ))}
      </nav>
      <div className="pt-2 border-t border-[#1f2936] w-full flex justify-center">
        <button title="Ayuda" className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-amber-300 hover:bg-[#1a2330] rounded-lg">
          <Lightbulb size={18} />
        </button>
      </div>
    </aside>
  )
}
