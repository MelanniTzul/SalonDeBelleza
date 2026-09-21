import { NgOptimizedImage } from "@angular/common";
import { ChangeDetectionStrategy, Component, computed, inject } from "@angular/core";
import { RouterLink } from "@angular/router";
import { SALON } from "../../../core/config/salon.config";
import { EstadoCarga } from "../../../shared/components/estado-carga";
import { SeccionTitulo } from "../../../shared/components/seccion-titulo";
import { Reveal } from "../../../shared/directives/reveal";
import { LightboxService } from "../../../shared/services/lightbox.service";
import { BuscadorCorte } from "../../catalogo/components/buscador-corte";
import { CatalogoCortes } from "../../catalogo/components/catalogo-cortes";
import { ServicioCard } from "../../catalogo/components/servicio-card";
import { CatalogoService } from "../../catalogo/services/catalogo.service";
import { ConsejosCuidado } from "../components/consejos-cuidado";
import { EquipoSalon } from "../components/equipo-salon";
import { EstilosCarrete } from "../components/estilos-carrete";
import { PasosAgenda } from "../components/pasos-agenda";
import { ProductosEscaparate } from "../components/productos-escaparate";
import { SalonGaleria } from "../components/salon-galeria";
import { Visitanos } from "../components/visitanos";

