import { NgOptimizedImage } from "@angular/common";
import { ChangeDetectionStrategy, Component, computed, input } from "@angular/core";
import { RouterLink } from "@angular/router";
import { Servicio } from "../models/catalogo.models";

// Ícono del marcador de posición cuando el servicio aún no tiene foto (según la categoría)
const ICONOS: Readonly<Record<string, string>> = {
  color: "pi-palette",
  peinados: "pi-star",
  "cejas-pestanas": "pi-eye",
  maquillaje: "pi-palette"
};
const ICONO_POR_DEFECTO = "pi-star";

// Toda la tarjeta lleva a la página del servicio (el enlace del nombre se extiende con after:absolute).
// "Agendar" y "Ver todos los cortes" quedan por encima (relative z-10) como acciones propias.
@Component({
  selector: "app-servicio-card",
  imports: [NgOptimizedImage, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-wine/10 has-[h3_a:focus-visible]:ring-2 has-[h3_a:focus-visible]:ring-wine">
      <div class="relative aspect-[4/3] overflow-hidden bg-linear-to-br from-blush to-[#D6D6D6]">
        @if (servicio().imagen; as imagen) {
          <img [ngSrc]="imagen" fill [priority]="prioritaria()" sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" alt="" class="object-cover object-[center_30%] transition duration-700 group-hover:scale-105" />
        } @else {
          <span class="grid h-full place-items-center text-wine/35" aria-hidden="true">
            @if (servicio().categoria === "cortes") {
              <svg viewBox="0 0 64 64" class="size-20" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round">
                <path d="M40 9 26 40" />
                <path d="M24 9 38 40" />
                <circle cx="23.5" cy="46.5" r="6.5" />
                <circle cx="40.5" cy="46.5" r="6.5" />
              </svg>
            } @else {
              <i class="pi text-5xl" [class]="icono()"></i>
            }
          </span>
        }
        @if (servicio().aDomicilio) {
          <span class="pointer-events-none absolute top-3 left-3 rounded-full bg-sage px-2.5 py-0.5 text-[11px] font-medium text-white shadow">A domicilio</span>
        }
      </div>
      <div class="flex flex-1 flex-col p-5">
        <p class="mb-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-wine">{{ etiqueta() }}</p>
        <h3 class="text-[15px] font-semibold leading-snug">
          <a [routerLink]="['/servicios', servicio().id]" class="transition group-hover:text-wine after:absolute after:inset-0 after:content-[''] focus-visible:outline-none">{{ servicio().nombre }}</a>
        </h3>
        <p class="mt-1.5 text-xs leading-relaxed text-muted">{{ servicio().descripcion }}</p>
        @if (servicio().incluye; as incluye) {
          <ul class="mt-3 flex flex-wrap gap-1.5 text-[11px]">
            @for (item of incluye; track item) {
              <li class="rounded-full bg-blush px-2.5 py-1 text-wine">{{ item }}</li>
            }
          </ul>
        }
        @if (servicio().grupoCortes; as grupo) {
          <a routerLink="/servicios" [queryParams]="{ cortes: grupo }" fragment="tipos-de-corte" class="relative z-10 mt-3 inline-flex items-center gap-1.5 self-start text-xs font-semibold text-wine hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wine">
            Ver todos los cortes
            <i class="pi pi-arrow-down text-[10px]" aria-hidden="true"></i>
          </a>
        }
        <div class="mt-auto flex items-center justify-between pt-5 text-xs text-muted">
          <span class="flex items-center gap-1.5"><i class="pi pi-clock text-[11px]" aria-hidden="true"></i>{{ duracion() }}</span>
          <span class="text-sm font-bold text-wine">{{ precio() }}</span>
        </div>
        <a
          routerLink="/agendar"
          [queryParams]="{ servicio: servicio().id }"
          class="relative z-10 mt-4 inline-flex items-center justify-center gap-2 rounded-full border border-wine px-4 py-2 text-[13px] font-semibold text-wine transition hover:bg-wine hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wine"
        >
          Agendar
          <i class="pi pi-arrow-right text-[11px]" aria-hidden="true"></i>
        </a>
      </div>
    </article>
  `
})
export class ServicioCard {
  readonly prioritaria = input(false);
  readonly servicio = input.required<Servicio>();

  readonly etiqueta = computed(() => this.servicio().categoriaNombre);

  readonly icono = computed(() => ICONOS[this.servicio().categoria] ?? ICONO_POR_DEFECTO);

  readonly duracion = computed(() => {
    const min = this.servicio().duracionMin;
    return min ? `${min} min` : "Duración a consultar";
  });

  readonly precio = computed(() => {
    const precio = this.servicio().precio;
    return precio ? `Q${precio}` : "Consultar";
  });
}
