import { DOCUMENT, NgOptimizedImage } from "@angular/common";
import { ChangeDetectionStrategy, Component, ElementRef, inject, signal, viewChild } from "@angular/core";
import { LightboxService } from "../../../shared/services/lightbox.service";
import { VideoTarjeta } from "./video-tarjeta";

interface Diapositiva {
  tipo: "video" | "foto";
  src: string;
  poster?: string;
  titulo: string;
  categoria: string;
  duracion?: string;
  alt?: string;
}

const foto = (archivo: string, titulo: string, categoria: string): Diapositiva => ({
  tipo: "foto",
  src: `img/trabajos/${archivo}.jpg`,
  titulo,
  categoria,
  alt: `${titulo}: trabajo realizado en el salón`
});

// Carrusel grande de trabajos: una pieza a la vez, con flechas, puntos y deslizamiento táctil.
@Component({
  selector: "app-salon-galeria",
  imports: [NgOptimizedImage, VideoTarjeta],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="mx-auto max-w-[1080px]"
      role="region"
      aria-roledescription="carrusel"
      aria-label="Trabajos del salón"
      (keydown.arrowright)="mover(1)"
      (keydown.arrowleft)="mover(-1)"
    >
      <div class="relative">
        <ul
          #pista
          (scroll)="alDesplazar()"
          class="flex snap-x snap-mandatory overflow-x-auto rounded-3xl bg-ink shadow-2xl ring-1 shadow-ink/30 ring-ink/5 scroll-smooth motion-reduce:scroll-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          @for (d of diapositivas; track d.src; let i = $index) {
            <li
              role="group"
              aria-roledescription="diapositiva"
              [attr.aria-label]="i + 1 + ' de ' + diapositivas.length"
              class="relative aspect-[3/4] w-full shrink-0 snap-center md:aspect-auto md:h-[min(80vh,780px)]"
            >
              @if (d.tipo === "video") {
                <app-video-tarjeta [src]="d.src" [poster]="d.poster!" [titulo]="d.titulo" [categoria]="d.categoria" [duracion]="d.duracion!" />
              } @else {
                <figure class="group relative size-full overflow-hidden bg-ink">
                  <div aria-hidden="true" class="absolute inset-0 scale-125 bg-cover bg-center opacity-60 blur-2xl" [style.background-image]="'url(' + d.src + ')'"></div>
                  <img [ngSrc]="d.src" fill sizes="(min-width: 1024px) 60vw, 100vw" alt="" class="object-contain" />
                  <button type="button" (click)="ampliar(d)" [attr.aria-label]="'Ampliar foto: ' + d.titulo" class="absolute inset-0 cursor-zoom-in focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-white"></button>
                  <div aria-hidden="true" class="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-linear-to-t from-ink/90 via-ink/40 to-transparent"></div>
                  <span class="pointer-events-none absolute top-5 left-5 inline-flex items-center gap-1.5 rounded-full bg-ink/55 px-3.5 py-1.5 text-xs font-semibold text-white backdrop-blur md:top-7 md:left-7">
                    <i class="pi pi-camera text-[10px]" aria-hidden="true"></i>Foto
                  </span>
                  <figcaption class="pointer-events-none absolute inset-x-0 bottom-0 p-6 md:p-10">
                    <span class="mb-1 block text-xs font-semibold tracking-[0.16em] text-gold uppercase">{{ d.categoria }}</span>
                    <span class="block font-serif text-2xl leading-snug font-semibold text-white md:text-4xl">{{ d.titulo }}</span>
                  </figcaption>
                </figure>
              }
            </li>
          }
        </ul>

        <button
          type="button"
          (click)="mover(-1)"
          aria-label="Anterior"
          class="absolute top-1/2 left-3 z-10 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-wine shadow-lg transition hover:bg-white hover:text-wine-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white md:left-5 md:size-12"
        >
          <i class="pi pi-chevron-left" aria-hidden="true"></i>
        </button>
        <button
          type="button"
          (click)="mover(1)"
          aria-label="Siguiente"
          class="absolute top-1/2 right-3 z-10 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-wine shadow-lg transition hover:bg-white hover:text-wine-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white md:right-5 md:size-12"
        >
          <i class="pi pi-chevron-right" aria-hidden="true"></i>
        </button>
      </div>

      <div class="mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-3">
        <div class="flex flex-wrap items-center justify-center gap-2" role="group" aria-label="Elegir diapositiva">
          @for (d of diapositivas; track d.src; let i = $index) {
            <button
              type="button"
              (click)="irA(i)"
              [attr.aria-label]="'Ver ' + d.titulo"
              [attr.aria-current]="i === activa()"
              class="h-2.5 rounded-full transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wine"
              [class]="i === activa() ? 'w-8 bg-wine' : 'w-2.5 bg-wine/30 hover:bg-wine/60'"
            ></button>
          }
        </div>
        <p class="text-xs font-medium text-muted tabular-nums" aria-live="polite">{{ activa() + 1 }} / {{ diapositivas.length }}</p>
      </div>
    </div>
  `
})
export class SalonGaleria {
  private readonly lightbox = inject(LightboxService);
  private readonly documento = inject(DOCUMENT);
  private readonly pista = viewChild.required<ElementRef<HTMLUListElement>>("pista");

  readonly activa = signal(0);
  // Videos y fotos reales de trabajos. Las fotos son copias livianas en public/img/trabajos/ (los originales están en trabajos/originales/).
  readonly diapositivas: readonly Diapositiva[] = [
    foto("recogido-flores-01", "Recogido de rizos con flores doradas", "Recogido"),
    { tipo: "video", src: "img/video-02.mp4", poster: "img/web/poster-video-02.jpg", titulo: "Moño bajo con textura", categoria: "Moño", duracion: "0:13" },
    foto("mono-trenzado-01", "Moño trenzado", "Recogido"),
    { tipo: "video", src: "img/video-03.mp4", poster: "img/web/poster-video-03.jpg", titulo: "Recogido con tocado dorado", categoria: "Recogido", duracion: "0:06" },
    foto("mono-trenzado-02", "Moño trenzado de espalda", "Recogido"),
    foto("recogido-flores-04", "Recogido lateral con flores", "Peinado"),
    foto("corte-degradado-01", "Corte degradado", "Corte"),
    foto("corte-degradado-02", "Degradado con acabado limpio", "Corte"),
    foto("corte-rizos", "Corte de rizos con textura", "Corte"),
    foto("lacio-largo", "Cabello largo y liso", "Lacio"),
    { tipo: "foto", src: "img/web/salon-111.jpg", titulo: "Corte con acabado natural", categoria: "Corte", alt: "Corte de cabello corto con acabado natural, en el salón" }
  ];

  // Al cambiar de diapositiva se pausan los videos
  alDesplazar(): void {
    const pista = this.pista().nativeElement;
    const indice = Math.round(pista.scrollLeft / pista.clientWidth);
    if (indice === this.activa()) return;
    this.activa.set(indice);
    pista.querySelectorAll("video").forEach(v => v.pause());
  }

  irA(indice: number): void {
    const pista = this.pista().nativeElement;
    // Solo se anima al pasar a la pieza contigua; los saltos largos (puntos, vuelta al inicio) son directos
    const contigua = Math.abs(indice - this.activa()) <= 1;
    pista.scrollTo({ left: indice * pista.clientWidth, behavior: contigua && !this.reducirMovimiento() ? "smooth" : "instant" });
  }

  // Circular: después de la última vuelve a la primera
  mover(sentido: 1 | -1): void {
    const total = this.diapositivas.length;
    this.irA((this.activa() + sentido + total) % total);
  }

  // El visor recorre todas las fotos del carrusel, empezando por la que se tocó
  ampliar(d: Diapositiva): void {
    const fotos = this.diapositivas.filter(x => x.tipo === "foto");
    this.lightbox.abrir(
      fotos.map(x => ({ src: x.src, alt: x.alt ?? x.titulo, titulo: x.titulo })),
      fotos.indexOf(d)
    );
  }

  private reducirMovimiento(): boolean {
    return this.documento.defaultView?.matchMedia("(prefers-reduced-motion: reduce)").matches ?? false;
  }
}
