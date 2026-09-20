import { HttpClient, HttpErrorResponse, HttpParams } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable, catchError, throwError } from "rxjs";

import { environment } from "../../../../environments/environment";
import { ApiError } from "../../../core/models/auth.models";
import { ActualizarUsuario, CrearUsuario, FiltrosUsuarios, Pagina, UsuarioAdmin } from "../models/usuario.models";

@Injectable({ providedIn: "root" })
export class UsuarioService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/admin/usuarios`;

  listar(filtros: FiltrosUsuarios): Observable<Pagina<UsuarioAdmin>> {
    let params = new HttpParams().set("page", filtros.pagina).set("size", 10);

    if (filtros.rol) {
      params = params.set("rol", filtros.rol);
    }
    if (filtros.activo !== null) {
      params = params.set("activo", filtros.activo);
    }
    if (filtros.busqueda.trim()) {
      params = params.set("busqueda", filtros.busqueda.trim());
    }
    return this.http.get<Pagina<UsuarioAdmin>>(this.base, { params }).pipe(catchError(this.traducir));
  }

  crear(datos: CrearUsuario): Observable<UsuarioAdmin> {
    return this.http.post<UsuarioAdmin>(this.base, datos).pipe(catchError(this.traducir));
  }

  actualizar(id: number, datos: ActualizarUsuario): Observable<UsuarioAdmin> {
    return this.http.put<UsuarioAdmin>(`${this.base}/${id}`, datos).pipe(catchError(this.traducir));
  }

  // En el backend esto solo pone activo en false, no borra nada.
  desactivar(id: number): Observable<UsuarioAdmin> {
    return this.http.delete<UsuarioAdmin>(`${this.base}/${id}`).pipe(catchError(this.traducir));
  }

  activar(id: number): Observable<UsuarioAdmin> {
    return this.http.patch<UsuarioAdmin>(`${this.base}/${id}/activar`, {}).pipe(catchError(this.traducir));
  }

  cambiarPassword(id: number, password: string): Observable<void> {
    return this.http.patch<void>(`${this.base}/${id}/password`, { password }).pipe(catchError(this.traducir));
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
