import { ApplicationConfig, provideAppInitializer, provideBrowserGlobalErrorListeners } from "@angular/core";
import { provideHttpClient, withFetch, withInterceptors } from "@angular/common/http";
import { provideRouter, withComponentInputBinding, withInMemoryScrolling } from "@angular/router";
import { providePrimeNG } from "primeng/config";

import { authInterceptor } from "./core/interceptors/auth.interceptor";
import { validarSesionGuardada } from "./core/services/sesion-inicial";
import { routes } from "./app.routes";
import { SalonPreset } from "./core/theme/salon-preset";

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withInMemoryScrolling({ scrollPositionRestoration: "top" })
    ),
    provideHttpClient(withFetch(), withInterceptors([authInterceptor])),
    provideAppInitializer(validarSesionGuardada),
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
