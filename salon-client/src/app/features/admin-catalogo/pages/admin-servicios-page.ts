import { ChangeDetectionStrategy, Component, computed, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";

import { API_URL, urlImagen } from "../../../core/config/api.config";
import { ApiError } from "../../../core/models/auth.models";
import { CategoriasPanel } from "../components/categorias-panel";
import { Interruptor } from "../components/interruptor";
import { Paginacion } from "../components/paginacion";
import { ServicioForm } from "../components/servicio-form";
import { aServicioRequest, ServicioAdmin } from "../models/admin-catalogo.models";
import { AdminCatalogoService } from "../services/admin-catalogo.service";

const TAMANIO_PAGINA = 10;
type FiltroEstado = "todos" | "activos" | "inactivos";
type Vista = "servicios" | "categorias";

// Alta, edición y baja de servicios. La API ya valida todo (slug único, categoría
// existente, etc.); aquí solo se muestran sus mensajes.
@Component({
  selector: "app-admin-servicios-page",
  imports: [FormsModule, Paginacion, ServicioForm, Interruptor, CategoriasPanel],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="px-6 py-7 md:px-8">
      <header class="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 class="font-serif text-[22px] font-semibold">Servicios</h1>
          <p class="mt-1 text-[13px] text-muted">
            Lo que creas o editas aquí se ve de inmediato en el sitio público.
          </p>
          @if (vista() === "servicios") {
            <div class="mt-3 flex items-center gap-3 text-[12.5px] text-muted">
              <span><span class="font-semibold text-ink">{{ servicios().length }}</span> en total</span>
              <span aria-hidden="true" class="text-line">·</span>
              <span><span class="font-semibold text-ink">{{ totalActivos() }}</span> activos</span>
            </div>
          }
        </div>
        @if (vista() === "servicios") {
          <button
            type="button"
            (click)="abrirNuevo()"
            class="inline-flex items-center gap-2 rounded-full bg-wine px-5 py-2.5 text-[13px] font-semibold text-white transition hover:bg-wine-dark focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wine">
            <i class="pi pi-plus" aria-hidden="true"></i>
            Nuevo servicio
          </button>
        }
      </header>

      <div class="mb-6 flex gap-2 border-b border-line" role="tablist" aria-label="Secciones de servicios">
        <button
          type="button"
          role="tab"
          [attr.aria-selected]="vista() === 'servicios'"
          (click)="vista.set('servicios')"
          [class]="clasePestana('servicios')">
          Servicios
        </button>
        <button
          type="button"
          role="tab"
          [attr.aria-selected]="vista() === 'categorias'"
          (click)="vista.set('categorias')"
          [class]="clasePestana('categorias')">
          Categorías
        </button>
      </div>

      @if (vista() === "categorias") {
        <app-categorias-panel tipo="SERVICIO" />
      }

      @if (vista() === "servicios") {
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
            aria-label="Buscar servicio por nombre"
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
            <caption class="sr-only">Servicios del catálogo</caption>
            <thead>
              <tr class="bg-ivory">
                <th scope="col" class="border-b border-line px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.04em] text-muted">Servicio</th>
                <th scope="col" class="border-b border-line px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.04em] text-muted">Categoría</th>
                <th scope="col" class="border-b border-line px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.04em] text-muted">Precio</th>
                <th scope="col" class="border-b border-line px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.04em] text-muted">A domicilio</th>
                <th scope="col" class="border-b border-line px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.04em] text-muted">Activo</th>
                <th scope="col" class="border-b border-line px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.04em] text-muted">Acciones</th>
              </tr>
            </thead>
            <tbody>
              @for (s of paginaActual(); track s.id) {
                <tr class="transition hover:bg-ivory/60" [class.opacity-55]="!s.activo">
                  <td class="border-b border-line px-4 py-3">
                    <div class="flex items-center gap-3">
                      @if (s.imagen) {
                        <img [src]="urlImagen(s.imagen)" alt="" class="size-10 flex-shrink-0 rounded-lg border border-line object-cover" />
                      } @else {
                        <div class="grid size-10 flex-shrink-0 place-items-center rounded-lg border border-dashed border-line text-muted">
                          <i class="pi pi-image text-[13px]" aria-hidden="true"></i>
                        </div>
                      }
                      <span class="font-semibold text-ink">{{ s.nombre }}</span>
                    </div>
                  </td>
                  <td class="border-b border-line px-4 py-3 text-muted">{{ s.categoriaNombre }}</td>
                  <td class="border-b border-line px-4 py-3">{{ s.precio != null ? "Q" + s.precio : "—" }}</td>
                  <td class="border-b border-line px-4 py-3">
                    @if (s.aDomicilio) {
                      <i class="pi pi-check text-sage" aria-hidden="true"></i>
                      <span class="sr-only">Sí</span>
                    } @else {
                      <span class="text-muted">—</span>
                    }
                  </td>
                  <td class="border-b border-line px-4 py-3">
                    <app-interruptor
                      [etiqueta]="(s.activo ? 'Desactivar ' : 'Activar ') + s.nombre"
                      [valor]="s.activo"
                      (alternar)="alternarActivo(s)" />
                  </td>
                  <td class="border-b border-line px-4 py-3">
                    <div class="flex justify-end">
                      <button
                        type="button"
                        (click)="abrirEdicion(s)"
                        [attr.aria-label]="'Editar ' + s.nombre"
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
                        {{ cargando() ? "Cargando…" : "No hay servicios que coincidan con la búsqueda." }}
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
            [totalElementos]="serviciosFiltrados().length"
            [tamanioPagina]="tamanioPagina"
            etiqueta="servicios"
            (cambiarPagina)="pagina.set($event)" />
        </div>
      </div>
      }
    </div>

    @if (formAbierto()) {
      <app-servicio-form [servicio]="servicioEnEdicion()" (guardado)="alGuardar($event)" (cerrado)="cerrarForm()" />
    }
  `
})
export class AdminServiciosPage {
  private readonly adminCatalogo = inject(AdminCatalogoService);
  private readonly apiUrl = inject(API_URL);

  protected readonly tamanioPagina = TAMANIO_PAGINA;
  protected readonly vista = signal<Vista>("servicios");
  protected readonly busqueda = signal("");
  protected readonly filtroEstado = signal<FiltroEstado>("todos");
  protected readonly pagina = signal(0);

  protected readonly filtros: ReadonlyArray<{ valor: FiltroEstado; etiqueta: string }> = [
    { valor: "todos", etiqueta: "Todos" },
    { valor: "activos", etiqueta: "Activos" },
    { valor: "inactivos", etiqueta: "Desactivados" }
  ];

  protected readonly servicios = signal<readonly ServicioAdmin[]>([]);
  protected readonly cargando = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly aviso = signal<string | null>(null);

  protected readonly formAbierto = signal(false);
  protected readonly servicioEnEdicion = signal<ServicioAdmin | null>(null);

  protected readonly totalActivos = computed(() => this.servicios().filter(s => s.activo).length);

  protected readonly serviciosFiltrados = computed(() => {
    const texto = this.busqueda().trim().toLowerCase();
    const estado = this.filtroEstado();
    return this.servicios().filter(s => {
      if (texto && !s.nombre.toLowerCase().includes(texto)) return false;
      if (estado === "activos" && !s.activo) return false;
      if (estado === "inactivos" && s.activo) return false;
      return true;
    });
  });

  protected readonly paginaActual = computed(() => {
    const inicio = this.pagina() * this.tamanioPagina;
    return this.serviciosFiltrados().slice(inicio, inicio + this.tamanioPagina);
  });

  constructor() {
    this.cargar();
  }

  protected urlImagen(ruta: string): string | undefined {
    return urlImagen(ruta, this.apiUrl);
  }

  protected clasePestana(valor: Vista): string {
    const base = "-mb-px rounded-t-lg border-b-2 px-4 py-2.5 text-[13px] font-semibold transition";
    return this.vista() === valor
      ? `${base} border-wine text-wine`
      : `${base} border-transparent text-muted hover:text-ink`;
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
    this.servicioEnEdicion.set(null);
    this.formAbierto.set(true);
  }

  protected abrirEdicion(servicio: ServicioAdmin): void {
    this.servicioEnEdicion.set(servicio);
    this.formAbierto.set(true);
  }

  protected cerrarForm(): void {
    this.formAbierto.set(false);
    this.servicioEnEdicion.set(null);
  }

  protected alGuardar(servicio: ServicioAdmin): void {
    const editaba = this.servicioEnEdicion() !== null;
    this.cerrarForm();
    this.mostrarAviso(editaba ? `Se guardaron los cambios de "${servicio.nombre}".` : `"${servicio.nombre}" ya está en el catálogo.`);
    this.cargar();
  }

  protected alternarActivo(servicio: ServicioAdmin): void {
    if (servicio.activo) {
      this.adminCatalogo.desactivarServicio(servicio.id).subscribe({
        next: () => this.trasAlternar(servicio.nombre, false),
        error: (e: ApiError) => this.error.set(e.mensaje)
      });
    } else {
      this.adminCatalogo.actualizarServicio(servicio.id, aServicioRequest(servicio)).subscribe({
        next: () => this.trasAlternar(servicio.nombre, true),
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
    this.adminCatalogo.listarServicios().subscribe({
      next: servicios => {
        this.servicios.set(servicios);
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
