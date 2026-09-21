import { ChangeDetectionStrategy, Component } from "@angular/core";
import { SeccionTitulo } from "../../../shared/components/seccion-titulo";
import { Reveal } from "../../../shared/directives/reveal";

@Component({
  selector: "app-consejos-cuidado",
  imports: [Reveal, SeccionTitulo],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="mx-auto max-w-6xl px-6 py-24 sm:py-28 lg:px-8">
      <div appReveal class="mb-12">
        <app-seccion-titulo eyebrow="Cuidado en casa" titulo="Consejos para mantener tu" acento="estilo" descripcion="Pequeños hábitos que hacen que tu corte, tu color y tu peinado se vean mejor por más tiempo." />
      </div>

      <ul class="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        @for (c of consejos; track c.titulo; let i = $index) {
          <li [appReveal]="i * 90">
            <article class="h-full rounded-2xl border border-line bg-white p-6 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-wine/10">
              <span class="grid size-12 place-items-center rounded-full bg-wine text-gold">
                <i class="pi" [class]="c.icono" aria-hidden="true"></i>
              </span>
              <h3 class="mt-4 font-serif text-lg font-semibold">{{ c.titulo }}</h3>
              <p class="mt-2 text-sm leading-relaxed text-muted">{{ c.detalle }}</p>
            </article>
          </li>
        }
      </ul>
    </section>
  `
})
export class ConsejosCuidado {
  readonly consejos = [
    { icono: "pi-calendar", titulo: "Mantén tu corte", detalle: "Retoca las puntas cada 6 a 8 semanas para que el corte conserve su forma y tu cabello se vea sano." },
    { icono: "pi-palette", titulo: "Cuida tu color", detalle: "Usa shampoo suave para cabello teñido, evita el agua muy caliente y protégelo del sol para que el tono dure más." },
    { icono: "pi-star", titulo: "Usa bien tu gel", detalle: "Toma una cantidad pequeña, caliéntala entre las manos y repártela por el cabello. Agrega más solo si hace falta." },
    { icono: "pi-heart", titulo: "Define tus rizos", detalle: "Aplica mousse o crema sobre el cabello húmedo, sin cepillar, y déjalo secar al aire o con difusor." }
  ];
}
