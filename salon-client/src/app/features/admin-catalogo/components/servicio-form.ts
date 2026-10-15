import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output, signal } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";

import { ApiError } from "../../../core/models/auth.models";
import { CatalogoService } from "../../catalogo/services/catalogo.service";
import { ETIQUETA_GRUPO_CORTES, generarSlug, GrupoCortes, ServicioAdmin } from "../models/admin-catalogo.models";
import { AdminCatalogoService } from "../services/admin-catalogo.service";
import { ImagenSubida } from "./imagen-subida";
import { Interruptor } from "./interruptor";

const GRUPOS_CORTES: readonly GrupoCortes[] = ["MUJERES", "HOMBRES", "NINOS", "ABUELOS"];

@Component({
  selector: "app-servicio-form",
  imports: [ReactiveFormsModule, ImagenSubida, Interruptor],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="fixed inset-0 z-40 flex items-start justify-center overflow-y-auto bg-ink/40 px-4 py-10"
      (click)="cerrarSiEsElFondo($event)">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-servicio"
        class="w-full max-w-[600px] rounded-xl border border-line bg-white shadow-[0_24px_60px_-20px_rgba(17,17,17,0.35)]">
        <div class="flex items-start justify-between gap-3 border-b border-line px-6 py-5">
          <div>
            <h2 id="titulo-servicio" class="font-serif text-[20px] font-semibold">
              {{ editando() ? "Editar servicio" : "Nuevo servicio" }}
            </h2>
            <p class="mt-1 text-[13px] text-muted">
              {{ editando() ? "Los cambios se ven en el sitio público al instante." : "Aparece de inmediato en el catálogo público." }}
            </p>
          </div>
          <button
            type="button"
            (click)="cerrado.emit()"
            aria-label="Cerrar"
            class="-mr-1.5 -mt-1 grid size-8 flex-shrink-0 place-items-center rounded-full text-muted transition hover:bg-ivory hover:text-ink focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wine">
            <i class="pi pi-times" aria-hidden="true"></i>
          </button>
        </div>

        <form [formGroup]="formulario" (ngSubmit)="enviar()" novalidate class="flex flex-col gap-6 px-6 py-6">
          @if (errorGeneral(); as mensaje) {
            <div role="alert" class="rounded-lg border border-wine/30 bg-blush px-4 py-3 text-[13px] text-wine-dark">
              {{ mensaje }}
            </div>
          }

          <section class="flex flex-col gap-4">
            <h3 class="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Información básica</h3>

            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label for="s-nombre" class="mb-1.5 block text-[13px] font-semibold">Nombre</label>
                <input id="s-nombre" type="text" formControlName="nombre" (input)="alEscribirNombre()" [class]="claseCampo('nombre')" />
                @if (invalido("nombre")) {
                  <p class="mt-1 text-xs text-wine">Escribe el nombre del servicio.</p>
                }
              </div>
              <div>
                <label for="s-slug" class="mb-1.5 block text-[13px] font-semibold">
                  Identificador <span class="font-normal text-muted">(para la URL)</span>
                </label>
                <div class="relative">
                  <input
                    id="s-slug"
                    type="text"
                    formControlName="slug"
                    placeholder="corte-de-cabello"
                    (input)="slugTocado.set(true)"
                    [class]="claseCampo('slug') + (slugTocado() ? '' : ' pr-[92px]')" />
                  @if (!slugTocado()) {
                    <span
                      aria-hidden="true"
                      class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-blush px-2.5 py-[3px] text-[10.5px] font-semibold text-wine">
                      Automático
                    </span>
                  }
                </div>
                @if (invalido("slug")) {
                  <p class="mt-1 text-xs text-wine">Solo minúsculas, números y guiones, ej. "corte-de-cabello".</p>
                }
              </div>
            </div>

            <div>
              <label for="s-categoria" class="mb-1.5 block text-[13px] font-semibold">Categoría</label>
              <select id="s-categoria" formControlName="categoria" [class]="claseCampo('categoria')">
                <option value="" disabled>Elige una categoría</option>
                @for (c of categorias(); track c.id) {
                  <option [value]="c.id">{{ c.etiqueta }}</option>
                }
              </select>
              @if (invalido("categoria")) {
                <p class="mt-1 text-xs text-wine">Elige una categoría.</p>
              }
            </div>

            <div>
              <label for="s-descripcion" class="mb-1.5 block text-[13px] font-semibold">
                Descripción <span class="font-normal text-muted">(opcional)</span>
              </label>
              <textarea id="s-descripcion" rows="3" formControlName="descripcion" [class]="claseCampo('descripcion')"></textarea>
            </div>
          </section>

          <section class="flex flex-col gap-4 border-t border-line pt-5">
            <h3 class="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Precio y duración</h3>

            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label for="s-precio" class="mb-1.5 block text-[13px] font-semibold">
                  Precio (Q) <span class="font-normal text-muted">(opcional)</span>
                </label>
                <input id="s-precio" type="number" min="0" step="0.01" formControlName="precio" [class]="claseCampo('precio')" />
              </div>
              <div>
                <label for="s-duracion" class="mb-1.5 block text-[13px] font-semibold">
                  Duración (min) <span class="font-normal text-muted">(opcional)</span>
                </label>
                <input id="s-duracion" type="number" min="1" step="1" formControlName="duracionMinutos" [class]="claseCampo('duracionMinutos')" />
              </div>
            </div>

            <div>
              <label for="s-grupo" class="mb-1.5 block text-[13px] font-semibold">
                Catálogo de cortes <span class="font-normal text-muted">(solo si es un servicio de corte)</span>
              </label>
              <select id="s-grupo" formControlName="grupoCortes" [class]="claseCampo('grupoCortes')">
                <option value="">No aplica</option>
                @for (g of grupos; track g) {
                  <option [value]="g">{{ etiquetaGrupo[g] }}</option>
                }
              </select>
            </div>

            <div>
              <label for="s-variantes" class="mb-1.5 block text-[13px] font-semibold">
                Variantes <span class="font-normal text-muted">(una por línea, opcional)</span>
              </label>
              <textarea
                id="s-variantes"
                rows="3"
                formControlName="variantes"
                placeholder="Cabello corto&#10;Cabello largo"
                [class]="claseCampo('variantes')"></textarea>
            </div>
          </section>

          <section class="flex flex-col gap-4 border-t border-line pt-5">
            <h3 class="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Imagen</h3>
            <app-imagen-subida
              etiqueta="Imagen del servicio"
              carpeta="servicios"
              [valorInicial]="servicio()?.imagen ?? null"
              (cambio)="imagenSeleccionada.set($event)" />
          </section>

          <section class="flex flex-col gap-3 border-t border-line pt-5">
            <h3 class="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Visibilidad</h3>

            <div class="flex items-center justify-between gap-3 rounded-lg border border-line bg-ivory px-4 py-3">
              <div>
                <p class="text-[13px] font-semibold">Reservable a domicilio</p>
                <p class="text-xs text-muted">El cliente puede agendarlo fuera del salón.</p>
              </div>
              <app-interruptor
                etiqueta="Reservable a domicilio"
                [valor]="formulario.controls.aDomicilio.value"
                (alternar)="formulario.controls.aDomicilio.setValue($event)" />
            </div>

            @if (editando()) {
              <div class="flex items-center justify-between gap-3 rounded-lg border border-line bg-ivory px-4 py-3">
                <div>
                  <p class="text-[13px] font-semibold">Activo</p>
                  <p class="text-xs text-muted">Visible en el catálogo público del sitio.</p>
                </div>
                <app-interruptor
                  etiqueta="Activo"
                  [valor]="formulario.controls.activo.value"
                  (alternar)="formulario.controls.activo.setValue($event)" />
              </div>
            }
          </section>

          <div class="flex justify-end gap-2.5 border-t border-line pt-5">
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
              {{ editando() ? "Guardar cambios" : "Crear servicio" }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  host: { "(document:keydown.escape)": "cerrado.emit()" }
})
export class ServicioForm {
  readonly servicio = input<ServicioAdmin | null>(null);
  readonly guardado = output<ServicioAdmin>();
  readonly cerrado = output<void>();

  private readonly fb = inject(FormBuilder);
  private readonly adminCatalogo = inject(AdminCatalogoService);
  protected readonly catalogo = inject(CatalogoService);

  protected readonly grupos = GRUPOS_CORTES;
  protected readonly etiquetaGrupo = ETIQUETA_GRUPO_CORTES;
  protected readonly categorias = this.catalogo.categoriasServicio;

  protected readonly guardando = signal(false);
  protected readonly errorGeneral = signal<string | null>(null);
  protected readonly imagenSeleccionada = signal<string | null | undefined>(undefined);

  protected readonly editando = computed(() => this.servicio() !== null);
  protected readonly slugTocado = signal(false);

  protected readonly formulario = this.fb.nonNullable.group({
    nombre: ["", [Validators.required, Validators.maxLength(150)]],
    slug: ["", [Validators.required, Validators.maxLength(100), Validators.pattern(/^[a-z0-9]+(-[a-z0-9]+)*$/)]],
    categoria: ["", [Validators.required]],
    descripcion: ["", [Validators.maxLength(5000)]],
    precio: [null as number | null],
    duracionMinutos: [null as number | null],
    grupoCortes: [""],
    variantes: [""],
    aDomicilio: [false],
    activo: [true]
  });

  constructor() {
    effect(() => {
      const servicio = this.servicio();
      if (!servicio) return;
      this.slugTocado.set(true);
      this.formulario.patchValue({
        nombre: servicio.nombre,
        slug: servicio.slug,
        categoria: servicio.categoria,
        descripcion: servicio.descripcion ?? "",
        precio: servicio.precio,
        duracionMinutos: servicio.duracionMinutos,
        grupoCortes: servicio.grupoCortes ?? "",
        variantes: servicio.variantes.join("\n"),
        aDomicilio: servicio.aDomicilio,
        activo: servicio.activo
      });
    });
  }

  protected alEscribirNombre(): void {
    if (this.slugTocado()) return;
    this.formulario.controls.slug.setValue(generarSlug(this.formulario.controls.nombre.value));
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
    const servicioEnEdicion = this.servicio();
    // Si no se tocó el campo de imagen, se conserva la que ya tenía (o null si es nuevo).
    const imagenSeleccionada = this.imagenSeleccionada();
    const imagen = imagenSeleccionada !== undefined ? imagenSeleccionada : (servicioEnEdicion?.imagen ?? null);

    this.guardando.set(true);
    const datos = {
      slug: v.slug.trim(),
      categoria: v.categoria,
      nombre: v.nombre.trim(),
      descripcion: v.descripcion.trim() || null,
      precio: v.precio,
      duracionMinutos: v.duracionMinutos,
      aDomicilio: v.aDomicilio,
      variantes: v.variantes
        .split("\n")
        .map(l => l.trim())
        .filter(l => l.length > 0),
      grupoCortes: v.grupoCortes ? (v.grupoCortes as GrupoCortes) : null,
      imagen,
      activo: v.activo
    };

    const peticion = servicioEnEdicion
      ? this.adminCatalogo.actualizarServicio(servicioEnEdicion.id, datos)
      : this.adminCatalogo.crearServicio(datos);

    peticion.subscribe({
      next: servicio => {
        this.guardando.set(false);
        this.guardado.emit(servicio);
      },
      error: (error: ApiError) => {
        this.guardando.set(false);
        this.errorGeneral.set(error.mensaje);
      }
    });
  }
}
