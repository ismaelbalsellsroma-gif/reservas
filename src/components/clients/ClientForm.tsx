import { useState } from 'react'
import { X, Star } from 'lucide-react'
import { useStore } from '../../store'
import type { Guest } from '../../types'
import { cn } from '../../lib/utils'

interface ClientFormProps {
  guest?: Guest
  onClose: () => void
}

const languages = [
  { v: 'es', l: 'Español' },
  { v: 'ca', l: 'Catalán' },
  { v: 'en', l: 'Inglés' },
  { v: 'fr', l: 'Francés' },
  { v: 'de', l: 'Alemán' },
]
const countries = [
  { v: '+34', l: '+34 ESPAÑA' },
  { v: '+33', l: '+33 FRANCIA' },
  { v: '+44', l: '+44 REINO UNIDO' },
  { v: '+49', l: '+49 ALEMANIA' },
  { v: '+39', l: '+39 ITALIA' },
]

export function ClientForm({ guest, onClose }: ClientFormProps) {
  const tagsList = useStore((s) => s.tags)
  const addGuest = useStore((s) => s.addGuest)
  const updateGuest = useStore((s) => s.updateGuest)

  const [name, setName] = useState(guest?.name || '')
  const [surname, setSurname] = useState(guest?.surname || '')
  const [phoneCountry, setPhoneCountry] = useState(guest?.phoneCountry || '+34')
  const [phone, setPhone] = useState(guest?.phone || '')
  const [email, setEmail] = useState(guest?.email || '')
  const [language, setLanguage] = useState(guest?.language || 'es')
  const [company, setCompany] = useState(guest?.company || '')
  const [notes, setNotes] = useState(guest?.notes || '')
  const [tags, setTags] = useState<string[]>(guest?.tags || [])
  const [vip, setVip] = useState(guest?.vip || false)
  const [marketingConsent, setMarketingConsent] = useState(guest?.marketingConsent || false)

  const input =
    'w-full px-2.5 py-1.5 bg-[#1a2330] border border-[#2a3441] focus:border-amber-400 rounded text-sm text-white outline-none'
  const label = 'block text-[10px] font-medium text-gray-400 uppercase mb-1'

  const handleSubmit = () => {
    if (!name || !surname) {
      alert('Nombre y apellido son obligatorios')
      return
    }
    const data = {
      name,
      surname,
      phone,
      phoneCountry,
      email,
      language,
      company,
      notes,
      tags,
      vip,
      marketingConsent,
    }
    if (guest) {
      updateGuest(guest.id, data)
    } else {
      addGuest(data)
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-[#0f1620] rounded-xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col border border-[#1f2936]">
        <div className="flex items-center justify-between p-4 border-b border-[#1f2936]">
          <h2 className="text-base font-semibold text-white">
            {guest ? 'Editar cliente' : 'Nuevo cliente'}
          </h2>
          <button onClick={onClose} className="p-1.5 hover:bg-[#1a2330] rounded">
            <X size={18} className="text-gray-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={label}>Nombre *</label>
              <input value={name} onChange={(e) => setName(e.target.value)} className={input} required />
            </div>
            <div>
              <label className={label}>Apellidos *</label>
              <input
                value={surname}
                onChange={(e) => setSurname(e.target.value)}
                className={input}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={label}>Prefijo</label>
              <select
                value={phoneCountry}
                onChange={(e) => setPhoneCountry(e.target.value)}
                className={input}
              >
                {countries.map((c) => (
                  <option key={c.v} value={c.v}>
                    {c.l}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={label}>Teléfono</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={input}
              />
            </div>
            <div>
              <label className={label}>Idioma</label>
              <select value={language} onChange={(e) => setLanguage(e.target.value)} className={input}>
                {languages.map((l) => (
                  <option key={l.v} value={l.v}>
                    {l.l}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={label}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={input}
              />
            </div>
            <div>
              <label className={label}>Empresa</label>
              <input value={company} onChange={(e) => setCompany(e.target.value)} className={input} />
            </div>
          </div>

          <div>
            <label className={label}>Etiquetas</label>
            <div className="flex flex-wrap gap-1.5">
              {tagsList.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() =>
                    setTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
                  }
                  className={cn(
                    'px-2 py-0.5 rounded-full text-[11px] font-medium border',
                    tags.includes(tag)
                      ? 'bg-amber-400 text-slate-900 border-amber-400'
                      : 'bg-[#1a2330] text-gray-400 border-[#2a3441] hover:border-amber-400'
                  )}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={label}>Notas</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={cn(input, 'min-h-[80px]')}
              placeholder="Alergias, preferencias, observaciones..."
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
              <input
                type="checkbox"
                checked={vip}
                onChange={(e) => setVip(e.target.checked)}
                className="rounded"
              />
              <Star size={14} className="text-yellow-400" />
              Cliente VIP
            </label>
            <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer">
              <input
                type="checkbox"
                checked={marketingConsent}
                onChange={(e) => setMarketingConsent(e.target.checked)}
                className="rounded"
              />
              Da consentimiento para recibir información comercial por e-mail y SMS
            </label>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-4 border-t border-[#1f2936] bg-[#0b111a]">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-300 hover:text-white">
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-amber-400 hover:bg-amber-300 text-slate-900 font-semibold text-sm rounded uppercase"
          >
            {guest ? 'Guardar cambios' : 'Crear cliente'}
          </button>
        </div>
      </div>
    </div>
  )
}
