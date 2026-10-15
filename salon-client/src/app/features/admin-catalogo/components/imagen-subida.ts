import { ChangeDetectionStrategy, Component, inject, input, output, signal } from "@angular/core";

import { API_URL, urlImagen } from "../../../core/config/api.config";
import { ApiError } from "../../../core/models/auth.models";
import { AdminCatalogoService } from "../services/admin-catalogo.service";

// Campo de imagen para los formularios de servicio y producto: sube el archivo apenas se elige
// (la ruta que devuelve el servidor es la que se guarda junto con el resto del formulario).
// La caja cuadrada punteada sigue el estilo "upload-box" del mockup de alta/edición.
@Component({
  selector: "app-imagen-subida",
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col gap-1.5">
      <label class="text-[13px] font-semibold">
        {{ etiqueta() }} @if (opcional()) { <span class="font-normal text-muted">(opcional)</span> }
      </label>

      <div class="flex items-start gap-3">
        <button
          type="button"
          (click)="inputArchivo.click()"
          [disabled]="subiendo()"
          class="group relative grid aspect-square w-28 flex-shrink-0 place-items-center overflow-hidden rounded-xl border border-dashed border-line bg-ivory text-muted transition hover:border-wine/40 hover:bg-blush focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wine disabled:cursor-not-allowed disabled:opacity-60">
          @if (previsualizacion(); as src) {
            <img [src]="src" alt="" class="absolute inset-0 size-full object-cover" />
            <span class="absolute inset-0 flex items-center justify-center bg-ink/0 text-[11px] font-semibold text-white opacity-0 transition group-hover:bg-ink/45 group-hover:opacity-100">
              Cambiar
            </span>
          } @else if (subiendo()) {
            <i class="pi pi-spin pi-spinner text-xl" aria-hidden="true"></i>
          } @else {
            <span class="flex flex-col items-center gap-1.5 px-2 text-center">
              <i class="pi pi-cloud-upload text-xl" aria-hidden="true"></i>
              <span class="text-[11px] font-semibold leading-tight">Subir imagen</span>
            </span>
          }
        </button>

        <input
          #inputArchivo
          type="file"
          accept="image/jpeg,image/png,image/webp"
          class="sr-only"
          [attr.aria-label]="etiqueta()"
          (change)="alElegir($event)" />

        <div class="flex min-w-0 flex-col gap-1.5 pt-1">
          <p class="text-xs text-muted">JPG, PNG o WebP, máximo 5 MB.</p>
          @if (ruta()) {
            <button
              type="button"
              (click)="quitar()"
              [disabled]="subiendo()"
              class="inline-flex items-center gap-1.5 self-start rounded-full border border-line px-3 py-1.5 text-[12px] font-semibold text-ink transition hover:border-wine/40 hover:bg-ivory focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wine disabled:opacity-60">
              <i class="pi pi-trash text-[11px]" aria-hidden="true"></i>
              Quitar imagen
            </button>
          }
          @if (error(); as mensaje) {
            <p role="alert" class="text-xs text-wine">{{ mensaje }}</p>
          }
        </div>
      </div>
    </div>
  `
})
export class ImagenSubida {
  readonly etiqueta = input("Imagen");
  readonly carpeta = input.required<"servicios" | "productos">();
  readonly opcional = input(true);
  // Ruta relativa que ya tenía el registro (para mostrarla al editar), ej. "uploads/servicios/x.jpg".
  readonly valorInicial = input<string | null>(null);

  // Ruta relativa lista para mandar en el formulario ("uploads/..."), o null si se quitó.
  readonly cambio = output<string | null>();

  private readonly adminCatalogo = inject(AdminCatalogoService);
  private readonly apiUrl = inject(API_URL);

  protected readonly ruta = signal<string | null>(null);
  protected readonly subiendo = signal(false);
  protected readonly error = signal<string | null>(null);

  // Vista previa: el archivo recién subido, o el que ya tenía el registro.
  protected readonly previsualizacion = signal<string | undefined>(undefined);

  constructor() {
    const inicial = this.valorInicial();
    if (inicial) {
      this.ruta.set(inicial);
      this.previsualizacion.set(urlImagen(inicial, this.apiUrl));
    }
  }

  protected alElegir(evento: Event): void {
    const archivo = (evento.target as HTMLInputElement).files?.[0];
    if (!archivo) return;

    this.error.set(null);
    this.subiendo.set(true);
    this.adminCatalogo.subirImagen(archivo, this.carpeta()).subscribe({
      next: ({ url }) => {
        this.subiendo.set(false);
        this.ruta.set(url);
        this.previsualizacion.set(urlImagen(url, this.apiUrl));
        this.cambio.emit(url);
      },
      error: (e: ApiError) => {
        this.subiendo.set(false);
        this.error.set(e.mensaje);
      }
    });
  }

  protected quitar(): void {
    this.ruta.set(null);
    this.previsualizacion.set(undefined);
    this.error.set(null);
    this.cambio.emit(null);
  }
}
