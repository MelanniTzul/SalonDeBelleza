import { provideHttpClient } from "@angular/common/http";
import { provideHttpClientTesting } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, provideRouter } from "@angular/router";

import { Usuario } from "../models/auth.models";
import { AuthService } from "../services/auth.service";
import { authGuard } from "./auth.guard";
import { invitadoGuard } from "./invitado.guard";
import { rolGuard } from "./rol.guard";

const RUTA = {} as ActivatedRouteSnapshot;
const estado = (url: string) => ({ url }) as RouterStateSnapshot;

const usuario = (rol: Usuario["rol"]): Usuario => ({
  id: 1,
  nombre: "Ana",
  apellido: "R",
  email: "ana@correo.com",
  telefono: null,
  rol
});

const iniciarSesionComo = (rol: Usuario["rol"]): void => {
  localStorage.setItem("salon.token", "token");
  localStorage.setItem("salon.usuario", JSON.stringify(usuario(rol)));
};

describe("Guards de rutas", () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();
  });

  const configurar = () =>
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
    });

  describe("authGuard", () => {
    it("manda al login y recuerda el destino cuando no hay sesión", () => {
      configurar();
      const resultado = TestBed.runInInjectionContext(() => authGuard(RUTA, estado("/admin")));

      expect(resultado).toBeInstanceOf(UrlTree);
      expect((resultado as UrlTree).toString()).toContain("/login");
      expect((resultado as UrlTree).toString()).toContain("redirigir=%2Fadmin");
    });

    it("deja pasar a un usuario autenticado", () => {
      iniciarSesionComo("CLIENTE");
      configurar();
      expect(TestBed.runInInjectionContext(() => authGuard(RUTA, estado("/mi-cuenta")))).toBe(true);
    });
  });

  describe("rolGuard", () => {
    it("deja entrar al rol permitido", () => {
      iniciarSesionComo("ADMINISTRADOR");
      configurar();
      const guard = rolGuard("ADMINISTRADOR");
      expect(TestBed.runInInjectionContext(() => guard(RUTA, estado("/admin")))).toBe(true);
    });

    it("redirige al panel propio cuando el rol no coincide", () => {
      iniciarSesionComo("CLIENTE");
      configurar();
      const guard = rolGuard("ADMINISTRADOR");
      const resultado = TestBed.runInInjectionContext(() => guard(RUTA, estado("/admin")));

      expect((resultado as UrlTree).toString()).toBe("/mi-cuenta");
    });

    it("manda al login si no hay sesión", () => {
      configurar();
      const guard = rolGuard("ESTILISTA");
      const resultado = TestBed.runInInjectionContext(() => guard(RUTA, estado("/estilista")));

      expect((resultado as UrlTree).toString()).toContain("/login");
    });
  });

  describe("invitadoGuard", () => {
    it("deja ver el login a quien no tiene sesión", () => {
      configurar();
      expect(TestBed.runInInjectionContext(() => invitadoGuard(RUTA, estado("/login")))).toBe(true);
    });

    it("saca del login a quien ya inició sesión", () => {
      iniciarSesionComo("ESTILISTA");
      configurar();
      const resultado = TestBed.runInInjectionContext(() => invitadoGuard(RUTA, estado("/login")));

      expect((resultado as UrlTree).toString()).toBe("/estilista");
    });

    it("usa la ruta del administrador para el rol ADMINISTRADOR", () => {
      iniciarSesionComo("ADMINISTRADOR");
      configurar();
      TestBed.inject(AuthService);
      const resultado = TestBed.runInInjectionContext(() => invitadoGuard(RUTA, estado("/login")));

      expect((resultado as UrlTree).toString()).toBe("/admin");
    });
  });
});
