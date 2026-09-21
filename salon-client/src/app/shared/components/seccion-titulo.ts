import { ChangeDetectionStrategy, Component, computed, input } from "@angular/core";

// Encabezado de sección: etiqueta con filetes dorados, título serif y acento en cursiva.
@Component({
  selector: "app-seccion-titulo",
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div [class]="contenedor()">
      <p class="mb-3 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.14em] text-wine" [class.justify-center]="centrado()">
        <span aria-hidden="true" class="h-px w-8 bg-gold"></span>{{ eyebrow() }}@if (centrado()) {
          <span aria-hidden="true" class="h-px w-8 bg-gold"></span>
        }
      </p>
      <h2 [attr.id]="idTitulo()" class="mb-4 font-serif text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
        {{ titulo() }}
        @if (acento()) {
          <em class="font-medium text-wine italic">{{ acento() }}</em>
        }
      </h2>
      @if (descripcion()) {
        <p class="text-[15px] leading-relaxed text-muted sm:text-base">{{ descripcion() }}</p>
      }
    </div>
  `
})
export class SeccionTitulo {
  readonly eyebrow = input.required<string>();
  readonly titulo = input.required<string>();
  readonly acento = input("");
  readonly descripcion = input("");
  readonly centrado = input(true);
  readonly idTitulo = input<string>();

  readonly contenedor = computed(() => (this.centrado() ? "mx-auto max-w-2xl text-center" : "max-w-2xl"));
}
