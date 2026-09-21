import { NgOptimizedImage } from "@angular/common";
import { ChangeDetectionStrategy, Component, DestroyRef, computed, effect, inject, input } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { RouterLink } from "@angular/router";
import { SALON } from "../../../core/config/salon.config";
import { SeccionTitulo } from "../../../shared/components/seccion-titulo";
import { EstadoCarga } from "../../../shared/components/estado-carga";
import { Reveal } from "../../../shared/directives/reveal";
import { LightboxService } from "../../../shared/services/lightbox.service";
import { CATEGORIAS_ESTILO } from "../../inicio/data/estilos.data";
import { CatalogoCortes } from "../components/catalogo-cortes";
import { ServicioCard } from "../components/servicio-card";
import { ESTILOS_POR_SERVICIO, INFO_GENERAL, INFO_SERVICIO, PreguntaFrecuente } from "../data/servicio-info.data";
import { CatalogoService } from "../services/catalogo.service";

const CANTIDAD_RELACIONADOS = 3;

const FOTOS_INSPIRACION = 8;

@Component({
  selector: "app-servicio-detalle-page",
  imports: [CatalogoCortes, EstadoCarga, NgOptimizedImage, Reveal, RouterLink, SeccionTitulo, ServicioCard],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (!catalogo.listo()) {
      <app-estado-carga que="el servicio" [error]="catalogo.estado() === 'error'" (reintentar)="catalogo.reintentar()" />
    } @else if (servicio(); as s) {
      <!-- Ruta de navegación -->
      <nav aria-label="Ruta de navegación" class="mx-auto max-w-6xl px-6 pt-8 pb-8 lg:px-8">
        <ol class="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
          <li><a routerLink="/servicios" class="transition hover:text-wine hover:underline">Servicios</a></li>
          <li aria-hidden="true">/</li>
          <li>{{ categoria() }}</li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" class="font-medium text-ink">{{ s.nombre }}</li>
        </ol>
      </nav>

      <!-- Presentación: foto a media pantalla + ficha -->
      <section class="lg:grid lg:min-h-[min(82vh,780px)] lg:grid-cols-2">
        <div class="group relative min-h-[420px] overflow-hidden bg-linear-to-br from-blush to-[#D6D6D6] lg:min-h-full">
          @if (s.imagen; as imagen) {
            <img [ngSrc]="imagen" fill priority sizes="(min-width: 1024px) 50vw, 100vw" alt="" class="object-cover object-[center_30%]" />
            <button type="button" (click)="ampliar(imagen, s.nombre)" [attr.aria-label]="'Ampliar foto: ' + s.nombre" class="absolute inset-0 cursor-zoom-in focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-white"></button>
            <span aria-hidden="true" class="pointer-events-none absolute right-5 bottom-5 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-wine shadow">
              <i class="pi pi-search-plus text-[11px]"></i>Ampliar
            </span>
          } @else {
            <span class="absolute inset-0 grid place-items-center text-wine/30" aria-hidden="true">
              <svg viewBox="0 0 64 64" class="size-32" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round">
                <path d="M40 9 26 40" />
                <path d="M24 9 38 40" />
                <circle cx="23.5" cy="46.5" r="6.5" />
                <circle cx="40.5" cy="46.5" r="6.5" />
              </svg>
            </span>
          }
          @if (s.aDomicilio) {
            <span class="pointer-events-none absolute top-5 left-5 rounded-full bg-sage px-3 py-1 text-xs font-medium text-white shadow">A domicilio</span>
          }
        </div>

        <div appReveal class="flex flex-col justify-center bg-ivory px-6 py-14 sm:px-12 lg:px-16 xl:px-24">
          <p class="mb-4 flex items-center gap-3 text-xs font-semibold tracking-[0.14em] text-wine uppercase">
            <span aria-hidden="true" class="h-px w-8 bg-gold"></span>{{ categoria() }}
          </p>
          <h1 class="font-serif text-4xl leading-[1.08] font-semibold tracking-tight sm:text-5xl lg:text-[3.4rem]">
            {{ tituloInicio() }} <em class="font-medium text-wine italic">{{ tituloFinal() }}</em>
          </h1>
          <p class="mt-6 max-w-xl text-base leading-relaxed text-muted sm:text-lg">{{ s.descripcion }}</p>

          @if (s.incluye?.length) {
            <ul class="mt-6 flex flex-wrap gap-2 text-xs">
              @for (item of s.incluye; track item) {
                <li class="rounded-full bg-blush px-3 py-1.5 font-medium text-wine">{{ item }}</li>
              }
            </ul>
          }

          <dl class="mt-8 grid max-w-md grid-cols-2 gap-4">
            <div class="rounded-2xl border border-line bg-white p-5">
              <dt class="text-xs font-semibold tracking-[0.12em] text-muted uppercase">Precio</dt>
              <dd class="mt-1.5 font-serif text-2xl font-semibold text-wine">{{ precio() }}</dd>
            </div>
            <div class="rounded-2xl border border-line bg-white p-5">
              <dt class="text-xs font-semibold tracking-[0.12em] text-muted uppercase">Duración</dt>
              <dd class="mt-1.5 font-serif text-2xl font-semibold">{{ duracion() }}</dd>
            </div>
          </dl>

          <a routerLink="/agendar" [queryParams]="{ servicio: s.id }" class="mt-8 inline-flex w-full max-w-lg items-center justify-center gap-3 rounded-full bg-wine px-7 py-4 text-sm font-semibold tracking-[0.06em] text-white uppercase shadow-lg shadow-wine/25 transition hover:-translate-y-0.5 hover:bg-wine-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wine">
            <i class="pi pi-calendar" aria-hidden="true"></i>
            Reservar cita
          </a>
          <a routerLink="/servicios" class="mt-4 inline-flex items-center gap-2 self-start text-sm font-semibold text-wine transition hover:gap-3 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-wine">
            <i class="pi pi-arrow-left text-xs" aria-hidden="true"></i>
            Ver más servicios
          </a>

          <p class="mt-8 flex items-center gap-2.5 text-sm text-muted">
            <span class="grid size-9 place-items-center rounded-full bg-blush text-wine"><i class="pi pi-map-marker" aria-hidden="true"></i></span>
            {{ ubicacion }} · {{ horario }}
          </p>
        </div>
      </section>

      <!-- Diseñado para ti: texto + foto a media pantalla -->
      @if (imagenes()[0]; as foto) {
        <section class="bg-white lg:grid lg:min-h-[min(70vh,640px)] lg:grid-cols-2">
          <div appReveal class="flex flex-col justify-center px-6 py-16 sm:px-12 lg:px-16 xl:px-24">
            <app-seccion-titulo eyebrow="Diseñado para ti" titulo="Pensado" acento="a tu medida" [centrado]="false" />
            <p class="mt-6 font-serif text-2xl leading-relaxed text-ink sm:text-[1.7rem]">{{ info().diseno }}</p>
          </div>
          <div class="group relative min-h-[380px] overflow-hidden bg-blush lg:min-h-full">
            <img [ngSrc]="foto" fill sizes="(min-width: 1024px) 50vw, 100vw" alt="" class="object-cover" />
            <button type="button" (click)="ampliar(foto, s.nombre)" [attr.aria-label]="'Ampliar foto de ' + s.nombre" class="absolute inset-0 cursor-zoom-in focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-white"></button>
          </div>
        </section>
      } @else {
        <section class="bg-white py-24 sm:py-28">
          <div class="mx-auto grid max-w-6xl gap-10 px-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20 lg:px-8">
            <div appReveal>
              <app-seccion-titulo eyebrow="Diseñado para ti" titulo="Pensado" acento="a tu medida" [centrado]="false" />
            </div>
            <div appReveal="120" class="self-center">
              <p class="font-serif text-2xl leading-relaxed text-ink sm:text-[1.7rem]">{{ info().diseno }}</p>
            </div>
          </div>
        </section>
      }

      <!-- Cómo será tu cita: foto a media pantalla + pasos -->
      @if (imagenes()[1]; as foto) {
        <section class="lg:grid lg:min-h-[min(70vh,640px)] lg:grid-cols-2">
          <div class="group relative min-h-[380px] overflow-hidden bg-blush lg:min-h-full">
            <img [ngSrc]="foto" fill sizes="(min-width: 1024px) 50vw, 100vw" alt="" class="object-cover" />
            <button type="button" (click)="ampliar(foto, s.nombre)" [attr.aria-label]="'Ampliar foto de ' + s.nombre" class="absolute inset-0 cursor-zoom-in focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-white"></button>
          </div>
          <div appReveal class="flex flex-col justify-center px-6 py-16 sm:px-12 lg:px-16 xl:px-24">
            <app-seccion-titulo eyebrow="Tu visita" titulo="Cómo será" acento="tu cita" [centrado]="false" />
            <ol class="mt-8 space-y-7">
              @for (paso of pasos(); track paso.titulo; let i = $index) {
                <li class="flex gap-5">
                  <span class="grid size-11 shrink-0 place-items-center rounded-full bg-wine font-serif text-lg font-semibold text-gold shadow-lg shadow-wine/25">{{ i + 1 }}</span>
                  <div>
                    <h3 class="font-serif text-xl font-semibold">{{ paso.titulo }}</h3>
                    <p class="mt-1 max-w-md text-sm leading-relaxed text-muted">{{ paso.detalle }}</p>
                  </div>
                </li>
              }
            </ol>
          </div>
        </section>
      } @else {
        <section class="mx-auto max-w-6xl px-6 py-24 sm:py-28 lg:px-8">
          <div appReveal>
            <app-seccion-titulo eyebrow="Tu visita" titulo="Cómo será" acento="tu cita" />
          </div>
          <ol class="relative mt-14 grid gap-12 md:grid-cols-3 md:gap-8">
            <div aria-hidden="true" class="absolute top-7 right-[17%] left-[17%] hidden border-t border-dashed border-gold md:block"></div>
            @for (paso of pasos(); track paso.titulo; let i = $index) {
              <li [appReveal]="i * 140" class="relative text-center">
                <span class="relative mx-auto grid size-14 place-items-center rounded-full bg-wine font-serif text-xl font-semibold text-gold shadow-lg shadow-wine/25 ring-8 ring-ivory">{{ i + 1 }}</span>
                <h3 class="mt-5 font-serif text-xl font-semibold">{{ paso.titulo }}</h3>
                <p class="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-muted">{{ paso.detalle }}</p>
              </li>
            }
          </ol>
        </section>
      }

      <!-- Ideas para inspirarte -->
      @if (grupoCortes(); as grupo) {
        <div class="mx-auto max-w-6xl px-6 pb-24 lg:px-8"><app-catalogo-cortes [grupoInicial]="grupo" /></div>
      } @else if (fotos().length) {
        <section class="bg-white py-24 sm:py-28">
          <div class="mx-auto max-w-6xl px-6 lg:px-8">
            <div appReveal class="mb-12">
              <app-seccion-titulo eyebrow="Inspiración" titulo="Ideas para" acento="inspirarte" descripcion="Toca una foto para verla en grande y llévala a tu cita como referencia." />
            </div>
            <ul class="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
              @for (f of fotos(); track f.src; let i = $index) {
                <li [appReveal]="(i % 4) * 90">
                  <button type="button" (click)="ampliarGaleria(i)" [attr.aria-label]="'Ampliar foto ' + (i + 1) + ' de ' + fotos().length" class="group relative block aspect-[3/4] w-full cursor-zoom-in overflow-hidden rounded-2xl bg-blush shadow-md shadow-ink/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wine">
                    <img [ngSrc]="f.src" fill sizes="(min-width: 1024px) 22vw, 45vw" alt="" class="object-cover transition duration-700 group-hover:scale-105" />
                  </button>
                </li>
              }
            </ul>
          </div>
        </section>
      }

      <!-- Preguntas frecuentes -->
      <section class="mx-auto max-w-4xl px-6 py-24 sm:py-28 lg:px-8">
        <div appReveal class="mb-12">
          <app-seccion-titulo eyebrow="Resolvemos tus dudas" titulo="Preguntas" acento="frecuentes" />
        </div>
        <div appReveal="100" class="border-t border-line">
          @for (p of preguntas(); track p.pregunta) {
            <details class="group border-b border-line py-5">
              <summary class="flex cursor-pointer list-none items-center justify-between gap-6 font-serif text-lg font-semibold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-wine [&::-webkit-details-marker]:hidden">
                {{ p.pregunta }}
                <i class="pi pi-plus shrink-0 text-sm text-wine transition duration-300 group-open:rotate-45" aria-hidden="true"></i>
              </summary>
              <p class="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted">{{ p.respuesta }}</p>
            </details>
          }
        </div>
      </section>

      <!-- Relacionados -->
      @if (relacionados().length) {
        <section class="mx-auto max-w-6xl px-6 pb-24 lg:px-8">
          <div appReveal class="mb-10 flex flex-wrap items-end justify-between gap-4">
            <app-seccion-titulo eyebrow="Sigue explorando" titulo="También te puede" acento="interesar" [centrado]="false" />
            <a routerLink="/servicios" class="inline-flex items-center gap-2 text-sm font-semibold text-wine transition hover:gap-3 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-wine">
              Ver todos los servicios
              <i class="pi pi-arrow-right text-xs" aria-hidden="true"></i>
            </a>
          </div>
          <ul class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            @for (r of relacionados(); track r.id; let i = $index) {
              <li [appReveal]="i * 90"><app-servicio-card [servicio]="r" /></li>
            }
          </ul>
        </section>
      }

      <!-- Cierre -->
      <section class="mx-auto max-w-6xl px-6 pb-24 lg:px-8">
        <div appReveal class="relative overflow-hidden rounded-3xl bg-linear-to-br from-wine to-wine-dark px-8 py-16 text-center text-white sm:px-14">
          <div aria-hidden="true" class="absolute -top-20 -right-16 size-64 rounded-full border border-gold/40"></div>
          <div aria-hidden="true" class="absolute -bottom-24 -left-10 size-72 rounded-full border border-gold/25"></div>
          <div class="relative">
            <h2 class="mx-auto mb-4 max-w-xl font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
              Reserva tu <em class="font-medium text-gold italic">{{ s.nombre.toLowerCase() }}</em>
            </h2>
            <p class="mx-auto mb-8 max-w-md text-sm leading-relaxed text-white/80">Elige el horario que mejor te acomode. Sin llamadas y con confirmación al instante.</p>
            <a routerLink="/agendar" [queryParams]="{ servicio: s.id }" class="inline-flex items-center gap-2 rounded-full bg-gold px-7 py-3 text-sm font-semibold text-ink transition hover:-translate-y-0.5 hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
              Agendar cita
              <i class="pi pi-arrow-right text-xs" aria-hidden="true"></i>
            </a>
          </div>
        </div>
      </section>
    } @else {
      <section class="mx-auto max-w-2xl px-6 py-24 text-center">
        <h1 class="font-serif text-3xl font-semibold">No encontramos este servicio</h1>
        <p class="mt-3 text-sm text-muted">Puede que ya no esté disponible. Mira el resto de nuestros servicios.</p>
        <a routerLink="/servicios" class="mt-8 inline-flex items-center gap-2 rounded-full bg-wine px-6 py-3 text-sm font-semibold text-white transition hover:bg-wine-dark">
          Ver todos los servicios
          <i class="pi pi-arrow-right text-xs" aria-hidden="true"></i>
        </a>
      </section>
    }
  `
})
export class ServicioDetallePage {
  protected readonly catalogo = inject(CatalogoService);
  private readonly lightbox = inject(LightboxService);
  private readonly titulo = inject(Title);

  // Llega desde la ruta /servicios/:id (withComponentInputBinding)
  readonly id = input.required<string>();

  readonly ubicacion = `${SALON.canton}, ${SALON.municipio}`;
  readonly horario = SALON.horario;

  readonly servicio = computed(() => this.catalogo.servicioPorId(this.id()));
  readonly categoria = computed(() => this.servicio()?.categoriaNombre ?? "");
  readonly info = computed(() => INFO_SERVICIO[this.servicio()?.categoria ?? ""] ?? INFO_GENERAL);
  readonly relacionados = computed(() => this.catalogo.serviciosRelacionados(this.id(), CANTIDAD_RELACIONADOS));

  // El título lleva la última palabra en cursiva vino
  readonly tituloInicio = computed(() => (this.servicio()?.nombre ?? "").split(" ").slice(0, -1).join(" "));
  readonly tituloFinal = computed(() => (this.servicio()?.nombre ?? "").split(" ").slice(-1)[0]);

  readonly precio = computed(() => {
    const precio = this.servicio()?.precio;
    return precio ? `Q${precio}` : "Consultar";
  });
  readonly duracion = computed(() => {
    const min = this.servicio()?.duracionMin;
    return min ? `${min} min` : "Consultar";
  });

  readonly pasos = computed(() => [
    { titulo: "Reserva en línea", detalle: "Elige tu servicio, tu estilista y el horario que mejor te acomode." },
    { titulo: "Cuéntanos qué buscas", detalle: this.info().preparacion },
    { titulo: "Relájate y disfruta", detalle: "Tu estilista se encarga del resto para que salgas feliz con el resultado." }
  ]);

  // Fotos para las secciones a media pantalla ("Diseñado para ti" y "Cómo será tu cita")
  readonly grupoCortes = computed(() => this.servicio()?.grupoCortes ?? null);

  readonly imagenes = computed<string[]>(() => {
    const grupo = this.grupoCortes();
    if (grupo) {
      // Dos cortes del catálogo del grupo ilustran las secciones a media pantalla
      const cortes = this.catalogo.cortesDeGrupo(grupo)?.cortes ?? [];
      return [1, 8]
        .map(i => cortes[i] ?? cortes[i % Math.max(cortes.length, 1)])
        .filter(c => !!c)
        .map(c => c.imagen);
    }
    return this.fotos()
      .slice(1, 3)
      .map(f => f.src);
  });

  readonly fotos = computed(() => {
    const categoria = CATEGORIAS_ESTILO.find(c => c.id === ESTILOS_POR_SERVICIO[this.id()]);
    return categoria ? categoria.fotos.slice(0, FOTOS_INSPIRACION) : [];
  });

  // Preguntas propias de la categoría + las de cita, precio, duración y domicilio
  readonly preguntas = computed<PreguntaFrecuente[]>(() => {
    const s = this.servicio();
    if (!s) return [];
    return [
      ...this.info().preguntas,
      { pregunta: "¿Necesito cita previa?", respuesta: `Sí. Atendemos con cita previa, ${SALON.horario.toLowerCase()}. Puedes reservar en línea cuando quieras.` },
      {
        pregunta: "¿Cuánto cuesta?",
        respuesta: s.precio
          ? `El precio de referencia es Q${s.precio}. Puede variar según lo que necesites; tu estilista te lo confirma antes de empezar.`
          : "El precio depende de lo que necesites. Consúltalo al agendar y te lo confirmamos."
      },
      {
        pregunta: "¿Cuánto dura?",
        respuesta: s.duracionMin ? `Aproximadamente ${s.duracionMin} minutos, según lo que necesites.` : "La duración depende de lo que necesites; te la confirmamos al agendar."
      },
      {
        pregunta: "¿Atienden a domicilio?",
        respuesta: s.aDomicilio ? "Sí, este servicio está disponible a domicilio. Consulta la cobertura al agendar." : "Consúltalo al agendar: te confirmamos si este servicio está disponible a domicilio."
      }
    ];
  });

  constructor() {
    this.catalogo.cargarCortes();
    effect(() => {
      const s = this.servicio();
      this.titulo.setTitle(s ? `${s.nombre} | ${SALON.nombre}` : SALON.nombre);
    });
    inject(DestroyRef).onDestroy(() => this.titulo.setTitle(SALON.nombre));
  }

  ampliar(src: string, titulo: string): void {
    this.lightbox.abrir([{ src, alt: `Foto del servicio ${titulo}`, titulo }]);
  }

  ampliarGaleria(indice: number): void {
    const titulo = this.servicio()?.nombre ?? "";
    this.lightbox.abrir(
      this.fotos().map(f => ({ src: f.src, alt: f.alt, titulo })),
      indice
    );
  }
}
