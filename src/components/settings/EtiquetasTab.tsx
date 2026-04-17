import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { useStore } from '../../store'

export function EtiquetasTab() {
  const tags = useStore((s) => s.tags)
  const addTag = useStore((s) => s.addTag)
  const removeTag = useStore((s) => s.removeTag)
  const [newTag, setNewTag] = useState('')

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-white mb-1">Etiquetas</h2>
        <p className="text-xs text-gray-500">
          Crea tus propias etiquetas para clasificar clientes y reservas (VIP, Celíaco, Empresa,
          Influencer, etc.)
        </p>
      </div>

      <div className="flex items-end gap-3 bg-[#1a2330] p-3 rounded-lg border border-[#2a3441]">
        <div className="flex-1">
          <label className="block text-[10px] font-medium text-gray-400 uppercase mb-1">
            Nueva etiqueta
          </label>
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && newTag.trim()) {
                addTag(newTag.trim())
                setNewTag('')
              }
            }}
            className="w-full px-2.5 py-1.5 bg-[#0b111a] border border-[#2a3441] focus:border-amber-400 rounded text-sm text-white outline-none"
            placeholder="Ej: VIP, Celíaco, Cumpleaños..."
          />
        </div>
        <button
          onClick={() => {
            if (newTag.trim()) {
              addTag(newTag.trim())
              setNewTag('')
            }
          }}
          className="bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold text-xs px-4 py-2 rounded uppercase flex items-center gap-2"
        >
          <Plus size={14} /> Añadir
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {tags.length === 0 ? (
          <p className="text-sm text-gray-500">No hay etiquetas todavía.</p>
        ) : (
          tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-400/10 border border-amber-400/40 text-amber-300 rounded-full text-sm font-medium"
            >
              {tag}
              <button
                onClick={() => removeTag(tag)}
                className="hover:bg-red-500/20 hover:text-red-400 rounded-full w-4 h-4 flex items-center justify-center"
              >
                <X size={12} />
              </button>
            </span>
          ))
        )}
      </div>
    </div>
  )
}
