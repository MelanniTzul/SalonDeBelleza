import { Rol } from "../../../core/models/auth.models";

export interface UsuarioAdmin {
  readonly id: number;
  readonly nombre: string;
  readonly apellido: string;
  readonly email: string;
  readonly telefono: string | null;
  readonly rol: Rol;
  readonly activo: boolean;
  readonly especialidad: string | null;
  readonly creadoEn: string | null;
}

export interface CrearUsuario {
  readonly nombre: string;
  readonly apellido: string;
  readonly email: string;
  readonly telefono: string | null;
  readonly password: string;
  readonly rol: Rol;
  readonly especialidad: string | null;
}

export interface ActualizarUsuario {
  readonly nombre: string;
  readonly apellido: string;
  readonly email: string;
  readonly telefono: string | null;
  readonly especialidad: string | null;
}

export interface FiltrosUsuarios {
  readonly rol: Rol | null;
  readonly activo: boolean | null;
  readonly busqueda: string;
  readonly pagina: number;
}

export interface Pagina<T> {
  readonly contenido: readonly T[];
  readonly pagina: number;
  readonly tamanio: number;
  readonly totalElementos: number;
  readonly totalPaginas: number;
  readonly ultima: boolean;
}

export const ETIQUETA_ROL: Record<Rol, string> = {
  ADMINISTRADOR: "Administrador",
  ESTILISTA: "Estilista",
  CLIENTE: "Cliente"
};
