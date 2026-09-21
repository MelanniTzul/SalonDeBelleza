import { provideHttpClient } from "@angular/common/http";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { Router, provideRouter } from "@angular/router";

import { environment } from "../../../../environments/environment";
import { AuthResponse } from "../../../core/models/auth.models";
import { LoginPage } from "./login-page";

const respuestaPara = (rol: AuthResponse["usuario"]["rol"]): AuthResponse => ({
  token: "token-de-prueba",
  tipo: "Bearer",
  expiraEnSegundos: 3600,
  usuario: { id: 1, nombre: "Ana", apellido: "R", email: "ana@correo.com", telefono: null, fotoUrl: null, rol, especialidad: null }
});

describe("LoginPage", () => {
  let fixture: ComponentFixture<LoginPage>;
  let http: HttpTestingController;
  let navegar: ReturnType<typeof vi.spyOn>;

  const elemento = (selector: string) => (fixture.nativeElement as HTMLElement).querySelector(selector);
  const texto = () => (fixture.nativeElement as HTMLElement).textContent ?? "";

  const escribir = (selector: string, valor: string) => {
    const campo = elemento(selector) as HTMLInputElement;
    campo.value = valor;
    campo.dispatchEvent(new Event("input"));
  };

  const enviarFormulario = () => {
    (elemento("form") as HTMLFormElement).dispatchEvent(new Event("submit"));
    fixture.detectChanges();
  };

  beforeEach(async () => {
    localStorage.clear();
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [LoginPage],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginPage);
    http = TestBed.inject(HttpTestingController);
    navegar = vi.spyOn(TestBed.inject(Router), "navigateByUrl").mockResolvedValue(true);
    fixture.detectChanges();
  });

  afterEach(() => http.verify());

  it("no llama a la API si el formulario está vacío", () => {
    enviarFormulario();

    http.expectNone(`${environment.apiUrl}/auth/login`);
    expect(texto()).toContain("Escribe tu correo.");
    expect(texto()).toContain("Escribe tu contraseña.");
  });

  it("avisa cuando el correo tiene mal formato", () => {
    escribir("#email", "no-es-correo");
    escribir("#password", "Cliente1234!");
    enviarFormulario();

    http.expectNone(`${environment.apiUrl}/auth/login`);
    expect(texto()).toContain("El formato del correo no es válido.");
  });

  it("envía las credenciales y lleva al panel según el rol", () => {
    escribir("#email", "ana@correo.com");
    escribir("#password", "Cliente1234!");
    enviarFormulario();

    const peticion = http.expectOne(`${environment.apiUrl}/auth/login`);
    expect(peticion.request.body).toEqual({ email: "ana@correo.com", password: "Cliente1234!" });
    peticion.flush(respuestaPara("CLIENTE"));

    expect(navegar).toHaveBeenCalledWith("/mi-cuenta");
  });

  it("lleva al panel de administración cuando el rol es ADMINISTRADOR", () => {
    escribir("#email", "admin@correo.com");
    escribir("#password", "Admin1234!");
    enviarFormulario();

    http.expectOne(`${environment.apiUrl}/auth/login`).flush(respuestaPara("ADMINISTRADOR"));

    expect(navegar).toHaveBeenCalledWith("/admin");
  });

  it("muestra el mensaje de error que devuelve la API", () => {
    escribir("#email", "ana@correo.com");
    escribir("#password", "mala");
    enviarFormulario();

    http.expectOne(`${environment.apiUrl}/auth/login`).flush(
      { mensaje: "Correo o contraseña incorrectos" },
      { status: 401, statusText: "Unauthorized" }
    );
    fixture.detectChanges();

    expect(elemento("[role='alert']")?.textContent).toContain("Correo o contraseña incorrectos");
    expect(navegar).not.toHaveBeenCalled();
  });

  it("permite mostrar y ocultar la contraseña", () => {
    const campo = elemento("#password") as HTMLInputElement;
    expect(campo.type).toBe("password");

    (elemento("[aria-label='Mostrar contraseña']") as HTMLButtonElement).click();
    fixture.detectChanges();

    expect((elemento("#password") as HTMLInputElement).type).toBe("text");
  });
});
