import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ApiError,
  MENSAJE_ERROR_DESCONOCIDO,
  actualizarCicloActivo,
  obtenerCicloActivo,
} from '../../api'
import type { Ciclo } from '../../api'
import { formatearFecha } from '../../lib/fechas'
import CampoFechaIngreso from './CampoFechaIngreso'
import { limitesFechaIngreso, validarFechaIngreso } from './fechaIngreso'

const sinCiclo = (e: unknown) =>
  e instanceof ApiError && e.status === 404 && e.codigo === 'NO_ENCONTRADO'

export default function CambiarFecha() {
  const navigate = useNavigate()
  const { min, max } = limitesFechaIngreso()

  const [ciclo, setCiclo] = useState<Ciclo | null>(null)
  const [cargando, setCargando] = useState(true)
  const [errorCarga, setErrorCarga] = useState<string | null>(null)
  const [intento, setIntento] = useState(0)

  const [fecha, setFecha] = useState('')
  const [noSe, setNoSe] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [errorGeneral, setErrorGeneral] = useState<string[]>([])
  const [errorFecha, setErrorFecha] = useState<string | undefined>()

  useEffect(() => {
    let cancelado = false
    obtenerCicloActivo()
      .then((c) => {
        if (cancelado) return
        setCiclo(c)
        setCargando(false)
      })
      .catch((e: unknown) => {
        if (cancelado) return
        if (sinCiclo(e)) {
          navigate('/configurar', { replace: true })
          return
        }
        setErrorCarga(e instanceof ApiError ? e.mensaje : MENSAJE_ERROR_DESCONOCIDO)
        setCargando(false)
      })
    return () => {
      cancelado = true
    }
  }, [intento, navigate])

  async function enviar(e: FormEvent) {
    e.preventDefault()
    setErrorGeneral([])
    const error = validarFechaIngreso(fecha, noSe, min, max)
    setErrorFecha(error)
    if (error) return

    setEnviando(true)
    try {
      await actualizarCicloActivo({ fechaProximoIngreso: noSe ? null : fecha })
      navigate('/panel')
    } catch (err) {
      if (sinCiclo(err)) {
        navigate('/configurar', { replace: true })
        return
      }
      if (err instanceof ApiError) {
        const campos = err.campos ?? {}
        setErrorFecha(campos.fechaProximoIngreso)
        const otros = Object.entries(campos)
          .filter(([k]) => k !== 'fechaProximoIngreso')
          .map(([, v]) => v)
        setErrorGeneral([err.mensaje, ...otros])
      } else {
        setErrorGeneral([MENSAJE_ERROR_DESCONOCIDO])
      }
      setEnviando(false)
    }
  }

  if (cargando) return <p className="pt-8 text-center text-slate-500">Cargando…</p>

  if (errorCarga) {
    return (
      <div className="space-y-3 pt-8 text-center">
        <p className="text-red-700">{errorCarga}</p>
        <button
          type="button"
          className="rounded-lg bg-slate-900 px-4 py-2 text-white"
          onClick={() => {
            setErrorCarga(null)
            setCargando(true)
            setIntento((n) => n + 1)
          }}
        >
          Reintentar
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={enviar} noValidate className="space-y-5 pt-2">
      <h1 className="text-xl font-semibold">Cambiar fecha del próximo ingreso</h1>

      {ciclo && (
        <p className="text-sm text-slate-600">
          Fecha actual: {formatearFecha(ciclo.fechaProximoIngreso)}
          {ciclo.fechaEstimada ? ' (fecha estimada)' : ''}
        </p>
      )}

      {errorGeneral.length > 0 && (
        <div role="alert" className="space-y-1 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {errorGeneral.map((m) => (
            <p key={m}>{m}</p>
          ))}
        </div>
      )}

      <CampoFechaIngreso
        fecha={fecha}
        noSe={noSe}
        min={min}
        max={max}
        error={errorFecha}
        onFecha={setFecha}
        onNoSe={(v) => {
          setNoSe(v)
          setErrorFecha(undefined)
        }}
      />

      <button
        type="submit"
        disabled={enviando}
        className="w-full rounded-lg bg-slate-900 px-4 py-3 text-base font-medium text-white disabled:opacity-60"
      >
        {enviando ? 'Guardando…' : 'Guardar fecha'}
      </button>
      <Link to="/panel" className="block text-center text-sm text-slate-600 underline">
        Cancelar
      </Link>
    </form>
  )
}
