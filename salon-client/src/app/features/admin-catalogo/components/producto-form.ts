import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output, signal } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";

import { ApiError } from "../../../core/models/auth.models";
import { CatalogoService } from "../../catalogo/services/catalogo.service";
import { ETIQUETA_NIVEL_FIJACION, ETIQUETA_TIPO_ACABADO, generarSlug, NivelFijacion, ProductoAdmin, TipoAcabado } from "../models/admin-catalogo.models";
import { AdminCatalogoService } from "../services/admin-catalogo.service";
import { ImagenSubida } from "./imagen-subida";
import { Interruptor } from "./interruptor";

const NIVELES_FIJACION: readonly NivelFijacion[] = ["MEDIA", "FUERTE", "MUY_FUERTE"];
const TIPOS_ACABADO: readonly TipoAcabado[] = ["BRILLANTE", "NATURAL", "MATE"];

@Component({
  selector: "app-producto-form",
  imports: [ReactiveFormsModule, ImagenSubida, Interruptor],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="fixed inset-0 z-40 flex items-start justify-center overflow-y-auto bg-ink/40 px-4 py-10"
      (click)="cerrarSiEsElFondo($event)">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-producto"
        class="w-full max-w-[600px] rounded-xl border border-line bg-white shadow-[0_24px_60px_-20px_rgba(17,17,17,0.35)]">
        <div class="flex items-start justify-between gap-3 border-b border-line px-6 py-5">
          <div>
            <h2 id="titulo-producto" class="font-serif text-[20px] font-semibold">
              {{ editando() ? "Editar producto" : "Nuevo producto" }}
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
                <label for="p-nombre" class="mb-1.5 block text-[13px] font-semibold">Nombre</label>
                <input id="p-nombre" type="text" formControlName="nombre" (input)="alEscribirNombre()" [class]="claseCampo('nombre')" />
                @if (invalido("nombre")) {
                  <p class="mt-1 text-xs text-wine">Escribe el nombre del producto.</p>
                }
              </div>
              <div>
                <label for="p-slug" class="mb-1.5 block text-[13px] font-semibold">
                  Identificador <span class="font-normal text-muted">(para la URL)</span>
                </label>
                <div class="relative">
                  <input
                    id="p-slug"
                    type="text"
                    formControlName="slug"
                    placeholder="cera-fijadora-mate"
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
                  <p class="mt-1 text-xs text-wine">Solo minúsculas, números y guiones, ej. "cera-fijadora-mate".</p>
                }
              </div>
            </div>

            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label for="p-categoria" class="mb-1.5 block text-[13px] font-semibold">Categoría</label>
                <select id="p-categoria" formControlName="categoria" [class]="claseCampo('categoria')">
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
                <label for="p-marca" class="mb-1.5 block text-[13px] font-semibold">
                  Marca <span class="font-normal text-muted">(opcional)</span>
                </label>
                <input id="p-marca" type="text" formControlName="marca" [class]="claseCampo('marca')" />
              </div>
            </div>

            <div>
              <label for="p-descripcion" class="mb-1.5 block text-[13px] font-semibold">
                Descripción <span class="font-normal text-muted">(opcional)</span>
              </label>
              <textarea id="p-descripcion" rows="3" formControlName="descripcion" [class]="claseCampo('descripcion')"></textarea>
            </div>
          </section>

          <section class="flex flex-col gap-4 border-t border-line pt-5">
            <h3 class="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Precio y características</h3>

            <div>
              <label for="p-precio" class="mb-1.5 block text-[13px] font-semibold">
                Precio (Q) <span class="font-normal text-muted">(opcional)</span>
              </label>
              <input id="p-precio" type="number" min="0" step="0.01" formControlName="precio" [class]="claseCampo('precio')" />
            </div>

            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label for="p-fijacion" class="mb-1.5 block text-[13px] font-semibold">
                  Fijación <span class="font-normal text-muted">(opcional)</span>
                </label>
                <input id="p-fijacion" type="text" formControlName="fijacion" placeholder="Media a fuerte" [class]="claseCampo('fijacion')" />
              </div>
              <div>
                <label for="p-nivel-fijacion" class="mb-1.5 block text-[13px] font-semibold">Nivel de fijación</label>
                <select id="p-nivel-fijacion" formControlName="nivelFijacion" [class]="claseCampo('nivelFijacion')">
                  <option value="">No aplica</option>
                  @for (n of nivelesFijacion; track n) {
                    <option [value]="n">{{ etiquetaNivel[n] }}</option>
                  }
                </select>
              </div>
            </div>

            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label for="p-acabado" class="mb-1.5 block text-[13px] font-semibold">
                  Acabado <span class="font-normal text-muted">(opcional)</span>
                </label>
                <input id="p-acabado" type="text" formControlName="acabado" placeholder="Mate" [class]="claseCampo('acabado')" />
              </div>
              <div>
                <label for="p-tipo-acabado" class="mb-1.5 block text-[13px] font-semibold">Tipo de acabado</label>
                <select id="p-tipo-acabado" formControlName="tipoAcabado" [class]="claseCampo('tipoAcabado')">
                  <option value="">No aplica</option>
                  @for (t of tiposAcabado; track t) {
                    <option [value]="t">{{ etiquetaAcabado[t] }}</option>
                  }
                </select>
              </div>
            </div>

            <div>
              <label for="p-beneficios" class="mb-1.5 block text-[13px] font-semibold">
                Beneficios <span class="font-normal text-muted">(uno por línea, opcional)</span>
              </label>
              <textarea
                id="p-beneficios"
                rows="3"
                formControlName="beneficios"
                placeholder="Fijación de larga duración&#10;No deja residuo graso"
                [class]="claseCampo('beneficios')"></textarea>
            </div>
          </section>

          <section class="flex flex-col gap-4 border-t border-line pt-5">
            <h3 class="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Imágenes</h3>
            <div class="flex flex-col gap-4 sm:flex-row">
              <app-imagen-subida
                etiqueta="Imagen principal"
                carpeta="productos"
                [valorInicial]="producto()?.imagen ?? null"
                (cambio)="imagenSeleccionada.set($event)" />
              <app-imagen-subida
                etiqueta="Imagen de detalle"
                carpeta="productos"
                [valorInicial]="producto()?.imagenDetalle ?? null"
                (cambio)="imagenDetalleSeleccionada.set($event)" />
            </div>
          </section>

          @if (editando()) {
            <section class="flex flex-col gap-3 border-t border-line pt-5">
              <h3 class="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Visibilidad</h3>
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
            </section>
          }

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
              {{ editando() ? "Guardar cambios" : "Crear producto" }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  host: { "(document:keydown.escape)": "cerrado.emit()" }
})
export class ProductoForm {
  readonly producto = input<ProductoAdmin | null>(null);
  readonly guardado = output<ProductoAdmin>();
  readonly cerrado = output<void>();

