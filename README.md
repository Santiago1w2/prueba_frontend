# TropelCare Control Room

Frontend para la hackathon **Pizza Protocol**. Consola operativa para monitorear y atender Tropeles y Señales del sistema Tuckersoft.

## Integrantes

| Nombre | Código |
|--------|--------|
| (Integrante A) | — |
| (Integrante B) | — |
| (Integrante C) | — |

## Stack

- React 18 + TypeScript estricto
- Vite 5
- React Router 6
- Tailwind CSS 3
- Fetch API (sin librerías de data-fetching)

## Instalación

```bash
npm install
```

## Variables de entorno

Crea un `.env` basado en `.env.example`:

```env
VITE_API_BASE_URL=https://<backend-url>/api/v1
VITE_TEAM_CODE=TEAM-001
VITE_EMAIL=operator@tuckersoft.com
```

## Comandos

```bash
npm run dev        # Dev server en http://localhost:5173
npm run build      # Build de producción
npm run typecheck  # Verificación de tipos sin emitir
npm run preview    # Preview del build
```

## Deploy

El deploy debe configurarse con `_redirects` (Netlify) o `vercel.json` para que cualquier ruta sirva `index.html`:

**Netlify** (`public/_redirects`):
```
/* /index.html 200
```

**Vercel** (`vercel.json`):
```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```

## Decisiones técnicas

### Anti-race condition en Tropeles
Se usa un contador de versión (`reqVersion`) por ref para descartar respuestas de requests obsoletas cuando el usuario cambia filtros rápidamente.

### Infinite scroll sin librerías
`IntersectionObserver` con un sentinel al final de la lista. Un ref booleano (`inFlightRef`) garantiza que sólo una request adicional esté en vuelo. En reseteos (cambio de filtros), se cancela la request anterior con `AbortController`.

### Deduplicación de señales
Se mantiene un `Set<string>` de IDs vistos. Cada página nueva filtra los IDs ya presentes antes de agregarlos al estado.

### Preservar posición en el feed
Al navegar a un detalle de señal, se guarda `window.scrollY` en el `state` de React Router. Al volver, se restaura con `window.scrollTo`.

### Scrollytelling (Checkpoint 5)
- `IntersectionObserver` con `rootMargin: '-30% 0px -40% 0px'` activa la etapa visible.
- `CSS Scroll-driven Animations` via `animation-timeline: view()` si el navegador lo soporta (progresive enhancement).
- `View Transition API` declarada en CSS global como progressive enhancement.
- `prefers-reduced-motion`: deshabilita todas las animaciones y transiciones.
- Navegación por teclado: ↑↓ ←→ hacen scroll a la etapa anterior/siguiente.
- El panel visual sticky (desktop) y compacto (mobile) muestran la etapa activa en todo momento.

### URL state
`useUrlState` sincroniza filtros y paginación con `useSearchParams` de React Router. Compartir o recargar la URL restaura el mismo estado exacto.

## Link del deploy

_Pendiente de completar_
