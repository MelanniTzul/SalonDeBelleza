import { GrupoCorteId } from "../models/catalogo.models";

export interface GrupoCortesMeta {
  id: GrupoCorteId;
  etiqueta: string;
  // Para el encabezado: "Catálogo de cortes para mujeres"
  para: string;
  // Mensaje cuando el grupo aún no tiene cortes cargados
  aviso?: string;
}

// Textos de cada pestaña del catálogo de cortes. Los cortes y los estilos vienen de la API (GET /api/cortes).
export const GRUPOS_CORTES_META: readonly GrupoCortesMeta[] = [
  { id: "mujeres", etiqueta: "Mujeres", para: "mujeres" },
  { id: "hombres", etiqueta: "Hombres", para: "hombres" },
  { id: "ninos", etiqueta: "Niños y niñas", para: "niños y niñas" },
  {
    id: "abuelos",
    etiqueta: "Abuelitos y abuelitas",
    para: "abuelitos y abuelitas",
    aviso: "Estamos preparando esta sección con ejemplos de cortes y peinados cómodos y elegantes para abuelitos y abuelitas. Mientras tanto, cuéntale a tu estilista qué buscas y te aconseja."
  }
];

export const esGrupoCorte = (valor: unknown): valor is GrupoCorteId => GRUPOS_CORTES_META.some(g => g.id === valor);