@Component({
  selector: "app-inicio-page",
  imports: [BuscadorCorte, CatalogoCortes, ConsejosCuidado, EquipoSalon, EstadoCarga, EstilosCarrete, NgOptimizedImage, PasosAgenda, ProductosEscaparate, Reveal, RouterLink, SalonGaleria, SeccionTitulo, ServicioCard, Visitanos],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="relative overflow-hidden">
      <div aria-hidden="true" class="pointer-events-none absolute -top-32 -left-32 size-[420px] rounded-full bg-blush/70 blur-3xl"></div>
      <div aria-hidden="true" class="pointer-events-none absolute -right-24 bottom-0 size-[360px] rounded-full bg-gold/15 blur-3xl"></div>

      <div class="relative mx-auto grid max-w-6xl items-center gap-14 px-6 py-16 md:grid-cols-2 md:py-28 lg:grid-cols-[0.85fr_1.15fr] lg:gap-10 lg:px-8">
        <div appReveal>
          <p class="mb-6 inline-flex items-center gap-2 rounded-full border border-gold/60 bg-white/70 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-wine">
            <i class="pi pi-heart-fill text-[10px]" aria-hidden="true"></i>
            Salón de belleza · {{ municipio }}
          </p>
          <h1 class="mb-5 font-serif text-[40px] font-semibold leading-[1.08] tracking-tight sm:text-5xl lg:text-[52px]">
            {{ lema }} <em class="font-medium text-wine italic">{{ lemaAcento }}</em>
          </h1>
          <p class="mb-9 max-w-[460px] text-base leading-relaxed text-muted">
            Consulta servicios, precios y disponibilidad en tiempo real, y agenda con la estilista de tu preferencia, presencial o a domicilio.
          </p>
          <div class="flex flex-wrap items-center gap-3">
            <a routerLink="/agendar" class="inline-flex items-center gap-2 rounded-full bg-wine px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-wine/25 transition hover:-translate-y-0.5 hover:bg-wine-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wine">
              Ver horarios disponibles
              <i class="pi pi-arrow-right text-xs" aria-hidden="true"></i>
            </a>
            <a routerLink="/" fragment="tipos-de-corte" class="inline-flex items-center rounded-full border border-wine/40 px-6 py-3 text-sm font-semibold text-wine transition hover:border-wine hover:bg-blush focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wine">
              Ver cortes de cabello
            </a>
          </div>
        </div>

        <div appReveal="150" class="relative mx-auto w-full max-w-[440px] md:max-w-none">
          <div aria-hidden="true" class="absolute inset-0 translate-x-3.5 translate-y-3.5 rounded-3xl border border-gold"></div>
          <div class="group relative aspect-square overflow-hidden rounded-3xl bg-blush shadow-2xl shadow-wine/25">
            <img ngSrc="img/salon-113.jpeg" fill priority sizes="(min-width: 768px) 45vw, 90vw" alt="" class="object-cover object-[center_62%]" />
            <button type="button" (click)="ampliarSalon()" aria-label="Ampliar foto: interior del salón con sillas de peinado y espejo" class="absolute inset-0 cursor-zoom-in focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-white"></button>
          </div>
          <div class="absolute bottom-8 -left-2 flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-xl shadow-ink/10 sm:-left-6">
            <span class="grid size-10 place-items-center rounded-full bg-wine text-gold">
              <i class="pi pi-calendar" aria-hidden="true"></i>
            </span>
            <span class="text-xs leading-snug text-muted">
              <strong class="block font-serif text-sm text-ink">Atención con cita</strong>
              Lunes a sábado
            </span>
          </div>
        </div>
      </div>
    </section>

    <section aria-label="Datos del salón" class="border-y border-line bg-white">
      <ul class="mx-auto grid max-w-6xl grid-cols-2 lg:grid-cols-4 lg:px-8">
        @for (d of datos; track d.titulo) {
          <li class="flex items-center gap-3.5 border-line px-6 py-6 even:border-l max-lg:nth-[n+3]:border-t lg:border-l lg:first:border-l-0">
            <span class="grid size-11 shrink-0 place-items-center rounded-full bg-blush text-wine">
              <i class="pi" [class]="d.icono" aria-hidden="true"></i>
            </span>
            <span class="text-xs leading-snug text-muted">
              <strong class="mb-0.5 block font-serif text-[15px] text-ink">{{ d.titulo }}</strong>
              {{ d.detalle }}
            </span>
          </li>
        }
      </ul>
    </section>

    <div class="mx-auto max-w-6xl px-6 pt-24 lg:px-8">
      <app-catalogo-cortes />
    </div>

    <div class="mx-auto max-w-6xl px-6 pt-10 lg:px-8">
      <app-buscador-corte />
    </div>

    <section class="mx-auto max-w-6xl px-6 py-24 sm:py-28 lg:px-8">
      <div appReveal class="mb-12 flex flex-wrap items-end justify-between gap-4">
        <app-seccion-titulo eyebrow="Servicios" titulo="Lo que hacemos" acento="por ti" [centrado]="false" />
        <a routerLink="/servicios" class="inline-flex items-center gap-2 text-sm font-semibold text-wine transition hover:gap-3 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-wine">
          Ver todos los servicios
          <i class="pi pi-arrow-right text-xs" aria-hidden="true"></i>
        </a>
      </div>
      @if (catalogo.listo()) {
      <ul class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        @for (s of serviciosDestacados(); track s.id; let i = $index) {
          <li [appReveal]="i * 100"><app-servicio-card [servicio]="s" /></li>
        }
      </ul>
      } @else {
        <app-estado-carga que="los servicios" [error]="catalogo.estado() === 'error'" (reintentar)="catalogo.reintentar()" />
      }
    </section>

    <app-equipo-salon />

    <section id="estilos" class="bg-white py-24 sm:py-28">
      <div class="mx-auto max-w-6xl px-6 lg:px-8">
        <div appReveal class="mb-9">
          <app-seccion-titulo
            eyebrow="Estilos y peinados"
            titulo="Un peinado para"
            acento="cada ocasión"
            descripcion="Explora ideas por estilo, desde un corte en capas hasta el recogido perfecto para tu evento, y reserva con quien mejor lo hace."
          />
        </div>
        <app-estilos-carrete />
      </div>
    </section>

    <app-pasos-agenda />

    <section class="bg-white py-24 sm:py-28">
      <div class="mx-auto max-w-[84rem] px-6 lg:px-10">
        <div appReveal class="mb-10 flex flex-wrap items-end justify-between gap-4">
          <app-seccion-titulo eyebrow="Productos" titulo="Para cuidar tu peinado" acento="en casa" [centrado]="false" />
          <a routerLink="/productos" class="inline-flex items-center gap-2 text-sm font-semibold text-wine transition hover:gap-3 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-wine">
            Ver todos los productos
            <i class="pi pi-arrow-right text-xs" aria-hidden="true"></i>
          </a>
        </div>

        <div appReveal class="mb-10 flex flex-col items-center gap-3 border-y border-line py-5 sm:flex-row sm:justify-between">
          <p class="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Marcas con las que trabajamos</p>
          <ul class="flex flex-wrap items-center justify-center gap-x-9 gap-y-2 font-serif text-lg font-semibold tracking-wide text-ink/75">
            @for (m of marcas; track m) {
              <li>{{ m }}</li>
            }
          </ul>
        </div>

        @if (catalogo.listo()) {
          <div appReveal="100"><app-productos-escaparate /></div>
        } @else {
          <app-estado-carga que="los productos" [error]="catalogo.estado() === 'error'" (reintentar)="catalogo.reintentar()" />
        }
      </div>
    </section>

    <app-consejos-cuidado />

    <section class="bg-blush/60 py-24 sm:py-32">
      <div class="mx-auto max-w-[84rem] px-6 lg:px-10">
        <div appReveal class="mb-10">
          <app-seccion-titulo eyebrow="Trabajos reales" titulo="Así trabajamos" acento="tu estilo" descripcion="Recogidos, moños y cortes, tal como los hacemos en cada cita." />
        </div>
        <app-salon-galeria />

        <div appReveal class="mt-14 flex flex-col items-center gap-6 text-center">
          <p class="font-serif text-2xl font-semibold sm:text-3xl">¿Te gustó alguno? <em class="font-medium text-wine italic">Lo hacemos para ti.</em></p>
          <div class="flex flex-wrap items-center justify-center gap-3">
            <a routerLink="/agendar" class="inline-flex items-center gap-2 rounded-full bg-wine px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-wine/25 transition hover:-translate-y-0.5 hover:bg-wine-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wine">
              Agendar cita
              <i class="pi pi-arrow-right text-xs" aria-hidden="true"></i>
            </a>
            <a routerLink="/" fragment="estilos" class="inline-flex items-center rounded-full border border-wine/40 bg-white px-6 py-3 text-sm font-semibold text-wine transition hover:border-wine hover:bg-blush focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wine">
              Ver más ideas de peinados
            </a>
          </div>
        </div>
      </div>
    </section>

    <div class="pt-24 sm:pt-28">
      <app-visitanos />
    </div>
  `
})
export class InicioPage {
  protected readonly catalogo = inject(CatalogoService);
  private readonly lightbox = inject(LightboxService);

  readonly serviciosDestacados = computed(() => this.catalogo.serviciosPorId(["corte-cabello", "tintes-cabello", "maquillaje-social"]));
  readonly marcas = SALON.marcas;
  readonly lema = SALON.lema;
  readonly lemaAcento = SALON.lemaAcento;
  readonly municipio = SALON.municipio;

  readonly datos = [
    { icono: "pi-users", titulo: "2 estilistas", detalle: "Perfiles y horarios propios" },
    { icono: "pi-clock", titulo: "Lun–Sáb", detalle: "Horario de atención" },
    { icono: "pi-home", titulo: "A domicilio", detalle: "Zona de cobertura configurable" },
    { icono: "pi-map-marker", titulo: SALON.municipio, detalle: `${SALON.canton}, ${SALON.zona}` }
  ];

  ampliarSalon(): void {
    this.lightbox.abrir([{ src: "img/salon-113.jpeg", alt: "Interior del salón con sillas de peinado y espejo", titulo: "Nuestro salón" }]);
  }
}
