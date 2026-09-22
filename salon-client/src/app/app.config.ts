import { ViewportScroller } from "@angular/common";
import { provideHttpClient, withFetch, withInterceptors } from "@angular/common/http";
import { ApplicationConfig, inject, provideAppInitializer, provideBrowserGlobalErrorListeners } from "@angular/core";
import { provideRouter, withComponentInputBinding, withInMemoryScrolling } from "@angular/router";
import { providePrimeNG } from "primeng/config";

import { authInterceptor } from "./core/interceptors/auth.interceptor";
import { validarSesionGuardada } from "./core/services/sesion-inicial";
import { routes } from "./app.routes";
import { SalonPreset } from "./core/theme/salon-preset";
import { CatalogoService } from "./features/catalogo/services/catalogo.service";

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withFetch(), withInterceptors([authInterceptor])),
    // Si hay un token guardado, se revalida antes de pintar (una sesión vencida se limpia sola)
    provideAppInitializer(validarSesionGuardada),
    // El catálogo empieza a cargarse al abrir el sitio, sin bloquear la primera pantalla
    provideAppInitializer(() => inject(CatalogoService).cargar()),
    // Deja espacio para el encabezado fijo al saltar a un ancla (#seccion)
    provideAppInitializer(() => inject(ViewportScroller).setOffset([0, 96])),
    provideRouter(routes, withComponentInputBinding(), withInMemoryScrolling({ scrollPositionRestoration: "top", anchorScrolling: "enabled" })),
    providePrimeNG({
      theme: {
        preset: SalonPreset,
        options: {
          darkModeSelector: ".app-dark",
          cssLayer: {
            name: "primeng",
            order: "theme, base, primeng"
          }
        }
      }
    })
  ]
};
