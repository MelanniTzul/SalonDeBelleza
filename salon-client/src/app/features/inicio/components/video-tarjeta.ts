import { DOCUMENT } from "@angular/common";
import { ChangeDetectionStrategy, Component, ElementRef, inject, input, signal, viewChild } from "@angular/core";

// Video sin sonido que llena su contenedor: se muestra completo (object-contain) sobre un fondo desenfocado de su portada.
// Portada, botón de play y título; al reproducir se pausan los demás videos y al terminar vuelve la portada.
@Component({
  selector: "app-video-tarjeta",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "relative block size-full overflow-hidden bg-ink" },
  template: `
    <div aria-hidden="true" class="absolute inset-0 scale-125 bg-cover bg-center opacity-60 blur-2xl" [style.background-image]="'url(' + poster() + ')'"></div>
    <video
      #video
      [poster]="poster()"
      [controls]="iniciado()"
      playsinline
      preload="metadata"
      [muted]="true"
      (volumechange)="silenciar()"
      (play)="alReproducir()"
      (ended)="alTerminar()"
      [attr.aria-label]="titulo()"
      [src]="src()"
      class="relative size-full object-contain [&::-webkit-media-controls-mute-button]:hidden [&::-webkit-media-controls-volume-control-container]:hidden [&::-webkit-media-controls-volume-slider]:hidden"
    ></video>

    @if (!iniciado()) {
      <button
        type="button"
        (click)="reproducir()"
        [attr.aria-label]="'Reproducir video: ' + titulo()"
        class="group absolute inset-0 grid place-items-center focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-white"
      >
        <span class="grid size-20 place-items-center rounded-full bg-white/90 text-wine shadow-xl ring-8 ring-white/20 transition duration-300 group-hover:scale-110 group-hover:bg-white md:size-24">
          <i class="pi pi-play ml-1 text-2xl md:text-3xl" aria-hidden="true"></i>
        </span>
      </button>
      <div aria-hidden="true" class="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-linear-to-t from-ink/90 via-ink/40 to-transparent"></div>
      <span class="pointer-events-none absolute top-5 left-5 inline-flex items-center gap-1.5 rounded-full bg-ink/55 px-3.5 py-1.5 text-xs font-semibold text-white backdrop-blur md:top-7 md:left-7">
        <i class="pi pi-video text-[10px]" aria-hidden="true"></i>{{ duracion() }}
      </span>
      <div class="pointer-events-none absolute inset-x-0 bottom-0 p-6 md:p-10">
        <span class="mb-1 block text-xs font-semibold tracking-[0.16em] text-gold uppercase">{{ categoria() }}</span>
        <span class="block font-serif text-2xl leading-snug font-semibold text-white md:text-4xl">{{ titulo() }}</span>
      </div>
    }
  `
})
export class VideoTarjeta {
  private readonly documento = inject(DOCUMENT);
  private readonly video = viewChild.required<ElementRef<HTMLVideoElement>>("video");

  readonly src = input.required<string>();
  readonly poster = input.required<string>();
  readonly titulo = input.required<string>();
  readonly categoria = input.required<string>();
  readonly duracion = input.required<string>();

  // Los controles nativos aparecen solo después de la primera reproducción
  readonly iniciado = signal(false);

  reproducir(): void {
    void this.video().nativeElement.play();
  }

  alReproducir(): void {
    this.iniciado.set(true);
    const actual = this.video().nativeElement;
    this.documento.querySelectorAll<HTMLVideoElement>("app-video-tarjeta video").forEach(otro => {
      if (otro !== actual) otro.pause();
    });
  }

  // Al terminar se restablece la portada y el botón de play
  alTerminar(): void {
    const video = this.video().nativeElement;
    video.load();
    video.muted = true;
    this.iniciado.set(false);
  }

  // Los videos no deben tener sonido: si el navegador lo activa, se vuelve a silenciar
  silenciar(): void {
    const video = this.video().nativeElement;
    if (!video.muted) video.muted = true;
  }
}
