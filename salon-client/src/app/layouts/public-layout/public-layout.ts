import { Component } from "@angular/core";
import { RouterLink, RouterOutlet } from "@angular/router";

@Component({
  selector: "app-public-layout",
  imports: [RouterLink, RouterOutlet],
  template: `
    <div class="min-h-screen bg-white">
      <header class="flex items-center justify-between border-b border-line px-8 py-[18px]">
        <a routerLink="/" class="font-serif text-[19px] font-semibold text-wine">{{ nombre }}</a>
        <nav class="hidden gap-7 text-[13px] md:flex">
          <a routerLink="/servicios">Servicios</a>
          <a routerLink="/productos">Productos</a>
          <a routerLink="/ubicacion">Ubicación</a>
        </nav>
        <div class="flex gap-2.5">
          <a routerLink="/login" class="rounded-full border border-wine px-[17px] py-2 text-[13px] font-semibold text-wine">Iniciar sesión</a>
          <a routerLink="/agendar" class="rounded-full bg-wine px-[18px] py-[9px] text-[13px] font-semibold text-white">Agendar cita</a>
        </div>
      </header>
      <router-outlet />
    </div>
  `
})
export class PublicLayout {
  // Nombre del salón: se cambia aquí y se actualiza en todo el sitio
  readonly nombre = "Salón de Belleza Familiar";
}
