// Textos por categoría de producto (el slug viene de la API). Una categoría nueva usa los valores generales.
export const TIPO_PRODUCTO: Readonly<Record<string, string>> = {
  geles: "Gel de peinado",
  rizos: "Mousse para rizos y ondas"
};

// Modo de uso general por tipo de producto (orientativo: la estilista recomienda según cada cabello)
export const PASOS_USO: Readonly<Record<string, readonly string[]>> = {
  geles: ["Toma una cantidad pequeña de producto.", "Caliéntala entre las manos.", "Repártela por el cabello y peina a tu gusto."],
  rizos: ["Aplica sobre el cabello húmedo.", "Distribuye sin cepillar, moldeando los rizos.", "Deja secar al aire o con difusor."]
};

export const PASOS_USO_GENERALES: readonly string[] = [
  "Lee las indicaciones del envase.",
  "Aplica una cantidad pequeña sobre el cabello.",
  "Pregunta a tu estilista cuál es la mejor forma de usarlo en tu cabello."
];
