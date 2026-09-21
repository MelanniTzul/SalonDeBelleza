import { ViewportScroller } from "@angular/common";
import { provideHttpClient, withFetch } from "@angular/common/http";
import { ApplicationConfig, inject, provideAppInitializer, provideBrowserGlobalErrorListeners } from "@angular/core";
import { provideRouter, withComponentInputBinding, withInMemoryScrolling } from "@angular/router";
import { providePrimeNG } from "primeng/config";

import { routes } from "./app.routes";
import { SalonPreset } from "./core/theme/salon-preset";
import { CatalogoService } from "./features/catalogo/services/catalogo.service";

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withFetch()),
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
