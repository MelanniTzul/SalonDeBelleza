import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from "@angular/core";
import { Router } from "@angular/router";

import { AuthService } from "../../../core/services/auth.service";
import { DeseosService, TipoDeseo } from "../services/deseos.service";

// Corazon para guardar o quitar un servicio/producto. Sin sesion manda al login y
// regresa a la misma pagina; para estilistas y admin no se muestra.
@Component({
  selector: "app-boton-deseo",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "inline-block" },
  template: `
    @if (visible()) {
      <button
        type="button"
        (click)="alternar($event)"
        [disabled]="ocupado()"
        [attr.aria-pressed]="guardado()"
        [attr.aria-label]="guardado() ? 'Quitar de mi lista de deseos' : 'Guardar en mi lista de deseos'"
        [title]="guardado() ? 'Quitar de mi lista' : 'Guardar en mi lista'"
        [class]="clase()">
        <i [class]="guardado() ? 'pi pi-heart-fill' : 'pi pi-heart'" aria-hidden="true"></i>
        @if (conTexto()) {
          <span>{{ guardado() ? "En tu lista" : "Guardar" }}</span>
        }
      </button>
    }
  `
})
export class BotonDeseo {
  readonly tipo = input.required<TipoDeseo>();
  readonly slug = input.required<string>();
  // true: boton con texto (paginas de detalle); false: solo el corazon redondo (tarjetas)
  readonly conTexto = input(false);

  private readonly auth = inject(AuthService);
  private readonly deseos = inject(DeseosService);
  private readonly router = inject(Router);

  protected readonly ocupado = signal(false);

  // Invitados y clientes lo ven; estilistas y admin no tienen lista.
  protected readonly visible = computed(() => !this.auth.autenticado() || this.auth.rol() === "CLIENTE");
  protected readonly guardado = computed(() => this.deseos.puedeUsar() && this.deseos.tiene(this.tipo(), this.slug()));

  protected readonly clase = computed(() => {
    const base = "inline-flex items-center justify-center gap-2 rounded-full border transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wine disabled:opacity-60";
    const forma = this.conTexto() ? "px-5 py-2.5 text-[13px] font-semibold" : "size-9 text-[15px] shadow-md";
    const color = this.guardado()
      ? "border-wine bg-wine text-white hover:bg-wine-dark"
      : "border-line bg-white/95 text-wine hover:border-wine hover:bg-blush";
    return `${base} ${forma} ${color}`;
  });

  constructor() {
    if (this.deseos.puedeUsar()) {
      this.deseos.cargar();
    }
  }

  protected alternar(evento: Event): void {
    // La tarjeta entera es un enlace: que el corazon no navegue.
    evento.preventDefault();
    evento.stopPropagation();

    if (!this.auth.autenticado()) {
      this.router.navigate(["/login"], { queryParams: { redirigir: this.router.url } });
      return;
    }
    this.ocupado.set(true);
    this.deseos.alternar(this.tipo(), this.slug()).subscribe({
      next: () => this.ocupado.set(false),
      error: () => this.ocupado.set(false)
    });
  }
}
