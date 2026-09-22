import { inject } from "@angular/core";
import { EMPTY, catchError } from "rxjs";

import { AuthService } from "./auth.service";

// Al arrancar, si hay token guardado se revalida contra la API. Asi una sesion
// vencida se limpia antes de pintar nada: el interceptor ve el 401 y hace logout.
export const validarSesionGuardada = () => {
  const auth = inject(AuthService);

  if (!auth.token()) {
    return;
  }
  // Se ignora el error, el interceptor ya cerro la sesion si el token no servia.
  return auth.refrescarPerfil().pipe(catchError(() => EMPTY));
};
