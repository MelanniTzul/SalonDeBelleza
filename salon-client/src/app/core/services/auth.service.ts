import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable, computed, inject, signal } from "@angular/core";
import { Observable, catchError, tap, throwError } from "rxjs";

import { environment } from "../../../environments/environment";
import { ApiError, AuthResponse, LoginRequest, RegistroRequest, Rol, Usuario } from "../models/auth.models";

const CLAVE_TOKEN = "salon.token";
const CLAVE_USUARIO = "salon.usuario";

/**
 * Única fuente de verdad de la sesión: guarda el token y el usuario en signals
 * y los replica en localStorage para que la sesión sobreviva a un refresco.
 */
@Injectable({ providedIn: "root" })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/auth`;

  private readonly _token = signal<string | null>(this.leerToken());
  private readonly _usuario = signal<Usuario | null>(this.leerUsuario());
  private readonly _cargando = signal(false);

  readonly usuario = this._usuario.asReadonly();
  readonly token = this._token.asReadonly();
  readonly cargando = this._cargando.asReadonly();

  readonly autenticado = computed(() => this._token() !== null && this._usuario() !== null);
  readonly rol = computed<Rol | null>(() => this._usuario()?.rol ?? null);
  readonly nombreCompleto = computed(() => {
    const usuario = this._usuario();
    return usuario ? `${usuario.nombre} ${usuario.apellido}` : "";
  });
  readonly iniciales = computed(() => {
    const usuario = this._usuario();
    return usuario ? `${usuario.nombre.charAt(0)}${usuario.apellido.charAt(0)}`.toUpperCase() : "";
  });

  login(credenciales: LoginRequest): Observable<AuthResponse> {
    this._cargando.set(true);
    return this.http.post<AuthResponse>(`${this.base}/login`, credenciales).pipe(
      tap(respuesta => this.guardarSesion(respuesta)),
      catchError((error: HttpErrorResponse) => throwError(() => this.traducirError(error))),
      tap({ finalize: () => this._cargando.set(false) })
    );
  }

  registrar(datos: RegistroRequest): Observable<AuthResponse> {
    this._cargando.set(true);
    return this.http.post<AuthResponse>(`${this.base}/register`, datos).pipe(
      tap(respuesta => this.guardarSesion(respuesta)),
      catchError((error: HttpErrorResponse) => throwError(() => this.traducirError(error))),
      tap({ finalize: () => this._cargando.set(false) })
    );
  }

  /** Revalida el token contra la API y refresca los datos del usuario. */
  refrescarPerfil(): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.base}/me`).pipe(
      tap(usuario => {
        this._usuario.set(usuario);
        localStorage.setItem(CLAVE_USUARIO, JSON.stringify(usuario));
      })
    );
  }

  logout(): void {
    this._token.set(null);
    this._usuario.set(null);
    localStorage.removeItem(CLAVE_TOKEN);
    localStorage.removeItem(CLAVE_USUARIO);
  }

  tieneRol(...roles: readonly Rol[]): boolean {
    const rol = this.rol();
    return rol !== null && roles.includes(rol);
  }

  private guardarSesion(respuesta: AuthResponse): void {
    this._token.set(respuesta.token);
    this._usuario.set(respuesta.usuario);
    localStorage.setItem(CLAVE_TOKEN, respuesta.token);
    localStorage.setItem(CLAVE_USUARIO, JSON.stringify(respuesta.usuario));
  }

  private leerToken(): string | null {
    return localStorage.getItem(CLAVE_TOKEN);
  }

  private leerUsuario(): Usuario | null {
    const guardado = localStorage.getItem(CLAVE_USUARIO);
    if (!guardado) {
      return null;
    }
    try {
      return JSON.parse(guardado) as Usuario;
    } catch {
      // El dato guardado quedó corrupto: se descarta para no romper la app.
      localStorage.removeItem(CLAVE_USUARIO);
      return null;
    }
  }

  private traducirError(error: HttpErrorResponse): ApiError {
    if (error.status === 0) {
      return { status: 0, mensaje: "No se pudo conectar con el servidor. Revisa tu conexión." };
    }
    const cuerpo = error.error as { mensaje?: string; campos?: Record<string, string> } | null;
    return {
      status: error.status,
      mensaje: cuerpo?.mensaje ?? "Ocurrió un error inesperado. Intenta de nuevo.",
      campos: cuerpo?.campos
    };
  }
}
