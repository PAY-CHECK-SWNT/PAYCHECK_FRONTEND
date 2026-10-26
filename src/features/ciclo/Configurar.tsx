import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { ApiError, MENSAJE_ERROR_DESCONOCIDO, crearCiclo } from '../../api'
import { formatearMilesInput, parsearMonto } from '../../lib/pesos'
import CampoFechaIngreso from './CampoFechaIngreso'
import { claseInput, limitesFechaIngreso, validarFechaIngreso } from './fechaIngreso'

type Errores = { saldoInicial?: string; fechaProximoIngreso?: string }

const CAMPOS_CONOCIDOS = ['saldoInicial', 'fechaProximoIngreso']

export default function Configurar() {
  const navigate = useNavigate()
  const { min, max } = limitesFechaIngreso()

  const [saldoTexto, setSaldoTexto] = useState('')
  const [fecha, setFecha] = useState('')
  const [noSe, setNoSe] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [errorGeneral, setErrorGeneral] = useState<string[]>([])
  const [errores, setErrores] = useState<Errores>({})

  function validar(): { errores: Errores; saldo: number | null } {
    const nuevos: Errores = {}
    const saldo = parsearMonto(saldoTexto)
    if (saldo === null) nuevos.saldoInicial = 'Es obligatorio.'
    const errorFecha = validarFechaIngreso(fecha, noSe, min, max)
    if (errorFecha) nuevos.fechaProximoIngreso = errorFecha
    return { errores: nuevos, saldo }
  }

  async function enviar(e: FormEvent) {
    e.preventDefault()
    setErrorGeneral([])
    const { errores: nuevos, saldo } = validar()
    setErrores(nuevos)
    if (Object.keys(nuevos).length > 0 || saldo === null) return

    setEnviando(true)
    try {
      await crearCiclo({ saldoInicial: saldo, fechaProximoIngreso: noSe ? null : fecha })
      navigate('/panel')
    } catch (err) {
      if (err instanceof ApiError && err.status === 409 && err.codigo === 'CICLO_ACTIVO_EXISTENTE') {
        navigate('/panel')
        return
      }
      if (err instanceof ApiError) {
        const campos = err.campos ?? {}
        setErrores({
          saldoInicial: campos.saldoInicial,
          fechaProximoIngreso: campos.fechaProximoIngreso,
        })
        const otros = Object.entries(campos)
          .filter(([k]) => !CAMPOS_CONOCIDOS.includes(k))
          .map(([, v]) => v)
        setErrorGeneral([err.mensaje, ...otros])
      } else {
        setErrorGeneral([MENSAJE_ERROR_DESCONOCIDO])
      }
      setEnviando(false)
    }
  }

  return (
    <form onSubmit={enviar} noValidate className="space-y-5 pt-2">
      <h1 className="text-xl font-semibold">Configura tu ciclo</h1>

      {errorGeneral.length > 0 && (
        <div role="alert" className="space-y-1 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {errorGeneral.map((m) => (
            <p key={m}>{m}</p>
          ))}
        </div>
      )}

      <div className="space-y-1">
        <label htmlFor="saldo" className="block text-sm font-medium">
          ¿Cuánto dinero tienes hoy?
        </label>
        <div className="flex items-center gap-2">
          <span className="text-slate-500">$</span>
          <input
            id="saldo"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            placeholder="600.000"
            value={saldoTexto}
            onChange={(e) => setSaldoTexto(formatearMilesInput(e.target.value))}
            aria-invalid={!!errores.saldoInicial}
            aria-describedby={errores.saldoInicial ? 'saldo-error' : undefined}
            className={claseInput}
          />
        </div>
        {errores.saldoInicial && (
          <p id="saldo-error" role="alert" className="text-sm text-red-700">
            {errores.saldoInicial}
          </p>
        )}
      </div>

      <CampoFechaIngreso
        fecha={fecha}
        noSe={noSe}
        min={min}
        max={max}
        error={errores.fechaProximoIngreso}
        onFecha={setFecha}
        onNoSe={(v) => {
          setNoSe(v)
          setErrores((prev) => ({ ...prev, fechaProximoIngreso: undefined }))
        }}
      />

      <button
        type="submit"
        disabled={enviando}
        className="w-full rounded-lg bg-slate-900 px-4 py-3 text-base font-medium text-white disabled:opacity-60"
      >
        {enviando ? 'Guardando…' : 'Guardar ciclo'}
      </button>
    </form>
  )
}
