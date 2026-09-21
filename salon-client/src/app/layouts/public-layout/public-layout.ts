import { DOCUMENT, NgOptimizedImage } from "@angular/common";
import { ChangeDetectionStrategy, Component, computed, inject, signal } from "@angular/core";
import { RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { DIRECCION_SALON, SALON } from "../../core/config/salon.config";
import { Lightbox } from "../../shared/components/lightbox";

interface EnlaceMenu {
  ruta: string;
  texto: string;
  fragmento?: string;
}

// Desplazamiento (px) a partir del cual aparece el botón de volver arriba
const UMBRAL_SUBIR = 700;

@Component({
  selector: "app-public-layout",
  imports: [Lightbox, NgOptimizedImage, RouterLink, RouterLinkActive, RouterOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { "(window:scroll)": "alDesplazar()" },
  template: `
    <div class="flex min-h-screen flex-col bg-ivory">
      <button type="button" (click)="irAlContenido()" class="fixed top-3 left-3 z-50 -translate-y-20 rounded-full bg-wine px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition focus:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold">
        Saltar al contenido
      </button>

      <header class="sticky top-0 z-30 border-b border-line bg-ivory/90 backdrop-blur">
        <div class="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3.5 lg:px-8">
          <a routerLink="/" (click)="cerrarMenu()" class="flex items-center gap-2.5 font-serif text-base font-semibold text-wine sm:text-[19px]">
            <img ngSrc="favicon.svg" alt="" width="34" height="34" class="size-8 sm:size-[34px]" />
            {{ nombre }}
          </a>
          <nav aria-label="Principal" class="hidden gap-8 text-[13px] font-medium md:flex">
            @for (e of enlaces; track e.texto) {
              @if (e.fragmento) {
                <a [routerLink]="e.ruta" [fragment]="e.fragmento" class="text-ink transition hover:text-wine">{{ e.texto }}</a>
              } @else {
                <a [routerLink]="e.ruta" routerLinkActive="text-wine!" class="text-ink transition hover:text-wine">{{ e.texto }}</a>
              }
            }
          </nav>
          <div class="flex items-center gap-2.5">
            <a routerLink="/login" class="hidden rounded-full border border-wine px-[17px] py-2 text-[13px] font-semibold text-wine transition hover:bg-blush md:inline-block">Iniciar sesión</a>
            <a routerLink="/agendar" class="whitespace-nowrap rounded-full bg-wine px-[18px] py-[9px] text-[13px] font-semibold text-white transition hover:bg-wine-dark">Agendar cita</a>
            <button
              type="button"
              (click)="alternarMenu()"
              [attr.aria-expanded]="menuAbierto()"
              aria-controls="menu-movil"
              aria-label="Menú de navegación"
              class="grid size-10 place-items-center rounded-full border border-line bg-white text-wine md:hidden"
            >
              <i class="pi" [class.pi-bars]="!menuAbierto()" [class.pi-times]="menuAbierto()" aria-hidden="true"></i>
            </button>
          </div>
        </div>

        @if (menuAbierto()) {
          <nav id="menu-movil" aria-label="Menú móvil" class="border-t border-line bg-ivory md:hidden">
            <div class="mx-auto flex max-w-6xl flex-col px-6 py-2">
              @for (e of enlaces; track e.texto) {
                @if (e.fragmento) {
                  <a [routerLink]="e.ruta" [fragment]="e.fragmento" (click)="cerrarMenu()" class="border-b border-line/70 py-3.5 text-sm font-medium text-ink">{{ e.texto }}</a>
                } @else {
                  <a [routerLink]="e.ruta" routerLinkActive="text-wine!" (click)="cerrarMenu()" class="border-b border-line/70 py-3.5 text-sm font-medium text-ink">{{ e.texto }}</a>
                }
              }
              <a routerLink="/login" (click)="cerrarMenu()" class="py-3.5 text-sm font-semibold text-wine">Iniciar sesión</a>
            </div>
          </nav>
        }
      </header>

      <main id="contenido" tabindex="-1" class="flex-1 outline-none">
        <router-outlet />
      </main>

      <footer class="bg-wine-dark text-white/75">
        <div class="h-px bg-linear-to-r from-transparent via-gold to-transparent"></div>
        <div class="mx-auto grid max-w-6xl gap-10 px-6 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr] lg:px-8">
          <div>
            <p class="mb-3 flex items-center gap-2.5 font-serif text-xl font-semibold text-white">
              <img ngSrc="favicon.svg" alt="" width="30" height="30" class="size-[30px]" />
              {{ nombre }}
            </p>
            <p class="max-w-xs text-sm leading-relaxed">{{ eslogan }} Cortes, color, peinados, cejas y pestañas, y maquillaje, en el salón o a domicilio.</p>
          </div>

          <nav aria-label="Explorar">
            <p class="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-gold">Explora</p>
            <ul class="space-y-2.5 text-sm">
              <li><a routerLink="/servicios" class="transition hover:text-white">Servicios</a></li>
              <li><a routerLink="/" fragment="tipos-de-corte" class="transition hover:text-white">Cortes de cabello</a></li>
              <li><a routerLink="/productos" class="transition hover:text-white">Productos</a></li>
              <li><a routerLink="/agendar" class="transition hover:text-white">Agendar cita</a></li>
            </ul>
          </nav>

          <div>
            <p class="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-gold">Visítanos</p>
            <ul class="space-y-2.5 text-sm">
              <li class="flex items-center gap-2.5"><i class="pi pi-map-marker text-gold" aria-hidden="true"></i>{{ direccion }}</li>
              <li class="flex items-center gap-2.5"><i class="pi pi-clock text-gold" aria-hidden="true"></i>{{ horario }}, con cita</li>
              <li class="flex items-center gap-2.5"><i class="pi pi-home text-gold" aria-hidden="true"></i>Servicio a domicilio</li>
              @if (telefono) {
                <li class="flex items-center gap-2.5"><i class="pi pi-phone text-gold" aria-hidden="true"></i>{{ telefono }}</li>
              }
            </ul>
          </div>
        </div>
        <div class="border-t border-white/10">
          <p class="mx-auto max-w-6xl px-6 py-5 text-xs text-white/60 lg:px-8">© {{ nombre }}. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>

    <div class="fixed right-4 bottom-4 z-20 flex flex-col items-end gap-3 sm:right-6 sm:bottom-6">
      @if (enlaceWhatsapp(); as enlace) {
        <a [href]="enlace" target="_blank" rel="noopener" aria-label="Escríbenos por WhatsApp" class="grid size-14 place-items-center rounded-full bg-sage text-2xl text-white shadow-xl shadow-ink/25 transition hover:-translate-y-0.5 hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage">
          <i class="pi pi-whatsapp" aria-hidden="true"></i>
        </a>
      }
      @if (mostrarSubir()) {
        <button type="button" (click)="subir()" aria-label="Volver arriba" class="grid size-11 place-items-center rounded-full border border-line bg-white text-wine shadow-lg shadow-ink/15 transition hover:bg-wine hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wine">
          <i class="pi pi-arrow-up" aria-hidden="true"></i>
        </button>
      }
    </div>

    <app-lightbox />
  `
})
export class PublicLayout {
  private readonly documento = inject(DOCUMENT);

  // Nombre del salón y demás datos: se cambian en core/config/salon.config.ts
  readonly nombre = SALON.nombre;
  readonly eslogan = SALON.eslogan;
  readonly horario = SALON.horario;
  readonly telefono = SALON.telefono;

  readonly direccion = DIRECCION_SALON;
  readonly enlaceWhatsapp = computed(() =>
    SALON.whatsapp ? `https://wa.me/${SALON.whatsapp}?text=${encodeURIComponent("Hola, quiero agendar una cita.")}` : null
  );

  readonly enlaces: readonly EnlaceMenu[] = [
    { ruta: "/servicios", texto: "Servicios" },
    { ruta: "/productos", texto: "Productos" },
    { ruta: "/", texto: "Ubicación", fragmento: "visitanos" }
  ];

  readonly menuAbierto = signal(false);
  readonly mostrarSubir = signal(false);

  alternarMenu(): void {
    this.menuAbierto.update(abierto => !abierto);
  }

  cerrarMenu(): void {
    this.menuAbierto.set(false);
  }

  alDesplazar(): void {
    const mostrar = (this.documento.defaultView?.scrollY ?? 0) > UMBRAL_SUBIR;
    if (mostrar !== this.mostrarSubir()) this.mostrarSubir.set(mostrar);
  }

  subir(): void {
    this.documento.defaultView?.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Enlace "saltar al contenido" para navegación con teclado
  irAlContenido(): void {
    this.documento.getElementById("contenido")?.focus();
  }
}
