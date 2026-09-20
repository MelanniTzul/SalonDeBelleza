/** Configuración por entorno. Al desplegar se cambia apiUrl por la URL pública de la API. */
export const environment = {
  produccion: false,
  apiUrl: "http://localhost:8080/api"
} as const;
