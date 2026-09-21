import { ChangeDetectionStrategy, Component, computed, inject } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import { RouterLink } from "@angular/router";
import { ENLACE_MAPA, SALON } from "../../../core/config/salon.config";
import { SeccionTitulo } from "../../../shared/components/seccion-titulo";
import { Reveal } from "../../../shared/directives/reveal";

@Component({
  selector: "app-visitanos",
  imports: [Reveal, RouterLink, SeccionTitulo],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section id="visitanos" aria-labelledby="titulo-visitanos" class="mx-auto max-w-6xl px-6 pb-24 lg:px-8">
      <div appReveal class="overflow-hidden rounded-3xl bg-white shadow-sm shadow-ink/5 ring-1 ring-line md:grid md:grid-cols-2">
        <div class="p-8 sm:p-12">
          <app-seccion-titulo eyebrow="Ubicación y horarios" titulo="Te esperamos en" [acento]="salon.municipio" [centrado]="false" idTitulo="titulo-visitanos" />

          <dl class="mt-8 space-y-6">
            @for (d of datos(); track d.titulo) {
              <div class="flex gap-4">
                <span class="grid size-11 shrink-0 place-items-center rounded-full bg-blush text-wine">
                  <i class="pi" [class]="d.icono" aria-hidden="true"></i>
                </span>
                <div>
                  <dt class="text-xs font-semibold uppercase tracking-[0.12em] text-muted">{{ d.titulo }}</dt>
                  <dd class="mt-0.5 font-serif text-lg font-semibold leading-snug">{{ d.valor }}</dd>
                  @if (d.detalle) {
                    <dd class="text-xs text-muted">{{ d.detalle }}</dd>
                  }
                </div>
              </div>
            }
          </dl>

          <div class="mt-9 flex flex-wrap gap-3">
            <a routerLink="/agendar" class="inline-flex items-center gap-2 rounded-full bg-wine px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-wine/25 transition hover:-translate-y-0.5 hover:bg-wine-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wine">
              Agendar cita
              <i class="pi pi-arrow-right text-xs" aria-hidden="true"></i>
            </a>
            <a [href]="enlaceMapa" target="_blank" rel="noopener" class="inline-flex items-center gap-2 rounded-full border border-wine/40 px-6 py-3 text-sm font-semibold text-wine transition hover:border-wine hover:bg-blush focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wine">
              <i class="pi pi-map" aria-hidden="true"></i>
              Cómo llegar
            </a>
            @if (enlaceWhatsapp(); as enlace) {
              <a [href]="enlace" target="_blank" rel="noopener" class="inline-flex items-center gap-2 rounded-full border border-sage px-6 py-3 text-sm font-semibold text-sage transition hover:bg-sage hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage">
                <i class="pi pi-whatsapp" aria-hidden="true"></i>
                Escríbenos por WhatsApp
              </a>
            }
          </div>
        </div>

        @if (mapa(); as url) {
          <iframe [src]="url" title="Mapa con la ubicación del salón" loading="lazy" referrerpolicy="no-referrer-when-downgrade" class="h-80 w-full border-0 md:h-full md:min-h-[26rem]"></iframe>
        } @else {
          <div class="relative grid min-h-72 place-items-center overflow-hidden bg-linear-to-br from-wine to-wine-dark p-10 text-center text-white">
            <div aria-hidden="true" class="absolute -top-16 -right-12 size-56 rounded-full border border-gold/40"></div>
            <div aria-hidden="true" class="absolute -bottom-20 -left-10 size-64 rounded-full border border-gold/25"></div>
            <div class="relative">
              <svg viewBox="0 0 64 64" class="mx-auto mb-5 size-16 text-gold" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" aria-hidden="true">
                <path d="M40 9 26 40" />
                <path d="M24 9 38 40" />
                <circle cx="23.5" cy="46.5" r="6.5" />
                <circle cx="40.5" cy="46.5" r="6.5" />
              </svg>
              <p class="font-serif text-2xl font-semibold">{{ salon.nombre }}</p>
              <p class="mt-2 text-sm text-white/80">{{ salon.eslogan }}</p>
            </div>
          </div>
        }
      </div>
    </section>
  `
})
export class Visitanos {
  private readonly sanitizer = inject(DomSanitizer);

  readonly salon = SALON;
  readonly enlaceMapa = ENLACE_MAPA;

  readonly datos = computed(() => {
    const items = [
      { icono: "pi-clock", titulo: "Horario", valor: SALON.horario, detalle: "Atención con cita previa" },
      { icono: "pi-map-marker", titulo: "Ubicación", valor: `${SALON.canton}, ${SALON.municipio}`, detalle: SALON.zona },
      { icono: "pi-home", titulo: "A domicilio", valor: "Llevamos el salón a tu casa", detalle: "Consulta la cobertura al agendar" }
    ];
    if (SALON.telefono) items.push({ icono: "pi-phone", titulo: "Teléfono", valor: SALON.telefono, detalle: "" });
    return items;
  });

  readonly enlaceWhatsapp = computed(() =>
    SALON.whatsapp ? `https://wa.me/${SALON.whatsapp}?text=${encodeURIComponent("Hola, quiero agendar una cita.")}` : null
  );

  // La URL viene de la configuración del salón (contenido propio), no de datos de usuarios
  readonly mapa = computed(() => (SALON.mapaEmbedUrl ? this.sanitizer.bypassSecurityTrustResourceUrl(SALON.mapaEmbedUrl) : null));
}