  private readonly fb = inject(FormBuilder);
  private readonly adminCatalogo = inject(AdminCatalogoService);
  protected readonly catalogo = inject(CatalogoService);

  protected readonly nivelesFijacion = NIVELES_FIJACION;
  protected readonly tiposAcabado = TIPOS_ACABADO;
  protected readonly etiquetaNivel = ETIQUETA_NIVEL_FIJACION;
  protected readonly etiquetaAcabado = ETIQUETA_TIPO_ACABADO;
  protected readonly categorias = this.catalogo.categoriasProducto;

  protected readonly guardando = signal(false);
  protected readonly errorGeneral = signal<string | null>(null);
  protected readonly imagenSeleccionada = signal<string | null | undefined>(undefined);
  protected readonly imagenDetalleSeleccionada = signal<string | null | undefined>(undefined);

  protected readonly editando = computed(() => this.producto() !== null);
  protected readonly slugTocado = signal(false);

  protected readonly formulario = this.fb.nonNullable.group({
    nombre: ["", [Validators.required, Validators.maxLength(150)]],
    slug: ["", [Validators.required, Validators.maxLength(100), Validators.pattern(/^[a-z0-9]+(-[a-z0-9]+)*$/)]],
    categoria: ["", [Validators.required]],
    marca: ["", [Validators.maxLength(80)]],
    descripcion: ["", [Validators.maxLength(5000)]],
    precio: [null as number | null],
    fijacion: ["", [Validators.maxLength(40)]],
    nivelFijacion: [""],
    acabado: ["", [Validators.maxLength(40)]],
    tipoAcabado: [""],
    beneficios: [""],
    activo: [true]
  });

  constructor() {
    effect(() => {
      const producto = this.producto();
      if (!producto) return;
      this.slugTocado.set(true);
      this.formulario.patchValue({
        nombre: producto.nombre,
        slug: producto.slug,
        categoria: producto.categoria,
        marca: producto.marca ?? "",
        descripcion: producto.descripcion ?? "",
        precio: producto.precio,
        fijacion: producto.fijacion ?? "",
        nivelFijacion: producto.nivelFijacion ?? "",
        acabado: producto.acabado ?? "",
        tipoAcabado: producto.tipoAcabado ?? "",
        beneficios: producto.beneficios.join("\n"),
        activo: producto.activo
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
    const productoEnEdicion = this.producto();
    const imagenSeleccionada = this.imagenSeleccionada();
    const imagen = imagenSeleccionada !== undefined ? imagenSeleccionada : (productoEnEdicion?.imagen ?? null);
    const imagenDetalleSeleccionada = this.imagenDetalleSeleccionada();
    const imagenDetalle = imagenDetalleSeleccionada !== undefined ? imagenDetalleSeleccionada : (productoEnEdicion?.imagenDetalle ?? null);

    this.guardando.set(true);
    const datos = {
      slug: v.slug.trim(),
      categoria: v.categoria,
      marca: v.marca.trim() || null,
      nombre: v.nombre.trim(),
      descripcion: v.descripcion.trim() || null,
      precio: v.precio,
      imagen,
      imagenDetalle,
      posicionImagen: null,
      fijacion: v.fijacion.trim() || null,
      nivelFijacion: v.nivelFijacion ? (v.nivelFijacion as NivelFijacion) : null,
      acabado: v.acabado.trim() || null,
      tipoAcabado: v.tipoAcabado ? (v.tipoAcabado as TipoAcabado) : null,
      beneficios: v.beneficios
        .split("\n")
        .map(l => l.trim())
        .filter(l => l.length > 0),
      activo: v.activo
    };

    const peticion = productoEnEdicion
      ? this.adminCatalogo.actualizarProducto(productoEnEdicion.id, datos)
      : this.adminCatalogo.crearProducto(datos);

    peticion.subscribe({
      next: producto => {
        this.guardando.set(false);
        this.guardado.emit(producto);
      },
      error: (error: ApiError) => {
        this.guardando.set(false);
        this.errorGeneral.set(error.mensaje);
      }
    });
  }
}
