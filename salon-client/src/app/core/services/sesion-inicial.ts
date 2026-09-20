import { inject } from "@angular/core";
import { EMPTY, catchError } from "rxjs";

import { AuthService } from "./auth.service";

/**
 * Al arrancar la aplicación, si hay un token guardado se revalida contra la API.
 * Así una sesión vencida o revocada se limpia antes de pintar la primera pantalla
 * (el interceptor recibe el 401 y llama a logout).
 */
export const validarSesionGuardada = () => {
  const auth = inject(AuthService);

  if (!auth.token()) {
    return;
  }
  // Se ignora el error: el interceptor ya cerró la sesión si el token no sirve.
  return auth.refrescarPerfil().pipe(catchError(() => EMPTY));
};
