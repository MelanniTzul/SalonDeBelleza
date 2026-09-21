import { NgOptimizedImage, DOCUMENT } from "@angular/common";
import { ChangeDetectionStrategy, Component, ElementRef, effect, inject, viewChild } from "@angular/core";
import { LightboxService } from "../services/lightbox.service";

// Umbral (px) de desplazamiento horizontal para considerar un deslizamiento en pantallas táctiles
const UMBRAL_DESLIZAMIENTO = 50;

@Component({
  selector: "app-lightbox",
  imports: [NgOptimizedImage],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <dialog
      #dialogo
      aria-label="Imagen ampliada"
      (close)="lightbox.cerrar()"
      (click)="alHacerClic($event)"
      (keydown)="alPresionarTecla($event)"
      class="fixed inset-0 m-0 h-dvh max-h-none w-dvw max-w-none border-0 bg-transparent p-0 text-white backdrop:bg-ink/90 backdrop:backdrop-blur-sm"
    >
      @if (lightbox.actual(); as imagen) {
        <div
          data-cerrar
          class="flex h-full w-full flex-col items-center px-4 pt-16 pb-6 sm:px-24"
          [class]="imagen.descripcion?.length ? 'overflow-y-auto md:flex-row md:justify-center md:gap-14 lg:gap-20' : 'justify-center'"
        >
          <button type="button" (click)="lightbox.cerrar()" aria-label="Cerrar imagen ampliada" class="absolute top-4 right-4 z-10 grid size-11 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
            <i class="pi pi-times" aria-hidden="true"></i>
          </button>

          @if (lightbox.hayVarias()) {
            <button type="button" (click)="lightbox.anterior()" aria-label="Imagen anterior" class="absolute top-1/2 left-2 z-10 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:left-6">
              <i class="pi pi-chevron-left" aria-hidden="true"></i>
            </button>
            <button type="button" (click)="lightbox.siguiente()" aria-label="Imagen siguiente" class="absolute top-1/2 right-2 z-10 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:right-6">
              <i class="pi pi-chevron-right" aria-hidden="true"></i>
            </button>
          }

          <div [class]="imagen.descripcion?.length ? 'flex shrink-0 flex-col items-center max-md:my-auto' : 'flex w-full flex-col items-center'">
            <figure
              class="relative touch-pan-y"
              [class]="imagen.descripcion?.length ? 'h-[52vh] w-[calc(52vh*0.8)] max-w-full md:h-[76vh] md:w-[calc(76vh*0.8)]' : 'h-[76vh] w-full max-w-5xl'"
              (pointerdown)="iniciarDeslizamiento($event)"
              (pointerup)="terminarDeslizamiento($event)"
            >
              <img [ngSrc]="imagen.src" fill priority [alt]="imagen.alt" draggable="false" class="object-contain select-none" />
            </figure>

            <p class="mt-4 text-center text-sm" aria-live="polite">
              @if (imagen.titulo) {
                <span class="font-serif text-base font-semibold">{{ imagen.titulo }}</span>
              }
              @if (lightbox.hayVarias()) {
                <span class="ml-2 text-white/70">{{ lightbox.indice() + 1 }} / {{ lightbox.total() }}</span>
              }
            </p>
          </div>

          @if (imagen.descripcion?.length) {
            <div class="mt-8 w-full max-w-lg space-y-4 border-white/25 pb-4 text-justify text-[15px] leading-relaxed hyphens-auto text-white/85 md:mt-0 md:max-h-[76vh] md:w-[26rem] md:overflow-y-auto md:border-l md:pb-0 md:pl-10 lg:w-[30rem]">
              @for (parrafo of imagen.descripcion; track parrafo) {
                <p>{{ parrafo }}</p>
              }
            </div>
          }
        </div>
      }
    </dialog>
  `
})
export class Lightbox {
  protected readonly lightbox = inject(LightboxService);
  private readonly documento = inject(DOCUMENT);
  private readonly dialogo = viewChild.required<ElementRef<HTMLDialogElement>>("dialogo");
  private inicioX: number | null = null;

  constructor() {
    effect(() => {
      const abierto = this.lightbox.abierto();
      const dialogo = this.dialogo().nativeElement;
      if (abierto && !dialogo.open) dialogo.showModal();
      else if (!abierto && dialogo.open) dialogo.close();
      this.documento.body.classList.toggle("overflow-hidden", abierto);
    });
  }

  // Un clic sobre el fondo (no sobre la imagen ni los botones) cierra el visor
  protected alHacerClic(evento: MouseEvent): void {
    const objetivo = evento.target as HTMLElement;
    if (objetivo === this.dialogo().nativeElement || objetivo.hasAttribute("data-cerrar")) this.lightbox.cerrar();
  }

  // Esc lo maneja el propio <dialog>
  protected alPresionarTecla(evento: KeyboardEvent): void {
    if (evento.key === "ArrowRight") this.lightbox.siguiente();
    else if (evento.key === "ArrowLeft") this.lightbox.anterior();
  }

  protected iniciarDeslizamiento(evento: PointerEvent): void {
    this.inicioX = evento.clientX;
  }

  protected terminarDeslizamiento(evento: PointerEvent): void {
    if (this.inicioX === null) return;
    const diferencia = evento.clientX - this.inicioX;
    this.inicioX = null;
    if (diferencia <= -UMBRAL_DESLIZAMIENTO) this.lightbox.siguiente();
    else if (diferencia >= UMBRAL_DESLIZAMIENTO) this.lightbox.anterior();
  }
}
