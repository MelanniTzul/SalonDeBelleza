// Formas que devuelve y espera /api/admin/servicios y /api/admin/productos.
// Son distintas de features/catalogo (el sitio público): aquí sí viajan "id" y "activo",
// y las peticiones de alta/edición llevan todos los campos del formulario.

// Identificador sugerido a partir del nombre (quita acentos, minúsculas, espacios y
// símbolos fuera de a-z/0-9/guion). Los formularios lo usan para no hacer escribir
// el slug a mano; el usuario puede sobreescribirlo si lo toca directamente.
export function generarSlug(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export type GrupoCortes = "MUJERES" | "HOMBRES" | "NINOS" | "ABUELOS";
export type NivelFijacion = "MEDIA" | "FUERTE" | "MUY_FUERTE";
export type TipoAcabado = "BRILLANTE" | "NATURAL" | "MATE";

export const ETIQUETA_GRUPO_CORTES: Record<GrupoCortes, string> = {
  MUJERES: "Mujeres",
  HOMBRES: "Hombres",
  NINOS: "Niños y niñas",
  ABUELOS: "Abuelitos y abuelitas"
};

export const ETIQUETA_NIVEL_FIJACION: Record<NivelFijacion, string> = {
  MEDIA: "Media",
  FUERTE: "Fuerte",
  MUY_FUERTE: "Muy fuerte"
};

export const ETIQUETA_TIPO_ACABADO: Record<TipoAcabado, string> = {
  BRILLANTE: "Brillante",
  NATURAL: "Natural",
  MATE: "Mate"
};

export interface Categoria {
  readonly slug: string;
  readonly nombre: string;
}

export type TipoCategoria = "SERVICIO" | "PRODUCTO";

export interface CategoriaAdmin {
  readonly id: number;
  readonly slug: string;
  readonly nombre: string;
  readonly tipo: TipoCategoria;
  readonly orden: number;
  readonly activo: boolean;
}

export interface CategoriaRequest {
  readonly slug: string;
  readonly nombre: string;
  readonly tipo: TipoCategoria;
  readonly orden: number | null;
  readonly activo: boolean;
}

export interface ServicioAdmin {
  readonly id: number;
  readonly slug: string;
  readonly nombre: string;
  readonly descripcion: string | null;
  readonly categoria: string;
  readonly categoriaNombre: string;
  readonly imagen: string | null;
  readonly precio: number | null;
  readonly duracionMinutos: number | null;
  readonly aDomicilio: boolean;
  readonly variantes: readonly string[];
  readonly grupoCortes: GrupoCortes | null;
  readonly activo: boolean;
}

export interface ServicioRequest {
  readonly slug: string;
  readonly categoria: string;
  readonly nombre: string;
  readonly descripcion: string | null;
  readonly precio: number | null;
  readonly duracionMinutos: number | null;
  readonly aDomicilio: boolean;
  readonly variantes: readonly string[];
  readonly grupoCortes: GrupoCortes | null;
  readonly imagen: string | null;
  readonly activo: boolean;
}

export interface ProductoAdmin {
  readonly id: number;
  readonly slug: string;
  readonly marca: string | null;
  readonly nombre: string;
  readonly descripcion: string | null;
  readonly categoria: string;
  readonly categoriaNombre: string;
  readonly imagen: string | null;
  readonly imagenDetalle: string | null;
  readonly posicionImagen: string | null;
  readonly fijacion: string | null;
  readonly nivelFijacion: NivelFijacion | null;
  readonly acabado: string | null;
  readonly tipoAcabado: TipoAcabado | null;
  readonly precio: number | null;
  readonly beneficios: readonly string[];
  readonly activo: boolean;
}

export interface ProductoRequest {
  readonly slug: string;
  readonly categoria: string;
  readonly marca: string | null;
  readonly nombre: string;
  readonly descripcion: string | null;
  readonly precio: number | null;
  readonly imagen: string | null;
  readonly imagenDetalle: string | null;
  readonly posicionImagen: string | null;
  readonly fijacion: string | null;
  readonly nivelFijacion: NivelFijacion | null;
  readonly acabado: string | null;
  readonly tipoAcabado: TipoAcabado | null;
  readonly beneficios: readonly string[];
  readonly activo: boolean;
}

export interface ImagenSubida {
  readonly url: string;
}

// Para el interruptor rápido de "Activo" en la tabla: el backend no tiene un
// endpoint de solo-activar, así que se reenvía el registro completo con ese campo en true.
export function aServicioRequest(s: ServicioAdmin): ServicioRequest {
  return {
    slug: s.slug,
    categoria: s.categoria,
    nombre: s.nombre,
    descripcion: s.descripcion,
    precio: s.precio,
    duracionMinutos: s.duracionMinutos,
    aDomicilio: s.aDomicilio,
    variantes: s.variantes,
    grupoCortes: s.grupoCortes,
    imagen: s.imagen,
    activo: true
  };
}

export function aCategoriaRequest(c: CategoriaAdmin): CategoriaRequest {
  return {
    slug: c.slug,
    nombre: c.nombre,
    tipo: c.tipo,
    orden: c.orden,
    activo: true
  };
}

export function aProductoRequest(p: ProductoAdmin): ProductoRequest {
  return {
    slug: p.slug,
    categoria: p.categoria,
    marca: p.marca,
    nombre: p.nombre,
    descripcion: p.descripcion,
    precio: p.precio,
    imagen: p.imagen,
    imagenDetalle: p.imagenDetalle,
    posicionImagen: p.posicionImagen,
    fijacion: p.fijacion,
    nivelFijacion: p.nivelFijacion,
    acabado: p.acabado,
    tipoAcabado: p.tipoAcabado,
    beneficios: p.beneficios,
    activo: true
  };
}
