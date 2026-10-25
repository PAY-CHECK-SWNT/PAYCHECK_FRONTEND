import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ApiError,
  MENSAJE_ERROR_DESCONOCIDO,
  crearMovimiento,
  type Categoria,
  type TipoMovimiento,
} from '../../api'
import { CATEGORIAS_GASTO, CATEGORIAS_INGRESO, etiqueta } from '../../lib/categorias'
import { hoyBogota } from '../../lib/fechas'
import { formatearMilesInput, parsearMonto } from '../../lib/pesos'

type Campo = 'monto' | 'categoria' | 'fecha' | 'descripcion'
type Errores = Partial<Record<Campo, string>>

const CAMPOS_CONOCIDOS: string[] = ['monto', 'categoria', 'fecha', 'descripcion']
const MAX_DESCRIPCION = 140

const claseInput =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-base disabled:bg-slate-100 disabled:text-slate-400'

export default function NuevoMovimiento() {
  const navigate = useNavigate()
  const hoy = hoyBogota()

  const [tipo, setTipo] = useState<TipoMovimiento>('GASTO')
  const [categoria, setCategoria] = useState<Categoria | null>(null)
  const [montoTexto, setMontoTexto] = useState('')
  const [fecha, setFecha] = useState(hoy)
  const [descripcion, setDescripcion] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [errorGeneral, setErrorGeneral] = useState<string[]>([])
  const [errores, setErrores] = useState<Errores>({})

  const categorias: Categoria[] = tipo === 'GASTO' ? CATEGORIAS_GASTO : CATEGORIAS_INGRESO

  function cambiarTipo(nuevo: TipoMovimiento) {
    if (nuevo === tipo) return
    setTipo(nuevo)
    setCategoria(null)
    setErrores((prev) => ({ ...prev, categoria: undefined }))
  }

  function validar(): { errores: Errores; monto: number | null } {
    const nuevos: Errores = {}
    const monto = parsearMonto(montoTexto)
    if (monto === null || monto <= 0) nuevos.monto = 'Ingresa un monto mayor que 0.'
    if (!categoria) nuevos.categoria = 'Elige una categoría.'
    if (!fecha) nuevos.fecha = 'Elige una fecha.'
    else if (fecha > hoy) nuevos.fecha = 'La fecha no puede ser futura.'
    return { errores: nuevos, monto }
  }

  async function enviar(e: FormEvent) {
    e.preventDefault()
    if (enviando) return
    setErrorGeneral([])
    const { errores: nuevos, monto } = validar()
    setErrores(nuevos)
    if (Object.keys(nuevos).length > 0 || monto === null || !categoria) return

    setEnviando(true)
    try {
      const texto = descripcion.trim()
      await crearMovimiento({
        tipo,
        monto,
        categoria,
        fecha,
        ...(texto ? { descripcion: texto } : {}),
      })
      navigate('/panel')
    } catch (err) {
      if (err instanceof ApiError && err.status === 409 && err.codigo === 'SIN_CICLO_ACTIVO') {
        navigate('/configurar')
        return
      }
      if (err instanceof ApiError) {
        const campos = err.campos ?? {}
        setErrores({
          monto: campos.monto,
          categoria: campos.categoria,
          fecha: campos.fecha,
          descripcion: campos.descripcion,
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
      <Link to="/panel" className="inline-block text-sm text-slate-600 underline">
        ← Volver al panel
      </Link>

      <h1 className="text-xl font-semibold">Nuevo movimiento</h1>

      {errorGeneral.length > 0 && (
        <div role="alert" className="space-y-1 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {errorGeneral.map((m) => (
            <p key={m}>{m}</p>
          ))}
        </div>
      )}

      <div role="group" aria-label="Tipo de movimiento" className="grid grid-cols-2 gap-2">
        {(['GASTO', 'INGRESO'] as const).map((t) => (
          <button
            key={t}
            type="button"
            aria-pressed={tipo === t}
            onClick={() => cambiarTipo(t)}
            className={`rounded-lg border px-4 py-2 text-base font-medium ${
              tipo === t
                ? 'border-slate-900 bg-slate-900 text-white'
                : 'border-slate-300 bg-white text-slate-700'
            }`}
          >
            {t === 'GASTO' ? 'Gasto' : 'Ingreso'}
          </button>
        ))}
      </div>

      <div className="space-y-1">
        <label htmlFor="monto" className="block text-sm font-medium">
          Monto
        </label>
        <div className="flex items-center gap-2">
          <span className="text-slate-500">$</span>
          <input
            id="monto"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            placeholder="15.000"
            value={montoTexto}
            onChange={(e) => setMontoTexto(formatearMilesInput(e.target.value))}
            aria-invalid={!!errores.monto}
            aria-describedby={errores.monto ? 'monto-error' : undefined}
            className={claseInput}
          />
        </div>
        {errores.monto && (
          <p id="monto-error" role="alert" className="text-sm text-red-700">
            {errores.monto}
          </p>
        )}
      </div>

      <div className="space-y-1">
        <span id="categoria-label" className="block text-sm font-medium">
          Categoría
        </span>
        <div
          role="group"
          aria-labelledby="categoria-label"
          aria-describedby={errores.categoria ? 'categoria-error' : undefined}
          className="flex flex-wrap gap-2"
        >
          {categorias.map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={categoria === c}
              onClick={() => {
                setCategoria(c)
                setErrores((prev) => ({ ...prev, categoria: undefined }))
              }}
              className={`rounded-full border px-4 py-2 text-sm ${
                categoria === c
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-slate-300 bg-white text-slate-700'
              }`}
            >
              {etiqueta(c)}
            </button>
          ))}
        </div>
        {errores.categoria && (
          <p id="categoria-error" role="alert" className="text-sm text-red-700">
            {errores.categoria}
          </p>
        )}
      </div>

      <div className="space-y-1">
        <label htmlFor="fecha" className="block text-sm font-medium">
          Fecha
        </label>
        <input
          id="fecha"
          type="date"
          max={hoy}
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          aria-invalid={!!errores.fecha}
          aria-describedby={errores.fecha ? 'fecha-error' : undefined}
          className={claseInput}
        />
        {errores.fecha && (
          <p id="fecha-error" role="alert" className="text-sm text-red-700">
            {errores.fecha}
          </p>
        )}
      </div>

      <div className="space-y-1">
        <label htmlFor="descripcion" className="block text-sm font-medium">
          Descripción (opcional)
        </label>
        <input
          id="descripcion"
          type="text"
          maxLength={MAX_DESCRIPCION}
          autoComplete="off"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          aria-invalid={!!errores.descripcion}
          aria-describedby={errores.descripcion ? 'descripcion-error' : undefined}
          className={claseInput}
        />
        <p className="text-right text-xs text-slate-500">
          {descripcion.length}/{MAX_DESCRIPCION}
        </p>
        {errores.descripcion && (
          <p id="descripcion-error" role="alert" className="text-sm text-red-700">
            {errores.descripcion}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={enviando}
        className="w-full rounded-lg bg-slate-900 px-4 py-3 text-base font-medium text-white disabled:opacity-60"
      >
        {enviando ? 'Guardando…' : 'Guardar movimiento'}
      </button>
    </form>
  )
}
