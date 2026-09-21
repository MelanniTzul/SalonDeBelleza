import { NgOptimizedImage } from "@angular/common";
import { ChangeDetectionStrategy, Component, computed, inject, signal } from "@angular/core";
import { RouterLink } from "@angular/router";
import { EstadoCarga } from "../../../shared/components/estado-carga";
import { FiltroChips, OpcionFiltro } from "../../../shared/components/filtro-chips";
import { SeccionTitulo } from "../../../shared/components/seccion-titulo";
import { Reveal } from "../../../shared/directives/reveal";
import { LightboxService } from "../../../shared/services/lightbox.service";
import { Corte } from "../models/catalogo.models";
import { CatalogoService } from "../services/catalogo.service";

const CUALQUIERA = "cualquiera";

// Peso de cada respuesta al puntuar qué corte se parece más a lo que la persona busca
const PESO_LARGO = 3;
const PESO_ACABADO = 2;
const PESO_FLEQUILLO = 2;
const MAX_RECOMENDADOS = 3;

interface Recomendacion {
  corte: Corte;
  ideal: boolean;
}

@Component({
  selector: "app-buscador-corte",
  imports: [EstadoCarga, FiltroChips, NgOptimizedImage, Reveal, RouterLink, SeccionTitulo],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (catalogo.cortesListos()) {
    <section aria-labelledby="titulo-buscador" class="rounded-3xl bg-linear-to-br from-blush/70 to-white px-5 py-12 ring-1 ring-line sm:px-10">
      <div appReveal class="mb-10">
        <app-seccion-titulo
          eyebrow="Guía rápida"
          titulo="Encuentra tu corte"
          acento="ideal"
          descripcion="¿No sabes cuál elegir? Cuéntanos qué buscas y te mostramos los cortes que más se parecen. Tu estilista te asesora según tu tipo de cabello."
          idTitulo="titulo-buscador"
        />
      </div>

      <div class="mx-auto grid max-w-4xl gap-7">
        <div>
          <p class="mb-2.5 text-xs font-semibold tracking-[0.12em] text-muted uppercase"><span class="text-wine">1</span> · ¿Qué largo prefieres?</p>
          <app-filtro-chips descripcion="Largo del corte" [opciones]="opcionesLargo" [activa]="largo()" (cambia)="largo.set($event)" />
        </div>
        <div>
          <p class="mb-2.5 text-xs font-semibold tracking-[0.12em] text-muted uppercase"><span class="text-wine">2</span> · ¿Qué acabado te gusta?</p>
          <app-filtro-chips descripcion="Acabado del corte" [opciones]="opcionesAcabado" [activa]="acabado()" (cambia)="acabado.set($event)" />
        </div>
        <div>
          <p class="mb-2.5 text-xs font-semibold tracking-[0.12em] text-muted uppercase"><span class="text-wine">3</span> · ¿Con flequillo?</p>
          <app-filtro-chips descripcion="Flequillo" [opciones]="opcionesFlequillo" [activa]="flequillo()" (cambia)="flequillo.set($event)" />
        </div>
      </div>

      <div class="mx-auto mt-10 max-w-4xl" aria-live="polite">
        @if (!hayPreferencias()) {
          <p class="rounded-2xl border border-dashed border-wine/30 bg-white/70 px-6 py-8 text-center text-sm text-muted">
            <i class="pi pi-arrow-up mr-2 text-wine" aria-hidden="true"></i>Elige al menos una opción y aquí aparecerán los cortes recomendados.
          </p>
        } @else if (!recomendados().length) {
          <div class="rounded-2xl border border-dashed border-wine/30 bg-white/70 px-6 py-8 text-center text-sm text-muted">
            <p>No encontramos un corte que coincida con esa combinación. Prueba cambiando alguna opción, o coméntaselo a tu estilista al agendar.</p>
            <button type="button" (click)="reiniciar()" class="mt-4 text-sm font-semibold text-wine hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wine">Empezar de nuevo</button>
          </div>
        } @else {
          <div class="mb-5 flex flex-wrap items-center justify-between gap-3">
            <p class="font-serif text-xl font-semibold">Te recomendamos</p>
            <button type="button" (click)="reiniciar()" class="text-sm font-semibold text-wine hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wine">Empezar de nuevo</button>
          </div>
          <ul class="grid gap-5 sm:grid-cols-3">
            @for (r of recomendados(); track r.corte.id; let i = $index) {
              <li>
                <article class="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-wine/10">
                  <div class="relative aspect-[4/5] overflow-hidden bg-blush">
                    <img [ngSrc]="r.corte.imagen" fill sizes="(min-width: 640px) 30vw, 90vw" alt="" class="object-cover transition duration-700 group-hover:scale-105" />
                    <button type="button" (click)="ampliar(i)" [attr.aria-label]="'Ampliar foto: ' + r.corte.nombre" class="absolute inset-0 cursor-zoom-in focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-white"></button>
                    <span class="pointer-events-none absolute top-3 left-3 rounded-full px-3 py-1 text-[11px] font-semibold shadow" [class]="r.ideal ? 'bg-wine text-white' : 'bg-white text-wine'">
                      {{ r.ideal ? "Ideal para ti" : "Se parece mucho" }}
                    </span>
                  </div>
                  <div class="flex flex-1 flex-col p-5">
                    <h3 class="font-serif text-lg font-semibold leading-snug">{{ r.corte.nombre }}</h3>
                    <p class="mt-1.5 text-xs leading-relaxed text-muted">{{ r.corte.descripcion }}</p>
                    <a routerLink="/agendar" [queryParams]="{ servicio: 'corte-cabello', corte: r.corte.id }" class="mt-5 inline-flex items-center justify-center gap-2 self-stretch rounded-full border border-wine px-4 py-2 text-[13px] font-semibold text-wine transition hover:bg-wine hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wine">
                      Agendar este corte
                      <i class="pi pi-arrow-right text-[11px]" aria-hidden="true"></i>
                    </a>
                  </div>
                </article>
              </li>
            }
          </ul>
        }
      </div>
    </section>
    } @else {
      <app-estado-carga que="la guía de cortes" [error]="catalogo.estadoCortes() === 'error'" (reintentar)="catalogo.reintentar()" />
    }
  `
})
export class BuscadorCorte {
  private readonly lightbox = inject(LightboxService);
  protected readonly catalogo = inject(CatalogoService);

  constructor() {
    this.catalogo.cargarCortes();
  }

  // Solo los cortes de mujeres que traen largo, acabado y flequillo pueden recomendarse
  private readonly cortesMujeres = computed(() =>
    (this.catalogo.cortesDeGrupo("mujeres")?.cortes ?? []).filter(c => c.largo && c.acabado && c.flequillo !== undefined)
  );

  readonly opcionesLargo: readonly OpcionFiltro[] = [
    { id: CUALQUIERA, etiqueta: "Cualquiera" },
    { id: "largo", etiqueta: "Largo" },
    { id: "medio", etiqueta: "Medio" },
    { id: "corto", etiqueta: "Corto" }
  ];
  readonly opcionesAcabado: readonly OpcionFiltro[] = [
    { id: CUALQUIERA, etiqueta: "Cualquiera" },
    { id: "volumen", etiqueta: "Volumen y movimiento" },
    { id: "ligero", etiqueta: "Ligero y natural" },
    { id: "pulido", etiqueta: "Liso y pulido" }
  ];
  readonly opcionesFlequillo: readonly OpcionFiltro[] = [
    { id: CUALQUIERA, etiqueta: "Me da igual" },
    { id: "con", etiqueta: "Con flequillo" },
    { id: "sin", etiqueta: "Sin flequillo" }
  ];

  readonly largo = signal(CUALQUIERA);
  readonly acabado = signal(CUALQUIERA);
  readonly flequillo = signal(CUALQUIERA);

  readonly hayPreferencias = computed(() => [this.largo(), this.acabado(), this.flequillo()].some(r => r !== CUALQUIERA));

  // Puntúa cada corte según las respuestas; "ideal" si coincide en todo lo que se pidió
  readonly recomendados = computed<Recomendacion[]>(() => {
    if (!this.hayPreferencias()) return [];
    const largo = this.largo();
    const acabado = this.acabado();
    const flequillo = this.flequillo();

    let maximo = 0;
    if (largo !== CUALQUIERA) maximo += PESO_LARGO;
    if (acabado !== CUALQUIERA) maximo += PESO_ACABADO;
    if (flequillo !== CUALQUIERA) maximo += PESO_FLEQUILLO;

    return this.cortesMujeres().map(corte => {
      let puntos = 0;
      if (largo !== CUALQUIERA && corte.largo === largo) puntos += PESO_LARGO;
      if (acabado !== CUALQUIERA && corte.acabado === acabado) puntos += PESO_ACABADO;
      if (flequillo !== CUALQUIERA && corte.flequillo === (flequillo === "con")) puntos += PESO_FLEQUILLO;
      return { corte, puntos, ideal: puntos === maximo };
    })
      .filter(r => r.puntos > 0)
      .sort((a, b) => b.puntos - a.puntos)
      .slice(0, MAX_RECOMENDADOS)
      .map(({ corte, ideal }) => ({ corte, ideal }));
  });

  reiniciar(): void {
    this.largo.set(CUALQUIERA);
    this.acabado.set(CUALQUIERA);
    this.flequillo.set(CUALQUIERA);
  }

  ampliar(indice: number): void {
    this.lightbox.abrir(
      this.recomendados().map(r => ({ src: r.corte.imagen, alt: `Corte de cabello: ${r.corte.nombre}`, titulo: r.corte.nombre })),
      indice
    );
  }
}
