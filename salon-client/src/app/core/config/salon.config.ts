export interface DatosSalon {
  nombre: string;
  eslogan: string;
  // Frase principal del inicio: "lema" + palabra destacada en cursiva
  lema: string;
  lemaAcento: string;
  canton: string;
  municipio: string;
  zona: string;
  horario: string;
  marcas: readonly string[];
  // Opcionales: al completarlos aparecen solos en el sitio (WhatsApp flotante, teléfono y mapa incrustado)
  telefono: string; // Ej. "+502 0000 0000"
  whatsapp: string; // Solo dígitos con código de país. Ej. "50200000000"
  mapaEmbedUrl: string; // URL de "Insertar un mapa" de Google Maps
}

export const SALON: DatosSalon = {
  nombre: "Salón de Belleza Familiar",
  eslogan: "Cuidamos tu estilo, en familia.",
  lema: "Belleza para toda la",
  lemaAcento: "familia",
  canton: "Cantón Juchanep",
  municipio: "Totonicapán",
  zona: "Zona 0",
  horario: "Lunes a sábado",
  marcas: ["Johnny B.", "Level 3", "Eco Styler", "Cantu"],
  telefono: "",
  whatsapp: "",
  mapaEmbedUrl: ""
};

// "Cantón Juchanep, Totonicapán, Zona 0"
export const DIRECCION_SALON = `${SALON.canton}, ${SALON.municipio}, ${SALON.zona}`;

// Abre Google Maps buscando la dirección (no requiere clave)
export const ENLACE_MAPA = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${DIRECCION_SALON}, Guatemala`)}`;
