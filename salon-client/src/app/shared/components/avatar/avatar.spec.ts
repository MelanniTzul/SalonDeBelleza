import { Component, signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";

import { API_URL } from "../../../core/config/api.config";
import { Usuario } from "../../../core/models/auth.models";
import { Avatar } from "./avatar";

const USUARIO: Usuario = {
  id: 1, nombre: "Ana", apellido: "Rodriguez", email: "a@b.com",
  telefono: null, fotoUrl: null, rol: "CLIENTE", especialidad: null
};

@Component({
  imports: [Avatar],
  template: `<app-avatar [usuario]="usuario()" [tamanio]="48" />`
})
class Anfitrion {
  readonly usuario = signal<Usuario | null>(USUARIO);
}

describe("Avatar", () => {
  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [Anfitrion],
      providers: [{ provide: API_URL, useValue: "http://api.test" }]
    });
  });

  it("muestra iniciales cuando no hay foto", () => {
    const fixture = TestBed.createComponent(Anfitrion);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;

    expect(el.querySelector("img")).toBeNull();
    expect(el.querySelector("[role='img']")?.textContent?.trim()).toBe("AR");
  });

  it("muestra la foto apuntando a la API cuando hay fotoUrl", () => {
    const fixture = TestBed.createComponent(Anfitrion);
    fixture.componentInstance.usuario.set({ ...USUARIO, fotoUrl: "uploads/perfiles/x.jpg" });
    fixture.detectChanges();
    const img = (fixture.nativeElement as HTMLElement).querySelector("img");

    expect(img?.getAttribute("src")).toBe("http://api.test/uploads/perfiles/x.jpg");
    expect(img?.getAttribute("alt")).toBe("Foto de Ana Rodriguez");
    expect(img?.style.width).toBe("48px");
  });
});
