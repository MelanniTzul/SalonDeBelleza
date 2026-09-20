import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";

import { RUTA_INICIO_POR_ROL } from "../models/auth.models";
import { AuthService } from "../services/auth.service";

/** Evita que alguien con sesión activa vuelva a ver el login o el registro. */
export const invitadoGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const rol = auth.rol();
  if (auth.autenticado() && rol) {
    return router.createUrlTree([RUTA_INICIO_POR_ROL[rol]]);
  }
  return true;
};
