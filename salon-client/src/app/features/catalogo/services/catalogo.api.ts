import { urlImagen } from "../../../core/config/api.config";
import { AcabadoCorte, Categoria, Corte, GrupoCorteId, GrupoCortes, LargoCorte, NivelFijacion, Producto, Servicio, TipoAcabado } from "../models/catalogo.models";

// Forma de las respuestas de la API (salon-api) y su traducción a los modelos del sitio.

export interface CategoriaDto {
  slug: string;
  nombre: string;
}

export interface ServicioDto {
  slug: string;
  nombre: string;
  descripcion: string | null;
  categoria: string;
  categoriaNombre: string;
  imagen: string | null;
  precio: number | null;
  duracionMinutos: number | null;
  aDomicilio: boolean;
  variantes: string[];
  grupoCortes: string | null;
}

export interface ProductoDto {
  slug: string;
  marca: string | null;
  nombre: string;
  descripcion: string | null;
  categoria: string;
  categoriaNombre: string;
  imagen: string | null;
  imagenDetalle: string | null;
  posicionImagen: string | null;
  fijacion: string | null;
  nivelFijacion: string | null;
  acabado: string | null;
  tipoAcabado: string | null;
  precio: number | null;
  beneficios: string[];
}

export interface CorteDto {
  slug: string;
  grupo: string;
  estilo: string | null;
  nombre: string;
  descripcion: string | null;
  imagen: string;
  largo: string | null;
  acabado: string | null;
  flequillo: boolean | null;
}

export interface GrupoCortesDto {
  grupo: string;
  estilos: { slug: string; etiqueta: string }[];
  cortes: CorteDto[];
}

// "MUY_FUERTE" → "muy-fuerte"
const minusculas = (valor: string | null): string | undefined => valor?.toLowerCase().replaceAll("_", "-") ?? undefined;

export const aCategoria = (dto: CategoriaDto): Categoria => ({ id: dto.slug, etiqueta: dto.nombre });

export function aServicio(dto: ServicioDto, apiUrl: string): Servicio {
  return {
    id: dto.slug,
    nombre: dto.nombre,
    categoria: dto.categoria,
    categoriaNombre: dto.categoriaNombre,
    descripcion: dto.descripcion ?? "",
    imagen: urlImagen(dto.imagen, apiUrl),
    duracionMin: dto.duracionMinutos ?? undefined,
    precio: dto.precio ?? undefined,
    aDomicilio: dto.aDomicilio,
    incluye: dto.variantes.length ? dto.variantes : undefined,
    grupoCortes: minusculas(dto.grupoCortes) as GrupoCorteId | undefined
  };
}

export function aProducto(dto: ProductoDto, apiUrl: string): Producto {
  return {
    id: dto.slug,
    nombre: dto.nombre,
    marca: dto.marca ?? "",
    categoria: dto.categoria,
    categoriaNombre: dto.categoriaNombre,
    descripcion: dto.descripcion ?? "",
    imagen: urlImagen(dto.imagen, apiUrl) ?? "",
    posicionImagen: dto.posicionImagen ?? undefined,
    imagenDetalle: urlImagen(dto.imagenDetalle, apiUrl),
    beneficios: dto.beneficios.length ? dto.beneficios : undefined,
    fijacion: dto.fijacion ?? undefined,
    nivelFijacion: minusculas(dto.nivelFijacion) as NivelFijacion | undefined,
    acabado: dto.acabado ?? undefined,
    tipoAcabado: minusculas(dto.tipoAcabado) as TipoAcabado | undefined,
    precio: dto.precio ?? undefined
  };
}

export function aCorte(dto: CorteDto, apiUrl: string): Corte {
  return {
    id: dto.slug,
    nombre: dto.nombre,
    descripcion: dto.descripcion ?? "",
    imagen: urlImagen(dto.imagen, apiUrl) ?? "",
    grupo: minusculas(dto.grupo) as GrupoCorteId,
    estilo: dto.estilo ?? undefined,
    largo: minusculas(dto.largo) as LargoCorte | undefined,
    acabado: minusculas(dto.acabado) as AcabadoCorte | undefined,
    flequillo: dto.flequillo ?? undefined
  };
}

export function aGrupoCortes(dto: GrupoCortesDto, apiUrl: string): GrupoCortes {
  return {
    id: minusculas(dto.grupo) as GrupoCorteId,
    estilos: dto.estilos.map(e => ({ id: e.slug, etiqueta: e.etiqueta })),
    cortes: dto.cortes.map(c => aCorte(c, apiUrl))
  };
}
