import { provideHttpClient } from "@angular/common/http";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";
import { ComponentFixture, TestBed } from "@angular/core/testing";

import { environment } from "../../../../environments/environment";
import { UsuarioForm } from "./usuario-form";

const BASE = `${environment.apiUrl}/admin/usuarios`;

describe("UsuarioForm", () => {
  let fixture: ComponentFixture<UsuarioForm>;
  let http: HttpTestingController;

  const raiz = () => fixture.nativeElement as HTMLElement;
  const opcionesDeRol = () =>
    [...raiz().querySelectorAll("#f-rol option")].map(o => (o as HTMLOptionElement).value);

  beforeEach(async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [UsuarioForm],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    }).compileComponents();

    fixture = TestBed.createComponent(UsuarioForm);
    http = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => http.verify());

  it("no ofrece crear administradores", () => {
    expect(opcionesDeRol()).toEqual(["ESTILISTA", "CLIENTE"]);
    expect(opcionesDeRol()).not.toContain("ADMINISTRADOR");
  });

  it("arranca en estilista y muestra el campo de especialidad", () => {
    expect(raiz().querySelector<HTMLSelectElement>("#f-rol")?.value).toBe("ESTILISTA");
    expect(raiz().querySelector("#f-especialidad")).not.toBeNull();
  });

  it("esconde la especialidad si el rol es cliente", () => {
    const select = raiz().querySelector<HTMLSelectElement>("#f-rol")!;
    select.value = "CLIENTE";
    select.dispatchEvent(new Event("change"));
    fixture.detectChanges();

    expect(raiz().querySelector("#f-especialidad")).toBeNull();
  });

  it("no llama a la API si faltan campos", () => {
    raiz().querySelector("form")!.dispatchEvent(new Event("submit"));
    fixture.detectChanges();

    http.expectNone(BASE);
    expect(raiz().textContent).toContain("Escribe el nombre.");
  });

  it("manda el alta con el rol y la especialidad elegidos", () => {
    const escribir = (id: string, valor: string) => {
      const campo = raiz().querySelector<HTMLInputElement>(id)!;
      campo.value = valor;
      campo.dispatchEvent(new Event("input"));
    };
    escribir("#f-nombre", "Karla");
    escribir("#f-apellido", "Ruiz");
    escribir("#f-email", "karla@salon.com");
    escribir("#f-password", "Karla12345");
    escribir("#f-especialidad", "Unas");
    fixture.detectChanges();

    raiz().querySelector("form")!.dispatchEvent(new Event("submit"));

    const peticion = http.expectOne(BASE);
    expect(peticion.request.body).toEqual({
      nombre: "Karla",
      apellido: "Ruiz",
      email: "karla@salon.com",
      telefono: null,
      password: "Karla12345",
      rol: "ESTILISTA",
      especialidad: "Unas"
    });
    peticion.flush({});
  });
});
