import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { ApiError, listarMovimientos, obtenerResumen } from '../../api'
import type { Movimiento, Resumen } from '../../api'
import { etiqueta } from '../../lib/categorias'
import { formatearFecha } from '../../lib/fechas'
import { formatearPesos } from '../../lib/pesos'

type Estado =
  | { tipo: 'cargando' }
  | { tipo: 'configurar' }
  | { tipo: 'error'; mensaje: string }
  | { tipo: 'listo'; resumen: Resumen; movimientos: Movimiento[] }

const sinCiclo = (e: unknown) =>
  e instanceof ApiError &&
  ((e.status === 404 && e.codigo === 'NO_ENCONTRADO') ||
    (e.status === 409 && e.codigo === 'SIN_CICLO_ACTIVO'))

function Cifra({
  titulo,
  valor,
  explicacion,
  rojo = false,
}: {
  titulo: string
  valor: string
  explicacion: string
  rojo?: boolean
}) {
  return (
    <div className="rounded-lg bg-white p-3 shadow-sm">
      <p className="text-sm text-slate-500">{titulo}</p>
      <p className={`text-xl font-semibold ${rojo ? 'text-red-700' : 'text-slate-900'}`}>{valor}</p>
      <p className="text-xs text-slate-500">{explicacion}</p>
    </div>
  )
}

export default function Panel() {
  const [estado, setEstado] = useState<Estado>({ tipo: 'cargando' })
  const [intento, setIntento] = useState(0)

  useEffect(() => {
    let cancelado = false
    Promise.all([obtenerResumen(), listarMovimientos()])
      .then(([resumen, movimientos]) => {
        if (!cancelado) setEstado({ tipo: 'listo', resumen, movimientos })
      })
      .catch((e: unknown) => {
        if (cancelado) return
        if (sinCiclo(e)) setEstado({ tipo: 'configurar' })
        else
          setEstado({
            tipo: 'error',
            mensaje:
              e instanceof ApiError ? e.mensaje : 'Ocurrió un error inesperado. Intenta de nuevo.',
          })
      })
    return () => {
      cancelado = true
    }
  }, [intento])

  if (estado.tipo === 'configurar') return <Navigate to="/configurar" replace />

  if (estado.tipo === 'cargando') {
    return <p className="pt-8 text-center text-slate-500">Cargando…</p>
  }

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

  const { resumen: r, movimientos } = estado

  return (
    <div className="space-y-4">
      <section className="rounded-lg bg-white p-4 text-center shadow-sm">
        <p className="text-sm text-slate-500">Libre</p>
        <p className={`text-4xl font-bold ${r.libre < 0 ? 'text-red-700' : 'text-slate-900'}`}>
          {formatearPesos(r.libre)}
        </p>
        <p className="text-xs text-slate-500">Lo que puedes gastar sin tocar tus gastos fijos</p>
      </section>

      <div className="grid grid-cols-2 gap-3">
        <Cifra
          titulo="Cupo de hoy"
          valor={formatearPesos(r.cupoHoy)}
          explicacion="Lo que te queda por gastar hoy"
          rojo={r.cupoHoy < 0}
        />
        <Cifra
          titulo="Próximos 7 días"
          valor={formatearPesos(r.cupoSemana)}
          explicacion="Lo que puedes gastar en la semana, contando hoy"
          rojo={r.cupoSemana < 0}
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Cifra
          titulo="Disponible"
          valor={formatearPesos(r.disponible)}
          explicacion="Lo que tienes hoy en total"
        />
        <Cifra
          titulo="Comprometido"
          valor={formatearPesos(r.comprometido)}
          explicacion="Lo que ya tiene destino"
        />
        <Cifra
          titulo="Días restantes"
          valor={String(r.diasRestantes)}
          explicacion={`Hasta tu próximo ingreso, el ${formatearFecha(r.fechaProximoIngreso)}${
            r.fechaEstimada ? ' (fecha estimada)' : ''
          }`}
        />
      </div>

      {r.alertas.length > 0 && (
        <ul className="space-y-2">
          {r.alertas.map((a) => (
            <li
              key={a.codigo}
              className={`rounded-lg p-3 text-sm ${
                a.codigo === 'DATOS_INSUFICIENTES'
                  ? 'bg-sky-50 text-sky-800'
                  : 'bg-amber-50 text-amber-900'
              }`}
            >
              {a.mensaje}
            </li>
          ))}
        </ul>
      )}

      {(r.fechaAgotamiento !== null || r.ritmoDiario !== null || r.saldoProyectado !== null) && (
        <section className="space-y-1 rounded-lg bg-white p-3 text-sm shadow-sm">
          {r.fechaAgotamiento !== null && (
            <p className="font-medium text-red-700">
              A este ritmo el dinero se acaba el {formatearFecha(r.fechaAgotamiento)}
            </p>
          )}
          {r.ritmoDiario !== null && (
            <p className="text-slate-700">
              Gastas en promedio {formatearPesos(r.ritmoDiario)} al día
            </p>
          )}
          {r.saldoProyectado !== null && (
            <p className={r.saldoProyectado < 0 ? 'text-red-700' : 'text-slate-700'}>
              Al llegar tu próximo ingreso tendrías {formatearPesos(r.saldoProyectado)}
            </p>
          )}
        </section>
      )}

      <Link
        to="/movimientos/nuevo"
        className="block rounded-lg bg-slate-900 px-4 py-3 text-center font-medium text-white"
      >
        Registrar gasto o ingreso
      </Link>

      <section>
        <h2 className="mb-2 font-semibold">Movimientos del ciclo</h2>
        {movimientos.length === 0 ? (
          <p className="rounded-lg bg-white p-4 text-center text-sm text-slate-500 shadow-sm">
            Aún no has registrado nada. Registra tu primer gasto o ingreso.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100 rounded-lg bg-white shadow-sm">
            {movimientos.map((m) => (
              <li key={m.id} className="flex items-center justify-between gap-3 p-3">
                <div className="min-w-0">
                  <p className="truncate">{m.descripcion || etiqueta(m.categoria)}</p>
                  <p className="text-xs text-slate-500">{formatearFecha(m.fecha)}</p>
                </div>
                <p
                  className={`shrink-0 font-medium ${
                    m.tipo === 'GASTO' ? 'text-slate-900' : 'text-green-700'
                  }`}
                >
                  {m.tipo === 'GASTO' ? '−' : '+'}
                  {formatearPesos(m.monto)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
