import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable, catchError, tap, throwError } from "rxjs";

import { environment } from "../../../../environments/environment";
import { ApiError, Usuario } from "../../../core/models/auth.models";
import { AuthService } from "../../../core/services/auth.service";

export interface ActualizarPerfil {
  readonly nombre: string;
  readonly apellido: string;
  readonly telefono: string | null;
  readonly especialidad: string | null;
}

// Todo lo que devuelve un Usuario actualizado se guarda en la sesion, asi el menu
// y los paneles ven el cambio sin recargar.
@Injectable({ providedIn: "root" })
export class PerfilService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly base = `${environment.apiUrl}/perfil`;

  obtener(): Observable<Usuario> {
    return this.http.get<Usuario>(this.base).pipe(tap(u => this.auth.actualizarUsuario(u)), catchError(this.traducir));
  }

  actualizar(datos: ActualizarPerfil): Observable<Usuario> {
    return this.http.put<Usuario>(this.base, datos).pipe(tap(u => this.auth.actualizarUsuario(u)), catchError(this.traducir));
  }

  cambiarPassword(passwordActual: string, passwordNueva: string): Observable<void> {
    return this.http.put<void>(`${this.base}/password`, { passwordActual, passwordNueva }).pipe(catchError(this.traducir));
  }

  subirFoto(archivo: File): Observable<Usuario> {
    const cuerpo = new FormData();
    cuerpo.append("archivo", archivo);
    return this.http.post<Usuario>(`${this.base}/foto`, cuerpo).pipe(tap(u => this.auth.actualizarUsuario(u)), catchError(this.traducir));
  }

  eliminarFoto(): Observable<Usuario> {
    return this.http.delete<Usuario>(`${this.base}/foto`).pipe(tap(u => this.auth.actualizarUsuario(u)), catchError(this.traducir));
  }

  private traducir(error: HttpErrorResponse): Observable<never> {
    if (error.status === 0) {
      return throwError(() => ({ status: 0, mensaje: "No se pudo conectar con el servidor." }) as ApiError);
    }
    const cuerpo = error.error as { mensaje?: string; campos?: Record<string, string> } | null;
    return throwError(() => ({
      status: error.status,
      mensaje: cuerpo?.mensaje ?? "Ocurrio un error inesperado. Intenta de nuevo.",
      campos: cuerpo?.campos
    }) as ApiError);
  }
}
