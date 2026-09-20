import { provideHttpClient } from "@angular/common/http";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";

import { environment } from "../../../../environments/environment";
import { ApiError } from "../../../core/models/auth.models";
import { UsuarioService } from "./usuario.service";

const BASE = `${environment.apiUrl}/admin/usuarios`;

describe("UsuarioService", () => {
  let servicio: UsuarioService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    servicio = TestBed.inject(UsuarioService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it("no manda los filtros vacios como parametros", () => {
    servicio.listar({ rol: null, activo: null, busqueda: "   ", pagina: 0 }).subscribe();

    const peticion = http.expectOne(r => r.url === BASE);
    expect(peticion.request.params.has("rol")).toBe(false);
    expect(peticion.request.params.has("activo")).toBe(false);
    expect(peticion.request.params.has("busqueda")).toBe(false);
    expect(peticion.request.params.get("page")).toBe("0");
    peticion.flush({ contenido: [], pagina: 0, tamanio: 10, totalElementos: 0, totalPaginas: 0, ultima: true });
  });

  it("manda los filtros que si tienen valor", () => {
    servicio.listar({ rol: "ESTILISTA", activo: false, busqueda: " karla ", pagina: 2 }).subscribe();

    const peticion = http.expectOne(r => r.url === BASE);
    expect(peticion.request.params.get("rol")).toBe("ESTILISTA");
    expect(peticion.request.params.get("activo")).toBe("false");
    expect(peticion.request.params.get("busqueda")).toBe("karla");
    expect(peticion.request.params.get("page")).toBe("2");
    peticion.flush({ contenido: [], pagina: 2, tamanio: 10, totalElementos: 0, totalPaginas: 3, ultima: false });
  });

  it("activo en false si se manda, no se confunde con null", () => {
    servicio.listar({ rol: null, activo: false, busqueda: "", pagina: 0 }).subscribe();

    const peticion = http.expectOne(r => r.url === BASE);
    expect(peticion.request.params.get("activo")).toBe("false");
    peticion.flush({ contenido: [], pagina: 0, tamanio: 10, totalElementos: 0, totalPaginas: 0, ultima: true });
  });

  it("desactivar pega un DELETE al id correcto", () => {
    servicio.desactivar(7).subscribe();

    const peticion = http.expectOne(`${BASE}/7`);
    expect(peticion.request.method).toBe("DELETE");
    peticion.flush({});
  });

  it("activar pega un PATCH a /activar", () => {
    servicio.activar(7).subscribe();

    const peticion = http.expectOne(`${BASE}/7/activar`);
    expect(peticion.request.method).toBe("PATCH");
    peticion.flush({});
  });

  it("traduce el error del backend a un mensaje legible", () => {
    let recibido: ApiError | undefined;
    servicio
      .crear({
        nombre: "Karla",
        apellido: "Ruiz",
        email: "karla@correo.com",
        telefono: null,
        password: "Karla12345",
        rol: "ESTILISTA",
        especialidad: null
      })
      .subscribe({ error: (e: ApiError) => (recibido = e) });

    http.expectOne(BASE).flush({ mensaje: "El correo ya esta registrado" }, { status: 409, statusText: "Conflict" });

    expect(recibido?.status).toBe(409);
    expect(recibido?.mensaje).toBe("El correo ya esta registrado");
  });

  it("avisa cuando no hay conexion", () => {
    let recibido: ApiError | undefined;
    servicio.activar(1).subscribe({ error: (e: ApiError) => (recibido = e) });

    http.expectOne(`${BASE}/1/activar`).error(new ProgressEvent("error"));

    expect(recibido?.status).toBe(0);
    expect(recibido?.mensaje).toContain("No se pudo conectar");
  });
});
