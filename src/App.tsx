import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { DashboardPage } from './pages/DashboardPage'
import { ReservationsPage } from './pages/ReservationsPage'
import { FloorPlanPage } from './pages/FloorPlanPage'
import { CalendarPage } from './pages/CalendarPage'
import { GuestsPage } from './pages/GuestsPage'
import { SettingsPage } from './pages/SettingsPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/reservations" element={<ReservationsPage />} />
          <Route path="/floor-plan" element={<FloorPlanPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/guests" element={<GuestsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
