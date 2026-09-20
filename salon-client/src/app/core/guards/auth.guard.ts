import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";

import { AuthService } from "../services/auth.service";

// Solo pasa quien tenga sesion, el resto al login.
export const authGuard: CanActivateFn = (_ruta, estado) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.autenticado()) {
    return true;
  }
  // Guarda a donde iba para devolverlo ahi despues del login.
  return router.createUrlTree(["/login"], { queryParams: { redirigir: estado.url } });
};
