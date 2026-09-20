import { ChangeDetectionStrategy, Component, inject, signal } from "@angular/core";
import { Router } from "@angular/router";

import { AuthService } from "../../../core/services/auth.service";

/** Avatar con iniciales, nombre del usuario y botón para cerrar sesión. */
@Component({
  selector: "app-menu-usuario",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "relative block" },
  template: `
    <button
      type="button"
      (click)="alternar()"
      [attr.aria-expanded]="abierto()"
      aria-haspopup="menu"
      class="flex items-center gap-2.5 rounded-full border border-line py-1 pl-1 pr-3 transition hover:border-wine/40 focus:outline-none focus:ring-2 focus:ring-wine/30">
      <span
        aria-hidden="true"
        class="flex h-8 w-8 items-center justify-center rounded-full bg-wine text-[12px] font-semibold text-white">
        {{ auth.iniciales() }}
      </span>
      <span class="hidden text-[13px] font-semibold text-ink sm:inline">{{ auth.usuario()?.nombre }}</span>
      <i class="pi pi-angle-down text-[11px] text-muted" aria-hidden="true"></i>
      <span class="sr-only">Abrir menú de la cuenta</span>
    </button>

    @if (abierto()) {
      <div
        role="menu"
        class="absolute right-0 z-20 mt-2 w-60 rounded-xl border border-line bg-white p-1.5 shadow-[0_20px_50px_-20px_rgba(36,23,38,0.35)]">
        <div class="border-b border-line px-3 py-2.5">
          <p class="truncate text-[13px] font-semibold text-ink">{{ auth.nombreCompleto() }}</p>
          <p class="truncate text-xs text-muted">{{ auth.usuario()?.email }}</p>
          <span class="mt-1.5 inline-block rounded-full bg-blush px-2.5 py-0.5 text-[10.5px] font-semibold text-wine">
            {{ etiquetaRol() }}
          </span>
        </div>
        <button
          type="button"
          role="menuitem"
          (click)="cerrarSesion()"
          class="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-[13px] text-ink transition hover:bg-ivory focus:outline-none focus:ring-2 focus:ring-wine/30">
          <i class="pi pi-sign-out text-[13px] text-wine" aria-hidden="true"></i>
          Cerrar sesión
        </button>
      </div>
    }
  `
})
export class MenuUsuario {
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly abierto = signal(false);

  protected alternar(): void {
    this.abierto.update(valor => !valor);
  }

  protected etiquetaRol(): string {
    switch (this.auth.rol()) {
      case "ADMINISTRADOR":
        return "Administradora";
      case "ESTILISTA":
        return "Estilista";
      default:
        return "Cliente";
    }
  }

  protected cerrarSesion(): void {
    this.abierto.set(false);
    this.auth.logout();
    this.router.navigate(["/login"]);
  }
}
