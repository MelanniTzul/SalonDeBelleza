import { ChangeDetectionStrategy, Component, computed, input, output } from "@angular/core";

// Paginación simple del lado del cliente: /api/admin/servicios y /api/admin/productos
// devuelven la lista completa (no están paginados en el backend), así que se corta aquí.
@Component({
  selector: "app-paginacion",
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (totalPaginas() > 1) {
      <nav aria-label="Paginación" class="mt-4 flex items-center justify-between gap-3">
        <p class="text-[12px] text-muted">
          Página {{ pagina() + 1 }} de {{ totalPaginas() }} · {{ totalElementos() }} {{ etiqueta() }}
        </p>
        <div class="flex gap-2">
          <button
            type="button"
            (click)="cambiarPagina.emit(pagina() - 1)"
            [disabled]="pagina() === 0"
            class="rounded-full border border-line px-3.5 py-1.5 text-[12px] font-semibold transition hover:bg-ivory focus:outline-none focus:ring-2 focus:ring-wine/30 disabled:opacity-40">
            Anterior
          </button>
          <button
            type="button"
            (click)="cambiarPagina.emit(pagina() + 1)"
            [disabled]="pagina() + 1 >= totalPaginas()"
            class="rounded-full border border-line px-3.5 py-1.5 text-[12px] font-semibold transition hover:bg-ivory focus:outline-none focus:ring-2 focus:ring-wine/30 disabled:opacity-40">
            Siguiente
          </button>
        </div>
      </nav>
    }
  `
})
export class Paginacion {
  readonly pagina = input.required<number>(); // 0-based
  readonly totalElementos = input.required<number>();
  readonly tamanioPagina = input(10);
  readonly etiqueta = input("elementos");

  readonly cambiarPagina = output<number>();

  protected readonly totalPaginas = computed(() => Math.max(1, Math.ceil(this.totalElementos() / this.tamanioPagina())));
}
