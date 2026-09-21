export interface Estilista {
  id: string;
  nombre: string;
  rol: string;
  // Reseña breve: un párrafo por elemento
  resena: readonly string[];
  // Sin foto se muestra un monograma con las iniciales
  foto?: string;
  posicionFoto?: string;
}

// Equipo del salón. Las fotos van recortadas en formato 4:5 en public/img/web/ (los originales quedan en public/img/equipo/).
export const EQUIPO: readonly Estilista[] = [
  {
    id: "aukje-tzul",
    nombre: "Aukje Tzul",
    rol: "Estilista",
    foto: "img/web/aukje-tzul.jpg",
    posicionFoto: "center 30%",
    resena: [
      "Soy estilista apasionada por la belleza y el cuidado personal. Me encanta ayudar a cada persona a resaltar su belleza natural, creando estilos que se adapten a su personalidad, gustos y necesidades.",
      "Me caracterizo por trabajar con dedicación, paciencia y atención a cada detalle, buscando que cada cliente no solo luzca hermosa, sino que también se sienta segura y especial.",
      "Mi objetivo es que cada visita al salón sea una experiencia de belleza, confianza y bienestar."
    ]
  },
  {
    id: "alvaro-tzul",
    nombre: "Alvaro Tzul",
    rol: "Estilista",
    foto: "img/web/alvaro-tzul.jpg",
    posicionFoto: "center 20%",
    resena: [
      "Soy estilista profesional, apasionado por la belleza, la imagen y la expresión personal. Mi formación en el mundo del estilismo me ha permitido desarrollar una mirada detallista y creativa, entendiendo que cada persona tiene una esencia única que puede potenciarse a través de su imagen."
    ]
  }
];
