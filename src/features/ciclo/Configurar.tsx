import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { ApiError, MENSAJE_ERROR_DESCONOCIDO, crearCiclo } from '../../api'
import { hoyBogota, sumarDias } from '../../lib/fechas'
import { formatearMilesInput, parsearMonto } from '../../lib/pesos'

type Errores = { saldoInicial?: string; fechaProximoIngreso?: string }

const CAMPOS_CONOCIDOS = ['saldoInicial', 'fechaProximoIngreso']

const claseInput =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-base disabled:bg-slate-100 disabled:text-slate-400'

export default function Configurar() {
  const navigate = useNavigate()
  const hoy = hoyBogota()
  const min = sumarDias(hoy, 1)
  const max = sumarDias(hoy, 62)

  const [saldoTexto, setSaldoTexto] = useState('')
  const [fecha, setFecha] = useState('')
  const [noSe, setNoSe] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [errorGeneral, setErrorGeneral] = useState<string[]>([])
  const [errores, setErrores] = useState<Errores>({})

  function validar(): { errores: Errores; saldo: number | null } {
    const nuevos: Errores = {}
    const saldo = parsearMonto(saldoTexto)
    if (saldo === null) nuevos.saldoInicial = 'Ingresa un monto válido (0 o más).'
    if (!noSe) {
      if (!fecha) nuevos.fechaProximoIngreso = 'Elige la fecha de tu próximo ingreso.'
      else if (fecha < min || fecha > max) {
        nuevos.fechaProximoIngreso = 'La fecha debe ser desde mañana hasta dentro de 62 días.'
      }
    }
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

      <div className="space-y-1">
        <label htmlFor="fecha" className="block text-sm font-medium">
          ¿Cuándo llega tu próximo ingreso?
        </label>
        <input
          id="fecha"
          type="date"
          min={min}
          max={max}
          value={noSe ? '' : fecha}
          disabled={noSe}
          onChange={(e) => setFecha(e.target.value)}
          aria-invalid={!!errores.fechaProximoIngreso}
          aria-describedby={errores.fechaProximoIngreso ? 'fecha-error' : undefined}
          className={claseInput}
        />
        {errores.fechaProximoIngreso && (
          <p id="fecha-error" role="alert" className="text-sm text-red-700">
            {errores.fechaProximoIngreso}
          </p>
        )}
      </div>

      <div className="space-y-1">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={noSe}
            onChange={(e) => {
              setNoSe(e.target.checked)
              setErrores((prev) => ({ ...prev, fechaProximoIngreso: undefined }))
            }}
            className="h-5 w-5"
          />
          No sé cuándo llega mi próximo ingreso
        </label>
        {noSe && (
          <p className="text-sm text-slate-500">Usaremos una fecha estimada (30 días).</p>
        )}
      </div>

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
