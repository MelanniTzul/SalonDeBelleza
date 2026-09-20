import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";

import { RUTA_INICIO_POR_ROL, Rol } from "../models/auth.models";
import { AuthService } from "../services/auth.service";

/**
 * Restringe una ruta a ciertos roles. Si el usuario está autenticado pero con
 * otro rol se le manda a su propio panel en lugar de mostrarle un error.
 */
export const rolGuard = (...rolesPermitidos: readonly Rol[]): CanActivateFn => {
  return (_ruta, estado) => {
    const auth = inject(AuthService);
    const router = inject(Router);

    if (!auth.autenticado()) {
      return router.createUrlTree(["/login"], { queryParams: { redirigir: estado.url } });
    }
    if (auth.tieneRol(...rolesPermitidos)) {
      return true;
    }
    const rol = auth.rol();
    return router.createUrlTree([rol ? RUTA_INICIO_POR_ROL[rol] : "/"]);
  };
};
