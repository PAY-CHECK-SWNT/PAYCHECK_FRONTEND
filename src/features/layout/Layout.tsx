import { Outlet } from 'react-router-dom'
import IndicadorEstado from './IndicadorEstado'

export default function Layout() {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-4">
      <header className="flex items-center justify-between py-3">
        <span className="font-semibold">Pay&amp;Check</span>
        <IndicadorEstado />
      </header>
      <main className="flex-1 pb-6">
        <Outlet />
      </main>
    </div>
  )
}
