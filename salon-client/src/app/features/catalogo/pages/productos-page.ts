import { ChangeDetectionStrategy, Component, computed, inject, signal } from "@angular/core";
import { RouterLink } from "@angular/router";
import { EstadoCarga } from "../../../shared/components/estado-carga";
import { FiltroChips, OpcionFiltro } from "../../../shared/components/filtro-chips";
import { Reveal } from "../../../shared/directives/reveal";
import { ProductoCard } from "../components/producto-card";
import { CatalogoService } from "../services/catalogo.service";

const TODOS = "todos";

@Component({
  selector: "app-productos-page",
  imports: [EstadoCarga, FiltroChips, ProductoCard, Reveal, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="mx-auto max-w-6xl px-6 py-14 lg:px-8 lg:py-16">
      <header class="mb-9 max-w-xl">
        <p class="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-wine">Catálogo</p>
        <h1 class="mb-3 font-serif text-4xl font-semibold tracking-tight sm:text-5xl">Productos</h1>
        <p class="text-sm leading-relaxed text-muted">Geles y productos de peinado que usamos y tenemos a la venta en el salón. Pregunta por tu favorito en tu próxima cita.</p>
      </header>

      @if (catalogo.listo()) {
      <app-filtro-chips descripcion="Filtrar productos por categoría" [opciones]="categorias()" [activa]="categoria()" (cambia)="categoria.set($event)">
        <a routerLink="/servicios" class="inline-flex items-center gap-1.5 rounded-full border border-dashed border-wine/50 px-4 py-1.5 text-[13px] font-medium text-wine transition hover:bg-blush focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wine">
          Servicios
          <i class="pi pi-arrow-right text-[10px]" aria-hidden="true"></i>
        </a>
      </app-filtro-chips>

      <div class="mt-6 grid gap-5 rounded-2xl border border-line bg-white p-5 sm:grid-cols-2">
        <div>
          <p class="mb-2.5 text-xs font-semibold tracking-[0.12em] text-muted uppercase">Fijación</p>
          <app-filtro-chips descripcion="Filtrar por fijación" [opciones]="opcionesFijacion" [activa]="fijacion()" (cambia)="fijacion.set($event)" />
        </div>
        <div>
          <p class="mb-2.5 text-xs font-semibold tracking-[0.12em] text-muted uppercase">Acabado</p>
          <app-filtro-chips descripcion="Filtrar por acabado" [opciones]="opcionesAcabado" [activa]="acabado()" (cambia)="acabado.set($event)" />
        </div>
      </div>

      <div class="mt-7 flex flex-wrap items-center justify-between gap-3">
        <p class="text-xs text-muted" aria-live="polite">{{ visibles().length }} {{ visibles().length === 1 ? "producto" : "productos" }}</p>
        @if (hayFiltros()) {
          <button type="button" (click)="limpiarFiltros()" class="text-xs font-semibold text-wine hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wine">
            Quitar filtros
          </button>
        }
      </div>

      @if (visibles().length) {
        <ul class="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          @for (p of visibles(); track p.id; let i = $index) {
            <li [appReveal]="(i % 3) * 90"><app-producto-card [producto]="p" [prioritaria]="prioritarias().has(p.id)" /></li>
          }
        </ul>
      } @else {
        <div class="mt-4 rounded-2xl border border-dashed border-wine/30 bg-white/70 px-6 py-12 text-center">
          <p class="font-serif text-lg font-semibold">No hay productos con esa combinación</p>
          <p class="mt-1 text-sm text-muted">Prueba con otra fijación o acabado.</p>
          <button type="button" (click)="limpiarFiltros()" class="mt-5 rounded-full border border-wine px-5 py-2 text-[13px] font-semibold text-wine transition hover:bg-wine hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wine">
            Ver todos los productos
          </button>
        </div>
      }
      } @else {
        <app-estado-carga que="los productos" [error]="catalogo.estado() === 'error'" (reintentar)="catalogo.reintentar()" />
      }
    </section>
  `
})
export class ProductosPage {
  protected readonly catalogo = inject(CatalogoService);

  readonly categorias = computed<readonly OpcionFiltro[]>(() => [{ id: TODOS, etiqueta: "Todos" }, ...this.catalogo.categoriasProducto()]);
  readonly opcionesFijacion: readonly OpcionFiltro[] = [
    { id: TODOS, etiqueta: "Todas" },
    { id: "media", etiqueta: "Media" },
    { id: "fuerte", etiqueta: "Fuerte" },
    { id: "muy-fuerte", etiqueta: "Muy fuerte" }
  ];
  readonly opcionesAcabado: readonly OpcionFiltro[] = [
    { id: TODOS, etiqueta: "Todos" },
    { id: "brillante", etiqueta: "Brillante" },
    { id: "natural", etiqueta: "Natural" },
    { id: "mate", etiqueta: "Mate" }
  ];

  readonly categoria = signal(TODOS);
  readonly fijacion = signal(TODOS);
  readonly acabado = signal(TODOS);

  // La prioridad de carga no puede cambiar tras crearse la tarjeta: se fija por elemento, no por posición filtrada
  readonly prioritarias = computed(() => new Set(this.catalogo.productos().slice(0, 3).map(p => p.id)));

  readonly hayFiltros = computed(() => [this.categoria(), this.fijacion(), this.acabado()].some(f => f !== TODOS));

  readonly visibles = computed(() => {
    const categoria = this.categoria();
    const fijacion = this.fijacion();
    const acabado = this.acabado();
    return this.catalogo.productos().filter(
      p =>
        (categoria === TODOS || p.categoria === categoria) &&
        (fijacion === TODOS || p.nivelFijacion === fijacion) &&
        (acabado === TODOS || p.tipoAcabado === acabado)
    );
  });

  limpiarFiltros(): void {
    this.categoria.set(TODOS);
    this.fijacion.set(TODOS);
    this.acabado.set(TODOS);
  }
}
