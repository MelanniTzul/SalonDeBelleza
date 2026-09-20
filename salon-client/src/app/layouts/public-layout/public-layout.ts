import { ChangeDetectionStrategy, Component, computed, inject } from "@angular/core";
import { RouterLink, RouterOutlet } from "@angular/router";

import { RUTA_INICIO_POR_ROL } from "../../core/models/auth.models";
import { AuthService } from "../../core/services/auth.service";
import { MenuUsuario } from "../../shared/components/menu-usuario/menu-usuario";

@Component({
  selector: "app-public-layout",
  imports: [RouterLink, RouterOutlet, MenuUsuario],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-white">
      <header class="flex items-center justify-between gap-4 border-b border-line px-8 py-[18px]">
        <a routerLink="/" class="font-serif text-[19px] font-semibold text-wine">{{ nombre }}</a>
        <nav aria-label="Secciones del sitio" class="hidden gap-7 text-[13px] md:flex">
          <a routerLink="/servicios">Servicios</a>
          <a routerLink="/productos">Productos</a>
          <a routerLink="/ubicacion">Ubicación</a>
        </nav>
        @if (auth.autenticado()) {
          <div class="flex items-center gap-2.5">
            <a
              [routerLink]="rutaPanel()"
              class="hidden rounded-full border border-wine px-[17px] py-2 text-[13px] font-semibold text-wine transition hover:bg-blush sm:inline-block">
              Mi panel
            </a>
            <app-menu-usuario />
          </div>
        } @else {
          <div class="flex gap-2.5">
            <a
              routerLink="/login"
              class="rounded-full border border-wine px-[17px] py-2 text-[13px] font-semibold text-wine transition hover:bg-blush">
              Iniciar sesión
            </a>
            <a
              routerLink="/agendar"
              class="rounded-full bg-wine px-[18px] py-[9px] text-[13px] font-semibold text-white transition hover:bg-wine-dark">
              Agendar cita
            </a>
          </div>
        }
      </header>
      <router-outlet />
    </div>
  `
})
export class PublicLayout {
  protected readonly auth = inject(AuthService);

  // Nombre del salón: se cambia aquí y se actualiza en todo el sitio
  readonly nombre = "Salón de Belleza Familiar";

  protected readonly rutaPanel = computed(() => {
    const rol = this.auth.rol();
    return rol ? RUTA_INICIO_POR_ROL[rol] : "/login";
  });
}
