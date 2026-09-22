import { ChangeDetectionStrategy, Component, computed, inject, input } from "@angular/core";

import { API_URL, urlImagen } from "../../../core/config/api.config";
import { Usuario } from "../../../core/models/auth.models";

// Foto del usuario, o sus iniciales sobre fondo vino si no tiene.
@Component({
  selector: "app-avatar",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "inline-block shrink-0" },
  template: `
    @if (src(); as url) {
      <img
        [src]="url"
        [alt]="'Foto de ' + nombreCompleto()"
        [style.width.px]="tamanio()"
        [style.height.px]="tamanio()"
        class="rounded-full border border-line object-cover" />
    } @else {
      <span
        role="img"
        [attr.aria-label]="'Iniciales de ' + nombreCompleto()"
        [style.width.px]="tamanio()"
        [style.height.px]="tamanio()"
        [style.font-size.px]="tamanio() * 0.38"
        class="flex items-center justify-center rounded-full bg-wine font-semibold text-white">
        {{ iniciales() }}
      </span>
    }
  `
})
export class Avatar {
  readonly usuario = input.required<Usuario | null>();
  readonly tamanio = input(32);

  private readonly apiUrl = inject(API_URL);

  protected readonly src = computed(() => urlImagen(this.usuario()?.fotoUrl, this.apiUrl));
  protected readonly nombreCompleto = computed(() => {
    const u = this.usuario();
    return u ? `${u.nombre} ${u.apellido}` : "";
  });
  protected readonly iniciales = computed(() => {
    const u = this.usuario();
    return u ? `${u.nombre.charAt(0)}${u.apellido.charAt(0)}`.toUpperCase() : "";
  });
}
