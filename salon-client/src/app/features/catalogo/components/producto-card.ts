import { NgOptimizedImage } from "@angular/common";
import { ChangeDetectionStrategy, Component, computed, input } from "@angular/core";
import { RouterLink } from "@angular/router";
import { Producto } from "../models/catalogo.models";

// Puntos del medidor de fijación (de 3) según el nivel normalizado
const PUNTOS_POR_NIVEL = { media: 1, fuerte: 2, "muy-fuerte": 3 } as const;

// Toda la tarjeta es un enlace a la ficha del producto: el enlace del nombre se extiende sobre la tarjeta (after:absolute).
@Component({
  selector: "app-producto-card",
  imports: [NgOptimizedImage, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-wine/10 has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-wine">
      <div class="relative aspect-square overflow-hidden bg-blush">
        <img
          [ngSrc]="producto().imagen"
          fill
          [priority]="prioritaria()"
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          alt=""
          [style.object-position]="producto().posicionImagen"
          class="object-cover transition duration-700 group-hover:scale-105"
        />
      </div>
      <div class="flex flex-1 flex-col p-5">
        <p class="mb-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-wine">{{ producto().marca }}</p>
        <h3 class="text-[15px] font-semibold leading-snug">
          <a [routerLink]="['/productos', producto().id]" class="transition group-hover:text-wine after:absolute after:inset-0 after:content-[''] focus-visible:outline-none">
            {{ producto().nombre }}
          </a>
        </h3>
        <p class="mt-2 text-xs leading-relaxed text-muted">{{ producto().descripcion }}</p>
        @if (producto().fijacion) {
          <div class="mt-3 flex items-center gap-2 text-[11px]">
            <span class="text-muted">Fijación</span>
            <span class="flex gap-1" role="img" [attr.aria-label]="'Fijación ' + producto().fijacion">
              @for (punto of puntosFijacion; track punto) {
                <span class="size-2 rounded-full" [class]="punto <= nivel() ? 'bg-wine' : 'bg-line'"></span>
              }
            </span>
            <span class="font-medium text-ink">{{ producto().fijacion }}</span>
          </div>
        }
        @if (producto().acabado) {
          <p class="mt-2 text-[11px] text-muted">Acabado: <span class="font-medium text-ink">{{ producto().acabado }}</span></p>
        }
        <p class="mt-auto flex items-center justify-between pt-5 text-xs text-muted">
          <span class="flex items-center gap-1.5"><i class="pi pi-map-marker text-[11px]" aria-hidden="true"></i>En el salón</span>
          <span class="text-sm font-bold text-wine">{{ precio() }}</span>
        </p>
      </div>
    </article>
  `
})
export class ProductoCard {
  readonly puntosFijacion = [1, 2, 3];

  readonly prioritaria = input(false);
  readonly producto = input.required<Producto>();

  readonly nivel = computed(() => {
    const nivel = this.producto().nivelFijacion;
    return nivel ? PUNTOS_POR_NIVEL[nivel] : 0;
  });

  readonly precio = computed(() => {
    const precio = this.producto().precio;
    return precio ? `Q${precio}` : "Consultar";
  });
}
