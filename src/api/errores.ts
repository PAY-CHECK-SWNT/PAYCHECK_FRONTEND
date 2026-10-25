import type { CodigoError } from './tipos'

export const MENSAJE_ERROR_DESCONOCIDO = 'Ocurrió un error inesperado. Intenta de nuevo.'

export class ApiError extends Error {
  status: number
  codigo: CodigoError
  mensaje: string
  campos?: Record<string, string>

  constructor(
    status: number,
    codigo: CodigoError,
    mensaje: string,
    campos?: Record<string, string>,
  ) {
    super(mensaje)
    this.name = 'ApiError'
    this.status = status
    this.codigo = codigo
    this.mensaje = mensaje
    this.campos = campos
  }
}
