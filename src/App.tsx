import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import CambiarFecha from './features/ciclo/CambiarFecha'
import Configurar from './features/ciclo/Configurar'
import Inicio from './features/ciclo/Inicio'
import Layout from './features/layout/Layout'
import NuevoMovimiento from './features/movimientos/NuevoMovimiento'
import Panel from './features/panel/Panel'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Inicio />} />
          <Route path="/configurar" element={<Configurar />} />
          <Route path="/ciclo/fecha" element={<CambiarFecha />} />
          <Route path="/panel" element={<Panel />} />
          <Route path="/movimientos/nuevo" element={<NuevoMovimiento />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
