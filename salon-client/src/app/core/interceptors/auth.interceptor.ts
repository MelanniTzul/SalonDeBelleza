import { HttpErrorResponse, HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { Router } from "@angular/router";
import { catchError, throwError } from "rxjs";

import { environment } from "../../../environments/environment";
import { AuthService } from "../services/auth.service";

// Pega el token en las peticiones a la API y cierra la sesion sola si
// el backend responde 401.
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const token = auth.token();
  const esPeticionALaApi = req.url.startsWith(environment.apiUrl);
  const esLoginORegistro = req.url.includes("/auth/login") || req.url.includes("/auth/register");

  const peticion =
    token && esPeticionALaApi && !esLoginORegistro
      ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : req;

  return next(peticion).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !esLoginORegistro) {
        auth.logout();
        router.navigate(["/login"], { queryParams: { sesionExpirada: true } });
      }
      return throwError(() => error);
    })
  );
};
