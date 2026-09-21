export type NivelFijacion = "media" | "fuerte" | "muy-fuerte";
export type TipoAcabado = "brillante" | "natural" | "mate";
export type LargoCorte = "largo" | "medio" | "corto";
export type AcabadoCorte = "volumen" | "ligero" | "pulido";
export type GrupoCorteId = "mujeres" | "hombres" | "ninos" | "abuelos";

// Los ids de servicios, productos y categorías son los "slug" de la API (los mismos que van en la URL).
export interface Categoria {
  id: string;
  etiqueta: string;
}

export interface Servicio {
  id: string;
  nombre: string;
  categoria: string;
  categoriaNombre: string;
  descripcion: string;
  imagen?: string;
  duracionMin?: number;
  precio?: number;
  aDomicilio: boolean;
  // Variantes o modalidades del servicio, se muestran como etiquetas en la tarjeta
  incluye?: readonly string[];
  // Catálogo de cortes que se muestra en la página del servicio
  grupoCortes?: GrupoCorteId;
}

export interface Corte {
  id: string;
  nombre: string;
  descripcion: string;
  imagen: string;
  grupo: GrupoCorteId;
  // Id del estilo (chip de filtro) dentro de su grupo
  estilo?: string;
  // Características que usa la guía "Encuentra tu corte ideal" (grupo mujeres)
  largo?: LargoCorte;
  acabado?: AcabadoCorte;
  flequillo?: boolean;
}

export interface EstiloCorte {
  id: string;
  etiqueta: string;
}

export interface GrupoCortes {
  id: GrupoCorteId;
  estilos: readonly EstiloCorte[];
  cortes: readonly Corte[];
}

export interface Producto {
  id: string;
  nombre: string;
  marca: string;
  categoria: string;
  categoriaNombre: string;
  descripcion: string;
  imagen: string;
  posicionImagen?: string;
  // Segunda foto de la galería (acercamiento) y puntos destacados de la ficha del producto
  imagenDetalle?: string;
  beneficios?: readonly string[];
  // Texto tal como se muestra (ej. "Media a fuerte") y su nivel normalizado para filtrar
  fijacion?: string;
  nivelFijacion?: NivelFijacion;
  acabado?: string;
  tipoAcabado?: TipoAcabado;
  precio?: number;
}
