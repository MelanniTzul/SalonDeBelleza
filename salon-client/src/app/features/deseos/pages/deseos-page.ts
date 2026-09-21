import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { RouterLink } from "@angular/router";

import { ProductoCard } from "../../catalogo/components/producto-card";
import { ServicioCard } from "../../catalogo/components/servicio-card";
import { DeseosService } from "../services/deseos.service";

// Lo que el cliente guardo. Las tarjetas son las mismas del catalogo, con su corazon:
// al quitarlo, el item desaparece de aqui.
@Component({
  selector: "app-deseos-page",
  imports: [RouterLink, ServicioCard, ProductoCard],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mx-auto w-full max-w-[1100px] px-6 py-8 md:px-8">
      <header class="mb-6">
        <h1 class="font-serif text-[22px] font-semibold">Mi lista de deseos</h1>
        <p class="mt-1 text-[13px] text-muted">Servicios y productos que guardaste para despues.</p>
      </header>

      @switch (deseos.estado()) {
        @case ("cargando") {
          <p role="status" class="py-16 text-center text-sm text-muted">
            <i class="pi pi-spin pi-spinner mr-2 text-wine" aria-hidden="true"></i>Cargando tu lista…
          </p>
        }
        @case ("error") {
          <div role="alert" class="rounded-lg border border-wine/30 bg-blush px-4 py-3 text-[13px] text-wine-dark">
            No pudimos cargar tu lista.
            <button type="button" (click)="deseos.cargar(true)" class="ml-2 font-semibold underline">Reintentar</button>
          </div>
        }
        @default {
          @if (deseos.total() === 0) {
            <div class="rounded-xl border border-dashed border-gold bg-[#FFFDF9] px-6 py-14 text-center">
              <i class="pi pi-heart mb-3 text-3xl text-wine" aria-hidden="true"></i>
              <p class="font-serif text-lg font-semibold">Todavia no has guardado nada</p>
              <p class="mx-auto mt-2 max-w-md text-sm text-muted">
                Toca el corazon de cualquier servicio o producto y aparecera aqui.
              </p>
              <div class="mt-6 flex flex-wrap justify-center gap-2.5">
                <a routerLink="/servicios" class="rounded-full bg-wine px-[18px] py-[9px] text-[13px] font-semibold text-white transition hover:bg-wine-dark">Ver servicios</a>
                <a routerLink="/productos" class="rounded-full border border-wine px-[17px] py-2 text-[13px] font-semibold text-wine transition hover:bg-blush">Ver productos</a>
              </div>
            </div>
          } @else {
            @if (deseos.servicios().length > 0) {
              <section aria-labelledby="titulo-servicios" class="mb-10">
                <h2 id="titulo-servicios" class="mb-4 font-serif text-[17px] font-semibold">
                  Servicios <span class="text-sm font-normal text-muted">({{ deseos.servicios().length }})</span>
                </h2>
                <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  @for (s of deseos.servicios(); track s.id) {
                    <app-servicio-card [servicio]="s" />
                  }
                </div>
              </section>
            }
            @if (deseos.productos().length > 0) {
              <section aria-labelledby="titulo-productos">
                <h2 id="titulo-productos" class="mb-4 font-serif text-[17px] font-semibold">
                  Productos <span class="text-sm font-normal text-muted">({{ deseos.productos().length }})</span>
                </h2>
                <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  @for (p of deseos.productos(); track p.id) {
                    <app-producto-card [producto]="p" />
                  }
                </div>
              </section>
            }
          }
        }
      }
    </div>
  `
})
export class DeseosPage {
  protected readonly deseos = inject(DeseosService);

  constructor() {
    // Siempre fresco al entrar: pudo cambiar desde el catalogo.
    this.deseos.cargar(true);
  }
}
