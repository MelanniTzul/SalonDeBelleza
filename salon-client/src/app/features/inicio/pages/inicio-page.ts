import { Component } from "@angular/core";
import { RouterLink } from "@angular/router";

@Component({
  selector: "app-inicio-page",
  imports: [RouterLink],
  template: `
    <section class="grid grid-cols-1 md:grid-cols-[1.1fr_0.9fr]">
      <div class="px-11 py-14">
        <p class="mb-3.5 text-xs font-semibold uppercase tracking-[0.14em] text-wine">Salón de belleza</p>
        <h1 class="mb-4 font-serif text-[34px] font-semibold leading-[1.15]">Tu cita, sin llamadas ni esperas</h1>
        <p class="mb-6 max-w-[380px] text-sm leading-relaxed text-muted">Consulta servicios, precios y disponibilidad en tiempo real, y agenda con la estilista de tu preferencia, presencial o a domicilio.</p>
        <a routerLink="/agendar" class="inline-block rounded-full bg-wine px-[18px] py-[9px] text-[13px] font-semibold text-white">Ver horarios disponibles</a>
      </div>
      <div class="relative min-h-[260px] bg-linear-to-br from-blush to-[#E3C9CF]">
        <div class="absolute inset-8 rounded border border-wine/25"></div>
      </div>
    </section>
    <section class="grid grid-cols-2 border-t border-line md:grid-cols-4">
      @for (d of datos; track d.titulo) {
        <div class="border-r border-line px-7 py-[22px] text-xs text-muted">
          <strong class="mb-1 block font-serif text-[15px] text-ink">{{ d.titulo }}</strong>{{ d.detalle }}
        </div>
      }
    </section>
  `
})
export class InicioPage {
  readonly datos = [
    { titulo: "2 estilistas", detalle: "Perfiles y horarios propios" },
    { titulo: "Lun–Sáb", detalle: "Horario de atención" },
    { titulo: "A domicilio", detalle: "Zona de cobertura configurable" },
    { titulo: "Zona 10", detalle: "Ubicación del salón" }
  ];
}
