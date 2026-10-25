import { useEffect, useState } from 'react'
import { obtenerHealth, usaMocks } from '../../api'

type Estado = 'cargando' | 'conectado' | 'sin-conexion'

export default function IndicadorEstado() {
  const [estado, setEstado] = useState<Estado>('cargando')

  useEffect(() => {
    let cancelado = false
    obtenerHealth()
      .then(() => !cancelado && setEstado('conectado'))
      .catch(() => !cancelado && setEstado('sin-conexion'))
    return () => {
      cancelado = true
    }
  }, [])

  if (estado === 'cargando') return null

  const [texto, color] = usaMocks
    ? ['Datos simulados', 'bg-amber-500']
    : estado === 'conectado'
      ? ['Conectado', 'bg-emerald-500']
      : ['Sin conexión', 'bg-red-500']

  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-slate-600">
      <span className={`h-2 w-2 rounded-full ${color}`} aria-hidden="true" />
      {texto}
    </span>
  )
}
