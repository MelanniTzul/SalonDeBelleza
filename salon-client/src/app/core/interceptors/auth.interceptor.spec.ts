import { HttpClient, provideHttpClient, withInterceptors } from "@angular/common/http";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { Router, provideRouter } from "@angular/router";

import { environment } from "../../../environments/environment";
import { AuthService } from "../services/auth.service";
import { authInterceptor } from "./auth.interceptor";

describe("authInterceptor", () => {
  let http: HttpClient;
  let control: HttpTestingController;
  let auth: AuthService;

  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem("salon.token", "token-de-prueba");
    localStorage.setItem(
      "salon.usuario",
      JSON.stringify({ id: 1, nombre: "Ana", apellido: "R", email: "ana@correo.com", telefono: null, rol: "CLIENTE" })
    );

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    });
    http = TestBed.inject(HttpClient);
    control = TestBed.inject(HttpTestingController);
    auth = TestBed.inject(AuthService);
  });

  afterEach(() => control.verify());

  it("añade el token a las peticiones de la API", () => {
    http.get(`${environment.apiUrl}/auth/me`).subscribe();

    const peticion = control.expectOne(`${environment.apiUrl}/auth/me`);
    expect(peticion.request.headers.get("Authorization")).toBe("Bearer token-de-prueba");
    peticion.flush({});
  });

  it("no envía el token al iniciar sesión", () => {
    http.post(`${environment.apiUrl}/auth/login`, {}).subscribe();

    const peticion = control.expectOne(`${environment.apiUrl}/auth/login`);
    expect(peticion.request.headers.has("Authorization")).toBe(false);
    peticion.flush({});
  });

  it("no añade el token a servicios externos", () => {
    http.get("https://otro-servicio.com/datos").subscribe();

    const peticion = control.expectOne("https://otro-servicio.com/datos");
    expect(peticion.request.headers.has("Authorization")).toBe(false);
    peticion.flush({});
  });

  it("cierra la sesión y va al login cuando la API responde 401", () => {
    const router = TestBed.inject(Router);
    const navegar = vi.spyOn(router, "navigate").mockResolvedValue(true);

    http.get(`${environment.apiUrl}/auth/me`).subscribe({ error: () => undefined });
    control.expectOne(`${environment.apiUrl}/auth/me`).flush(null, { status: 401, statusText: "Unauthorized" });

    expect(auth.autenticado()).toBe(false);
    expect(navegar).toHaveBeenCalledWith(["/login"], { queryParams: { sesionExpirada: true } });
  });

  it("no cierra la sesión por un 403", () => {
    http.get(`${environment.apiUrl}/admin/reportes`).subscribe({ error: () => undefined });
    control.expectOne(`${environment.apiUrl}/admin/reportes`).flush(null, { status: 403, statusText: "Forbidden" });

    expect(auth.autenticado()).toBe(true);
  });
});
