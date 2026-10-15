import { HttpClient, HttpErrorResponse, HttpParams } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable, catchError, throwError } from "rxjs";

import { environment } from "../../../../environments/environment";
import { ApiError } from "../../../core/models/auth.models";
import {
  CategoriaAdmin,
  CategoriaRequest,
  ImagenSubida,
  ProductoAdmin,
  ProductoRequest,
  ServicioAdmin,
  ServicioRequest,
  TipoCategoria
} from "../models/admin-catalogo.models";

// CRUD de servicios y productos para el panel de administración. Las bajas son lógicas
// (el backend solo pone "activo" en false); para reactivar se edita y se vuelve a guardar activo.
@Injectable({ providedIn: "root" })
export class AdminCatalogoService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/admin`;

  // ---------- Categorías ----------

  listarCategorias(tipo: TipoCategoria): Observable<CategoriaAdmin[]> {
    const parametros = new HttpParams().set("tipo", tipo);
    return this.http.get<CategoriaAdmin[]>(`${this.base}/categorias`, { params: parametros }).pipe(catchError(this.traducir));
  }

  crearCategoria(datos: CategoriaRequest): Observable<CategoriaAdmin> {
    return this.http.post<CategoriaAdmin>(`${this.base}/categorias`, datos).pipe(catchError(this.traducir));
  }

  actualizarCategoria(id: number, datos: CategoriaRequest): Observable<CategoriaAdmin> {
    return this.http.put<CategoriaAdmin>(`${this.base}/categorias/${id}`, datos).pipe(catchError(this.traducir));
  }

  desactivarCategoria(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/categorias/${id}`).pipe(catchError(this.traducir));
  }

  // ---------- Servicios ----------

  listarServicios(): Observable<ServicioAdmin[]> {
    return this.http.get<ServicioAdmin[]>(`${this.base}/servicios`).pipe(catchError(this.traducir));
  }

  crearServicio(datos: ServicioRequest): Observable<ServicioAdmin> {
    return this.http.post<ServicioAdmin>(`${this.base}/servicios`, datos).pipe(catchError(this.traducir));
  }

  actualizarServicio(id: number, datos: ServicioRequest): Observable<ServicioAdmin> {
    return this.http.put<ServicioAdmin>(`${this.base}/servicios/${id}`, datos).pipe(catchError(this.traducir));
  }

  // El backend solo desactiva, nunca borra: las citas ya agendadas conservan su servicio.
  desactivarServicio(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/servicios/${id}`).pipe(catchError(this.traducir));
  }

  // ---------- Productos ----------

  listarProductos(): Observable<ProductoAdmin[]> {
    return this.http.get<ProductoAdmin[]>(`${this.base}/productos`).pipe(catchError(this.traducir));
  }

  crearProducto(datos: ProductoRequest): Observable<ProductoAdmin> {
    return this.http.post<ProductoAdmin>(`${this.base}/productos`, datos).pipe(catchError(this.traducir));
  }

  actualizarProducto(id: number, datos: ProductoRequest): Observable<ProductoAdmin> {
    return this.http.put<ProductoAdmin>(`${this.base}/productos/${id}`, datos).pipe(catchError(this.traducir));
  }

  desactivarProducto(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/productos/${id}`).pipe(catchError(this.traducir));
  }

  // ---------- Imágenes ----------

  // "carpeta" debe ser "servicios" o "productos" (ver ImagenService del backend).
  subirImagen(archivo: File, carpeta: "servicios" | "productos"): Observable<ImagenSubida> {
    const cuerpo = new FormData();
    cuerpo.append("archivo", archivo);
    cuerpo.append("carpeta", carpeta);
    return this.http.post<ImagenSubida>(`${this.base}/imagenes`, cuerpo).pipe(catchError(this.traducir));
  }

  private traducir(error: HttpErrorResponse): Observable<never> {
    if (error.status === 0) {
      return throwError(() => ({ status: 0, mensaje: "No se pudo conectar con el servidor." }) as ApiError);
    }
    const cuerpo = error.error as { mensaje?: string; campos?: Record<string, string> } | null;
    return throwError(() => ({
      status: error.status,
      mensaje: cuerpo?.mensaje ?? "Ocurrió un error inesperado. Intenta de nuevo.",
      campos: cuerpo?.campos
    }) as ApiError);
  }
}
