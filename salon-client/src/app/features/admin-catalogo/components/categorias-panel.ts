import { ChangeDetectionStrategy, Component, effect, inject, input, signal, untracked } from "@angular/core";

import { ApiError } from "../../../core/models/auth.models";
import { aCategoriaRequest, CategoriaAdmin, TipoCategoria } from "../models/admin-catalogo.models";
import { AdminCatalogoService } from "../services/admin-catalogo.service";
import { CategoriaForm } from "./categoria-form";
import { Interruptor } from "./interruptor";

// Panel de categorías embebido como pestaña dentro de Servicios (o Productos, pasando
// el "tipo" correspondiente): comparte el mismo patrón de alta/edición/baja lógica que
// el resto del catálogo, pero sin paginación porque la lista suele ser corta.
@Component({
  selector: "app-categorias-panel",
  imports: [CategoriaForm, Interruptor],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mb-5 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h2 class="font-serif text-[18px] font-semibold">Categorías</h2>
        <p class="mt-1 text-[13px] text-muted">Agrupan los servicios en el catálogo público y en el filtro de categoría.</p>
      </div>
      <button
        type="button"
        (click)="abrirNuevo()"
        class="inline-flex items-center gap-2 rounded-full bg-wine px-5 py-2.5 text-[13px] font-semibold text-white transition hover:bg-wine-dark focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wine">
        <i class="pi pi-plus" aria-hidden="true"></i>
        Nueva categoría
      </button>
    </div>

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

    <div class="overflow-hidden rounded-2xl border border-line bg-white">
      <div class="overflow-x-auto [contain:layout]" [class.opacity-50]="cargando()">
        <table class="w-full min-w-[420px] border-collapse text-[12.5px]">
          <caption class="sr-only">Categorías de servicios</caption>
          <thead>
            <tr class="bg-ivory">
              <th scope="col" class="border-b border-line px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.04em] text-muted">Nombre</th>
              <th scope="col" class="border-b border-line px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.04em] text-muted">Orden</th>
              <th scope="col" class="border-b border-line px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.04em] text-muted">Activa</th>
              <th scope="col" class="border-b border-line px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.04em] text-muted">Acciones</th>
            </tr>
          </thead>
          <tbody>
            @for (c of categorias(); track c.id) {
              <tr class="transition hover:bg-ivory/60" [class.opacity-55]="!c.activo">
                <td class="border-b border-line px-4 py-3 font-semibold text-ink">{{ c.nombre }}</td>
                <td class="border-b border-line px-4 py-3 text-muted">{{ c.orden }}</td>
                <td class="border-b border-line px-4 py-3">
                  <app-interruptor
                    [etiqueta]="(c.activo ? 'Desactivar ' : 'Activar ') + c.nombre"
                    [valor]="c.activo"
                    (alternar)="alternarActivo(c)" />
                </td>
                <td class="border-b border-line px-4 py-3">
                  <div class="flex justify-end">
                    <button
                      type="button"
                      (click)="abrirEdicion(c)"
                      [attr.aria-label]="'Editar ' + c.nombre"
                      class="inline-flex items-center gap-1.5 rounded-full border border-line px-3.5 py-1.5 text-[11.5px] font-semibold transition hover:border-wine/40 hover:bg-ivory focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wine">
                      <i class="pi pi-pencil text-[11px]" aria-hidden="true"></i>
                      Editar
                    </button>
                  </div>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="4" class="border-b border-line px-4 py-16 text-center">
                  <div class="flex flex-col items-center gap-2 text-muted">
                    <i class="pi pi-tags text-2xl" aria-hidden="true"></i>
                    <p class="text-[13px]">{{ cargando() ? "Cargando…" : "Todavía no hay categorías." }}</p>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>

    @if (formAbierto()) {
      <app-categoria-form [tipo]="tipo()" [categoria]="categoriaEnEdicion()" (guardado)="alGuardar($event)" (cerrado)="cerrarForm()" />
    }
  `
})
export class CategoriasPanel {
  readonly tipo = input.required<TipoCategoria>();

  private readonly adminCatalogo = inject(AdminCatalogoService);

  protected readonly categorias = signal<readonly CategoriaAdmin[]>([]);
  protected readonly cargando = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly aviso = signal<string | null>(null);

  protected readonly formAbierto = signal(false);
  protected readonly categoriaEnEdicion = signal<CategoriaAdmin | null>(null);

  constructor() {
    // Los inputs de señal no tienen valor dentro del constructor: se espera a que
    // Angular los asigne (el effect corre después), y se recarga si "tipo" cambia.
    effect(() => {
      this.tipo();
      untracked(() => this.cargar());
    });
  }

  protected abrirNuevo(): void {
    this.categoriaEnEdicion.set(null);
    this.formAbierto.set(true);
  }

  protected abrirEdicion(categoria: CategoriaAdmin): void {
    this.categoriaEnEdicion.set(categoria);
    this.formAbierto.set(true);
  }

  protected cerrarForm(): void {
    this.formAbierto.set(false);
    this.categoriaEnEdicion.set(null);
  }

  protected alGuardar(categoria: CategoriaAdmin): void {
    const editaba = this.categoriaEnEdicion() !== null;
    this.cerrarForm();
    this.mostrarAviso(editaba ? `Se guardaron los cambios de "${categoria.nombre}".` : `"${categoria.nombre}" ya está disponible para usarse.`);
    this.cargar();
  }

  protected alternarActivo(categoria: CategoriaAdmin): void {
    if (categoria.activo) {
      this.adminCatalogo.desactivarCategoria(categoria.id).subscribe({
        next: () => this.trasAlternar(categoria.nombre, false),
        error: (e: ApiError) => this.error.set(e.mensaje)
      });
    } else {
      this.adminCatalogo.actualizarCategoria(categoria.id, aCategoriaRequest(categoria)).subscribe({
        next: () => this.trasAlternar(categoria.nombre, true),
        error: (e: ApiError) => this.error.set(e.mensaje)
      });
    }
  }

  private trasAlternar(nombre: string, activo: boolean): void {
    this.mostrarAviso(activo ? `"${nombre}" vuelve a estar disponible.` : `"${nombre}" ya no se puede elegir para nuevos registros.`);
    this.cargar();
  }

  private cargar(): void {
    this.cargando.set(true);
    this.error.set(null);
    this.adminCatalogo.listarCategorias(this.tipo()).subscribe({
      next: categorias => {
        this.categorias.set(categorias);
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
