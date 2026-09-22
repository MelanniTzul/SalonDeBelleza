import { NgOptimizedImage } from "@angular/common";
import { ChangeDetectionStrategy, Component, computed, inject } from "@angular/core";
import { RouterLink } from "@angular/router";
import { SeccionTitulo } from "../../../shared/components/seccion-titulo";
import { Reveal } from "../../../shared/directives/reveal";
import { LightboxService } from "../../../shared/services/lightbox.service";
import { EQUIPO, Estilista } from "../data/equipo.data";

@Component({
  selector: "app-equipo-salon",
  imports: [NgOptimizedImage, Reveal, RouterLink, SeccionTitulo],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section id="equipo" aria-labelledby="titulo-equipo" class="mx-auto max-w-6xl px-6 py-24 sm:py-28 lg:px-8">
      <div appReveal>
        <app-seccion-titulo eyebrow="Nuestro equipo" titulo="Conoce a tus" acento="estilistas" descripcion="Elige con quién quieres agendar tu cita." idTitulo="titulo-equipo" />
      </div>

      <ul class="mx-auto mt-16 max-w-5xl space-y-20 sm:space-y-24">
        @for (e of equipo; track e.id; let i = $index) {
          <li [appReveal]="i * 100">
            <article class="group grid items-center gap-8 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] md:gap-14 lg:gap-20">
              <div class="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-3xl bg-linear-to-br from-blush to-[#D6D6D6] shadow-xl shadow-wine/15 ring-1 ring-line md:max-w-none">
                @if (e.foto; as foto) {
                  <img [ngSrc]="foto" fill [priority]="i === 0" sizes="(min-width: 768px) 40vw, 90vw" alt="" [style.object-position]="e.posicionFoto" class="object-cover transition duration-700 group-hover:scale-105" />
                  <button type="button" (click)="ampliar(e)" [attr.aria-label]="'Ampliar foto de ' + e.nombre" class="absolute inset-0 cursor-zoom-in focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-white"></button>
                } @else {
                  <div class="grid h-full place-items-center" aria-hidden="true">
                    <span class="grid size-32 place-items-center rounded-full border border-wine/25 bg-white/50 font-serif text-5xl font-semibold text-wine/70">{{ iniciales(e) }}</span>
                  </div>
                }
              </div>

              <div>
                <p class="flex items-center gap-3 text-xs font-semibold tracking-[0.14em] text-wine uppercase">
                  <span aria-hidden="true" class="h-px w-8 bg-gold"></span>{{ e.rol }}
                </p>
                <h3 class="mt-3 font-serif text-3xl leading-tight font-semibold tracking-tight sm:text-4xl">{{ e.nombre }}</h3>

                <div class="mt-6 space-y-4 border-t border-line pt-6 text-base leading-relaxed text-justify hyphens-auto text-muted">
                  @for (parrafo of e.resena; track parrafo) {
                    <p>{{ parrafo }}</p>
                  }
                </div>

                <a
                  routerLink="/agendar"
                  [queryParams]="{ estilista: e.id }"
                  class="mt-8 inline-flex items-center gap-2 rounded-full border border-wine px-6 py-3 text-[13px] font-semibold text-wine transition hover:bg-wine hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wine"
                >
                  Agendar con {{ primerNombre(e) }}
                  <i class="pi pi-arrow-right text-[11px]" aria-hidden="true"></i>
                </a>
              </div>
            </article>
          </li>
        }
      </ul>
    </section>
  `
})
export class EquipoSalon {
  private readonly lightbox = inject(LightboxService);

  readonly equipo = EQUIPO;

  iniciales(e: Estilista): string {
    return e.nombre
      .split(" ")
      .map(p => p[0])
      .slice(0, 2)
      .join("");
  }

  primerNombre(e: Estilista): string {
    return e.nombre.split(" ")[0];
  }

  ampliar(e: Estilista): void {
    if (!e.foto) return;
    this.lightbox.abrir([{ src: e.foto, alt: `Foto de ${e.nombre}`, titulo: `${e.nombre} · ${e.rol}`, descripcion: e.resena }]);
  }
}
