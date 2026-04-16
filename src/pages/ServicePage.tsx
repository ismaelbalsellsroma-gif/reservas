import { ServiceBar } from '../components/layout/ServiceBar'

export function ServicePage() {
  return (
    <div className="flex flex-col h-full">
      <ServiceBar />
      <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">
        Plano y lista de reservas (Bloque C — en construcción)
      </div>
    </div>
  )
}
