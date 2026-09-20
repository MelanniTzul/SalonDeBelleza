import { ChangeDetectionStrategy, Component } from "@angular/core";
import { RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";

import { MenuUsuario } from "../../shared/components/menu-usuario/menu-usuario";

// Panel del admin: barra lateral vino oscuro, como el mockup 06.
@Component({
  selector: "app-admin-layout",
  imports: [RouterLink, RouterLinkActive, RouterOutlet, MenuUsuario],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-white md:grid md:grid-cols-[210px_1fr]">
      <a
        href="#contenido"
        class="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-30 focus:rounded-full focus:bg-wine focus:px-4 focus:py-2 focus:text-[13px] focus:text-white">
        Saltar al contenido
      </a>

      <aside class="bg-wine-dark py-6 text-white md:min-h-screen">
        <a routerLink="/" class="block px-6 pb-5 font-serif text-[19px] font-semibold text-white">
          {{ nombreSalon }}
        </a>
        <nav aria-label="Menú de administración" class="flex overflow-x-auto md:block">
          @for (enlace of enlaces; track enlace.ruta) {
            <a
              [routerLink]="enlace.ruta"
              routerLinkActive="bg-white/10 !text-white border-l-[3px] border-gold font-semibold"
              [routerLinkActiveOptions]="{ exact: enlace.exacto }"
              class="whitespace-nowrap px-6 py-[11px] text-[13px] text-[#E9D9DE] transition hover:bg-white/5 md:block">
              {{ enlace.texto }}
            </a>
          }
        </nav>
      </aside>

      <div class="flex min-w-0 flex-col">
        <header class="flex items-center justify-between gap-4 border-b border-line px-6 py-[14px] md:px-8">
          <p class="text-xs font-semibold uppercase tracking-[0.14em] text-wine">Panel de administración</p>
          <app-menu-usuario />
        </header>
        <main id="contenido" tabindex="-1" class="min-w-0 flex-1">
          <router-outlet />
        </main>
      </div>
    </div>
  `
})
export class AdminLayout {
  protected readonly nombreSalon = "Salón de Belleza Familiar";

  protected readonly enlaces = [
    { ruta: "/admin", texto: "Panel", exacto: true },
    { ruta: "/admin/citas", texto: "Citas", exacto: false },
    { ruta: "/admin/usuarios", texto: "Usuarios", exacto: false },
    { ruta: "/admin/catalogo", texto: "Servicios y productos", exacto: false },
    { ruta: "/admin/reportes", texto: "Reportes", exacto: false }
  ];
}
