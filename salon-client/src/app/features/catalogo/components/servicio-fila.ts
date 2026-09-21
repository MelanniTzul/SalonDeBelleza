import { NgOptimizedImage } from "@angular/common";
import { ChangeDetectionStrategy, Component, computed, input } from "@angular/core";
import { RouterLink } from "@angular/router";
import { BotonDeseo } from "../../deseos/components/boton-deseo";
import { Servicio } from "../models/catalogo.models";

// Fila del menú de servicios: miniatura, nombre, descripción, precio y duración.
// Toda la fila lleva a la página del servicio (el enlace del nombre se extiende con after:absolute);
// "Agendar" y "Ver todos los cortes" quedan por encima (relative z-10) como acciones propias.
@Component({
  selector: "app-servicio-fila",
  imports: [NgOptimizedImage, RouterLink, BotonDeseo],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="group relative grid grid-cols-[auto_1fr] gap-x-4 gap-y-4 rounded-2xl border border-line bg-white p-4 transition duration-300 hover:border-wine/40 hover:shadow-lg hover:shadow-wine/10 has-[h3_a:focus-visible]:ring-2 has-[h3_a:focus-visible]:ring-wine sm:grid-cols-[auto_1fr_auto] sm:gap-x-5 sm:p-5">
      <div class="relative size-20 shrink-0 overflow-hidden rounded-xl bg-linear-to-br from-blush to-[#D6D6D6] sm:size-24">
        @if (servicio().imagen; as imagen) {
          <img [ngSrc]="imagen" fill alt="" class="object-cover object-[center_30%] transition duration-700 group-hover:scale-110" />
        } @else {
          <svg viewBox="0 0 64 64" class="absolute inset-0 m-auto size-9 text-wine/35" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" aria-hidden="true">
            <path d="M40 9 26 40" />
            <path d="M24 9 38 40" />
            <circle cx="23.5" cy="46.5" r="6.5" />
            <circle cx="40.5" cy="46.5" r="6.5" />
          </svg>
        }
      </div>

      <div class="min-w-0">
        <div class="flex flex-wrap items-center gap-x-3 gap-y-1">
          <h3 class="font-serif text-lg leading-snug font-semibold">
            <a [routerLink]="['/servicios', servicio().id]" class="transition group-hover:text-wine after:absolute after:inset-0 after:content-[''] focus-visible:outline-none">{{ servicio().nombre }}</a>
          </h3>
          @if (servicio().aDomicilio) {
            <span class="rounded-full bg-sage px-2.5 py-0.5 text-[11px] font-medium text-white">A domicilio</span>
          }
        </div>
        <p class="mt-1.5 text-sm leading-relaxed text-muted">{{ servicio().descripcion }}</p>
        @if (servicio().incluye; as incluye) {
          <ul class="mt-3 flex flex-wrap gap-1.5 text-[11px]">
            @for (item of incluye; track item) {
              <li class="rounded-full bg-blush px-2.5 py-1 text-wine">{{ item }}</li>
            }
          </ul>
        }
        @if (servicio().grupoCortes; as grupo) {
          <a routerLink="/servicios" [queryParams]="{ cortes: grupo }" fragment="tipos-de-corte" class="relative z-10 mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-wine hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wine">
            Ver todos los cortes
            <i class="pi pi-arrow-down text-[10px]" aria-hidden="true"></i>
          </a>
        }
      </div>

      <div class="col-span-2 flex items-center justify-between gap-4 border-t border-line/70 pt-4 sm:col-span-1 sm:flex-col sm:items-end sm:border-t-0 sm:pt-0">
        <div class="sm:text-right">
          <p class="font-serif text-xl font-semibold text-wine">{{ precio() }}</p>
          <p class="mt-0.5 flex items-center gap-1.5 text-xs text-muted sm:justify-end">
            <i class="pi pi-clock text-[11px]" aria-hidden="true"></i>{{ duracion() }}
          </p>
        </div>
        <div class="relative z-10 flex items-center gap-2">
          <app-boton-deseo tipo="servicio" [slug]="servicio().id" />
          <a
            routerLink="/agendar"
            [queryParams]="{ servicio: servicio().id }"
            class="inline-flex items-center gap-2 rounded-full bg-wine px-5 py-2 text-[13px] font-semibold text-white transition hover:bg-wine-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wine"
          >
            Agendar
            <i class="pi pi-arrow-right text-[11px]" aria-hidden="true"></i>
          </a>
        </div>
      </div>
    </article>
  `
})
export class ServicioFila {
  readonly servicio = input.required<Servicio>();

  readonly duracion = computed(() => {
    const min = this.servicio().duracionMin;
    return min ? `${min} min` : "Duración a consultar";
  });

  readonly precio = computed(() => {
    const precio = this.servicio().precio;
    return precio ? `Q${precio}` : "Consultar";
  });
}
