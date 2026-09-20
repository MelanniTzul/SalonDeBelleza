// Tiene que coincidir con el enum Rol del backend.
export type Rol = "CLIENTE" | "ESTILISTA" | "ADMINISTRADOR";

export interface Usuario {
  readonly id: number;
  readonly nombre: string;
  readonly apellido: string;
  readonly email: string;
  readonly telefono: string | null;
  readonly rol: Rol;
}

export interface LoginRequest {
  readonly email: string;
  readonly password: string;
}

export interface RegistroRequest {
  readonly nombre: string;
  readonly apellido: string;
  readonly email: string;
  readonly telefono: string | null;
  readonly password: string;
}

export interface AuthResponse {
  readonly token: string;
  readonly tipo: string;
  readonly expiraEnSegundos: number;
  readonly usuario: Usuario;
}

// Formato de error que devuelve la API.
export interface ApiError {
  readonly status: number;
  readonly mensaje: string;
  readonly campos?: Record<string, string>;
}

// A donde cae cada rol despues del login.
export const RUTA_INICIO_POR_ROL: Record<Rol, string> = {
  ADMINISTRADOR: "/admin",
  ESTILISTA: "/estilista",
  CLIENTE: "/mi-cuenta"
};
