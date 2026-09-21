import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";

import { AuthService } from "../../core/services/auth.service";
import { MenuUsuario } from "../../shared/components/menu-usuario/menu-usuario";

// Envoltorio de las pantallas del cliente y de la estilista.
@Component({
  selector: "app-panel-layout",
  imports: [RouterLink, RouterLinkActive, RouterOutlet, MenuUsuario],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-white">
      <a
        href="#contenido"
        class="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-30 focus:rounded-full focus:bg-wine focus:px-4 focus:py-2 focus:text-[13px] focus:text-white">
        Saltar al contenido
      </a>

      <header class="flex items-center justify-between gap-4 border-b border-line px-6 py-[14px] md:px-8">
        <a routerLink="/" class="font-serif text-[19px] font-semibold text-wine">{{ nombreSalon }}</a>

        <nav aria-label="Secciones" class="hidden gap-1 md:flex">
          @for (enlace of enlaces(); track enlace.ruta) {
            <a
              [routerLink]="enlace.ruta"
              routerLinkActive="bg-blush text-wine"
              [routerLinkActiveOptions]="{ exact: true }"
              class="rounded-full px-4 py-2 text-[13px] text-ink transition hover:bg-ivory">
              {{ enlace.texto }}
            </a>
          }
        </nav>

        <app-menu-usuario />
      </header>

      <main id="contenido" tabindex="-1">
        <router-outlet />
      </main>
    </div>
  `
})
export class PanelLayout {
  private readonly auth = inject(AuthService);

  protected readonly nombreSalon = "Salón de Belleza Familiar";

  protected enlaces(): readonly { ruta: string; texto: string }[] {
    return this.auth.rol() === "ESTILISTA"
      ? [
          { ruta: "/estilista", texto: "Mi agenda" },
          { ruta: "/estilista/horario", texto: "Mi horario" }
        ]
      : [
          { ruta: "/mi-cuenta", texto: "Mis citas" },
          { ruta: "/mi-cuenta/deseos", texto: "Lista de deseos" },
          { ruta: "/agendar", texto: "Agendar cita" }
        ];
  }
}
