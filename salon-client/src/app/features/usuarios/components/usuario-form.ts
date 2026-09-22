import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output, signal } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";

import { ApiError, Rol } from "../../../core/models/auth.models";
import { ETIQUETA_ROL, UsuarioAdmin } from "../models/usuario.models";
import { UsuarioService } from "../services/usuario.service";

// Sirve para crear y para editar. En edicion no se tocan el rol ni la contrasena:
// eso va por endpoints aparte en el backend.
@Component({
  selector: "app-usuario-form",
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="fixed inset-0 z-40 flex items-start justify-center overflow-y-auto bg-ink/40 px-4 py-10"
      (click)="cerrarSiEsElFondo($event)">
      <div
        role="dialog"
        aria-modal="true"
        [attr.aria-labelledby]="'titulo-form'"
        class="w-full max-w-[520px] rounded-xl border border-line bg-white p-6 shadow-[0_24px_60px_-20px_rgba(36,23,38,0.4)]">

        <h2 id="titulo-form" class="mb-1 font-serif text-[20px] font-semibold">
          {{ editando() ? "Editar usuario" : "Nuevo usuario" }}
        </h2>
        <p class="mb-5 text-[13px] text-muted">
          {{ editando() ? "El rol y la contrasena se cambian aparte." : "Aqui das de alta estilistas y administradores." }}
        </p>

        @if (errorGeneral(); as mensaje) {
          <div role="alert" class="mb-4 rounded-lg border border-wine/30 bg-blush px-4 py-3 text-[13px] text-wine-dark">
            {{ mensaje }}
          </div>
        }

        <form [formGroup]="formulario" (ngSubmit)="enviar()" novalidate class="flex flex-col gap-4">
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label for="f-nombre" class="mb-1.5 block text-[13px] font-semibold">Nombre</label>
              <input id="f-nombre" type="text" formControlName="nombre" [class]="claseCampo('nombre')" />
              @if (invalido("nombre")) {
                <p class="mt-1 text-xs text-wine">Escribe el nombre.</p>
              }
            </div>
            <div>
              <label for="f-apellido" class="mb-1.5 block text-[13px] font-semibold">Apellido</label>
              <input id="f-apellido" type="text" formControlName="apellido" [class]="claseCampo('apellido')" />
              @if (invalido("apellido")) {
                <p class="mt-1 text-xs text-wine">Escribe el apellido.</p>
              }
            </div>
          </div>

          <div>
            <label for="f-email" class="mb-1.5 block text-[13px] font-semibold">Correo electronico</label>
            <input id="f-email" type="email" formControlName="email" [class]="claseCampo('email')" />
            @if (invalido("email")) {
              <p class="mt-1 text-xs text-wine">
                {{ formulario.controls.email.hasError("required") ? "Escribe el correo." : "El correo no tiene un formato valido." }}
              </p>
            }
          </div>

          <div>
            <label for="f-telefono" class="mb-1.5 block text-[13px] font-semibold">
              Telefono <span class="font-normal text-muted">(opcional)</span>
            </label>
            <input id="f-telefono" type="tel" formControlName="telefono" [class]="claseCampo('telefono')" />
          </div>

          @if (!editando()) {
            <div>
              <label for="f-rol" class="mb-1.5 block text-[13px] font-semibold">Rol</label>
              <select id="f-rol" formControlName="rol" [class]="claseCampo('rol')">
                @for (r of roles; track r) {
                  <option [value]="r">{{ etiquetaRol[r] }}</option>
                }
              </select>
            </div>

            <div>
              <label for="f-password" class="mb-1.5 block text-[13px] font-semibold">Contrasena temporal</label>
              <input id="f-password" type="text" formControlName="password" autocomplete="off" [class]="claseCampo('password')" />
              <p class="mt-1 text-xs" [class.text-muted]="!invalido('password')" [class.text-wine]="invalido('password')">
                Minimo 8 caracteres. Se la compartes a la persona para su primer ingreso.
              </p>
            </div>
          }

          @if (esEstilista()) {
            <div>
              <label for="f-especialidad" class="mb-1.5 block text-[13px] font-semibold">
                Especialidad <span class="font-normal text-muted">(opcional)</span>
              </label>
              <input id="f-especialidad" type="text" formControlName="especialidad" placeholder="Corte y color" [class]="claseCampo('especialidad')" />
            </div>
          }

          <div class="mt-2 flex justify-end gap-2.5">
            <button
              type="button"
              (click)="cerrado.emit()"
              class="rounded-full border border-line px-4 py-2.5 text-[13px] font-semibold text-ink transition hover:bg-ivory focus:outline-none focus:ring-2 focus:ring-wine/30">
              Cancelar
            </button>
            <button
              type="submit"
              [disabled]="guardando()"
              class="flex items-center gap-2 rounded-full bg-wine px-5 py-2.5 text-[13px] font-semibold text-white transition hover:bg-wine-dark focus:outline-none focus:ring-2 focus:ring-wine/40 disabled:opacity-60">
              @if (guardando()) {
                <i class="pi pi-spin pi-spinner" aria-hidden="true"></i>
              }
              {{ editando() ? "Guardar cambios" : "Crear usuario" }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  host: { "(document:keydown.escape)": "cerrado.emit()" }
})
export class UsuarioForm {
  readonly usuario = input<UsuarioAdmin | null>(null);
  readonly guardado = output<UsuarioAdmin>();
  readonly cerrado = output<void>();

  private readonly fb = inject(FormBuilder);
  private readonly usuarioService = inject(UsuarioService);

  // El admin no se crea desde aqui, sale de la migracion inicial.
  protected readonly roles: readonly Rol[] = ["ESTILISTA", "CLIENTE"];
  protected readonly etiquetaRol = ETIQUETA_ROL;
  protected readonly guardando = signal(false);
  protected readonly errorGeneral = signal<string | null>(null);

  protected readonly editando = computed(() => this.usuario() !== null);

  protected readonly formulario = this.fb.nonNullable.group({
    nombre: ["", [Validators.required, Validators.maxLength(100)]],
    apellido: ["", [Validators.required, Validators.maxLength(100)]],
    email: ["", [Validators.required, Validators.email, Validators.maxLength(150)]],
    telefono: ["", [Validators.maxLength(20)]],
    rol: ["ESTILISTA" as Rol, [Validators.required]],
    password: ["", [Validators.required, Validators.minLength(8), Validators.maxLength(72)]],
    especialidad: ["", [Validators.maxLength(150)]]
  });

  private readonly rolElegido = signal<Rol>("ESTILISTA");

  protected readonly esEstilista = computed(() =>
    this.editando() ? this.usuario()?.rol === "ESTILISTA" : this.rolElegido() === "ESTILISTA"
  );

  constructor() {
    this.formulario.controls.rol.valueChanges.subscribe(rol => this.rolElegido.set(rol));

    effect(() => {
      const usuario = this.usuario();
      if (!usuario) {
        return;
      }
      // En edicion la contrasena no se pide, asi que su validador estorba.
      this.formulario.controls.password.clearValidators();
      this.formulario.controls.password.updateValueAndValidity();
      this.formulario.patchValue({
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        telefono: usuario.telefono ?? "",
        especialidad: usuario.especialidad ?? ""
      });
    });
  }

  protected claseCampo(campo: keyof typeof this.formulario.controls): string {
    const base =
      "w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition focus:border-wine focus:ring-2 focus:ring-wine/20";
    return `${base} ${this.invalido(campo) ? "border-wine" : "border-line"}`;
  }

  protected invalido(campo: keyof typeof this.formulario.controls): boolean {
    const control = this.formulario.controls[campo];
    return control.invalid && (control.dirty || control.touched);
  }

  protected cerrarSiEsElFondo(evento: MouseEvent): void {
    if (evento.target === evento.currentTarget) {
      this.cerrado.emit();
    }
  }

  protected enviar(): void {
    this.errorGeneral.set(null);

    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const valores = this.formulario.getRawValue();
    const especialidad = this.esEstilista() ? valores.especialidad || null : null;
    this.guardando.set(true);

    const usuarioEnEdicion = this.usuario();
    const peticion = usuarioEnEdicion
      ? this.usuarioService.actualizar(usuarioEnEdicion.id, {
          nombre: valores.nombre,
          apellido: valores.apellido,
          email: valores.email,
          telefono: valores.telefono || null,
          especialidad
        })
      : this.usuarioService.crear({
          nombre: valores.nombre,
          apellido: valores.apellido,
          email: valores.email,
          telefono: valores.telefono || null,
          password: valores.password,
          rol: valores.rol,
          especialidad
        });

    peticion.subscribe({
      next: usuario => {
        this.guardando.set(false);
        this.guardado.emit(usuario);
      },
      error: (error: ApiError) => {
        this.guardando.set(false);
        this.errorGeneral.set(error.mensaje);
      }
    });
  }
}
