import { ChangeDetectionStrategy, Component, inject } from "@angular/core";

import { AuthService } from "../../../core/services/auth.service";

interface Cita {
  readonly cliente: string;
  readonly servicio: string;
  /** Resalta la cita en dorado (por ejemplo, las citas a domicilio). */
  readonly domicilio?: boolean;
}

/**
 * Agenda semanal de la estilista (mockup 05).
 * Las citas son datos de muestra hasta conectar el endpoint de agenda.
 */
@Component({
  selector: "app-agenda-estilista-page",
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="px-6 py-7 md:px-8">
      <header class="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 class="font-serif text-[22px] font-semibold">Mi agenda — semana del 18 ago</h1>
          <p class="mt-1 text-[13px] text-muted">Hola {{ auth.usuario()?.nombre }}, estas son tus citas de la semana.</p>
        </div>
        <button
          type="button"
          class="rounded-full border border-wine px-[17px] py-2 text-[13px] font-semibold text-wine transition hover:bg-blush focus:outline-none focus:ring-2 focus:ring-wine/30">
          Editar horario
        </button>
      </header>

      <div class="overflow-x-auto">
        <table class="w-full min-w-[640px] border-collapse border-t border-line text-left">
          <caption class="sr-only">Citas agendadas de lunes a viernes por hora</caption>
          <thead>
            <tr>
              <th scope="col" class="w-[70px] border-b border-r border-line p-2.5 text-xs font-normal text-muted">
                <span class="sr-only">Hora</span>
              </th>
              @for (dia of dias; track dia) {
                <th
                  scope="col"
                  class="border-b border-r border-line p-2.5 text-center text-xs font-normal text-muted">
                  {{ dia }}
                </th>
              }
            </tr>
          </thead>
          <tbody>
            @for (hora of horas; track hora) {
              <tr>
                <th scope="row" class="border-b border-r border-line p-2 text-[11px] font-normal text-muted">
                  {{ hora }}
                </th>
                @for (dia of dias; track dia) {
                  <td class="h-[46px] border-b border-r border-line p-1 align-top">
                    @if (citaDe(dia, hora); as cita) {
                      <div
                        class="rounded px-1.5 py-1 text-[10.5px] leading-[1.3]"
                        [class.bg-wine]="!cita.domicilio"
                        [class.text-white]="!cita.domicilio"
                        [class.bg-gold]="cita.domicilio"
                        [class.text-ink]="cita.domicilio">
                        {{ cita.cliente }}<br />{{ cita.servicio }}
                      </div>
                    }
                  </td>
                }
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class AgendaEstilistaPage {
  protected readonly auth = inject(AuthService);

  protected readonly dias = ["Lun", "Mar", "Mié", "Jue", "Vie"] as const;
  protected readonly horas = ["10:00", "11:00", "12:00"] as const;

  /** Citas de muestra indexadas por "dia-hora". */
  private readonly citas: Readonly<Record<string, Cita>> = {
    "Mar-10:00": { cliente: "Ana G.", servicio: "Corte" },
    "Lun-11:00": { cliente: "Luis P.", servicio: "Barba", domicilio: true },
    "Jue-11:00": { cliente: "Rosa T.", servicio: "Corte" },
    "Vie-12:00": { cliente: "Vero L.", servicio: "Maquillaje", domicilio: true }
  };

  protected citaDe(dia: string, hora: string): Cita | undefined {
    return this.citas[`${dia}-${hora}`];
  }
}
