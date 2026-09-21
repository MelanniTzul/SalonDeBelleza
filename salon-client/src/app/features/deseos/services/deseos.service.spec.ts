import { provideHttpClient } from "@angular/common/http";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";

import { environment } from "../../../../environments/environment";
import { AuthService } from "../../../core/services/auth.service";
import { DeseosService } from "./deseos.service";

const BASE = `${environment.apiUrl}/cliente/deseos`;

const SERVICIO_DTO = {
  id: 10, slug: "corte-cabello", nombre: "Corte de cabello", descripcion: "", categoria: "cortes", categoriaNombre: "Cortes",
  imagen: null, precio: 150, duracionMinutos: 45, aDomicilio: true, variantes: [], grupoCortes: null, activo: true
};
const PRODUCTO_DTO = {
  id: 20, slug: "cera-mate", marca: "Level 3", nombre: "Cera mate", descripcion: "", categoria: "geles", categoriaNombre: "Geles",
  imagen: "img/x.jpg", imagenDetalle: null, posicionImagen: null, fijacion: null, nivelFijacion: null, acabado: null, tipoAcabado: null,
  precio: 80, beneficios: [], activo: true
};

const sesionComo = (rol: string) => {
  localStorage.setItem("salon.token", "token");
  localStorage.setItem("salon.usuario", JSON.stringify({ id: 3, nombre: "Ana", apellido: "R", email: "ana@correo.com", telefono: null, fotoUrl: null, rol, especialidad: null }));
};

describe("DeseosService", () => {
  let servicio: DeseosService;
  let http: HttpTestingController;

  const configurar = () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    servicio = TestBed.inject(DeseosService);
    http = TestBed.inject(HttpTestingController);
  };

  beforeEach(() => localStorage.clear());
  afterEach(() => http.verify());

  it("un invitado no puede usar la lista y cargar no llama a la API", () => {
    configurar();
    servicio.cargar();

    expect(servicio.puedeUsar()).toBe(false);
    http.expectNone(BASE);
  });

  it("una estilista tampoco tiene lista", () => {
    sesionComo("ESTILISTA");
    configurar();

    expect(servicio.puedeUsar()).toBe(false);
  });

  it("carga la lista del cliente una sola vez", () => {
    sesionComo("CLIENTE");
    configurar();
    servicio.cargar();
    http.expectOne(BASE).flush({ servicios: [SERVICIO_DTO], productos: [PRODUCTO_DTO] });
    servicio.cargar();

    http.expectNone(BASE);
    expect(servicio.total()).toBe(2);
    expect(servicio.tiene("servicio", "corte-cabello")).toBe(true);
    expect(servicio.tiene("producto", "cera-mate")).toBe(true);
    expect(servicio.tiene("producto", "otro")).toBe(false);
  });

  it("alternar sobre algo nuevo hace PUT y recarga", () => {
    sesionComo("CLIENTE");
    configurar();
    servicio.cargar();
    http.expectOne(BASE).flush({ servicios: [], productos: [] });

    let resultado: boolean | undefined;
    servicio.alternar("servicio", "corte-cabello").subscribe(r => (resultado = r));

    const put = http.expectOne(`${BASE}/servicios/corte-cabello`);
    expect(put.request.method).toBe("PUT");
    put.flush(null, { status: 204, statusText: "No Content" });
    http.expectOne(BASE).flush({ servicios: [SERVICIO_DTO], productos: [] });

    expect(resultado).toBe(true);
    expect(servicio.tiene("servicio", "corte-cabello")).toBe(true);
  });

  it("alternar sobre algo guardado hace DELETE y lo quita al instante", () => {
    sesionComo("CLIENTE");
    configurar();
    servicio.cargar();
    http.expectOne(BASE).flush({ servicios: [SERVICIO_DTO], productos: [PRODUCTO_DTO] });

    let resultado: boolean | undefined;
    servicio.alternar("producto", "cera-mate").subscribe(r => (resultado = r));

    expect(servicio.tiene("producto", "cera-mate")).toBe(false);
    const del = http.expectOne(`${BASE}/productos/cera-mate`);
    expect(del.request.method).toBe("DELETE");
    del.flush(null, { status: 204, statusText: "No Content" });

    expect(resultado).toBe(false);
    expect(servicio.total()).toBe(1);
  });

  it("si el DELETE falla, el item vuelve a la lista", () => {
    sesionComo("CLIENTE");
    configurar();
    servicio.cargar();
    http.expectOne(BASE).flush({ servicios: [SERVICIO_DTO], productos: [] });

    servicio.alternar("servicio", "corte-cabello").subscribe({ error: () => undefined });
    http.expectOne(`${BASE}/servicios/corte-cabello`).flush(null, { status: 500, statusText: "Error" });

    expect(servicio.tiene("servicio", "corte-cabello")).toBe(true);
  });

  it("al cerrar sesion la lista se vacia", () => {
    sesionComo("CLIENTE");
    configurar();
    servicio.cargar();
    http.expectOne(BASE).flush({ servicios: [SERVICIO_DTO], productos: [] });
    expect(servicio.total()).toBe(1);

    TestBed.inject(AuthService).logout();
    TestBed.tick();

    expect(servicio.total()).toBe(0);
    expect(servicio.estado()).toBe("inactivo");
  });
});
