import { provideHttpClient } from "@angular/common/http";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";
import { Component } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { Router, provideRouter } from "@angular/router";

import { environment } from "../../../../environments/environment";
import { BotonDeseo } from "./boton-deseo";

const BASE = `${environment.apiUrl}/cliente/deseos`;

@Component({
  imports: [BotonDeseo],
  template: `<a href="/x"><app-boton-deseo tipo="producto" slug="cera-mate" /></a>`
})
class Anfitrion {}

const sesionComo = (rol: string) => {
  localStorage.setItem("salon.token", "token");
  localStorage.setItem("salon.usuario", JSON.stringify({ id: 3, nombre: "Ana", apellido: "R", email: "ana@correo.com", telefono: null, fotoUrl: null, rol, especialidad: null }));
};

describe("BotonDeseo", () => {
  let fixture: ComponentFixture<Anfitrion>;
  let http: HttpTestingController;

  const boton = () => (fixture.nativeElement as HTMLElement).querySelector("button");

  const montar = () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [Anfitrion],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()]
    });
    fixture = TestBed.createComponent(Anfitrion);
    http = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  };

  beforeEach(() => localStorage.clear());
  afterEach(() => http.verify());

  it("un invitado ve el corazon y al tocarlo va al login con retorno", () => {
    montar();
    const navegar = vi.spyOn(TestBed.inject(Router), "navigate").mockResolvedValue(true);

    expect(boton()).not.toBeNull();
    boton()!.click();

    expect(navegar).toHaveBeenCalledWith(["/login"], { queryParams: { redirigir: expect.any(String) } });
    http.expectNone(`${BASE}/productos/cera-mate`);
  });

  it("una estilista no ve el corazon", () => {
    sesionComo("ESTILISTA");
    montar();

    expect(boton()).toBeNull();
  });

  it("un cliente lo guarda y el corazon se llena", () => {
    sesionComo("CLIENTE");
    montar();
    http.expectOne(BASE).flush({ servicios: [], productos: [] });
    fixture.detectChanges();
    expect(boton()!.getAttribute("aria-pressed")).toBe("false");

    boton()!.click();
    http.expectOne(`${BASE}/productos/cera-mate`).flush(null, { status: 204, statusText: "No Content" });
    http.expectOne(BASE).flush({ servicios: [], productos: [{
      id: 20, slug: "cera-mate", marca: "Level 3", nombre: "Cera mate", descripcion: "", categoria: "geles", categoriaNombre: "Geles",
      imagen: "img/x.jpg", imagenDetalle: null, posicionImagen: null, fijacion: null, nivelFijacion: null, acabado: null, tipoAcabado: null,
      precio: 80, beneficios: [], activo: true
    }] });
    fixture.detectChanges();

    expect(boton()!.getAttribute("aria-pressed")).toBe("true");
    expect(boton()!.querySelector("i")?.className).toContain("pi-heart-fill");
  });

  it("el click no navega por el enlace de la tarjeta", () => {
    sesionComo("CLIENTE");
    montar();
    http.expectOne(BASE).flush({ servicios: [], productos: [] });

    const evento = new MouseEvent("click", { bubbles: true, cancelable: true });
    boton()!.dispatchEvent(evento);

    expect(evento.defaultPrevented).toBe(true);
    http.expectOne(`${BASE}/productos/cera-mate`).flush(null, { status: 204, statusText: "No Content" });
    http.expectOne(BASE).flush({ servicios: [], productos: [] });
  });
});
