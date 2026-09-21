import { ChangeDetectionStrategy, Component } from "@angular/core";
import { RouterLink } from "@angular/router";
import { SeccionTitulo } from "../../../shared/components/seccion-titulo";
import { Reveal } from "../../../shared/directives/reveal";

@Component({
  selector: "app-pasos-agenda",
  imports: [Reveal, RouterLink, SeccionTitulo],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="mx-auto max-w-6xl px-6 py-24 sm:py-28 lg:px-8">
      <div appReveal>
        <app-seccion-titulo eyebrow="Reservar es fácil" titulo="Agenda tu cita en" acento="3 pasos" descripcion="Sin llamadas ni esperas: elige, confirma y listo." />
      </div>

      <ol class="relative mt-14 grid gap-12 md:grid-cols-3 md:gap-8">
        <div aria-hidden="true" class="absolute top-7 right-[17%] left-[17%] hidden border-t border-dashed border-gold md:block"></div>
        @for (paso of pasos; track paso.titulo; let i = $index) {
          <li [appReveal]="i * 140" class="relative text-center">
            <span class="relative mx-auto grid size-14 place-items-center rounded-full bg-wine font-serif text-xl font-semibold text-gold shadow-lg shadow-wine/25 ring-8 ring-ivory">{{ i + 1 }}</span>
            <h3 class="mt-5 font-serif text-xl font-semibold">{{ paso.titulo }}</h3>
            <p class="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-muted">{{ paso.detalle }}</p>
          </li>
        }
      </ol>

      <div appReveal="300" class="mt-12 text-center">
        <a routerLink="/agendar" class="inline-flex items-center gap-2 rounded-full bg-wine px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-wine/25 transition hover:-translate-y-0.5 hover:bg-wine-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wine">
          Agendar mi cita
          <i class="pi pi-arrow-right text-xs" aria-hidden="true"></i>
        </a>
      </div>
    </section>
  `
})
export class PasosAgenda {
  readonly pasos = [
    { titulo: "Elige tu servicio", detalle: "Explora el catálogo y escoge lo que necesitas, en el salón o a domicilio." },
    { titulo: "Escoge estilista y horario", detalle: "Consulta la disponibilidad en tiempo real y reserva con quien prefieras." },
    { titulo: "Confirma y disfruta", detalle: "Recibe la confirmación de tu cita y llega con todo listo para consentirte." }
  ];
}
