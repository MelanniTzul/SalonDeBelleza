import { ChangeDetectionStrategy, Component, input, output } from "@angular/core";

export interface OpcionFiltro {
  id: string;
  etiqueta: string;
}

@Component({
  selector: "app-filtro-chips",
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div role="group" [attr.aria-label]="descripcion()" class="flex flex-wrap gap-2" [class.justify-center]="centrado()">
      @for (o of opciones(); track o.id) {
        <button
          type="button"
          (click)="cambia.emit(o.id)"
          [attr.aria-pressed]="o.id === activa()"
          class="rounded-full border px-4 py-1.5 text-[13px] font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wine"
          [class]="o.id === activa() ? 'border-ink bg-ink text-white' : 'border-line bg-white text-ink hover:border-wine hover:text-wine'"
        >
          {{ o.etiqueta }}
        </button>
      }
      <ng-content />
    </div>
  `
})
export class FiltroChips {
  readonly opciones = input.required<readonly OpcionFiltro[]>();
  readonly activa = input.required<string>();
  readonly descripcion = input("Filtrar");
  readonly centrado = input(false);
  readonly cambia = output<string>();
}
