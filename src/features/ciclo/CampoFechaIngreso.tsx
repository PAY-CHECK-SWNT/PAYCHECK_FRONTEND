import { claseInput } from './fechaIngreso'

interface Props {
  fecha: string
  noSe: boolean
  min: string
  max: string
  error?: string
  onFecha: (fecha: string) => void
  onNoSe: (noSe: boolean) => void
}

export default function CampoFechaIngreso({ fecha, noSe, min, max, error, onFecha, onNoSe }: Props) {
  return (
    <>
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
          onChange={(e) => onFecha(e.target.value)}
          aria-invalid={!!error}
          aria-describedby={error ? 'fecha-error' : undefined}
          className={claseInput}
        />
        {error && (
          <p id="fecha-error" role="alert" className="text-sm text-red-700">
            {error}
          </p>
        )}
      </div>

      <div className="space-y-1">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={noSe}
            onChange={(e) => onNoSe(e.target.checked)}
            className="h-5 w-5"
          />
          No sé cuándo llega mi próximo ingreso
        </label>
        {noSe && <p className="text-sm text-slate-500">Usaremos una fecha estimada (30 días).</p>}
      </div>
    </>
  )
}
