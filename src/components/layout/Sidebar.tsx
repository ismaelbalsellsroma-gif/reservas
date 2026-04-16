import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  CalendarDays,
  BookOpen,
  MapPin,
  Users,
  Settings,
  UtensilsCrossed,
} from 'lucide-react'
import { cn } from '../../lib/utils'

const links = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/reservations', icon: BookOpen, label: 'Reservas' },
  { to: '/floor-plan', icon: MapPin, label: 'Mapa de mesas' },
  { to: '/calendar', icon: CalendarDays, label: 'Calendario' },
  { to: '/guests', icon: Users, label: 'Clientes' },
  { to: '/settings', icon: Settings, label: 'Configuración' },
]

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={onClose} />
      )}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full w-64 bg-gray-900 text-white flex flex-col transition-transform lg:translate-x-0 lg:static lg:z-auto',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-800">
          <div className="w-9 h-9 bg-indigo-500 rounded-lg flex items-center justify-center">
            <UtensilsCrossed size={20} />
          </div>
          <div>
            <h1 className="text-base font-bold leading-tight">ReservasPro</h1>
            <p className="text-xs text-gray-400">Gestión de reservas</p>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                )
              }
            >
              <link.icon size={20} />
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="px-5 py-4 border-t border-gray-800 text-xs text-gray-500">
          v1.0.0
        </div>
      </aside>
    </>
  )
}
