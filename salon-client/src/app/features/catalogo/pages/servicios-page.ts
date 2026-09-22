import { NgOptimizedImage } from "@angular/common";
import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from "@angular/core";
import { RouterLink } from "@angular/router";
import { SALON } from "../../../core/config/salon.config";
import { EstadoCarga } from "../../../shared/components/estado-carga";
import { FiltroChips, OpcionFiltro } from "../../../shared/components/filtro-chips";
import { Reveal } from "../../../shared/directives/reveal";
import { BuscadorCorte } from "../components/buscador-corte";
import { CatalogoCortes } from "../components/catalogo-cortes";
import { ServicioFila } from "../components/servicio-fila";
import { esGrupoCorte } from "../data/cortes-grupos.data";
import { GrupoCorteId } from "../models/catalogo.models";
import { CatalogoService } from "../services/catalogo.service";

const TODOS = "todos";

// Para buscar sin importar mayúsculas ni acentos ("pestanas" encuentra "pestañas")
const normalizar = (texto: string): string => texto.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().trim();

@Component({
  selector: "app-servicios-page",
  imports: [BuscadorCorte, CatalogoCortes, EstadoCarga, FiltroChips, NgOptimizedImage, Reveal, RouterLink, ServicioFila],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="mx-auto max-w-[80rem] px-6 py-14 lg:px-10 lg:py-16">
      <header class="mb-10 max-w-xl">
        <p class="mb-3 flex items-center gap-3 text-xs font-semibold tracking-[0.14em] text-wine uppercase">
          <span aria-hidden="true" class="h-px w-8 bg-gold"></span>Catálogo
        </p>
        <h1 class="mb-3 font-serif text-4xl font-semibold tracking-tight sm:text-5xl">Elige tu <em class="font-medium text-wine italic">servicio</em></h1>
        <p class="text-[15px] leading-relaxed text-muted">Escoge el servicio que necesitas y agenda con la estilista de tu preferencia, en el salón o a domicilio.</p>
      </header>

      @if (catalogo.listo()) {
      <div class="grid gap-8 lg:grid-cols-[13rem_minmax(0,1fr)_21rem] lg:gap-10">
        <!-- Categorías (escritorio) -->
        <nav aria-label="Categorías de servicios" class="hidden lg:block">
          <ul class="sticky top-28 overflow-hidden rounded-2xl border border-line bg-white">
            @for (c of categorias(); track c.id) {
              <li class="border-b border-line last:border-b-0">
                <button
                  type="button"
                  (click)="categoria.set(c.id)"
                  [attr.aria-pressed]="c.id === categoria()"
                  class="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-wine"
                  [class]="c.id === categoria() ? 'bg-ink text-white' : 'text-ink hover:bg-blush'"
                >
                  {{ c.etiqueta }}
                  <span class="text-xs tabular-nums" [class]="c.id === categoria() ? 'text-white/70' : 'text-muted'">{{ cuantos(c.id) }}</span>
                </button>
              </li>
            }
          </ul>
        </nav>

        <!-- Lista -->
        <div class="min-w-0">
          <div class="mb-5 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-white p-4 pl-5">
            <p class="text-sm font-medium">¿Quieres elegir primero a tu estilista?</p>
            <a routerLink="/" fragment="equipo" class="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2 text-[13px] font-semibold text-white transition hover:bg-wine focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wine">
              Elegir ahora
              <i class="pi pi-arrow-right text-[11px]" aria-hidden="true"></i>
            </a>
          </div>

          <div class="relative mb-5">
            <label for="buscar-servicio" class="sr-only">Buscar un servicio</label>
            <i class="pi pi-search pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-sm text-muted" aria-hidden="true"></i>
            <input
              id="buscar-servicio"
              type="search"
              autocomplete="off"
              placeholder="Buscar un servicio"
              [value]="busqueda()"
              (input)="busqueda.set($any($event.target).value)"
              class="w-full rounded-2xl border border-line bg-white py-3.5 pr-4 pl-11 text-sm outline-none transition placeholder:text-muted focus:border-wine focus:ring-2 focus:ring-wine/20"
            />
          </div>

          <!-- Categorías (móvil y tablet) -->
          <div class="mb-5 lg:hidden">
            <app-filtro-chips descripcion="Filtrar servicios por categoría" [opciones]="categorias()" [activa]="categoria()" (cambia)="categoria.set($event)" />
          </div>

          <p class="mb-4 text-xs text-muted" aria-live="polite">{{ visibles().length }} {{ visibles().length === 1 ? "servicio" : "servicios" }}</p>

          @if (visibles().length) {
            <ul class="space-y-4">
              @for (s of visibles(); track s.id; let i = $index) {
                <li [appReveal]="(i % 4) * 70"><app-servicio-fila [servicio]="s" /></li>
              }
            </ul>
          } @else {
            <div class="rounded-2xl border border-dashed border-wine/30 bg-white/70 px-6 py-12 text-center">
              <p class="font-serif text-lg font-semibold">No encontramos servicios con esa búsqueda</p>
              <p class="mt-1 text-sm text-muted">Prueba con otra palabra o cambia de categoría.</p>
              <button type="button" (click)="limpiar()" class="mt-5 rounded-full border border-wine px-5 py-2 text-[13px] font-semibold text-wine transition hover:bg-wine hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wine">
                Ver todos los servicios
              </button>
            </div>
          }
        </div>

        <!-- Información -->
        <aside class="space-y-5 lg:sticky lg:top-28 lg:self-start">
          <div class="relative aspect-[4/5] overflow-hidden rounded-2xl bg-blush shadow-xl shadow-ink/10">
            <img ngSrc="img/salon-113.jpeg" fill priority sizes="(min-width: 1024px) 22vw, 100vw" alt="" class="object-cover object-[center_62%]" />
            <div aria-hidden="true" class="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-ink/85 to-transparent"></div>
            <p class="absolute inset-x-0 bottom-0 p-6 font-serif text-2xl leading-snug font-semibold text-white">Tu cita, <em class="font-medium text-gold italic">a tu estilo</em></p>
          </div>

          <div class="rounded-2xl border border-line bg-white p-6">
            <h2 class="font-serif text-lg font-semibold">Antes de tu cita</h2>
            <ul class="mt-4 space-y-3.5 text-sm leading-snug text-muted">
              <li class="flex gap-3"><i class="pi pi-clock mt-0.5 text-wine" aria-hidden="true"></i>{{ horario }}, con cita previa.</li>
              <li class="flex gap-3"><i class="pi pi-map-marker mt-0.5 text-wine" aria-hidden="true"></i>{{ ubicacion }}.</li>
              <li class="flex gap-3"><i class="pi pi-home mt-0.5 text-wine" aria-hidden="true"></i>Algunos servicios se ofrecen a domicilio: consulta la cobertura al agendar.</li>
              <li class="flex gap-3"><i class="pi pi-check mt-0.5 text-wine" aria-hidden="true"></i>Tu estilista te confirma el precio final antes de empezar.</li>
            </ul>
            <a routerLink="/productos" class="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-wine transition hover:gap-3 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-wine">
              Ver nuestros productos
              <i class="pi pi-arrow-right text-xs" aria-hidden="true"></i>
            </a>
          </div>
        </aside>
      </div>

      @if (mostrarCortes()) {
        <div class="mt-24">
          <app-catalogo-cortes [grupoInicial]="grupoCortesInicial()" />
        </div>
        <div class="mt-10">
          <app-buscador-corte />
        </div>
      }
      } @else {
        <app-estado-carga que="los servicios" [error]="catalogo.estado() === 'error'" (reintentar)="catalogo.reintentar()" />
      }
    </section>
  `
})
export class ServiciosPage {
  protected readonly catalogo = inject(CatalogoService);

  // /servicios?cortes=hombres abre el catálogo de cortes en esa pestaña
  readonly cortes = input<string>();
  readonly grupoCortesInicial = computed<GrupoCorteId>(() => {
    const grupo = this.cortes();
    return esGrupoCorte(grupo) ? grupo : "mujeres";
  });

  readonly horario = SALON.horario;
  readonly ubicacion = `${SALON.canton}, ${SALON.municipio}`;

  readonly categorias = computed<readonly OpcionFiltro[]>(() => [{ id: TODOS, etiqueta: "Todos" }, ...this.catalogo.categoriasServicio()]);

  readonly categoria = signal(TODOS);
  readonly busqueda = signal("");

  readonly visibles = computed(() => {
    const categoria = this.categoria();
    const texto = normalizar(this.busqueda());
    return this.catalogo.servicios().filter(
      s => (categoria === TODOS || s.categoria === categoria) && (!texto || normalizar(`${s.nombre} ${s.descripcion} ${(s.incluye ?? []).join(" ")}`).includes(texto))
    );
  });

  // El catálogo de tipos de corte aparece al ver todo o al filtrar por "Cortes", sin búsqueda activa
  readonly mostrarCortes = computed(() => !this.busqueda().trim() && (this.categoria() === TODOS || this.categoria() === "cortes"));

  cuantos(categoria: string): number {
    const servicios = this.catalogo.servicios();
    return categoria === TODOS ? servicios.length : servicios.filter(s => s.categoria === categoria).length;
  }

  limpiar(): void {
    this.categoria.set(TODOS);
    this.busqueda.set("");
  }
}
