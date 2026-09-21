import { provideHttpClient } from "@angular/common/http";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";

import { environment } from "../../../../environments/environment";
import { ApiError, Usuario } from "../../../core/models/auth.models";
import { AuthService } from "../../../core/services/auth.service";
import { PerfilService } from "./perfil.service";

const BASE = `${environment.apiUrl}/perfil`;

const USUARIO: Usuario = {
  id: 3, nombre: "Ana", apellido: "Rodriguez", email: "ana@correo.com",
  telefono: null, fotoUrl: null, rol: "CLIENTE", especialidad: null
};

describe("PerfilService", () => {
  let servicio: PerfilService;
  let auth: AuthService;
  let http: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem("salon.token", "token");
    localStorage.setItem("salon.usuario", JSON.stringify(USUARIO));
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    servicio = TestBed.inject(PerfilService);
    auth = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it("al actualizar guarda el usuario nuevo en la sesion", () => {
    servicio.actualizar({ nombre: "Ana Maria", apellido: "Rodriguez", telefono: "5555", especialidad: null }).subscribe();

    const peticion = http.expectOne(BASE);
    expect(peticion.request.method).toBe("PUT");
    peticion.flush({ ...USUARIO, nombre: "Ana Maria", telefono: "5555" });

    expect(auth.usuario()?.nombre).toBe("Ana Maria");
    expect(JSON.parse(localStorage.getItem("salon.usuario")!).telefono).toBe("5555");
  });

  it("sube la foto como multipart con el campo archivo", () => {
    const archivo = new File(["x"], "yo.png", { type: "image/png" });
    servicio.subirFoto(archivo).subscribe();

    const peticion = http.expectOne(`${BASE}/foto`);
    expect(peticion.request.method).toBe("POST");
    expect(peticion.request.body).toBeInstanceOf(FormData);
    expect((peticion.request.body as FormData).get("archivo")).toBe(archivo);
    peticion.flush({ ...USUARIO, fotoUrl: "uploads/perfiles/a.png" });

    expect(auth.usuario()?.fotoUrl).toBe("uploads/perfiles/a.png");
  });

  it("al quitar la foto deja fotoUrl en null en la sesion", () => {
    auth.actualizarUsuario({ ...USUARIO, fotoUrl: "uploads/perfiles/a.png" });
    servicio.eliminarFoto().subscribe();

    const peticion = http.expectOne(`${BASE}/foto`);
    expect(peticion.request.method).toBe("DELETE");
    peticion.flush({ ...USUARIO, fotoUrl: null });

    expect(auth.usuario()?.fotoUrl).toBeNull();
  });

  it("manda actual y nueva al cambiar la contrasena", () => {
    servicio.cambiarPassword("vieja123", "Nueva1234").subscribe();

    const peticion = http.expectOne(`${BASE}/password`);
    expect(peticion.request.body).toEqual({ passwordActual: "vieja123", passwordNueva: "Nueva1234" });
    peticion.flush(null, { status: 204, statusText: "No Content" });
  });

  it("traduce el error del backend", () => {
    let recibido: ApiError | undefined;
    servicio.cambiarPassword("mala", "Nueva1234").subscribe({ error: (e: ApiError) => (recibido = e) });

    http.expectOne(`${BASE}/password`).flush({ mensaje: "La contrasena actual no es correcta" }, { status: 400, statusText: "Bad Request" });

    expect(recibido?.mensaje).toBe("La contrasena actual no es correcta");
    // un 400 no toca la sesion
    expect(auth.autenticado()).toBe(true);
  });
});
