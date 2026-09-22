import { ChangeDetectionStrategy, Component, input, output } from "@angular/core";

// Mensaje mientras el catálogo carga o cuando no se pudo cargar (con botón para reintentar).
@Component({
  selector: "app-estado-carga",
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (error()) {
      <div role="alert" class="mx-auto max-w-lg rounded-2xl border border-dashed border-wine/30 bg-white px-6 py-14 text-center">
        <i class="pi pi-exclamation-circle mb-4 text-3xl text-wine" aria-hidden="true"></i>
        <p class="font-serif text-xl font-semibold">No pudimos cargar {{ que() }}</p>
        <p class="mt-2 text-sm leading-relaxed text-muted">Revisa tu conexión e inténtalo de nuevo en un momento.</p>
        <button type="button" (click)="reintentar.emit()" class="mt-6 inline-flex items-center gap-2 rounded-full bg-wine px-6 py-3 text-sm font-semibold text-white transition hover:bg-wine-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wine">
          <i class="pi pi-refresh text-xs" aria-hidden="true"></i>
          Reintentar
        </button>
      </div>
    } @else {
      <div role="status" aria-live="polite" class="mx-auto max-w-lg px-6 py-20 text-center">
        <i class="pi pi-spin pi-spinner text-2xl text-wine" aria-hidden="true"></i>
        <p class="mt-4 text-sm text-muted">Cargando {{ que() }}…</p>
      </div>
    }
  `
})
export class EstadoCarga {
  // Qué se está cargando, ej. "los servicios"
  readonly que = input("el catálogo");
  readonly error = input(false);
  readonly reintentar = output<void>();
}
