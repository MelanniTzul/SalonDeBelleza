import { NgOptimizedImage } from "@angular/common";
import { ChangeDetectionStrategy, Component, computed, inject, signal } from "@angular/core";
import { RouterLink } from "@angular/router";
import { Producto } from "../../catalogo/models/catalogo.models";
import { CatalogoService } from "../../catalogo/services/catalogo.service";

const PUNTOS_POR_NIVEL = { media: 1, fuerte: 2, "muy-fuerte": 3 } as const;

// Escaparate grande de productos: la foto ocupa una mitad y la ficha la otra, un producto a la vez.
// La foto y el nombre llevan a la página del producto.
@Component({
  selector: "app-productos-escaparate",
  imports: [NgOptimizedImage, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    @media (prefers-reduced-motion: no-preference) {
      .entra {
        animation: entra 0.6s ease-out both;
      }
    }
    @keyframes entra {
      from {
        opacity: 0;
        transform: translateY(12px);
      }
      to {
        opacity: 1;
        transform: none;
      }
    }
  `,
  template: `
    <div role="region" aria-roledescription="carrusel" aria-label="Productos destacados" (keydown.arrowright)="mover(1)" (keydown.arrowleft)="mover(-1)">
      <div class="overflow-hidden bg-ivory shadow-2xl ring-1 shadow-ink/15 ring-line md:grid md:min-h-[min(80vh,720px)] md:grid-cols-2">
        @for (p of actual(); track p.id) {
          <a
            [routerLink]="['/productos', p.id]"
            [attr.aria-label]="'Ver ' + p.marca + ' ' + p.nombre"
            class="entra group relative block aspect-square overflow-hidden bg-ink focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-white md:aspect-auto"
          >
            <div aria-hidden="true" class="absolute inset-0 scale-125 bg-cover bg-center opacity-70 blur-2xl" [style.background-image]="'url(' + p.imagen + ')'"></div>
            <img [ngSrc]="p.imagen" fill sizes="(min-width: 768px) 45vw, 100vw" alt="" [style.object-position]="p.posicionImagen" class="object-cover transition duration-700 group-hover:scale-105" />
            <span class="pointer-events-none absolute right-5 bottom-5 inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-xs font-semibold text-wine opacity-0 shadow transition group-hover:opacity-100 group-focus-visible:opacity-100 max-md:opacity-100 md:right-8 md:bottom-8">
              Ver producto <i class="pi pi-arrow-right text-[10px]" aria-hidden="true"></i>
            </span>
          </a>
        }

        <div class="flex flex-col p-7 sm:p-10 lg:p-16">
          @for (p of actual(); track p.id) {
            <div class="entra flex flex-1 flex-col justify-center">
              <p class="mb-4 flex items-center gap-3 text-xs font-semibold tracking-[0.16em] text-wine uppercase">
                <span aria-hidden="true" class="h-px w-8 bg-gold"></span>{{ p.marca }}
              </p>
              <h3 class="font-serif text-4xl leading-[1.08] font-semibold tracking-tight lg:text-5xl">
                <a [routerLink]="['/productos', p.id]" class="transition hover:text-wine focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-wine">
                  <em class="font-medium text-wine italic">{{ p.nombre }}</em>
                </a>
              </h3>
              <p class="mt-5 max-w-md text-base leading-relaxed text-muted">{{ p.descripcion }}</p>

              @if (p.beneficios?.length) {
                <ul class="mt-6 grid gap-x-6 gap-y-2.5 text-sm font-semibold sm:grid-cols-2">
                  @for (b of p.beneficios; track b) {
                    <li class="flex items-center gap-2"><i class="pi pi-check text-[11px] text-gold" aria-hidden="true"></i>{{ b }}</li>
                  }
                </ul>
              }

              @if (p.fijacion || p.acabado) {
                <dl class="mt-8 grid max-w-md grid-cols-2 gap-5 rounded-2xl border border-line bg-white p-5">
                  @if (p.fijacion) {
                    <div>
                      <dt class="text-xs font-semibold tracking-[0.12em] text-muted uppercase">Fijación</dt>
                      <dd class="mt-2 flex items-center gap-2 text-sm font-medium">
                        <span class="flex gap-1" role="img" [attr.aria-label]="'Fijación ' + p.fijacion">
                          @for (punto of puntos; track punto) {
                            <span class="size-2.5 rounded-full" [class]="punto <= nivel(p) ? 'bg-wine' : 'bg-line'"></span>
                          }
                        </span>
                        {{ p.fijacion }}
                      </dd>
                    </div>
                  }
                  @if (p.acabado) {
                    <div>
                      <dt class="text-xs font-semibold tracking-[0.12em] text-muted uppercase">Acabado</dt>
                      <dd class="mt-2 text-sm font-medium">{{ p.acabado }}</dd>
                    </div>
                  }
                </dl>
              }

              <p class="mt-7 font-semibold text-wine" [class]="p.precio ? 'text-3xl' : 'text-xl'">{{ p.precio ? 'Q' + p.precio : 'Consultar precio' }}</p>
            </div>
          }

          <div class="mt-10 flex flex-wrap items-center justify-between gap-5">
            <div class="flex items-center gap-4">
              <div class="flex items-center gap-2.5" role="group" aria-label="Elegir producto">
                @for (p of productos(); track p.id; let i = $index) {
                  <button
                    type="button"
                    (click)="activo.set(i)"
                    [attr.aria-label]="'Ver ' + p.marca + ' ' + p.nombre"
                    [attr.aria-current]="i === activo()"
                    class="h-2.5 rounded-full transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wine"
                    [class]="i === activo() ? 'w-8 bg-wine' : 'w-2.5 bg-wine/30 hover:bg-wine/60'"
                  ></button>
                }
              </div>
              <p class="text-xs font-medium text-muted tabular-nums" aria-live="polite">{{ activo() + 1 }} / {{ productos().length }}</p>
            </div>
            <div class="flex gap-3">
              <button type="button" (click)="mover(-1)" aria-label="Producto anterior" class="grid size-12 place-items-center rounded-full border border-wine/40 text-wine transition hover:border-wine hover:bg-wine hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wine">
                <i class="pi pi-chevron-left" aria-hidden="true"></i>
              </button>
              <button type="button" (click)="mover(1)" aria-label="Producto siguiente" class="grid size-12 place-items-center rounded-full border border-wine/40 text-wine transition hover:border-wine hover:bg-wine hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wine">
                <i class="pi pi-chevron-right" aria-hidden="true"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ProductosEscaparate {
  private readonly catalogo = inject(CatalogoService);

  readonly productos = computed<readonly Producto[]>(() => this.catalogo.productosPorId(["johnny-b-control", "level-3-cream-gel", "eco-styler-olive-oil", "cantu-wave-whip"]));
  readonly puntos = [1, 2, 3];
  readonly activo = signal(0);

  // Lista de un solo elemento: al cambiar de producto se vuelve a dibujar y se repite la animación de entrada
  readonly actual = computed(() => {
    const producto = this.productos()[this.activo()];
    return producto ? [producto] : [];
  });

  nivel(p: Producto): number {
    return p.nivelFijacion ? PUNTOS_POR_NIVEL[p.nivelFijacion] : 0;
  }

  // Circular: después del último vuelve al primero
  mover(sentido: 1 | -1): void {
    const total = this.productos().length;
    if (total) this.activo.set((this.activo() + sentido + total) % total);
  }
}
