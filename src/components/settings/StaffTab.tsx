import { useState } from 'react'
import { Plus, Trash2, UserCheck } from 'lucide-react'
import { useStore } from '../../store'
import { cn } from '../../lib/utils'

export function StaffTab() {
  const staff = useStore((s) => s.staff)
  const addStaff = useStore((s) => s.addStaff)
  const updateStaff = useStore((s) => s.updateStaff)
  const deleteStaff = useStore((s) => s.deleteStaff)

  const [newName, setNewName] = useState('')
  const [newRole, setNewRole] = useState('Camarero')

  const input =
    'w-full px-2.5 py-1.5 bg-[#1a2330] border border-[#2a3441] focus:border-amber-400 rounded text-sm text-white outline-none'

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-white mb-1">Personal (Anotado por)</h2>
        <p className="text-xs text-gray-500">
          Crea los nombres del personal que toma reservas. Aparecerán en el desplegable "Anotado por".
        </p>
      </div>

      <div className="flex items-end gap-3 bg-[#1a2330] p-3 rounded-lg border border-[#2a3441]">
        <div className="flex-1">
          <label className="block text-[10px] font-medium text-gray-400 uppercase mb-1">Nombre</label>
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className={input}
            placeholder="Ej: Ismael"
          />
        </div>
        <div className="w-40">
          <label className="block text-[10px] font-medium text-gray-400 uppercase mb-1">Rol</label>
          <select value={newRole} onChange={(e) => setNewRole(e.target.value)} className={input}>
            <option value="Maître">Maître</option>
            <option value="Recepción">Recepción</option>
            <option value="Camarero">Camarero</option>
            <option value="Encargado">Encargado</option>
            <option value="Propietario">Propietario</option>
            <option value="Otro">Otro</option>
          </select>
        </div>
        <button
          onClick={() => {
            if (newName.trim()) {
              addStaff({ name: newName.trim(), role: newRole, active: true })
              setNewName('')
            }
          }}
          className="bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold text-xs px-4 py-2 rounded uppercase flex items-center gap-2"
        >
          <Plus size={14} /> Añadir
        </button>
      </div>

      <div className="space-y-2">
        {staff.map((s) => (
          <div
            key={s.id}
            className="flex items-center gap-3 p-3 bg-[#1a2330] rounded-lg border border-[#2a3441]"
          >
            <div
              className={cn(
                'w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs',
                s.active ? 'bg-emerald-600 text-white' : 'bg-gray-700 text-gray-400'
              )}
            >
              {s.name.slice(0, 2).toUpperCase()}
            </div>
            <input
              type="text"
              value={s.name}
              onChange={(e) => updateStaff(s.id, { name: e.target.value })}
              className={cn(input, 'flex-1')}
            />
            <select
              value={s.role}
              onChange={(e) => updateStaff(s.id, { role: e.target.value })}
              className={cn(input, 'w-40')}
            >
              <option value="Maître">Maître</option>
              <option value="Recepción">Recepción</option>
              <option value="Camarero">Camarero</option>
              <option value="Encargado">Encargado</option>
              <option value="Propietario">Propietario</option>
              <option value="Otro">Otro</option>
            </select>
            <button
              onClick={() => updateStaff(s.id, { active: !s.active })}
              className={cn(
                'px-3 py-1.5 text-xs font-semibold rounded flex items-center gap-1',
                s.active
                  ? 'bg-emerald-600/30 text-emerald-300 hover:bg-emerald-600/50'
                  : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
              )}
            >
              <UserCheck size={12} /> {s.active ? 'Activo' : 'Inactivo'}
            </button>
            <button
              onClick={() => {
                if (confirm(`¿Eliminar a ${s.name}?`)) deleteStaff(s.id)
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
