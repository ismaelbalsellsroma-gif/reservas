import { HashRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { ServicePage } from './pages/ServicePage'
import { ClientsPage } from './pages/ClientsPage'
import { SettingsPage } from './pages/SettingsPage'
import { FloorEditorPage } from './pages/FloorEditorPage'
import { ShiftsPage } from './pages/ShiftsPage'

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<ServicePage />} />
          <Route path="/clients" element={<ClientsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/floor-editor" element={<FloorEditorPage />} />
          <Route path="/shifts" element={<ShiftsPage />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}
