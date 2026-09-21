export interface PreguntaFrecuente {
  pregunta: string;
  respuesta: string;
}

export interface ContenidoCategoria {
  // Bloque "Diseñado para ti"
  diseno: string;
  // Paso 2 de "Cómo será tu cita"
  preparacion: string;
  // Preguntas propias de la categoría (las de cita, precio, duración y domicilio se agregan aparte)
  preguntas: readonly PreguntaFrecuente[];
}

// Contenido general de las páginas de servicio. Es un borrador: conviene que el salón lo revise y lo ajuste a su forma de trabajar.
// Contenido editorial por categoría (el slug viene de la API). Una categoría nueva usa INFO_GENERAL.
export const INFO_SERVICIO: Readonly<Record<string, ContenidoCategoria>> = {
  cortes: {
    diseno: "Tu estilista tiene en cuenta tu tipo de cabello, el largo que quieres conservar y cómo lo peinas día a día, para proponerte un corte que puedas mantener con facilidad.",
    preparacion: "Cuéntale a tu estilista qué te gustaría cambiar. Si tienes fotos del corte que te gusta, tráelas: ayudan a entender lo que buscas.",
    preguntas: [
      { pregunta: "¿Cada cuánto debo retocar mi corte?", respuesta: "Lo habitual es cada 6 a 8 semanas, para que el corte conserve su forma y tu cabello se vea sano. Tu estilista te recomienda según tu tipo de cabello." },
      { pregunta: "¿Y si no estoy segura del corte que quiero?", respuesta: "Puedes usar la guía «Encuentra tu corte ideal» del inicio o comentárselo a tu estilista antes de empezar: te aconseja y acuerdan juntas el resultado." }
    ]
  },
  color: {
    diseno: "El tono y la técnica se eligen según tu color natural, el estado de tu cabello y el resultado que buscas, para que el color se vea bien y se mantenga.",
    preparacion: "Cuéntale a tu estilista si has teñido o decolorado tu cabello antes. Esa información ayuda a elegir el proceso adecuado.",
    preguntas: [
      { pregunta: "¿Cuánto dura el color?", respuesta: "Depende del tono y de los cuidados en casa. Usar shampoo para cabello teñido y evitar el agua muy caliente ayuda a que dure más." },
      { pregunta: "¿Puedo lograr cualquier tono en una sola cita?", respuesta: "Depende de tu punto de partida. Tu estilista te dirá con honestidad qué es posible y si conviene hacerlo por etapas." }
    ]
  },
  peinados: {
    diseno: "Cuéntale a tu estilista el evento, tu vestimenta y el estilo que imaginas, y juntas lo convierten en un peinado hecho a tu medida.",
    preparacion: "Lleva una foto de referencia y, si es para un evento, cuéntale la hora y cómo irás vestida para planear el peinado.",
    preguntas: [
      { pregunta: "¿Con cuánta anticipación debo reservar para un evento?", respuesta: "Mientras antes, mejor: así aseguras tu horario. Puedes reservar en línea cuando quieras." },
      { pregunta: "¿Puedo llevar mis propios accesorios?", respuesta: "Sí. Puedes llevar diademas, peinetas o tocados para que tu estilista los combine con el peinado." }
    ]
  },
  "cejas-pestanas": {
    diseno: "Un cuidado delicado que realza tu mirada de forma natural, con el resultado que te haga sentir cómoda.",
    preparacion: "Avísale a tu estilista si tienes alergias, piel sensible o si usas algún tratamiento en la zona.",
    preguntas: [
      { pregunta: "¿Puedo hacerme este servicio si tengo la piel sensible?", respuesta: "Cuéntaselo a tu estilista antes de empezar para que valore si es adecuado para ti." },
      { pregunta: "¿Cómo cuido el resultado en casa?", respuesta: "Tu estilista te indica los cuidados que conviene seguir después del servicio." }
    ]
  },
  maquillaje: {
    diseno: "El maquillaje se adapta a tu tipo de piel, tu ropa y la ocasión, para que te veas y te sientas como tú, en tu mejor versión.",
    preparacion: "Llega con el rostro limpio y lleva fotos del estilo que te gusta; ayudan a tu estilista a entender lo que buscas.",
    preguntas: [
      { pregunta: "¿Puedo combinarlo con un peinado?", respuesta: "Coméntalo al agendar y tu estilista te indica la mejor forma de organizar tu visita." }
    ]
  }
};

export const INFO_GENERAL: ContenidoCategoria = {
  diseno: "Tu estilista adapta el servicio a lo que buscas, a tus gustos y a lo que necesitas, para que el resultado te encante.",
  preparacion: "Cuéntale a tu estilista qué te gustaría lograr; si tienes fotos de referencia, tráelas.",
  preguntas: []
};

// Peinados con ideas para inspirarse: id del servicio → id de categoría del carrete de estilos
export const ESTILOS_POR_SERVICIO: Readonly<Record<string, string>> = {
  "ondas-bucles": "ondas",
  recogidos: "recogidos",
  trenzas: "trenzas",
  "peinados-infantiles": "infantiles",
  "lacio-brillo": "lacio",
  "rizos-definidos": "rizos",
  "novias-eventos": "novias"
};
