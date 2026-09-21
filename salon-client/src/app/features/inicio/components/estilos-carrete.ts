import { NgOptimizedImage } from "@angular/common";
import { ChangeDetectionStrategy, Component, ElementRef, computed, inject, signal, viewChild } from "@angular/core";
import { FiltroChips, OpcionFiltro } from "../../../shared/components/filtro-chips";
import { LightboxService } from "../../../shared/services/lightbox.service";
import { CATEGORIAS_ESTILO, TODAS_LAS_FOTOS } from "../data/estilos.data";

@Component({
  selector: "app-estilos-carrete",
  imports: [FiltroChips, NgOptimizedImage],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-filtro-chips descripcion="Filtrar peinados por estilo" [centrado]="true" [opciones]="opciones" [activa]="categoria()" (cambia)="seleccionar($event)" />

    <p class="mt-6 text-center text-xs text-muted" aria-live="polite">{{ fotos().length }} fotos · desliza para ver más</p>

    <div class="relative mt-4">
      <button
        type="button"
        (click)="mover(-1)"
        aria-label="Ver fotos anteriores"
        class="absolute top-1/2 left-1 z-10 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/95 text-wine shadow-lg transition hover:bg-wine hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wine sm:-left-3"
      >
        <i class="pi pi-chevron-left" aria-hidden="true"></i>
      </button>
      <button
        type="button"
        (click)="mover(1)"
        aria-label="Ver más fotos"
        class="absolute top-1/2 right-1 z-10 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/95 text-wine shadow-lg transition hover:bg-wine hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wine sm:-right-3"
      >
        <i class="pi pi-chevron-right" aria-hidden="true"></i>
      </button>

      <ul
        #pista
        tabindex="0"
        aria-label="Carrete de peinados"
        class="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-5 [scrollbar-width:none] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-wine [&::-webkit-scrollbar]:hidden"
      >
        @for (f of fotos(); track f.src; let i = $index) {
          <li class="group relative aspect-[3/4] w-[68%] shrink-0 snap-start overflow-hidden rounded-2xl bg-blush shadow-md shadow-ink/10 sm:w-[290px]">
            <img [ngSrc]="f.src" fill sizes="(min-width: 640px) 20vw, 68vw" alt="" class="object-cover transition duration-700 group-hover:scale-105" />
            <div aria-hidden="true" class="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-ink/70 to-transparent"></div>
            <p class="pointer-events-none absolute inset-x-0 bottom-0 p-4 font-serif text-sm font-semibold text-white">{{ f.categoria }}</p>
            <button type="button" (click)="ampliar(i)" [attr.aria-label]="'Ampliar foto de peinado: ' + f.categoria" class="absolute inset-0 cursor-zoom-in focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-white"></button>
            <span aria-hidden="true" class="pointer-events-none absolute top-3 right-3 grid size-8 place-items-center rounded-full bg-white/90 text-wine opacity-0 shadow transition group-hover:opacity-100 group-focus-within:opacity-100"><i class="pi pi-search-plus text-xs"></i></span>
          </li>
        }
      </ul>
    </div>
  `
})
export class EstilosCarrete {
  private readonly lightbox = inject(LightboxService);
  private readonly pista = viewChild.required<ElementRef<HTMLUListElement>>("pista");

  readonly opciones: readonly OpcionFiltro[] = [{ id: "todos", etiqueta: "Todos" }, ...CATEGORIAS_ESTILO.map(c => ({ id: c.id, etiqueta: c.titulo }))];

  readonly categoria = signal("todos");

  readonly fotos = computed(() => {
    const id = this.categoria();
    return id === "todos" ? TODAS_LAS_FOTOS : (CATEGORIAS_ESTILO.find(c => c.id === id)?.fotos ?? []);
  });

  ampliar(indice: number): void {
    this.lightbox.abrir(
      this.fotos().map(f => ({ src: f.src, alt: f.alt, titulo: f.categoria })),
      indice
    );
  }

  seleccionar(id: string): void {
    this.categoria.set(id);
    this.pista().nativeElement.scrollTo({ left: 0, behavior: "auto" });
  }

  mover(sentido: 1 | -1): void {
    const pista = this.pista().nativeElement;
    pista.scrollBy({ left: sentido * pista.clientWidth * 0.85, behavior: "smooth" });
  }
}
