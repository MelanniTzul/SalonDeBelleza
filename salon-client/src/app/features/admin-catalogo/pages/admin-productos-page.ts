import { ChangeDetectionStrategy, Component, computed, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";

import { API_URL, urlImagen } from "../../../core/config/api.config";
import { ApiError } from "../../../core/models/auth.models";
import { Interruptor } from "../components/interruptor";
import { Paginacion } from "../components/paginacion";
import { ProductoForm } from "../components/producto-form";
import { aProductoRequest, ProductoAdmin } from "../models/admin-catalogo.models";
import { AdminCatalogoService } from "../services/admin-catalogo.service";

const TAMANIO_PAGINA = 10;
type FiltroEstado = "todos" | "activos" | "inactivos";

// Alta, edición y baja de productos. La API ya valida todo (slug único, categoría
// existente, etc.); aquí solo se muestran sus mensajes.
@Component({
  selector: "app-admin-productos-page",
  imports: [FormsModule, Paginacion, ProductoForm, Interruptor],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="px-6 py-7 md:px-8">
      <header class="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 class="font-serif text-[22px] font-semibold">Productos</h1>
          <p class="mt-1 text-[13px] text-muted">
            Lo que creas o editas aquí se ve de inmediato en el sitio público.
          </p>
          <div class="mt-3 flex items-center gap-3 text-[12.5px] text-muted">
            <span><span class="font-semibold text-ink">{{ productos().length }}</span> en total</span>
            <span aria-hidden="true" class="text-line">·</span>
            <span><span class="font-semibold text-ink">{{ totalActivos() }}</span> activos</span>
          </div>
        </div>
        <button
          type="button"
          (click)="abrirNuevo()"
          class="inline-flex items-center gap-2 rounded-full bg-wine px-5 py-2.5 text-[13px] font-semibold text-white transition hover:bg-wine-dark focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wine">
          <i class="pi pi-plus" aria-hidden="true"></i>
          Nuevo producto
        </button>
      </header>

      @if (error(); as mensaje) {
        <div role="alert" class="mb-4 rounded-lg border border-wine/30 bg-blush px-4 py-3 text-[13px] text-wine-dark">
          {{ mensaje }}
        </div>
      }

      @if (aviso(); as mensaje) {
        <div role="status" class="mb-4 rounded-lg border border-sage/40 bg-[#F2F7F3] px-4 py-3 text-[13px] text-ink">
          {{ mensaje }}
        </div>
      }

      <div class="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div class="relative w-full max-w-sm">
          <i class="pi pi-search pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[13px] text-muted" aria-hidden="true"></i>
          <input
            id="busqueda"
            type="search"
            [ngModel]="busqueda()"
            (ngModelChange)="cambiarBusqueda($event)"
            placeholder="Buscar por nombre…"
            aria-label="Buscar producto por nombre"
            class="w-full rounded-full border border-line bg-white py-2.5 pl-9 pr-3.5 text-sm outline-none transition placeholder:text-muted/70 focus:border-wine focus:ring-2 focus:ring-wine/20" />
        </div>

        <div class="flex gap-2" role="group" aria-label="Filtrar por estado">
          @for (opcion of filtros; track opcion.valor) {
            <button
              type="button"
              (click)="cambiarFiltro(opcion.valor)"
              [attr.aria-pressed]="filtroEstado() === opcion.valor"
              [class]="claseFiltro(opcion.valor)">
              {{ opcion.etiqueta }}
            </button>
          }
        </div>
      </div>

      <div class="overflow-hidden rounded-2xl border border-line bg-white">
        <div class="overflow-x-auto [contain:layout]" [class.opacity-50]="cargando()">
          <table class="w-full min-w-[760px] border-collapse text-[12.5px]">
            <caption class="sr-only">Productos del catálogo</caption>
            <thead>
              <tr class="bg-ivory">
                <th scope="col" class="border-b border-line px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.04em] text-muted">Producto</th>
                <th scope="col" class="border-b border-line px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.04em] text-muted">Categoría</th>
                <th scope="col" class="border-b border-line px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.04em] text-muted">Marca</th>
                <th scope="col" class="border-b border-line px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.04em] text-muted">Precio</th>
                <th scope="col" class="border-b border-line px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.04em] text-muted">Activo</th>
                <th scope="col" class="border-b border-line px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.04em] text-muted">Acciones</th>
              </tr>
            </thead>
            <tbody>
              @for (p of paginaActual(); track p.id) {
                <tr class="transition hover:bg-ivory/60" [class.opacity-55]="!p.activo">
                  <td class="border-b border-line px-4 py-3">
                    <div class="flex items-center gap-3">
                      @if (p.imagen) {
                        <img [src]="urlImagen(p.imagen)" alt="" class="size-10 flex-shrink-0 rounded-lg border border-line object-cover" />
                      } @else {
                        <div class="grid size-10 flex-shrink-0 place-items-center rounded-lg border border-dashed border-line text-muted">
                          <i class="pi pi-image text-[13px]" aria-hidden="true"></i>
                        </div>
                      }
                      <span class="font-semibold text-ink">{{ p.nombre }}</span>
                    </div>
                  </td>
                  <td class="border-b border-line px-4 py-3 text-muted">{{ p.categoriaNombre }}</td>
                  <td class="border-b border-line px-4 py-3">{{ p.marca ?? "—" }}</td>
                  <td class="border-b border-line px-4 py-3">{{ p.precio != null ? "Q" + p.precio : "—" }}</td>
                  <td class="border-b border-line px-4 py-3">
                    <app-interruptor
                      [etiqueta]="(p.activo ? 'Desactivar ' : 'Activar ') + p.nombre"
                      [valor]="p.activo"
                      (alternar)="alternarActivo(p)" />
                  </td>
                  <td class="border-b border-line px-4 py-3">
                    <div class="flex justify-end">
                      <button
                        type="button"
                        (click)="abrirEdicion(p)"
                        [attr.aria-label]="'Editar ' + p.nombre"
                        class="inline-flex items-center gap-1.5 rounded-full border border-line px-3.5 py-1.5 text-[11.5px] font-semibold transition hover:border-wine/40 hover:bg-ivory focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wine">
                        <i class="pi pi-pencil text-[11px]" aria-hidden="true"></i>
                        Editar
                      </button>
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="6" class="border-b border-line px-4 py-16 text-center">
                    <div class="flex flex-col items-center gap-2 text-muted">
                      <i class="pi pi-inbox text-2xl" aria-hidden="true"></i>
                      <p class="text-[13px]">
                        {{ cargando() ? "Cargando…" : "No hay productos que coincidan con la búsqueda." }}
                      </p>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <div class="border-t border-line px-4 py-3">
          <app-paginacion
            [pagina]="pagina()"
            [totalElementos]="productosFiltrados().length"
            [tamanioPagina]="tamanioPagina"
            etiqueta="productos"
            (cambiarPagina)="pagina.set($event)" />
        </div>
      </div>
    </div>

    @if (formAbierto()) {
      <app-producto-form [producto]="productoEnEdicion()" (guardado)="alGuardar($event)" (cerrado)="cerrarForm()" />
    }
  `
})
export class AdminProductosPage {
  private readonly adminCatalogo = inject(AdminCatalogoService);
  private readonly apiUrl = inject(API_URL);

  protected readonly tamanioPagina = TAMANIO_PAGINA;
  protected readonly busqueda = signal("");
  protected readonly filtroEstado = signal<FiltroEstado>("todos");
  protected readonly pagina = signal(0);

  protected readonly filtros: ReadonlyArray<{ valor: FiltroEstado; etiqueta: string }> = [
    { valor: "todos", etiqueta: "Todos" },
    { valor: "activos", etiqueta: "Activos" },
    { valor: "inactivos", etiqueta: "Desactivados" }
  ];

  protected readonly productos = signal<readonly ProductoAdmin[]>([]);
  protected readonly cargando = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly aviso = signal<string | null>(null);

  protected readonly formAbierto = signal(false);
  protected readonly productoEnEdicion = signal<ProductoAdmin | null>(null);

  protected readonly totalActivos = computed(() => this.productos().filter(p => p.activo).length);

  protected readonly productosFiltrados = computed(() => {
    const texto = this.busqueda().trim().toLowerCase();
    const estado = this.filtroEstado();
    return this.productos().filter(p => {
      if (texto && !p.nombre.toLowerCase().includes(texto)) return false;
      if (estado === "activos" && !p.activo) return false;
      if (estado === "inactivos" && p.activo) return false;
      return true;
    });
  });

  protected readonly paginaActual = computed(() => {
    const inicio = this.pagina() * this.tamanioPagina;
    return this.productosFiltrados().slice(inicio, inicio + this.tamanioPagina);
  });

  constructor() {
    this.cargar();
  }

  protected urlImagen(ruta: string): string | undefined {
    return urlImagen(ruta, this.apiUrl);
  }

  protected claseFiltro(valor: FiltroEstado): string {
    const base = "rounded-full px-3.5 py-1.5 text-[12.5px] font-semibold transition";
    return this.filtroEstado() === valor
      ? `${base} bg-wine text-white`
      : `${base} border border-line text-ink hover:bg-ivory`;
  }

  protected cambiarBusqueda(texto: string): void {
    this.busqueda.set(texto);
    this.pagina.set(0);
  }

  protected cambiarFiltro(valor: FiltroEstado): void {
    this.filtroEstado.set(valor);
    this.pagina.set(0);
  }

  protected abrirNuevo(): void {
    this.productoEnEdicion.set(null);
    this.formAbierto.set(true);
  }

  protected abrirEdicion(producto: ProductoAdmin): void {
    this.productoEnEdicion.set(producto);
    this.formAbierto.set(true);
  }

  protected cerrarForm(): void {
    this.formAbierto.set(false);
    this.productoEnEdicion.set(null);
  }

  protected alGuardar(producto: ProductoAdmin): void {
    const editaba = this.productoEnEdicion() !== null;
    this.cerrarForm();
    this.mostrarAviso(editaba ? `Se guardaron los cambios de "${producto.nombre}".` : `"${producto.nombre}" ya está en el catálogo.`);
    this.cargar();
  }

  protected alternarActivo(producto: ProductoAdmin): void {
    if (producto.activo) {
      this.adminCatalogo.desactivarProducto(producto.id).subscribe({
        next: () => this.trasAlternar(producto.nombre, false),
        error: (e: ApiError) => this.error.set(e.mensaje)
      });
    } else {
      this.adminCatalogo.actualizarProducto(producto.id, aProductoRequest(producto)).subscribe({
        next: () => this.trasAlternar(producto.nombre, true),
        error: (e: ApiError) => this.error.set(e.mensaje)
      });
    }
  }

  private trasAlternar(nombre: string, activo: boolean): void {
    this.mostrarAviso(activo ? `"${nombre}" vuelve a estar visible en el sitio público.` : `"${nombre}" ya no se muestra en el sitio público.`);
    this.cargar();
  }

  private cargar(): void {
    this.cargando.set(true);
    this.error.set(null);
    this.adminCatalogo.listarProductos().subscribe({
      next: productos => {
        this.productos.set(productos);
        this.cargando.set(false);
      },
      error: (e: ApiError) => {
        this.error.set(e.mensaje);
        this.cargando.set(false);
      }
    });
  }

  private mostrarAviso(texto: string): void {
    this.aviso.set(texto);
    setTimeout(() => this.aviso.set(null), 5000);
  }
}
