export interface FotoEstilo {
  src: string;
  categoria: string;
  alt: string;
}

export interface CategoriaEstilo {
  id: string;
  titulo: string;
  fotos: readonly FotoEstilo[];
}

const ruta = (n: number) => `img/salon-${String(n).padStart(3, "0")}.jpeg`;

const categoria = (id: string, titulo: string, numeros: readonly number[]): CategoriaEstilo => ({
  id,
  titulo,
  fotos: numeros.map(n => ({ src: ruta(n), categoria: titulo, alt: `Peinado de ejemplo: ${titulo}` }))
});

// Números = salon-NNN.jpeg. Cada foto pertenece a una sola categoría.
// Quedan fuera las que traen restos de captura de pantalla (botones, marcas de agua, collages).
export const CATEGORIAS_ESTILO: readonly CategoriaEstilo[] = [
  categoria("ondas", "Ondas y bucles", [14, 15, 16, 17, 18, 19, 20, 23, 24, 25]),
  categoria("lacio", "Lacio y capas", [13, 36, 37, 38, 39, 41, 42, 43, 44, 45, 48, 52]),
  categoria("recogidos", "Recogidos", [35, 40, 46, 47, 53, 54, 70]),
  categoria("rizos", "Rizos definidos", [73, 75, 76, 77, 78, 80, 89, 90, 91, 92, 93]),
  categoria("trenzas", "Trenzas", [74, 82, 83, 84, 85, 86, 87, 94, 95]),
  categoria("infantiles", "Peinados infantiles", [26, 27, 29, 32, 34, 57, 58, 60, 62, 64, 65, 66, 67, 68, 69, 81]),
  categoria("novias", "Novias y eventos", [21, 22, 33, 49, 51])
];

// Para "Todos": una foto de cada categoría por turno, así el carrete siempre mezcla estilos.
function intercalar(categorias: readonly CategoriaEstilo[]): FotoEstilo[] {
  const mayor = Math.max(...categorias.map(c => c.fotos.length));
  const fotos: FotoEstilo[] = [];
  for (let i = 0; i < mayor; i++) {
    for (const c of categorias) {
      if (c.fotos[i]) fotos.push(c.fotos[i]);
    }
  }
  return fotos;
}

export const TODAS_LAS_FOTOS: readonly FotoEstilo[] = intercalar(CATEGORIAS_ESTILO);
