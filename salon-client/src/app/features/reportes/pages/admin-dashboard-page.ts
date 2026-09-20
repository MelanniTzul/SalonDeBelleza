import { ChangeDetectionStrategy, Component, inject } from "@angular/core";

import { AuthService } from "../../../core/services/auth.service";

interface Kpi {
  readonly valor: string;
  readonly etiqueta: string;
}

interface FilaServicio {
  readonly servicio: string;
  readonly citas: number;
  readonly modalidad: string;
  readonly tendencia: string;
}

/**
 * Pantalla de inicio del administrador (mockup 06).
 * Los números son datos de muestra: se reemplazarán por el endpoint de reportes.
 */
@Component({
  selector: "app-admin-dashboard-page",
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="px-6 py-7 md:px-8">
      <header class="mb-6">
        <h1 class="font-serif text-[21px] font-semibold">Hola, {{ auth.usuario()?.nombre }}</h1>
        <p class="mt-1 text-[13px] text-muted">Resumen de la operación del salón este mes.</p>
      </header>

      <section aria-label="Indicadores del mes" class="mb-6 grid grid-cols-2 gap-3.5 xl:grid-cols-4">
        @for (kpi of kpis; track kpi.etiqueta) {
          <article class="rounded-[10px] border border-line p-4">
            <p class="font-serif text-2xl font-semibold text-wine">{{ kpi.valor }}</p>
            <p class="mt-1 text-[11.5px] text-muted">{{ kpi.etiqueta }}</p>
          </article>
        }
      </section>

      <section aria-labelledby="titulo-tabla">
        <h2 id="titulo-tabla" class="mb-3 font-serif text-[17px] font-semibold">Servicios más solicitados</h2>
        <div class="overflow-x-auto">
          <table class="w-full border-collapse text-[12.5px]">
            <caption class="sr-only">Citas por servicio, modalidad más usada y tendencia</caption>
            <thead>
              <tr>
                @for (columna of columnas; track columna) {
                  <th
                    scope="col"
                    class="border-b border-line px-2.5 py-2.5 text-left text-[11px] font-semibold uppercase tracking-[0.04em] text-muted">
                    {{ columna }}
                  </th>
                }
              </tr>
            </thead>
            <tbody>
              @for (fila of filas; track fila.servicio) {
                <tr>
                  <td class="border-b border-line px-2.5 py-3">{{ fila.servicio }}</td>
                  <td class="border-b border-line px-2.5 py-3">{{ fila.citas }}</td>
                  <td class="border-b border-line px-2.5 py-3">{{ fila.modalidad }}</td>
                  <td class="border-b border-line px-2.5 py-3">
                    <span class="rounded-full bg-blush px-2.5 py-[3px] text-[10.5px] font-semibold text-wine">
                      {{ fila.tendencia }}
                    </span>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <div class="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            class="rounded-full border border-wine px-3.5 py-[7px] text-[11.5px] font-semibold text-wine transition hover:bg-blush focus:outline-none focus:ring-2 focus:ring-wine/30">
            Exportar .xlsx
          </button>
          <button
            type="button"
            class="rounded-full border border-wine px-3.5 py-[7px] text-[11.5px] font-semibold text-wine transition hover:bg-blush focus:outline-none focus:ring-2 focus:ring-wine/30">
            Exportar PDF
          </button>
        </div>
      </section>
    </div>
  `
})
export class AdminDashboardPage {
  protected readonly auth = inject(AuthService);

  protected readonly kpis: readonly Kpi[] = [
    { valor: "347", etiqueta: "Citas este mes" },
    { valor: "65%", etiqueta: "Ocupación promedio" },
    { valor: "Q42,180", etiqueta: "Ingresos estimados" },
    { valor: "12", etiqueta: "Inasistencias" }
  ];

  protected readonly columnas = ["Servicio", "Citas", "Modalidad más usada", "Estado"] as const;

  protected readonly filas: readonly FilaServicio[] = [
    { servicio: "Corte y peinado", citas: 142, modalidad: "Presencial", tendencia: "Al alza" },
    { servicio: "Manicure spa", citas: 98, modalidad: "Presencial", tendencia: "Estable" },
    { servicio: "Maquillaje social", citas: 54, modalidad: "A domicilio", tendencia: "Al alza" }
  ];
}
