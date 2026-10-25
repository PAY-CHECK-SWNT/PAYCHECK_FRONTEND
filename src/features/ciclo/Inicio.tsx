import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { ApiError, obtenerCicloActivo } from '../../api'

type Estado =
  | { tipo: 'cargando' }
  | { tipo: 'destino'; ruta: string }
  | { tipo: 'error'; mensaje: string }

export default function Inicio() {
  const [estado, setEstado] = useState<Estado>({ tipo: 'cargando' })
  const [intento, setIntento] = useState(0)

  useEffect(() => {
    let cancelado = false
    obtenerCicloActivo()
      .then(() => !cancelado && setEstado({ tipo: 'destino', ruta: '/panel' }))
      .catch((e: unknown) => {
        if (cancelado) return
        if (e instanceof ApiError && e.status === 404 && e.codigo === 'NO_ENCONTRADO') {
          setEstado({ tipo: 'destino', ruta: '/configurar' })
        } else {
          setEstado({
            tipo: 'error',
            mensaje:
              e instanceof ApiError ? e.mensaje : 'Ocurrió un error inesperado. Intenta de nuevo.',
          })
        }
      })
    return () => {
      cancelado = true
    }
  }, [intento])

  if (estado.tipo === 'destino') return <Navigate to={estado.ruta} replace />

  if (estado.tipo === 'error') {
    return (
      <div className="space-y-3 pt-8 text-center">
        <p className="text-red-700">{estado.mensaje}</p>
        <button
          type="button"
          className="rounded-lg bg-slate-900 px-4 py-2 text-white"
          onClick={() => {
            setEstado({ tipo: 'cargando' })
            setIntento((n) => n + 1)
          }}
        >
          Reintentar
        </button>
      </div>
    )
  }

  return <p className="pt-8 text-center text-slate-500">Cargando…</p>
}
