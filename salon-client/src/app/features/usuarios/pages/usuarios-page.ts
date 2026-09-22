import { ChangeDetectionStrategy, Component, computed, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";

import { ApiError, Rol } from "../../../core/models/auth.models";
import { AuthService } from "../../../core/services/auth.service";
import { UsuarioForm } from "../components/usuario-form";
import { ETIQUETA_ROL, FiltrosUsuarios, Pagina, UsuarioAdmin } from "../models/usuario.models";
import { UsuarioService } from "../services/usuario.service";

@Component({
  selector: "app-usuarios-page",
  imports: [FormsModule, UsuarioForm],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="px-6 py-7 md:px-8">
      <header class="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 class="font-serif text-[21px] font-semibold">Usuarios</h1>
          <p class="mt-1 text-[13px] text-muted">
            Aqui das de alta estilistas. Los clientes se registran solos desde la pagina principal.
          </p>
        </div>
        <button
          type="button"
          (click)="abrirNuevo()"
          class="rounded-full bg-wine px-[18px] py-[9px] text-[13px] font-semibold text-white transition hover:bg-wine-dark focus:outline-none focus:ring-2 focus:ring-wine/40 focus:ring-offset-2">
          Nuevo usuario
        </button>
      </header>

      <div class="mb-4 flex flex-wrap items-end gap-3">
        <div class="min-w-[200px] flex-1">
          <label for="busqueda" class="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
            Buscar
          </label>
          <input
            id="busqueda"
            type="search"
            [ngModel]="filtros().busqueda"
            (ngModelChange)="cambiarBusqueda($event)"
            placeholder="Nombre, apellido o correo"
            class="w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm outline-none transition placeholder:text-muted/70 focus:border-wine focus:ring-2 focus:ring-wine/20" />
        </div>

        <div>
          <label for="filtro-rol" class="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
            Rol
          </label>
          <select
            id="filtro-rol"
            [ngModel]="filtros().rol ?? ''"
            (ngModelChange)="cambiarRol($event)"
            class="rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm outline-none focus:border-wine focus:ring-2 focus:ring-wine/20">
            <option value="">Todos</option>
            @for (r of roles; track r) {
              <option [value]="r">{{ etiquetaRol[r] }}</option>
            }
          </select>
        </div>

        <div>
          <label for="filtro-estado" class="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
            Estado
          </label>
          <select
            id="filtro-estado"
            [ngModel]="estadoSeleccionado()"
            (ngModelChange)="cambiarEstado($event)"
            class="rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm outline-none focus:border-wine focus:ring-2 focus:ring-wine/20">
            <option value="">Todos</option>
            <option value="activos">Activos</option>
            <option value="inactivos">Desactivados</option>
          </select>
        </div>
      </div>

      @if (error(); as mensaje) {
        <div role="alert" class="mb-4 rounded-lg border border-wine/30 bg-blush px-4 py-3 text-[13px] text-wine-dark">
          {{ mensaje }}
        </div>
      }

      @if (aviso(); as mensaje) {
        <div role="status" class="mb-4 rounded-lg border border-sage/40 bg-[#F2F7F3] px-4 py-3 text-[13px] text-ink">
          {{ mensaje }}
        </div>
      }

      <div class="overflow-x-auto" [class.opacity-50]="cargando()">
        <table class="w-full min-w-[720px] border-collapse text-[12.5px]">
          <caption class="sr-only">Usuarios registrados en el sistema</caption>
          <thead>
            <tr>
              @for (columna of columnas; track columna) {
                <th scope="col" class="border-b border-line px-2.5 py-2.5 text-left text-[11px] font-semibold uppercase tracking-[0.04em] text-muted">
                  {{ columna }}
                </th>
              }
              <th scope="col" class="border-b border-line px-2.5 py-2.5 text-right text-[11px] font-semibold uppercase tracking-[0.04em] text-muted">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            @for (usuario of pagina()?.contenido ?? []; track usuario.id) {
              <tr [class.opacity-55]="!usuario.activo">
                <td class="border-b border-line px-2.5 py-3">
                  <span class="font-semibold">{{ usuario.nombre }} {{ usuario.apellido }}</span>
                  @if (usuario.especialidad) {
                    <span class="block text-[11.5px] text-muted">{{ usuario.especialidad }}</span>
                  }
                </td>
                <td class="border-b border-line px-2.5 py-3">{{ usuario.email }}</td>
                <td class="border-b border-line px-2.5 py-3">{{ usuario.telefono ?? "—" }}</td>
                <td class="border-b border-line px-2.5 py-3">
                  <span class="rounded-full bg-blush px-2.5 py-[3px] text-[10.5px] font-semibold text-wine">
                    {{ etiquetaRol[usuario.rol] }}
                  </span>
                </td>
                <td class="border-b border-line px-2.5 py-3">
                  <span
                    class="rounded-full px-2.5 py-[3px] text-[10.5px] font-semibold text-white"
                    [class.bg-sage]="usuario.activo"
                    [class.bg-muted]="!usuario.activo">
                    {{ usuario.activo ? "Activo" : "Desactivado" }}
                  </span>
                </td>
                <td class="border-b border-line px-2.5 py-3">
                  <div class="flex justify-end gap-1.5">
                    <button
                      type="button"
                      (click)="abrirEdicion(usuario)"
                      [attr.aria-label]="'Editar a ' + usuario.nombre + ' ' + usuario.apellido"
                      class="rounded-full border border-line px-3 py-1.5 text-[11.5px] font-semibold transition hover:border-wine/40 hover:bg-ivory focus:outline-none focus:ring-2 focus:ring-wine/30">
                      Editar
                    </button>
                    @if (usuario.activo) {
                      <button
                        type="button"
                        (click)="desactivar(usuario)"
                        [disabled]="esMiCuenta(usuario)"
                        [attr.aria-label]="'Desactivar a ' + usuario.nombre + ' ' + usuario.apellido"
                        [title]="esMiCuenta(usuario) ? 'No puedes desactivar tu propia cuenta' : ''"
                        class="rounded-full border border-wine px-3 py-1.5 text-[11.5px] font-semibold text-wine transition hover:bg-blush focus:outline-none focus:ring-2 focus:ring-wine/30 disabled:cursor-not-allowed disabled:opacity-40">
                        Desactivar
                      </button>
                    } @else {
                      <button
                        type="button"
                        (click)="activar(usuario)"
                        [attr.aria-label]="'Activar a ' + usuario.nombre + ' ' + usuario.apellido"
                        class="rounded-full border border-sage px-3 py-1.5 text-[11.5px] font-semibold text-sage transition hover:bg-[#F2F7F3] focus:outline-none focus:ring-2 focus:ring-sage/30">
                        Activar
                      </button>
                    }
                  </div>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="6" class="border-b border-line px-2.5 py-10 text-center text-muted">
                  {{ cargando() ? "Cargando…" : "No hay usuarios que coincidan con el filtro." }}
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      @if (pagina(); as p) {
        @if (p.totalPaginas > 1) {
          <nav aria-label="Paginacion" class="mt-4 flex items-center justify-between gap-3">
            <p class="text-[12px] text-muted">
              Pagina {{ p.pagina + 1 }} de {{ p.totalPaginas }} · {{ p.totalElementos }} usuarios
            </p>
            <div class="flex gap-2">
              <button
                type="button"
                (click)="irA(p.pagina - 1)"
                [disabled]="p.pagina === 0"
                class="rounded-full border border-line px-3.5 py-1.5 text-[12px] font-semibold transition hover:bg-ivory focus:outline-none focus:ring-2 focus:ring-wine/30 disabled:opacity-40">
                Anterior
              </button>
              <button
                type="button"
                (click)="irA(p.pagina + 1)"
                [disabled]="p.ultima"
                class="rounded-full border border-line px-3.5 py-1.5 text-[12px] font-semibold transition hover:bg-ivory focus:outline-none focus:ring-2 focus:ring-wine/30 disabled:opacity-40">
                Siguiente
              </button>
            </div>
          </nav>
        }
      }
    </div>

    @if (formAbierto()) {
      <app-usuario-form
        [usuario]="usuarioEnEdicion()"
        (guardado)="alGuardar($event)"
        (cerrado)="cerrarForm()" />
    }
  `
})
export class UsuariosPage {
  private readonly usuarioService = inject(UsuarioService);
  private readonly auth = inject(AuthService);

  protected readonly roles: readonly Rol[] = ["ADMINISTRADOR", "ESTILISTA", "CLIENTE"];
  protected readonly etiquetaRol = ETIQUETA_ROL;
  protected readonly columnas = ["Nombre", "Correo", "Telefono", "Rol", "Estado"] as const;

  protected readonly pagina = signal<Pagina<UsuarioAdmin> | null>(null);
  protected readonly cargando = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly aviso = signal<string | null>(null);
  protected readonly formAbierto = signal(false);
  protected readonly usuarioEnEdicion = signal<UsuarioAdmin | null>(null);

  protected readonly filtros = signal<FiltrosUsuarios>({
    rol: null,
    activo: null,
    busqueda: "",
    pagina: 0
  });

  protected readonly estadoSeleccionado = computed(() => {
    const activo = this.filtros().activo;
    return activo === null ? "" : activo ? "activos" : "inactivos";
  });

  private temporizador: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    this.cargar();
  }

  protected esMiCuenta(usuario: UsuarioAdmin): boolean {
    return usuario.email === this.auth.usuario()?.email;
  }

  // Espera a que deje de escribir para no pegarle a la API en cada tecla.
  protected cambiarBusqueda(texto: string): void {
    this.filtros.update(f => ({ ...f, busqueda: texto, pagina: 0 }));
    clearTimeout(this.temporizador);
    this.temporizador = setTimeout(() => this.cargar(), 350);
  }

  protected cambiarRol(valor: string): void {
    this.filtros.update(f => ({ ...f, rol: valor ? (valor as Rol) : null, pagina: 0 }));
    this.cargar();
  }

  protected cambiarEstado(valor: string): void {
    const activo = valor === "" ? null : valor === "activos";
    this.filtros.update(f => ({ ...f, activo, pagina: 0 }));
    this.cargar();
  }

  protected irA(pagina: number): void {
    this.filtros.update(f => ({ ...f, pagina }));
    this.cargar();
  }

  protected abrirNuevo(): void {
    this.usuarioEnEdicion.set(null);
    this.formAbierto.set(true);
  }

  protected abrirEdicion(usuario: UsuarioAdmin): void {
    this.usuarioEnEdicion.set(usuario);
    this.formAbierto.set(true);
  }

  protected cerrarForm(): void {
    this.formAbierto.set(false);
    this.usuarioEnEdicion.set(null);
  }

  protected alGuardar(usuario: UsuarioAdmin): void {
    const editaba = this.usuarioEnEdicion() !== null;
    this.cerrarForm();
    this.mostrarAviso(
      editaba
        ? `Se guardaron los cambios de ${usuario.nombre}.`
        : `${usuario.nombre} ${usuario.apellido} ya puede iniciar sesion con el rol ${ETIQUETA_ROL[usuario.rol].toLowerCase()}.`
    );
    this.cargar();
  }

  protected desactivar(usuario: UsuarioAdmin): void {
    this.usuarioService.desactivar(usuario.id).subscribe({
      next: () => {
        this.mostrarAviso(`${usuario.nombre} ya no puede iniciar sesion.`);
        this.cargar();
      },
      error: (e: ApiError) => this.error.set(e.mensaje)
    });
  }

  protected activar(usuario: UsuarioAdmin): void {
    this.usuarioService.activar(usuario.id).subscribe({
      next: () => {
        this.mostrarAviso(`${usuario.nombre} vuelve a tener acceso.`);
        this.cargar();
      },
      error: (e: ApiError) => this.error.set(e.mensaje)
    });
  }

  private cargar(): void {
    this.cargando.set(true);
    this.error.set(null);
    this.usuarioService.listar(this.filtros()).subscribe({
      next: pagina => {
        this.pagina.set(pagina);
        this.cargando.set(false);
      },
      error: (e: ApiError) => {
        this.error.set(e.mensaje);
        this.cargando.set(false);
      }
    });
  }

  private mostrarAviso(texto: string): void {
    this.aviso.set(texto);
    setTimeout(() => this.aviso.set(null), 5000);
  }
}
