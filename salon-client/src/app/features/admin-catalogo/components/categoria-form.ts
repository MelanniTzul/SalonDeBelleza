import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output, signal } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";

import { ApiError } from "../../../core/models/auth.models";
import { CategoriaAdmin, generarSlug, TipoCategoria } from "../models/admin-catalogo.models";
import { AdminCatalogoService } from "../services/admin-catalogo.service";
import { Interruptor } from "./interruptor";

@Component({
  selector: "app-categoria-form",
  imports: [ReactiveFormsModule, Interruptor],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="fixed inset-0 z-40 flex items-start justify-center overflow-y-auto bg-ink/40 px-4 py-10"
      (click)="cerrarSiEsElFondo($event)">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-categoria"
        class="w-full max-w-[440px] rounded-xl border border-line bg-white shadow-[0_24px_60px_-20px_rgba(17,17,17,0.35)]">
        <div class="flex items-start justify-between gap-3 border-b border-line px-6 py-5">
          <div>
            <h2 id="titulo-categoria" class="font-serif text-[20px] font-semibold">
              {{ editando() ? "Editar categoría" : "Nueva categoría" }}
            </h2>
            <p class="mt-1 text-[13px] text-muted">Organiza cómo se agrupan los servicios en el catálogo público.</p>
          </div>
          <button
            type="button"
            (click)="cerrado.emit()"
            aria-label="Cerrar"
            class="-mr-1.5 -mt-1 grid size-8 flex-shrink-0 place-items-center rounded-full text-muted transition hover:bg-ivory hover:text-ink focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wine">
            <i class="pi pi-times" aria-hidden="true"></i>
          </button>
        </div>

        <form [formGroup]="formulario" (ngSubmit)="enviar()" novalidate class="flex flex-col gap-4 px-6 py-6">
          @if (errorGeneral(); as mensaje) {
            <div role="alert" class="rounded-lg border border-wine/30 bg-blush px-4 py-3 text-[13px] text-wine-dark">
              {{ mensaje }}
            </div>
          }

          <div>
            <label for="c-nombre" class="mb-1.5 block text-[13px] font-semibold">Nombre</label>
            <input id="c-nombre" type="text" formControlName="nombre" [class]="claseCampo('nombre')" />
            @if (invalido("nombre")) {
              <p class="mt-1 text-xs text-wine">Escribe el nombre de la categoría.</p>
            }
            <p class="mt-1 text-xs text-muted">El identificador interno se genera solo a partir del nombre.</p>
          </div>

          <div>
            <label for="c-orden" class="mb-1.5 block text-[13px] font-semibold">
              Orden <span class="font-normal text-muted">(opcional, menor número aparece primero)</span>
            </label>
            <input id="c-orden" type="number" step="1" formControlName="orden" [class]="claseCampo('orden')" />
          </div>

          @if (editando()) {
            <div class="flex items-center justify-between gap-3 rounded-lg border border-line bg-ivory px-4 py-3">
              <div>
                <p class="text-[13px] font-semibold">Activa</p>
                <p class="text-xs text-muted">Visible para elegir al crear o editar servicios.</p>
              </div>
              <app-interruptor
                etiqueta="Activa"
                [valor]="formulario.controls.activo.value"
                (alternar)="formulario.controls.activo.setValue($event)" />
            </div>
          }

          <div class="mt-2 flex justify-end gap-2.5 border-t border-line pt-5">
            <button
              type="button"
              (click)="cerrado.emit()"
              class="rounded-full border border-line px-4 py-2.5 text-[13px] font-semibold text-ink transition hover:bg-ivory focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wine">
              Cancelar
            </button>
            <button
              type="submit"
              [disabled]="guardando()"
              class="flex items-center gap-2 rounded-full bg-wine px-5 py-2.5 text-[13px] font-semibold text-white transition hover:bg-wine-dark focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wine disabled:opacity-60">
              @if (guardando()) {
                <i class="pi pi-spin pi-spinner" aria-hidden="true"></i>
              } @else {
                <i class="pi pi-check" aria-hidden="true"></i>
              }
              {{ editando() ? "Guardar cambios" : "Crear categoría" }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  host: { "(document:keydown.escape)": "cerrado.emit()" }
})
export class CategoriaForm {
  readonly tipo = input.required<TipoCategoria>();
  readonly categoria = input<CategoriaAdmin | null>(null);
  readonly guardado = output<CategoriaAdmin>();
  readonly cerrado = output<void>();

  private readonly fb = inject(FormBuilder);
  private readonly adminCatalogo = inject(AdminCatalogoService);

  protected readonly guardando = signal(false);
  protected readonly errorGeneral = signal<string | null>(null);

  protected readonly editando = computed(() => this.categoria() !== null);

  protected readonly formulario = this.fb.nonNullable.group({
    nombre: ["", [Validators.required, Validators.maxLength(100)]],
    orden: [null as number | null],
    activo: [true]
  });

  constructor() {
    effect(() => {
      const categoria = this.categoria();
      if (!categoria) return;
      this.formulario.patchValue({
        nombre: categoria.nombre,
        orden: categoria.orden,
        activo: categoria.activo
      });
    });
  }

  protected claseCampo(campo: keyof typeof this.formulario.controls): string {
    const base =
      "w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition focus:border-wine focus:ring-2 focus:ring-wine/20";
    return `${base} ${this.invalido(campo) ? "border-wine" : "border-line"}`;
  }

  protected invalido(campo: keyof typeof this.formulario.controls): boolean {
    const control = this.formulario.controls[campo];
    return control.invalid && (control.dirty || control.touched);
  }

  protected cerrarSiEsElFondo(evento: MouseEvent): void {
    if (evento.target === evento.currentTarget) {
      this.cerrado.emit();
    }
  }

  protected enviar(): void {
    this.errorGeneral.set(null);

    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const v = this.formulario.getRawValue();
    const nombre = v.nombre.trim();
    const categoriaEnEdicion = this.categoria();

    this.guardando.set(true);

    if (categoriaEnEdicion) {
      // Al editar se conserva el identificador que ya tenía: cambiarlo no aporta nada y
      // solo arriesga una colisión innecesaria.
      const datos = { slug: categoriaEnEdicion.slug, nombre, tipo: this.tipo(), orden: v.orden, activo: v.activo };
      this.adminCatalogo.actualizarCategoria(categoriaEnEdicion.id, datos).subscribe({
        next: categoria => {
          this.guardando.set(false);
          this.guardado.emit(categoria);
        },
        error: (error: ApiError) => {
          this.guardando.set(false);
          this.errorGeneral.set(error.mensaje);
        }
      });
      return;
    }

    this.crearConIdentificadorUnico(nombre, generarSlug(nombre), v.orden, v.activo, 1);
  }

  // Si el identificador generado ya existe (409 por el identificador, no por el nombre),
  // reintenta con un sufijo numérico hasta encontrar uno libre, sin que el administrador
  // tenga que intervenir. Un 409 por nombre repetido sí es un error real: el admin debe
  // elegir otro nombre, así que ahí no se reintenta.
  private crearConIdentificadorUnico(nombre: string, base: string, orden: number | null, activo: boolean, intento: number): void {
    const slug = intento === 1 ? base : `${base}-${intento}`;
    const datos = { slug, nombre, tipo: this.tipo(), orden, activo };

    this.adminCatalogo.crearCategoria(datos).subscribe({
      next: categoria => {
        this.guardando.set(false);
        this.guardado.emit(categoria);
      },
      error: (error: ApiError) => {
        const esColisionDeIdentificador = error.status === 409 && error.mensaje.includes("identificador");
        if (esColisionDeIdentificador && intento < 30) {
          this.crearConIdentificadorUnico(nombre, base, orden, activo, intento + 1);
          return;
        }
        this.guardando.set(false);
        this.errorGeneral.set(error.mensaje);
      }
    });
  }
}
