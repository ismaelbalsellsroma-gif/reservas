import { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'

export function Layout() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <div className="flex h-screen bg-[#0f1620]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          onNewReservation={() => navigate('/?newReservation=1')}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <Outlet context={{ searchQuery }} />
        </div>
      </div>
    </div>
  )
}
