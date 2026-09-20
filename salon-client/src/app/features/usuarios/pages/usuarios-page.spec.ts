import { provideHttpClient } from "@angular/common/http";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";

import { environment } from "../../../../environments/environment";
import { UsuarioAdmin } from "../models/usuario.models";
import { UsuariosPage } from "./usuarios-page";

const BASE = `${environment.apiUrl}/admin/usuarios`;

const usuario = (extra: Partial<UsuarioAdmin> = {}): UsuarioAdmin => ({
  id: 1,
  nombre: "Marisol",
  apellido: "Gomez",
  email: "marisol@salon.com",
  telefono: "5555",
  rol: "ESTILISTA",
  activo: true,
  especialidad: "Corte",
  creadoEn: "2026-09-20T10:00:00",
  ...extra
});

const paginaCon = (usuarios: UsuarioAdmin[]) => ({
  contenido: usuarios,
  pagina: 0,
  tamanio: 10,
  totalElementos: usuarios.length,
  totalPaginas: 1,
  ultima: true
});

describe("UsuariosPage", () => {
  let fixture: ComponentFixture<UsuariosPage>;
  let http: HttpTestingController;

  const texto = () => (fixture.nativeElement as HTMLElement).textContent ?? "";
  const boton = (etiqueta: string) =>
    (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>(`[aria-label="${etiqueta}"]`);

  const montar = (usuarios: UsuarioAdmin[]) => {
    fixture = TestBed.createComponent(UsuariosPage);
    http = TestBed.inject(HttpTestingController);
    http.expectOne(r => r.url === BASE).flush(paginaCon(usuarios));
    fixture.detectChanges();
  };

  beforeEach(async () => {
    localStorage.clear();
    localStorage.setItem("salon.token", "token");
    localStorage.setItem(
      "salon.usuario",
      JSON.stringify({ id: 9, nombre: "Admin", apellido: "Salon", email: "admin@salon.com", telefono: null, rol: "ADMINISTRADOR" })
    );

    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [UsuariosPage],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()]
    }).compileComponents();
  });

  afterEach(() => http.verify());

  it("pinta los usuarios que devuelve la API", () => {
    montar([usuario()]);

    expect(texto()).toContain("Marisol Gomez");
    expect(texto()).toContain("marisol@salon.com");
    expect(texto()).toContain("Corte");
  });

  it("muestra el estado de cada usuario", () => {
    montar([usuario(), usuario({ id: 2, nombre: "Ana", email: "ana@salon.com", activo: false })]);

    expect(texto()).toContain("Activo");
    expect(texto()).toContain("Desactivado");
  });

  it("ofrece Desactivar al activo y Activar al desactivado", () => {
    montar([usuario(), usuario({ id: 2, nombre: "Ana", apellido: "Ruiz", email: "ana@salon.com", activo: false })]);

    expect(boton("Desactivar a Marisol Gomez")).not.toBeNull();
    expect(boton("Activar a Ana Ruiz")).not.toBeNull();
    expect(boton("Desactivar a Ana Ruiz")).toBeNull();
  });

  it("no deja al admin desactivar su propia cuenta", () => {
    montar([usuario({ id: 9, nombre: "Admin", apellido: "Salon", email: "admin@salon.com", rol: "ADMINISTRADOR", especialidad: null })]);

    expect(boton("Desactivar a Admin Salon")?.disabled).toBe(true);
  });

  it("si desactiva, recarga la lista y avisa", () => {
    montar([usuario()]);

    boton("Desactivar a Marisol Gomez")!.click();
    http.expectOne(`${BASE}/1`).flush(usuario({ activo: false }));
    http.expectOne(r => r.url === BASE).flush(paginaCon([usuario({ activo: false })]));
    fixture.detectChanges();

    expect(texto()).toContain("ya no puede iniciar sesion");
  });

  it("muestra el error si la API rechaza la desactivacion", () => {
    montar([usuario()]);

    boton("Desactivar a Marisol Gomez")!.click();
    http.expectOne(`${BASE}/1`).flush({ mensaje: "No puedes desactivar tu propia cuenta" }, { status: 409, statusText: "Conflict" });
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).querySelector("[role='alert']")?.textContent)
      .toContain("No puedes desactivar tu propia cuenta");
  });

  it("avisa cuando el filtro no trae resultados", () => {
    montar([]);

    expect(texto()).toContain("No hay usuarios que coincidan");
  });
});
