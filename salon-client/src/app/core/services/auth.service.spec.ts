import { HttpErrorResponse, provideHttpClient } from "@angular/common/http";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";

import { environment } from "../../../environments/environment";
import { ApiError, AuthResponse } from "../models/auth.models";
import { AuthService } from "./auth.service";

const RESPUESTA: AuthResponse = {
  token: "token-de-prueba",
  tipo: "Bearer",
  expiraEnSegundos: 3600,
  usuario: {
    id: 1,
    nombre: "Ana",
    apellido: "Rodríguez",
    email: "ana@correo.com",
    telefono: null,
    fotoUrl: null,
    rol: "CLIENTE",
    especialidad: null
  }
};

describe("AuthService", () => {
  let servicio: AuthService;
  let http: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    servicio = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it("arranca sin sesión", () => {
    expect(servicio.autenticado()).toBe(false);
    expect(servicio.rol()).toBeNull();
  });

  it("guarda token y usuario al iniciar sesión", () => {
    servicio.login({ email: "ana@correo.com", password: "Cliente1234!" }).subscribe();

    const peticion = http.expectOne(`${environment.apiUrl}/auth/login`);
    expect(peticion.request.method).toBe("POST");
    peticion.flush(RESPUESTA);

    expect(servicio.autenticado()).toBe(true);
    expect(servicio.token()).toBe("token-de-prueba");
    expect(servicio.rol()).toBe("CLIENTE");
    expect(servicio.nombreCompleto()).toBe("Ana Rodríguez");
    expect(servicio.iniciales()).toBe("AR");
    expect(localStorage.getItem("salon.token")).toBe("token-de-prueba");
  });

  it("traduce el error del backend a un mensaje legible", () => {
    let recibido: ApiError | undefined;
    servicio.login({ email: "ana@correo.com", password: "mala" }).subscribe({
      error: (error: ApiError) => (recibido = error)
    });

    http.expectOne(`${environment.apiUrl}/auth/login`).flush(
      { mensaje: "Correo o contraseña incorrectos" },
      { status: 401, statusText: "Unauthorized" }
    );

    expect(recibido?.status).toBe(401);
    expect(recibido?.mensaje).toBe("Correo o contraseña incorrectos");
    expect(servicio.autenticado()).toBe(false);
  });

  it("avisa cuando no hay conexión con el servidor", () => {
    let recibido: ApiError | undefined;
    servicio.login({ email: "ana@correo.com", password: "x" }).subscribe({
      error: (error: ApiError) => (recibido = error)
    });

    http.expectOne(`${environment.apiUrl}/auth/login`).error(new ProgressEvent("error"));

    expect(recibido?.status).toBe(0);
    expect(recibido?.mensaje).toContain("No se pudo conectar");
  });

  it("borra la sesión al cerrarla", () => {
    servicio.login({ email: "ana@correo.com", password: "Cliente1234!" }).subscribe();
    http.expectOne(`${environment.apiUrl}/auth/login`).flush(RESPUESTA);

    servicio.logout();

    expect(servicio.autenticado()).toBe(false);
    expect(localStorage.getItem("salon.token")).toBeNull();
    expect(localStorage.getItem("salon.usuario")).toBeNull();
  });

  it("tieneRol responde según el rol guardado", () => {
    servicio.login({ email: "ana@correo.com", password: "Cliente1234!" }).subscribe();
    http.expectOne(`${environment.apiUrl}/auth/login`).flush(RESPUESTA);

    expect(servicio.tieneRol("CLIENTE")).toBe(true);
    expect(servicio.tieneRol("ADMINISTRADOR", "ESTILISTA")).toBe(false);
  });

  it("recupera la sesión guardada en localStorage", () => {
    localStorage.setItem("salon.token", RESPUESTA.token);
    localStorage.setItem("salon.usuario", JSON.stringify(RESPUESTA.usuario));

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    const recuperado = TestBed.inject(AuthService);

    expect(recuperado.autenticado()).toBe(true);
    expect(recuperado.rol()).toBe("CLIENTE");
    http = TestBed.inject(HttpTestingController);
  });

  it("descarta un usuario corrupto en localStorage", () => {
    localStorage.setItem("salon.token", "token");
    localStorage.setItem("salon.usuario", "{no-es-json");

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    const recuperado = TestBed.inject(AuthService);

    expect(recuperado.autenticado()).toBe(false);
    http = TestBed.inject(HttpTestingController);
  });

  it("no deja pasar un error inesperado sin mensaje", () => {
    let recibido: ApiError | undefined;
    servicio.registrar({
      nombre: "Ana",
      apellido: "R",
      email: "ana@correo.com",
      telefono: null,
      password: "Cliente1234!"
    }).subscribe({ error: (error: ApiError) => (recibido = error) });

    http.expectOne(`${environment.apiUrl}/auth/register`).flush(null, {
      status: 500,
      statusText: "Server Error"
    });

    expect(recibido?.mensaje).toContain("error inesperado");
  });

  it("expone el error como ApiError y no como HttpErrorResponse", () => {
    let recibido: unknown;
    servicio.login({ email: "a@b.com", password: "x" }).subscribe({ error: e => (recibido = e) });

    http.expectOne(`${environment.apiUrl}/auth/login`).flush(
      { mensaje: "Correo o contraseña incorrectos" },
      { status: 401, statusText: "Unauthorized" }
    );

    expect(recibido instanceof HttpErrorResponse).toBe(false);
  });
});
