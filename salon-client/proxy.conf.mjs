// Reenvía la API y las imágenes subidas al backend durante el desarrollo (evita CORS).
// Otro backend: API_URL=http://localhost:8090 npm start
const target = process.env.API_URL || "http://localhost:8080";

export default {
  "/api": { target, secure: false, changeOrigin: true },
  "/uploads": { target, secure: false, changeOrigin: true }
};
