import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { RouterLink } from "@angular/router";

import { AuthService } from "../../../core/services/auth.service";

interface Cita {
  readonly codigo: string;
  readonly estado: "Confirmada" | "Completada";
  readonly servicio: string;
  readonly estilista: string;
  readonly fecha: string;
  readonly modalidad: string;
  readonly total: string;
}

// Inicio del cliente, sus citas como tickets (mockup 04). Datos de muestra.
@Component({
  selector: "app-mis-citas-page",
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mx-auto w-full max-w-[720px] px-6 py-8">
      <header class="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 class="font-serif text-[22px] font-semibold">Mis citas</h1>
          <p class="mt-1 text-[13px] text-muted">Hola {{ auth.usuario()?.nombre }}, aquí están tus reservas.</p>
        </div>
        <a
          routerLink="/agendar"
          class="rounded-full bg-wine px-[18px] py-[9px] text-[13px] font-semibold text-white transition hover:bg-wine-dark focus:outline-none focus:ring-2 focus:ring-wine/40 focus:ring-offset-2">
          Agendar cita
        </a>
      </header>

      <ul class="flex flex-col gap-3.5">
        @for (cita of citas; track cita.codigo) {
          <li
            class="rounded-xl border border-dashed border-gold bg-[#FFFDF9] p-4"
            [class.opacity-60]="cita.estado === 'Completada'">
            <div class="mb-2.5 flex items-start justify-between gap-3">
              <span class="font-serif text-[15px] font-bold text-wine">{{ cita.codigo }}</span>
              <span
                class="rounded-full px-2.5 py-[3px] text-[10px] font-semibold text-white"
                [class.bg-sage]="cita.estado === 'Confirmada'"
                [class.bg-muted]="cita.estado === 'Completada'">
                {{ cita.estado }}
              </span>
            </div>
            <dl class="text-[12.5px]">
              <div class="flex justify-between py-[3px]">
                <dt class="text-muted">Servicio</dt>
                <dd>{{ cita.servicio }}</dd>
              </div>
              <div class="flex justify-between py-[3px]">
                <dt class="text-muted">Estilista</dt>
                <dd>{{ cita.estilista }}</dd>
              </div>
              <div class="flex justify-between py-[3px]">
                <dt class="text-muted">Fecha</dt>
                <dd>{{ cita.fecha }}</dd>
              </div>
              <div class="flex justify-between py-[3px]">
                <dt class="text-muted">Modalidad</dt>
                <dd>{{ cita.modalidad }}</dd>
              </div>
              <div class="mt-2.5 flex justify-between border-t border-dashed border-line pt-2.5">
                <dt class="text-muted">Total</dt>
                <dd class="font-bold text-wine">{{ cita.total }}</dd>
              </div>
            </dl>
          </li>
        }
      </ul>
    </div>
  `
})
export class MisCitasPage {
  protected readonly auth = inject(AuthService);

  protected readonly citas: readonly Cita[] = [
    {
      codigo: "#RSV-0248",
      estado: "Confirmada",
      servicio: "Corte y peinado",
      estilista: "Marisol",
      fecha: "Jue 20 ago, 11:00",
      modalidad: "Presencial",
      total: "Q150.00"
    },
    {
      codigo: "#RSV-0201",
      estado: "Completada",
      servicio: "Manicure spa",
      estilista: "Marisol",
      fecha: "Vie 07 ago, 15:30",
      modalidad: "Presencial",
      total: "Q120.00"
    }
  ];
}
