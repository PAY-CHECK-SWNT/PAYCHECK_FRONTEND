# Pay&Check — Frontend

App para universitarios colombianos: registran gastos e ingresos y la app calcula un plan
hasta su próximo ingreso (cuánto tienen libre, cupo de hoy y de la semana, alertas).
Proyecto académico, 3 sprints, entrega el 17 de noviembre de 2026.

Este repositorio es solo el **frontend**. El backend (Spring Boot) vive en el repositorio `PAYCHECK_BACKEND`.

## Principio central
- El LLM solo **interpreta** texto del usuario y **redacta** explicaciones.
- Todas las cifras las calcula `PlanCalculator` en el backend con reglas explícitas (`docs/reglas-plan.md`).
- El frontend **no calcula** cifras del plan: muestra lo que devuelve `GET /api/resumen`.

## Stack
- React + Vite + TypeScript, Tailwind, React Router. Mobile-first (se usa desde el celular).
- Backend (otro repo): Java 17, Spring Boot 3, PostgreSQL 16. Expone la API de `docs/api.md`.

## Comandos
- `npm install` · `npm run dev -- --host` · `npm run build` · `npm run lint`

## Estructura
- `src/features/{ciclo, movimientos, panel}`: una carpeta por funcionalidad (pantallas y componentes propios).
- `src/api/`: cliente HTTP, tipos del contrato y datos simulados.
- `src/lib/`: utilidades (pesos, montos, fechas).
- Si `VITE_USE_MOCKS=true`, el cliente devuelve datos simulados con la forma exacta de `docs/api.md`.
- `VITE_API_URL` apunta al backend (local: `http://localhost:8080`; desde celulares: la IP del computador del backend).

## Convenciones
- Dinero: pesos colombianos enteros. El usuario puede escribir "15.000" o "15000"; se envía como entero.
  Se muestra con `Intl.NumberFormat('es-CO')`, sin decimales.
- Fechas: formato ISO `yyyy-MM-dd`, zona `America/Bogota`. "Hoy" nunca se calcula con `toISOString()` (usa UTC).
  Una fecha `yyyy-MM-dd` se muestra sin convertirla a `Date` en UTC, para que no salga un día antes.
- Todas las llamadas pasan por `src/api/`. Ninguna pantalla usa `fetch` directamente.
- Errores con el formato de `docs/api.md`: se muestra `mensaje` y, si viene `campos`, cada mensaje debajo de su campo.
- Nombres del dominio en español (Ciclo, Movimiento, Compromiso); textos para el usuario en español.
- Mobile-first: se diseña primero para 375 px de ancho.

## Reglas para Claude
- El contrato es `docs/api.md`. No cambies endpoints ni JSON sin preguntarme primero; los cambios se acuerdan con backend.
- `docs/` es una copia exacta de la del backend. No la edites por tu cuenta.
- Las fórmulas están en `docs/reglas-plan.md`; úsalas solo para redactar explicaciones, nunca para calcular en el frontend.
- Dependencias permitidas: react, react-dom, react-router-dom y Tailwind con su plugin de Vite. Cualquier otra, pregúntame.
- Si algo es ambiguo, pregunta; no inventes reglas.
- Al terminar una tarea, corre `npm run build` y `npm run lint` y muestra el resultado.
- Nunca escribas claves ni secretos en el código; usa variables de entorno y `.env` (ignorado por git).
- Mensajes de commit: empiezan con la tarea de Jira, por ejemplo `PC-03: agrega cliente HTTP`.
