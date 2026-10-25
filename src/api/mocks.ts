import { hoyBogota } from '../lib/fechas'
import { ApiError } from './errores'
import type {
  ActualizarCicloBody,
  Ciclo,
  CrearCicloBody,
  CrearMovimientoBody,
  Health,
  Movimiento,
  Resumen,
} from './tipos'

const RETRASO_MS = 300

let ciclo: Ciclo | null = null
let movimientos: Movimiento[] = []
let siguienteIdCiclo = 1
let siguienteIdMovimiento = 1

const espera = () => new Promise<void>((r) => setTimeout(r, RETRASO_MS))

function sumarDias(iso: string, dias: number): string {
  const [a, m, d] = iso.split('-').map(Number)
  return new Date(Date.UTC(a, m - 1, d + dias)).toISOString().slice(0, 10)
}

/** Hora actual en Bogotá con offset fijo -05:00 (Colombia no tiene horario de verano). */
function ahoraBogota(): string {
  const local = new Date(Date.now() - 5 * 60 * 60 * 1000)
  return `${local.toISOString().slice(0, 19)}-05:00`
}

function requerirCiclo(): Ciclo {
  if (!ciclo) throw new ApiError(404, 'NO_ENCONTRADO', 'No hay un ciclo activo.')
  return ciclo
}

function requerirCicloParaMovimientos(): Ciclo {
  if (!ciclo) throw new ApiError(409, 'SIN_CICLO_ACTIVO', 'Primero configura tu ciclo.')
  return ciclo
}

// Ejemplo del contrato (Caso A). Los mocks no calculan cifras.
const RESUMEN_CASO_A: Resumen = {
  hoy: '2026-10-25',
  fechaProximoIngreso: '2026-11-03',
  fechaEstimada: false,
  disponible: 385000,
  comprometido: 50000,
  libre: 335000,
  diasRestantes: 9,
  cupoDiario: 38888,
  cupoHoy: 23888,
  cupoSemana: 257216,
  diasTranscurridos: 6,
  ritmoDiario: 35833,
  saldoProyectado: 12503,
  fechaAgotamiento: null,
  alertas: [],
}

export const mocks = {
  async health(): Promise<Health> {
    await espera()
    return { estado: 'ok' }
  },

  async crearCiclo(body: CrearCicloBody): Promise<Ciclo> {
    await espera()
    if (ciclo) {
      throw new ApiError(409, 'CICLO_ACTIVO_EXISTENTE', 'Ya tienes un ciclo activo.')
    }
    const hoy = hoyBogota()
    ciclo = {
      id: siguienteIdCiclo++,
      saldoInicial: body.saldoInicial,
      fechaInicio: hoy,
      fechaProximoIngreso: body.fechaProximoIngreso ?? sumarDias(hoy, 30),
      fechaEstimada: body.fechaProximoIngreso === null,
      estado: 'ACTIVO',
    }
    return { ...ciclo }
  },

  async obtenerCicloActivo(): Promise<Ciclo> {
    await espera()
    return { ...requerirCiclo() }
  },

  async actualizarCicloActivo(body: ActualizarCicloBody): Promise<Ciclo> {
    await espera()
    ciclo = {
      ...requerirCiclo(),
      fechaProximoIngreso: body.fechaProximoIngreso,
      fechaEstimada: false,
    }
    return { ...ciclo }
  },

  async crearMovimiento(body: CrearMovimientoBody): Promise<Movimiento> {
    await espera()
    requerirCicloParaMovimientos()
    const movimiento: Movimiento = {
      id: siguienteIdMovimiento++,
      tipo: body.tipo,
      monto: body.monto,
      categoria: body.categoria,
      fecha: body.fecha ?? hoyBogota(),
      descripcion: body.descripcion ?? null,
      origen: 'MANUAL',
      creadoEn: ahoraBogota(),
    }
    movimientos = [movimiento, ...movimientos]
    return { ...movimiento }
  },

  async listarMovimientos(): Promise<Movimiento[]> {
    await espera()
    requerirCicloParaMovimientos()
    return [...movimientos].sort(
      (a, b) => b.fecha.localeCompare(a.fecha) || b.creadoEn.localeCompare(a.creadoEn),
    )
  },

  async obtenerResumen(): Promise<Resumen> {
    await espera()
    requerirCiclo()
    return structuredClone(RESUMEN_CASO_A)
  },
}
