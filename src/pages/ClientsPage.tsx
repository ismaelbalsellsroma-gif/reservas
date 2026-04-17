import { useState, useMemo } from 'react'
import { Plus, Search, Trash2, RefreshCw, Filter, Eye, UserCog, Download, X } from 'lucide-react'
import { useStore } from '../store'
import { cn } from '../lib/utils'
import type { Guest } from '../types'
import { ClientDetail } from '../components/clients/ClientDetail'
import { ClientForm } from '../components/clients/ClientForm'

type SortKey = 'name' | 'surname' | 'phone' | 'email'

export function ClientsPage() {
  const guests = useStore((s) => s.guests)
  const tags = useStore((s) => s.tags)
  const deleteGuest = useStore((s) => s.deleteGuest)

  const [search, setSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [tagFilter, setTagFilter] = useState<string>('')
  const [showTagFilter, setShowTagFilter] = useState(false)
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null)
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null)
  const [showNewForm, setShowNewForm] = useState(false)
  const [sortBy, setSortBy] = useState<SortKey>('name')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  const filtered = useMemo(() => {
    let result = guests
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (g) =>
          g.name.toLowerCase().includes(q) ||
          g.surname.toLowerCase().includes(q) ||
          g.phone.includes(q) ||
          g.email.toLowerCase().includes(q) ||
          g.company.toLowerCase().includes(q)
      )
    }
    if (tagFilter) {
      result = result.filter((g) => g.tags.includes(tagFilter))
    }
    result = [...result].sort((a, b) => {
      const va = (a[sortBy] || '').toString().toLowerCase()
      const vb = (b[sortBy] || '').toString().toLowerCase()
      return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va)
    })
    return result
  }, [guests, search, tagFilter, sortBy, sortDir])

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filtered.map((g) => g.id)))
    }
  }

  const handleSort = (key: SortKey) => {
    if (sortBy === key) setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    else {
      setSortBy(key)
      setSortDir('asc')
    }
  }

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return
    if (confirm(`¿Eliminar ${selectedIds.size} clientes seleccionados?`)) {
      selectedIds.forEach((id) => deleteGuest(id))
      setSelectedIds(new Set())
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-5">
            <h1 className="text-xl font-semibold text-white">Listado de clientes</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Consulta y gestiona la base de datos de tus clientes
            </p>
          </div>

          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <button
              onClick={() => window.location.reload()}
              className="w-9 h-9 flex items-center justify-center bg-amber-400 hover:bg-amber-300 text-slate-900 rounded"
              title="Refrescar"
            >
              <RefreshCw size={14} />
            </button>
            <button
              onClick={handleBulkDelete}
              disabled={selectedIds.size === 0}
              className={cn(
                'w-9 h-9 flex items-center justify-center rounded',
                selectedIds.size > 0
                  ? 'bg-red-500 hover:bg-red-400 text-white'
                  : 'bg-[#1a2330] text-gray-600 cursor-not-allowed'
              )}
              title="Eliminar seleccionados"
            >
              <Trash2 size={14} />
            </button>
            <button
              className="w-9 h-9 flex items-center justify-center bg-[#1a2330] hover:bg-[#243040] text-gray-300 rounded"
              title="Exportar"
            >
              <Download size={14} />
            </button>

            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar cliente..."
                className="w-72 pl-9 pr-3 py-2 bg-[#1a2330] border border-[#2a3441] focus:border-amber-400 rounded text-sm text-white outline-none"
              />
            </div>
            <button
              onClick={() => setShowTagFilter(!showTagFilter)}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded text-sm border',
                tagFilter
                  ? 'bg-amber-400 text-slate-900 border-amber-400'
                  : 'bg-[#1a2330] text-gray-300 border-[#2a3441] hover:border-amber-400'
              )}
            >
              <Filter size={14} />
              {tagFilter ? `Etiqueta: ${tagFilter}` : 'Filtrar por etiqueta'}
              {tagFilter && (
                <span
                  onClick={(e) => {
                    e.stopPropagation()
                    setTagFilter('')
                  }}
                  className="ml-1 hover:text-red-500"
                >
                  <X size={12} />
                </span>
              )}
            </button>

            <div className="flex-1" />

            <button
              onClick={() => setShowNewForm(true)}
              className="flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold text-xs px-4 py-2 rounded uppercase"
            >
              <Plus size={14} /> Añadir nuevo cliente
            </button>
          </div>

          {showTagFilter && (
            <div className="mb-4 p-3 bg-[#1a2330] rounded-lg border border-[#2a3441]">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    setTagFilter('')
                    setShowTagFilter(false)
                  }}
                  className={cn(
                    'px-3 py-1 rounded-full text-xs font-medium border',
                    !tagFilter
                      ? 'bg-amber-400 text-slate-900 border-amber-400'
                      : 'bg-transparent text-gray-400 border-[#2a3441] hover:border-amber-400'
                  )}
                >
                  Todas
                </button>
                {tags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => {
                      setTagFilter(tag)
                      setShowTagFilter(false)
                    }}
                    className={cn(
                      'px-3 py-1 rounded-full text-xs font-medium border',
                      tagFilter === tag
                        ? 'bg-amber-400 text-slate-900 border-amber-400'
                        : 'bg-transparent text-gray-400 border-[#2a3441] hover:border-amber-400'
                    )}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Results count */}
          <p className="text-xs text-gray-500 mb-2">
            {filtered.length} clientes
            {selectedIds.size > 0 && <span className="text-amber-300"> · {selectedIds.size} seleccionados</span>}
          </p>

          {/* Table */}
          <div className="bg-[#0b111a] rounded-lg border border-[#1f2936] overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-[#1a2330] text-[11px] uppercase text-gray-500">
                <tr>
                  <th className="px-3 py-2.5 text-left w-8">
                    <input
                      type="checkbox"
                      checked={selectedIds.size === filtered.length && filtered.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded"
                    />
                  </th>
                  <SortHeader label="Nombre" sortKey="name" current={sortBy} dir={sortDir} onClick={handleSort} />
                  <SortHeader label="Apellidos" sortKey="surname" current={sortBy} dir={sortDir} onClick={handleSort} />
                  <SortHeader label="Teléfono" sortKey="phone" current={sortBy} dir={sortDir} onClick={handleSort} />
                  <SortHeader label="Email" sortKey="email" current={sortBy} dir={sortDir} onClick={handleSort} />
                  <th className="px-3 py-2.5 text-left">Empresa</th>
                  <th className="px-3 py-2.5 text-left">Etiquetas</th>
                  <th className="px-3 py-2.5 text-left">Notas</th>
                  <th className="px-3 py-2.5 text-right w-24">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-3 py-12 text-center text-sm text-gray-500">
                      No hay clientes
                    </td>
                  </tr>
                ) : (
                  filtered.map((g) => (
                    <tr
                      key={g.id}
                      className="border-t border-[#1f2936] hover:bg-[#11192a] transition-colors"
                    >
                      <td className="px-3 py-2">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(g.id)}
                          onChange={() => toggleSelect(g.id)}
                          className="rounded"
                        />
                      </td>
                      <td
                        onClick={() => setSelectedGuest(g)}
                        className="px-3 py-2 text-amber-300 font-medium cursor-pointer"
                      >
                        {g.name}
                        {g.vip && <span className="ml-1 text-yellow-400">★</span>}
                      </td>
                      <td
                        onClick={() => setSelectedGuest(g)}
                        className="px-3 py-2 text-amber-300 cursor-pointer"
                      >
                        {g.surname}
                      </td>
                      <td className="px-3 py-2 text-gray-300">
                        {g.phoneCountry}-{g.phone}
                      </td>
                      <td className="px-3 py-2 text-gray-300 truncate max-w-[180px]">{g.email || '—'}</td>
                      <td className="px-3 py-2 text-gray-300">{g.company || '—'}</td>
                      <td className="px-3 py-2">
                        <div className="flex flex-wrap gap-1">
                          {g.tags.slice(0, 3).map((t) => (
                            <span
                              key={t}
                              className="px-1.5 py-0.5 bg-amber-400/10 text-amber-300 rounded text-[10px] font-medium"
                            >
                              {t}
                            </span>
                          ))}
                          {g.tags.length > 3 && (
                            <span className="text-[10px] text-gray-500">+{g.tags.length - 3}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2 text-xs text-gray-400 truncate max-w-[160px]">
                        {g.notes || '—'}
                      </td>
                      <td className="px-3 py-2 text-right">
                        <div className="flex items-center gap-1 justify-end">
                          <button
                            onClick={() => setEditingGuest(g)}
                            className="w-7 h-7 flex items-center justify-center bg-amber-400 hover:bg-amber-300 text-slate-900 rounded"
                            title="Editar"
                          >
                            <UserCog size={13} />
                          </button>
                          <button
                            onClick={() => setSelectedGuest(g)}
                            className="w-7 h-7 flex items-center justify-center bg-amber-400 hover:bg-amber-300 text-slate-900 rounded"
                            title="Ver perfil"
                          >
                            <Eye size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Detail panel */}
      {selectedGuest && (
        <ClientDetail
          guest={selectedGuest}
          onClose={() => setSelectedGuest(null)}
          onEdit={() => {
            setEditingGuest(selectedGuest)
            setSelectedGuest(null)
          }}
        />
      )}
      {editingGuest && (
        <ClientForm guest={editingGuest} onClose={() => setEditingGuest(null)} />
      )}
      {showNewForm && <ClientForm onClose={() => setShowNewForm(false)} />}
    </div>
  )
}

function SortHeader({
  label,
  sortKey,
  current,
  dir,
  onClick,
}: {
  label: string
  sortKey: SortKey
  current: SortKey
  dir: 'asc' | 'desc'
  onClick: (k: SortKey) => void
}) {
  return (
    <th
      onClick={() => onClick(sortKey)}
      className="px-3 py-2.5 text-left cursor-pointer hover:text-amber-300 select-none"
    >
      <span className="inline-flex items-center gap-1">
        {current === sortKey && <span className="text-amber-400">{dir === 'asc' ? '↑' : '↓'}</span>}
        {label}
      </span>
    </th>
  )
}
