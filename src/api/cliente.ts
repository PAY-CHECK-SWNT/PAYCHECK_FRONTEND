import { solicitar } from './http'
import { mocks } from './mocks'
import type {
  ActualizarCicloBody,
  Ciclo,
  CrearCicloBody,
  CrearMovimientoBody,
  Health,
  Movimiento,
  Resumen,
} from './tipos'

export const usaMocks = import.meta.env.VITE_USE_MOCKS === 'true'

export const obtenerHealth = (): Promise<Health> =>
  usaMocks ? mocks.health() : solicitar<Health>('GET', '/health')

export const crearCiclo = (body: CrearCicloBody): Promise<Ciclo> =>
  usaMocks ? mocks.crearCiclo(body) : solicitar<Ciclo>('POST', '/ciclos', body)

export const obtenerCicloActivo = (): Promise<Ciclo> =>
  usaMocks ? mocks.obtenerCicloActivo() : solicitar<Ciclo>('GET', '/ciclos/activo')

export const actualizarCicloActivo = (body: ActualizarCicloBody): Promise<Ciclo> =>
  usaMocks
    ? mocks.actualizarCicloActivo(body)
    : solicitar<Ciclo>('PATCH', '/ciclos/activo', body)

export const crearMovimiento = (body: CrearMovimientoBody): Promise<Movimiento> =>
  usaMocks ? mocks.crearMovimiento(body) : solicitar<Movimiento>('POST', '/movimientos', body)

export const listarMovimientos = (): Promise<Movimiento[]> =>
  usaMocks ? mocks.listarMovimientos() : solicitar<Movimiento[]>('GET', '/movimientos')

export const obtenerResumen = (): Promise<Resumen> =>
  usaMocks ? mocks.obtenerResumen() : solicitar<Resumen>('GET', '/resumen')
