import { NgOptimizedImage } from "@angular/common";
import { ChangeDetectionStrategy, Component, computed, inject, input, linkedSignal, signal } from "@angular/core";
import { RouterLink } from "@angular/router";
import { EstadoCarga } from "../../../shared/components/estado-carga";
import { FiltroChips, OpcionFiltro } from "../../../shared/components/filtro-chips";
import { SeccionTitulo } from "../../../shared/components/seccion-titulo";
import { Reveal } from "../../../shared/directives/reveal";
import { LightboxService } from "../../../shared/services/lightbox.service";
import { GRUPOS_CORTES_META } from "../data/cortes-grupos.data";
import { GrupoCorteId } from "../models/catalogo.models";
import { CatalogoService } from "../services/catalogo.service";

// Cortes visibles antes de pulsar "Ver todos los cortes"
const CORTES_INICIALES = 4;
const TODOS = "todos";

// Catálogo de cortes con una vista por grupo (mujeres, hombres, niños y niñas, abuelitos y abuelitas).
// Al cambiar de grupo o de estilo, la lista se actualiza.
@Component({
  selector: "app-catalogo-cortes",
  imports: [EstadoCarga, FiltroChips, NgOptimizedImage, Reveal, RouterLink, SeccionTitulo],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (catalogo.cortesListos()) {
    <section id="tipos-de-corte" aria-labelledby="titulo-cortes" class="rounded-3xl bg-white px-5 py-12 shadow-sm shadow-ink/5 ring-1 ring-line sm:px-10">
      <div appReveal class="mb-8 flex flex-wrap items-end justify-between gap-4">
        <app-seccion-titulo
          [eyebrow]="'Catálogo de cortes para ' + meta().para"
          titulo="Todos los cortes de"
          acento="cabello"
          descripcion="Elige para quién es el corte, encuentra el que más te guste y agenda tu fecha. Toca una foto para verla en grande."
          [centrado]="false"
          idTitulo="titulo-cortes"
        />
        @if (hayMas()) {
          <button
            type="button"
            (click)="alternar()"
            [attr.aria-expanded]="expandido()"
            aria-controls="lista-cortes"
            class="inline-flex items-center gap-2 text-sm font-semibold text-wine transition hover:gap-3 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-wine"
          >
            {{ expandido() ? "Ver menos cortes" : "Ver todos los cortes" }}
            <i class="pi text-xs" [class]="expandido() ? 'pi-arrow-up' : 'pi-arrow-down'" aria-hidden="true"></i>
          </button>
        }
      </div>

      <div class="mb-10 space-y-3">
        <app-filtro-chips descripcion="Elegir para quién es el corte" [opciones]="opcionesGrupo" [activa]="grupoId()" (cambia)="cambiarGrupo($any($event))" />
        @if (opcionesFiltro().length > 1) {
          <app-filtro-chips descripcion="Filtrar cortes por estilo" [opciones]="opcionesFiltro()" [activa]="filtro()" (cambia)="cambiarFiltro($event)" />
        }
      </div>

      <ul id="lista-cortes" class="grid grid-cols-2 gap-x-4 gap-y-9 sm:gap-x-6 lg:grid-cols-4" [class.hidden]="!lista().length">
        @for (c of visibles(); track c.id; let i = $index) {
          <li [appReveal]="(i % 4) * 90">
            <figure class="group flex h-full flex-col">
              <div class="relative aspect-[3/4] overflow-hidden rounded-2xl bg-blush shadow-md shadow-ink/10">
                <img [ngSrc]="c.imagen" fill sizes="(min-width: 1024px) 20vw, 45vw" alt="" class="object-cover transition duration-700 group-hover:scale-105" />
                <button type="button" (click)="ampliar(i)" [attr.aria-label]="'Ampliar foto: ' + c.nombre" class="absolute inset-0 cursor-zoom-in focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-white"></button>
                <span aria-hidden="true" class="pointer-events-none absolute top-3 right-3 grid size-8 place-items-center rounded-full bg-white/90 text-wine opacity-0 shadow transition group-hover:opacity-100 group-focus-within:opacity-100"><i class="pi pi-search-plus text-xs"></i></span>
              </div>
              <figcaption class="mt-3 flex flex-1 flex-col px-1">
                <h3 class="font-serif text-base font-semibold leading-snug">{{ c.nombre }}</h3>
                <p class="mt-1 text-xs leading-relaxed text-muted">{{ c.descripcion }}</p>
              </figcaption>
            </figure>
          </li>
        }
      </ul>

      @if (meta().aviso; as aviso) {
        <div class="rounded-2xl border border-dashed border-wine/30 bg-ivory px-6 py-14 text-center" [class.mt-10]="lista().length">
          <i class="pi pi-clock mb-4 text-2xl text-wine" aria-hidden="true"></i>
          <p class="font-serif text-xl font-semibold">Próximamente</p>
          <p class="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-muted">{{ aviso }}</p>
        </div>
      }

      <div class="mt-12 flex flex-col items-center gap-4 text-center">
        <p class="text-xs text-muted" aria-live="polite">
          @if (!lista().length) {
            Sin ejemplos por ahora
          } @else if (hayMas() && !expandido()) {
            Mostrando {{ visibles().length }} de {{ lista().length }} cortes
          } @else {
            {{ lista().length }} {{ lista().length === 1 ? "corte" : "cortes" }}
          }
        </p>
        <div class="flex flex-wrap items-center justify-center gap-3">
          @if (hayMas() && !expandido()) {
            <button
              type="button"
              (click)="alternar()"
              aria-controls="lista-cortes"
              class="inline-flex items-center gap-2 rounded-full border border-wine/40 px-6 py-3 text-sm font-semibold text-wine transition hover:border-wine hover:bg-blush focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wine"
            >
              Ver todos los cortes
              <i class="pi pi-arrow-down text-xs" aria-hidden="true"></i>
            </button>
          }
          <a routerLink="/agendar" [queryParams]="{ servicio: servicioReserva() }" class="inline-flex items-center gap-2 rounded-full bg-wine px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-wine/25 transition hover:-translate-y-0.5 hover:bg-wine-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wine">
            Agendar mi cita
            <i class="pi pi-arrow-right text-xs" aria-hidden="true"></i>
          </a>
        </div>
      </div>
    </section>
    } @else {
      <section id="tipos-de-corte" class="rounded-3xl bg-white px-5 py-12 ring-1 ring-line sm:px-10">
        <app-estado-carga que="los cortes" [error]="catalogo.estadoCortes() === 'error'" (reintentar)="catalogo.reintentar()" />
      </section>
    }
  `
})
export class CatalogoCortes {
  private readonly lightbox = inject(LightboxService);
  protected readonly catalogo = inject(CatalogoService);

  constructor() {
    this.catalogo.cargarCortes();
  }

  // Grupo con el que abre el catálogo (por ejemplo, "hombres" desde la página del corte para caballero)
  readonly grupoInicial = input<GrupoCorteId>("mujeres");

  readonly opcionesGrupo: readonly OpcionFiltro[] = GRUPOS_CORTES_META.map(g => ({ id: g.id, etiqueta: g.etiqueta }));

  readonly grupoId = linkedSignal<GrupoCorteId>(() => this.grupoInicial());
  readonly filtro = signal(TODOS);
  readonly expandido = signal(false);

  readonly meta = computed(() => GRUPOS_CORTES_META.find(g => g.id === this.grupoId()) ?? GRUPOS_CORTES_META[0]);
  private readonly datos = computed(() => this.catalogo.cortesDeGrupo(this.grupoId()));

  // El servicio que se reserva desde este grupo es el que tiene asignado ese catálogo de cortes
  readonly servicioReserva = computed(() => this.catalogo.servicios().find(s => s.grupoCortes === this.grupoId())?.id ?? "corte-cabello");

  // Chips de estilo del grupo (solo si tiene más de uno), con "Todos" al inicio
  readonly opcionesFiltro = computed<readonly OpcionFiltro[]>(() => {
    const estilos = this.datos()?.estilos ?? [];
    return estilos.length ? [{ id: TODOS, etiqueta: "Todos" }, ...estilos] : [];
  });

  readonly lista = computed(() => {
    const filtro = this.filtro();
    const cortes = this.datos()?.cortes ?? [];
    return filtro === TODOS ? cortes : cortes.filter(c => c.estilo === filtro);
  });

  readonly hayMas = computed(() => this.lista().length > CORTES_INICIALES);
  readonly visibles = computed(() => (this.expandido() ? this.lista() : this.lista().slice(0, CORTES_INICIALES)));

  cambiarGrupo(id: GrupoCorteId): void {
    this.grupoId.set(id);
    this.filtro.set(TODOS);
    this.expandido.set(false);
  }

  cambiarFiltro(id: string): void {
    this.filtro.set(id);
    this.expandido.set(false);
  }

  alternar(): void {
    this.expandido.update(abierto => !abierto);
  }

  // El visor recorre siempre todos los cortes de la vista actual, aunque no estén desplegados
  ampliar(indice: number): void {
    this.lightbox.abrir(
      this.lista().map(c => ({ src: c.imagen, alt: `Corte de cabello: ${c.nombre}`, titulo: c.nombre })),
      indice
    );
  }
}
