import { NgOptimizedImage } from "@angular/common";
import { ChangeDetectionStrategy, Component, DestroyRef, computed, effect, inject, input, signal } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { RouterLink } from "@angular/router";
import { SALON } from "../../../core/config/salon.config";
import { EstadoCarga } from "../../../shared/components/estado-carga";
import { Reveal } from "../../../shared/directives/reveal";
import { LightboxService } from "../../../shared/services/lightbox.service";
import { ProductoCard } from "../components/producto-card";
import { PASOS_USO, PASOS_USO_GENERALES, TIPO_PRODUCTO } from "../data/producto-info.data";
import { CatalogoService } from "../services/catalogo.service";

const PUNTOS_POR_NIVEL = { media: 1, fuerte: 2, "muy-fuerte": 3 } as const;
const CANTIDAD_RELACIONADOS = 3;

@Component({
  selector: "app-producto-detalle-page",
  imports: [EstadoCarga, NgOptimizedImage, ProductoCard, Reveal, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (!catalogo.listo()) {
      <app-estado-carga que="el producto" [error]="catalogo.estado() === 'error'" (reintentar)="catalogo.reintentar()" />
    } @else if (producto(); as p) {
      <section class="mx-auto max-w-6xl px-6 py-10 lg:px-8 lg:py-12">
        <nav aria-label="Ruta de navegación" class="mb-8">
          <ol class="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
            <li><a routerLink="/productos" class="transition hover:text-wine hover:underline">Productos</a></li>
            <li aria-hidden="true">/</li>
            <li>{{ categoria() }}</li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" class="font-medium text-ink">{{ p.marca }} {{ p.nombre }}</li>
          </ol>
        </nav>

        <div class="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <!-- Galería -->
          <div appReveal class="flex flex-col-reverse gap-4 sm:flex-row lg:sticky lg:top-28 lg:self-start">
            @if (imagenes().length > 1) {
              <ul class="flex gap-3 sm:flex-col" aria-label="Fotos del producto">
                @for (foto of imagenes(); track foto; let i = $index) {
                  <li>
                    <button
                      type="button"
                      (click)="activa.set(i)"
                      [attr.aria-label]="'Ver foto ' + (i + 1) + ' de ' + imagenes().length"
                      [attr.aria-current]="i === activa()"
                      class="relative block size-20 overflow-hidden rounded-xl border-2 bg-blush transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wine"
                      [class]="i === activa() ? 'border-wine' : 'border-transparent opacity-70 hover:opacity-100'"
                    >
                      <img [ngSrc]="foto" fill alt="" class="object-cover" />
                    </button>
                  </li>
                }
              </ul>
            }

            <div class="group relative aspect-square flex-1 overflow-hidden rounded-3xl bg-blush shadow-xl shadow-ink/10 ring-1 ring-line">
              @for (foto of imagenes(); track foto; let i = $index) {
                @if (i === activa()) {
                  <img [ngSrc]="foto" fill priority sizes="(min-width: 1024px) 45vw, 100vw" alt="" [style.object-position]="i === 0 ? p.posicionImagen : null" class="object-cover" />
                }
              }
              <button type="button" (click)="ampliar()" [attr.aria-label]="'Ampliar foto: ' + p.marca + ' ' + p.nombre" class="absolute inset-0 cursor-zoom-in focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-white"></button>
              <span aria-hidden="true" class="pointer-events-none absolute right-4 bottom-4 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-wine shadow">
                <i class="pi pi-search-plus text-[11px]"></i>Ampliar
              </span>
            </div>
          </div>

          <!-- Ficha -->
          <div appReveal="120">
            <p class="mb-3 flex items-center gap-3 text-xs font-semibold tracking-[0.14em] text-wine uppercase">
              <span aria-hidden="true" class="h-px w-8 bg-gold"></span>{{ tipo() }}
            </p>
            <h1 class="font-serif text-4xl leading-[1.1] font-semibold tracking-tight sm:text-5xl">
              {{ p.marca }} <em class="font-medium text-wine italic">{{ p.nombre }}</em>
            </h1>

            <p class="mt-5 font-semibold text-wine" [class]="p.precio ? 'text-3xl' : 'text-xl'">{{ precio() }}</p>
            @if (!p.precio) {
              <p class="mt-1 text-xs text-muted">Pregunta el precio en el salón o al agendar tu cita.</p>
            }

            <p class="mt-6 text-base leading-relaxed text-muted">{{ p.descripcion }}</p>

            @if (p.beneficios?.length) {
              <ul class="mt-6 flex flex-wrap gap-x-6 gap-y-2.5 text-sm font-semibold">
                @for (b of p.beneficios; track b) {
                  <li class="flex items-center gap-2">
                    <i class="pi pi-check text-[11px] text-gold" aria-hidden="true"></i>{{ b }}
                  </li>
                }
              </ul>
            }

            @if (p.fijacion || p.acabado) {
              <dl class="mt-8 grid grid-cols-2 gap-5 rounded-2xl border border-line bg-white p-5">
                @if (p.fijacion) {
                  <div>
                    <dt class="text-xs font-semibold tracking-[0.12em] text-muted uppercase">Fijación</dt>
                    <dd class="mt-2 flex items-center gap-2 text-sm font-medium">
                      <span class="flex gap-1" role="img" [attr.aria-label]="'Fijación ' + p.fijacion">
                        @for (punto of puntos; track punto) {
                          <span class="size-2.5 rounded-full" [class]="punto <= nivel() ? 'bg-wine' : 'bg-line'"></span>
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

            <div class="mt-8 flex flex-wrap gap-3">
              <a routerLink="/agendar" class="inline-flex items-center gap-2 rounded-full bg-wine px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-wine/25 transition hover:-translate-y-0.5 hover:bg-wine-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wine">
                Agendar cita
                <i class="pi pi-arrow-right text-xs" aria-hidden="true"></i>
              </a>
              @if (enlaceWhatsapp(); as enlace) {
                <a [href]="enlace" target="_blank" rel="noopener" class="inline-flex items-center gap-2 rounded-full border border-sage px-6 py-3 text-sm font-semibold text-sage transition hover:bg-sage hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage">
                  <i class="pi pi-whatsapp" aria-hidden="true"></i>
                  Preguntar por este producto
                </a>
              } @else {
                <a routerLink="/productos" class="inline-flex items-center rounded-full border border-wine/40 px-6 py-3 text-sm font-semibold text-wine transition hover:border-wine hover:bg-blush focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wine">
                  Ver más productos
                </a>
              }
            </div>

            <p class="mt-6 flex items-center gap-2.5 text-sm text-muted">
              <span class="grid size-9 place-items-center rounded-full bg-blush text-wine"><i class="pi pi-map-marker" aria-hidden="true"></i></span>
              Disponible en el salón · {{ ubicacion }}
            </p>
          </div>
        </div>

        <!-- Cómo usarlo -->
        <div appReveal class="mt-20 rounded-3xl bg-white px-6 py-10 ring-1 ring-line sm:px-10">
          <div class="mb-8 max-w-xl">
            <p class="mb-3 flex items-center gap-3 text-xs font-semibold tracking-[0.14em] text-wine uppercase">
              <span aria-hidden="true" class="h-px w-8 bg-gold"></span>Modo de uso
            </p>
            <h2 class="font-serif text-2xl font-semibold tracking-tight sm:text-3xl">Cómo usarlo <em class="font-medium text-wine italic">paso a paso</em></h2>
          </div>
          <ol class="grid gap-6 sm:grid-cols-3">
            @for (paso of pasos(); track paso; let i = $index) {
              <li class="flex gap-4">
                <span class="grid size-10 shrink-0 place-items-center rounded-full bg-wine font-serif text-lg font-semibold text-gold">{{ i + 1 }}</span>
                <p class="pt-1.5 text-sm leading-relaxed">{{ paso }}</p>
              </li>
            }
          </ol>
          <p class="mt-8 text-xs text-muted">Indicaciones generales. Tu estilista te recomienda la cantidad y la técnica ideales según tu tipo de cabello.</p>
        </div>

        <!-- Relacionados -->
        @if (relacionados().length) {
          <div class="mt-20">
            <div appReveal class="mb-8 flex flex-wrap items-end justify-between gap-4">
              <h2 class="font-serif text-2xl font-semibold tracking-tight sm:text-3xl">También te puede <em class="font-medium text-wine italic">interesar</em></h2>
              <a routerLink="/productos" class="inline-flex items-center gap-2 text-sm font-semibold text-wine transition hover:gap-3 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-wine">
                Ver todos los productos
                <i class="pi pi-arrow-right text-xs" aria-hidden="true"></i>
              </a>
            </div>
            <ul class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              @for (r of relacionados(); track r.id; let i = $index) {
                <li [appReveal]="i * 90"><app-producto-card [producto]="r" /></li>
              }
            </ul>
          </div>
        }
      </section>
    } @else {
      <section class="mx-auto max-w-2xl px-6 py-24 text-center">
        <h1 class="font-serif text-3xl font-semibold">No encontramos este producto</h1>
        <p class="mt-3 text-sm text-muted">Puede que ya no esté disponible. Mira el resto de nuestros productos.</p>
        <a routerLink="/productos" class="mt-8 inline-flex items-center gap-2 rounded-full bg-wine px-6 py-3 text-sm font-semibold text-white transition hover:bg-wine-dark">
          Ver todos los productos
          <i class="pi pi-arrow-right text-xs" aria-hidden="true"></i>
        </a>
      </section>
    }
  `
})
export class ProductoDetallePage {
  protected readonly catalogo = inject(CatalogoService);
  private readonly lightbox = inject(LightboxService);
  private readonly titulo = inject(Title);

  // Llega desde la ruta /productos/:id (withComponentInputBinding)
  readonly id = input.required<string>();

  readonly ubicacion = `${SALON.canton}, ${SALON.municipio}`;
  readonly puntos = [1, 2, 3];
  readonly activa = signal(0);

  readonly producto = computed(() => this.catalogo.productoPorId(this.id()));
  readonly imagenes = computed(() => {
    const p = this.producto();
    return p ? [p.imagen, ...(p.imagenDetalle ? [p.imagenDetalle] : [])] : [];
  });
  readonly categoria = computed(() => this.producto()?.categoriaNombre ?? "");
  readonly tipo = computed(() => TIPO_PRODUCTO[this.producto()?.categoria ?? ""] ?? "Producto");
  readonly pasos = computed(() => PASOS_USO[this.producto()?.categoria ?? ""] ?? PASOS_USO_GENERALES);
  readonly relacionados = computed(() => this.catalogo.productosRelacionados(this.id(), CANTIDAD_RELACIONADOS));

  readonly nivel = computed(() => {
    const nivel = this.producto()?.nivelFijacion;
    return nivel ? PUNTOS_POR_NIVEL[nivel] : 0;
  });

  readonly precio = computed(() => {
    const precio = this.producto()?.precio;
    return precio ? `Q${precio}` : "Consultar precio";
  });

  readonly enlaceWhatsapp = computed(() => {
    const p = this.producto();
    if (!SALON.whatsapp || !p) return null;
    return `https://wa.me/${SALON.whatsapp}?text=${encodeURIComponent(`Hola, quiero información sobre ${p.marca} ${p.nombre}.`)}`;
  });

  constructor() {
    // Al cambiar de producto (por ejemplo, desde "También te puede interesar") se vuelve a la primera foto
    effect(() => {
      this.id();
      this.activa.set(0);
    });

    effect(() => {
      const p = this.producto();
      this.titulo.setTitle(p ? `${p.marca} ${p.nombre} | ${SALON.nombre}` : SALON.nombre);
    });
    inject(DestroyRef).onDestroy(() => this.titulo.setTitle(SALON.nombre));
  }

  ampliar(): void {
    const p = this.producto();
    if (!p) return;
    const nombre = `${p.marca} ${p.nombre}`;
    this.lightbox.abrir(
      this.imagenes().map((src, i) => ({ src, alt: `Foto ${i + 1} de ${nombre}`, titulo: nombre })),
      this.activa()
    );
  }
}
