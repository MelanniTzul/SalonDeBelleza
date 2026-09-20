import { ChangeDetectionStrategy, Component, inject, signal } from "@angular/core";
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";

import { ApiError, RUTA_INICIO_POR_ROL } from "../../../core/models/auth.models";
import { AuthService } from "../../../core/services/auth.service";

/** Comprueba que la confirmación coincida con la contraseña escrita arriba. */
const passwordsCoinciden = (grupo: AbstractControl): ValidationErrors | null => {
  const password = grupo.get("password")?.value;
  const confirmacion = grupo.get("confirmacion")?.value;
  return password && confirmacion && password !== confirmacion ? { noCoinciden: true } : null;
};

@Component({
  selector: "app-registro-page",
  imports: [ReactiveFormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="grid min-h-screen grid-cols-1 lg:grid-cols-[1fr_0.85fr]">
      <div class="flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16">
        <div class="mx-auto w-full max-w-[440px]">
          <a routerLink="/" class="mb-10 inline-block font-serif text-[19px] font-semibold text-wine">
            {{ nombreSalon }}
          </a>

          <p class="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-wine">Nueva cuenta</p>
          <h1 class="mb-3 font-serif text-[30px] font-semibold leading-[1.15]">Crea tu cuenta</h1>
          <p class="mb-8 text-sm leading-relaxed text-muted">
            Con tu cuenta puedes agendar citas y consultar el historial cuando quieras.
          </p>

          @if (errorGeneral(); as mensaje) {
            <div
              role="alert"
              class="mb-6 rounded-lg border border-wine/30 bg-blush px-4 py-3 text-[13px] text-wine-dark">
              {{ mensaje }}
            </div>
          }

          <form [formGroup]="formulario" (ngSubmit)="enviar()" novalidate class="flex flex-col gap-5">
            <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label for="nombre" class="mb-2 block text-[13px] font-semibold text-ink">Nombre</label>
                <input
                  id="nombre"
                  type="text"
                  formControlName="nombre"
                  autocomplete="given-name"
                  [attr.aria-invalid]="esInvalido('nombre')"
                  [attr.aria-describedby]="esInvalido('nombre') ? 'error-nombre' : null"
                  class="w-full rounded-lg border bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-wine focus:ring-2 focus:ring-wine/20"
                  [class.border-line]="!esInvalido('nombre')"
                  [class.border-wine]="esInvalido('nombre')" />
                @if (esInvalido("nombre")) {
                  <p id="error-nombre" class="mt-1.5 text-xs text-wine">Escribe tu nombre.</p>
                }
              </div>
              <div>
                <label for="apellido" class="mb-2 block text-[13px] font-semibold text-ink">Apellido</label>
                <input
                  id="apellido"
                  type="text"
                  formControlName="apellido"
                  autocomplete="family-name"
                  [attr.aria-invalid]="esInvalido('apellido')"
                  [attr.aria-describedby]="esInvalido('apellido') ? 'error-apellido' : null"
                  class="w-full rounded-lg border bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-wine focus:ring-2 focus:ring-wine/20"
                  [class.border-line]="!esInvalido('apellido')"
                  [class.border-wine]="esInvalido('apellido')" />
                @if (esInvalido("apellido")) {
                  <p id="error-apellido" class="mt-1.5 text-xs text-wine">Escribe tu apellido.</p>
                }
              </div>
            </div>

            <div>
              <label for="email" class="mb-2 block text-[13px] font-semibold text-ink">Correo electrónico</label>
              <input
                id="email"
                type="email"
                formControlName="email"
                autocomplete="email"
                placeholder="tucorreo@ejemplo.com"
                [attr.aria-invalid]="esInvalido('email')"
                [attr.aria-describedby]="esInvalido('email') ? 'error-email' : null"
                class="w-full rounded-lg border bg-white px-4 py-3 text-sm text-ink outline-none transition placeholder:text-muted/70 focus:border-wine focus:ring-2 focus:ring-wine/20"
                [class.border-line]="!esInvalido('email')"
                [class.border-wine]="esInvalido('email')" />
              @if (esInvalido("email")) {
                <p id="error-email" class="mt-1.5 text-xs text-wine">
                  {{ formulario.controls.email.hasError("required") ? "Escribe tu correo." : "El formato del correo no es válido." }}
                </p>
              }
            </div>

            <div>
              <label for="telefono" class="mb-2 block text-[13px] font-semibold text-ink">
                Teléfono <span class="font-normal text-muted">(opcional)</span>
              </label>
              <input
                id="telefono"
                type="tel"
                formControlName="telefono"
                autocomplete="tel"
                placeholder="5555-0000"
                class="w-full rounded-lg border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition placeholder:text-muted/70 focus:border-wine focus:ring-2 focus:ring-wine/20" />
            </div>

            <div>
              <label for="password" class="mb-2 block text-[13px] font-semibold text-ink">Contraseña</label>
              <div class="relative">
                <input
                  id="password"
                  [type]="verPassword() ? 'text' : 'password'"
                  formControlName="password"
                  autocomplete="new-password"
                  [attr.aria-invalid]="esInvalido('password')"
                  aria-describedby="ayuda-password"
                  class="w-full rounded-lg border bg-white px-4 py-3 pr-12 text-sm text-ink outline-none transition focus:border-wine focus:ring-2 focus:ring-wine/20"
                  [class.border-line]="!esInvalido('password')"
                  [class.border-wine]="esInvalido('password')" />
                <button
                  type="button"
                  (click)="alternarPassword()"
                  [attr.aria-label]="verPassword() ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                  [attr.aria-pressed]="verPassword()"
                  class="absolute right-1 top-1/2 -translate-y-1/2 rounded-md p-2.5 text-muted transition hover:text-wine focus:outline-none focus:ring-2 focus:ring-wine/30">
                  <i [class]="verPassword() ? 'pi pi-eye-slash' : 'pi pi-eye'" aria-hidden="true"></i>
                </button>
              </div>
              <p id="ayuda-password" class="mt-1.5 text-xs" [class.text-muted]="!esInvalido('password')" [class.text-wine]="esInvalido('password')">
                Mínimo 8 caracteres.
              </p>
            </div>

            <div>
              <label for="confirmacion" class="mb-2 block text-[13px] font-semibold text-ink">Repite la contraseña</label>
              <input
                id="confirmacion"
                type="password"
                formControlName="confirmacion"
                autocomplete="new-password"
                [attr.aria-invalid]="mostrarErrorConfirmacion()"
                [attr.aria-describedby]="mostrarErrorConfirmacion() ? 'error-confirmacion' : null"
                class="w-full rounded-lg border bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-wine focus:ring-2 focus:ring-wine/20"
                [class.border-line]="!mostrarErrorConfirmacion()"
                [class.border-wine]="mostrarErrorConfirmacion()" />
              @if (mostrarErrorConfirmacion()) {
                <p id="error-confirmacion" class="mt-1.5 text-xs text-wine">Las contraseñas no coinciden.</p>
              }
            </div>

            <button
              type="submit"
              [disabled]="auth.cargando()"
              class="mt-1 flex items-center justify-center gap-2 rounded-full bg-wine px-[18px] py-[13px] text-[13px] font-semibold text-white transition hover:bg-wine-dark focus:outline-none focus:ring-2 focus:ring-wine/40 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60">
              @if (auth.cargando()) {
                <i class="pi pi-spin pi-spinner" aria-hidden="true"></i>
                <span>Creando cuenta…</span>
              } @else {
                <span>Crear cuenta</span>
              }
            </button>
          </form>

          <p class="mt-7 text-center text-[13px] text-muted">
            ¿Ya tienes cuenta?
            <a routerLink="/login" class="font-semibold text-wine underline-offset-2 hover:underline">Inicia sesión</a>
          </p>
        </div>
      </div>

      <aside class="relative hidden bg-linear-to-br from-blush to-[#E3C9CF] lg:block" aria-hidden="true">
        <div class="absolute inset-8 rounded border border-wine/25"></div>
        <blockquote class="absolute bottom-16 left-12 right-12 font-serif text-[26px] font-semibold leading-[1.25] text-wine-dark">
          Elige tu estilista y tu horario, desde donde estés.
        </blockquote>
      </aside>
    </main>
  `
})
export class RegistroPage {
  protected readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  protected readonly nombreSalon = "Salón de Belleza Familiar";
  protected readonly errorGeneral = signal<string | null>(null);
  protected readonly verPassword = signal(false);

  protected readonly formulario = this.fb.nonNullable.group(
    {
      nombre: ["", [Validators.required, Validators.maxLength(100)]],
      apellido: ["", [Validators.required, Validators.maxLength(100)]],
      email: ["", [Validators.required, Validators.email, Validators.maxLength(150)]],
      telefono: ["", [Validators.maxLength(20)]],
      password: ["", [Validators.required, Validators.minLength(8), Validators.maxLength(72)]],
      confirmacion: ["", [Validators.required]]
    },
    { validators: passwordsCoinciden }
  );

  protected alternarPassword(): void {
    this.verPassword.update(valor => !valor);
  }

  protected esInvalido(control: "nombre" | "apellido" | "email" | "password"): boolean {
    const campo = this.formulario.controls[control];
    return campo.invalid && (campo.dirty || campo.touched);
  }

  protected mostrarErrorConfirmacion(): boolean {
    const campo = this.formulario.controls.confirmacion;
    return this.formulario.hasError("noCoinciden") && (campo.dirty || campo.touched);
  }

  protected enviar(): void {
    this.errorGeneral.set(null);

    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const { nombre, apellido, email, telefono, password } = this.formulario.getRawValue();
    this.auth.registrar({ nombre, apellido, email, telefono: telefono || null, password }).subscribe({
      next: respuesta => this.router.navigateByUrl(RUTA_INICIO_POR_ROL[respuesta.usuario.rol]),
      error: (error: ApiError) => this.errorGeneral.set(error.mensaje)
    });
  }
}
