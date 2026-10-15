import { ChangeDetectionStrategy, Component, input, output } from "@angular/core";

// Interruptor (switch) accesible: se usa para "Activo" y "A domicilio" en los formularios,
// y para activar/desactivar directo desde la tabla sin abrir el formulario.
@Component({
  selector: "app-interruptor",
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      type="button"
      role="switch"
      [attr.aria-checked]="valor()"
      [attr.aria-label]="etiqueta()"
      [disabled]="deshabilitado()"
      (click)="alternar.emit(!valor())"
      [class]="claseTrack()">
      <span [class]="claseKnob()"></span>
    </button>
  `
})
export class Interruptor {
  readonly valor = input.required<boolean>();
  readonly etiqueta = input.required<string>();
  readonly deshabilitado = input(false);
  readonly alternar = output<boolean>();

  protected claseTrack(): string {
    const base =
      "relative inline-flex h-[22px] w-[38px] flex-shrink-0 items-center rounded-full transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wine disabled:cursor-not-allowed disabled:opacity-50";
    return `${base} ${this.valor() ? "bg-wine" : "bg-line"}`;
  }

  protected claseKnob(): string {
    const base = "inline-block size-[18px] rounded-full bg-white shadow transition-transform";
    return `${base} ${this.valor() ? "translate-x-[18px]" : "translate-x-0.5"}`;
  }
}
