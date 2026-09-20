import { ApplicationConfig, provideBrowserGlobalErrorListeners } from "@angular/core";
import { provideRouter } from "@angular/router";
import { providePrimeNG } from "primeng/config";

import { routes } from "./app.routes";
import { SalonPreset } from "./core/theme/salon-preset";

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
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
