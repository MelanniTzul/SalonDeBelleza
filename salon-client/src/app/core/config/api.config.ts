import { InjectionToken } from "@angular/core";

import { environment } from "../../../environments/environment";

// Dirección de la API sin el "/api" final (ej. "http://localhost:8080"). Sale de environment.apiUrl,
// la misma configuración que usa el login: al desplegar solo se cambia ese valor.
// El backend debe tener el dominio del frontend en CORS_ALLOWED_ORIGINS.
export const API_URL = new InjectionToken<string>("API_URL", {
  providedIn: "root",
  factory: () => environment.apiUrl.replace(/\/api\/?$/, "")
});

// Las rutas de imagen que guarda la base son relativas:
//  - "img/..."     → imágenes incluidas en el frontend
//  - "uploads/..." → imágenes subidas por el administrador, que sirve la API
export function urlImagen(ruta: string | null | undefined, apiUrl: string): string | undefined {
  if (!ruta) return undefined;
  if (/^https?:\/\//.test(ruta)) return ruta;
  return ruta.startsWith("uploads/") ? `${apiUrl}/${ruta}` : ruta;
}
