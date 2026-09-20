import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";

import { AuthService } from "../services/auth.service";

/** Deja pasar solo a usuarios con sesión iniciada; el resto va al login. */
export const authGuard: CanActivateFn = (_ruta, estado) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.autenticado()) {
    return true;
  }
  // Se recuerda a dónde iba el usuario para devolverlo ahí tras iniciar sesión.
  return router.createUrlTree(["/login"], { queryParams: { redirigir: estado.url } });
};
