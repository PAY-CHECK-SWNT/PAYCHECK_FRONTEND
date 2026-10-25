import { ApiError, MENSAJE_ERROR_DESCONOCIDO } from './errores'
import type { ErrorApi } from './tipos'

const API_URL = import.meta.env.VITE_API_URL ?? ''

/** Único lugar donde se arman los headers. Sprint 2: agregar aquí Authorization: Bearer <jwt>. */
function construirHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
  }
}

async function errorDesdeRespuesta(res: Response): Promise<ApiError> {
  try {
    const cuerpo = (await res.json()) as Partial<ErrorApi> | null
    if (cuerpo && typeof cuerpo.codigo === 'string' && typeof cuerpo.mensaje === 'string') {
      return new ApiError(res.status, cuerpo.codigo, cuerpo.mensaje, cuerpo.campos)
    }
  } catch {
    // Cuerpo que no es JSON (500 en HTML, proxy caído): se cae al error genérico.
  }
  return new ApiError(res.status, 'ERROR_DESCONOCIDO', MENSAJE_ERROR_DESCONOCIDO)
}

export async function solicitar<T>(
  metodo: 'GET' | 'POST' | 'PATCH',
  ruta: string,
  body?: unknown,
): Promise<T> {
  let res: Response
  try {
    res = await fetch(`${API_URL}/api${ruta}`, {
      method: metodo,
      headers: construirHeaders(),
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new ApiError(0, 'SIN_CONEXION', 'No se pudo conectar con el servidor.')
  }
  if (!res.ok) throw await errorDesdeRespuesta(res)
  return (await res.json()) as T
}
