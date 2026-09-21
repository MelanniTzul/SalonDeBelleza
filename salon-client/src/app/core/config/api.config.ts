import { InjectionToken } from "@angular/core";

// Dirección base de la API. Vacía = mismo origen: en desarrollo el servidor de Angular reenvía /api y /uploads
// al backend (proxy.conf.mjs) y en producción lo hace el servidor web. Si el backend está en otro dominio,
// se define aquí (y ese dominio debe estar en CORS_ALLOWED_ORIGINS del backend).
export const API_URL = new InjectionToken<string>("API_URL", { providedIn: "root", factory: () => "" });

// Las rutas de imagen que guarda la base son relativas:
//  - "img/..."     → imágenes incluidas en el frontend
//  - "uploads/..." → imágenes subidas por el administrador, que sirve la API
export function urlImagen(ruta: string | null | undefined, apiUrl: string): string | undefined {
  if (!ruta) return undefined;
  if (/^https?:\/\//.test(ruta)) return ruta;
  return ruta.startsWith("uploads/") ? `${apiUrl}/${ruta}` : ruta;
}
