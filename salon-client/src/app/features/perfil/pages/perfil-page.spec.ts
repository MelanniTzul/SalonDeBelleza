import { provideHttpClient } from "@angular/common/http";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";
import { ComponentFixture, TestBed } from "@angular/core/testing";

import { environment } from "../../../../environments/environment";
import { Usuario } from "../../../core/models/auth.models";
import { PerfilPage } from "./perfil-page";

const BASE = `${environment.apiUrl}/perfil`;

const CLIENTE: Usuario = {
  id: 3, nombre: "Ana", apellido: "Rodriguez", email: "ana@correo.com",
  telefono: "5555-2020", fotoUrl: null, rol: "CLIENTE", especialidad: null
};

describe("PerfilPage", () => {
  let fixture: ComponentFixture<PerfilPage>;
  let http: HttpTestingController;

  const raiz = () => fixture.nativeElement as HTMLElement;
  const campo = (id: string) => raiz().querySelector<HTMLInputElement>(id)!;
  const escribir = (id: string, valor: string) => {
    campo(id).value = valor;
    campo(id).dispatchEvent(new Event("input"));
  };

  const montar = (usuario: Usuario) => {
    localStorage.clear();
    localStorage.setItem("salon.token", "token");
    localStorage.setItem("salon.usuario", JSON.stringify(usuario));
    fixture = TestBed.createComponent(PerfilPage);
    http = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
    // la pagina refresca el perfil al abrir
    http.expectOne(BASE).flush(usuario);
    fixture.detectChanges();
  };

  beforeEach(async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [PerfilPage],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    }).compileComponents();
  });

  afterEach(() => http.verify());

  it("precarga los datos del usuario y deja el correo solo lectura", () => {
    montar(CLIENTE);

    expect(campo("#p-nombre").value).toBe("Ana");
    expect(campo("#p-telefono").value).toBe("5555-2020");
    expect(campo("#p-email").value).toBe("ana@correo.com");
    expect(campo("#p-email").readOnly).toBe(true);
  });

  it("solo la estilista ve el campo de especialidad", () => {
    montar(CLIENTE);
    expect(raiz().querySelector("#p-especialidad")).toBeNull();

    montar({ ...CLIENTE, rol: "ESTILISTA", especialidad: "Corte" });
    expect(campo("#p-especialidad").value).toBe("Corte");
  });

  it("guarda los datos y avisa", () => {
    montar(CLIENTE);
    escribir("#p-nombre", "Ana Maria");
    raiz().querySelectorAll("form")[0].dispatchEvent(new Event("submit"));

    const peticion = http.expectOne(BASE);
    expect(peticion.request.method).toBe("PUT");
    expect(peticion.request.body).toEqual({ nombre: "Ana Maria", apellido: "Rodriguez", telefono: "5555-2020", especialidad: null });
    peticion.flush({ ...CLIENTE, nombre: "Ana Maria" });
    fixture.detectChanges();

    expect(raiz().querySelector("[role='status']")?.textContent).toContain("guardados");
  });

  it("no manda la contrasena si la confirmacion no coincide", () => {
    montar(CLIENTE);
    escribir("#p-actual", "Cliente1234!");
    escribir("#p-nueva", "Nueva12345");
    escribir("#p-confirmacion", "Otra12345");
    raiz().querySelectorAll("form")[1].dispatchEvent(new Event("submit"));
    fixture.detectChanges();

    http.expectNone(`${BASE}/password`);
    expect(raiz().textContent).toContain("Las contrasenas no coinciden.");
  });

  it("muestra el error si la contrasena actual esta mal, sin cerrar sesion", () => {
    montar(CLIENTE);
    escribir("#p-actual", "mala");
    escribir("#p-nueva", "Nueva12345");
    escribir("#p-confirmacion", "Nueva12345");
    raiz().querySelectorAll("form")[1].dispatchEvent(new Event("submit"));

    http.expectOne(`${BASE}/password`).flush({ mensaje: "La contrasena actual no es correcta" }, { status: 400, statusText: "Bad Request" });
    fixture.detectChanges();

    expect(raiz().querySelector("[role='alert']")?.textContent).toContain("La contrasena actual no es correcta");
    expect(localStorage.getItem("salon.token")).toBe("token");
  });

  it("rechaza en el cliente un archivo que no es imagen sin llamar a la API", () => {
    montar(CLIENTE);
    const input = campo("input[type='file']");
    const archivo = new File(["hola"], "notas.txt", { type: "text/plain" });
    Object.defineProperty(input, "files", { value: [archivo] });
    input.dispatchEvent(new Event("change"));
    fixture.detectChanges();

    http.expectNone(`${BASE}/foto`);
    expect(raiz().querySelector("[role='alert']")?.textContent).toContain("JPG, PNG o WebP");
  });

  it("sube una imagen valida y muestra el boton de quitar", () => {
    montar(CLIENTE);
    const input = campo("input[type='file']");
    Object.defineProperty(input, "files", { value: [new File(["x"], "yo.png", { type: "image/png" })] });
    input.dispatchEvent(new Event("change"));

    http.expectOne(`${BASE}/foto`).flush({ ...CLIENTE, fotoUrl: "uploads/perfiles/yo.png" });
    fixture.detectChanges();

    expect(raiz().querySelector("img")?.getAttribute("src")).toContain("uploads/perfiles/yo.png");
    expect(raiz().textContent).toContain("Quitar");
    expect(raiz().textContent).toContain("Cambiar foto");
  });
});
