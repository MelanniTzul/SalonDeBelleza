import { ChangeDetectionStrategy, Component, inject, signal } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { NgOptimizedImage } from "@angular/common";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";

import { ApiError, RUTA_INICIO_POR_ROL } from "../../../core/models/auth.models";
import { AuthService } from "../../../core/services/auth.service";

@Component({
  selector: "app-login-page",
  imports: [ReactiveFormsModule, RouterLink, NgOptimizedImage],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="grid min-h-screen grid-cols-1 lg:grid-cols-[1fr_0.85fr]">
      <!-- Columna del formulario -->
      <div class="flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16">
        <div class="mx-auto w-full max-w-[400px]">
          <a routerLink="/" class="mb-10 inline-block font-serif text-[19px] font-semibold text-wine">
            {{ nombreSalon }}
          </a>

          <p class="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-wine">Bienvenida de nuevo</p>
          <h1 class="mb-3 font-serif text-[30px] font-semibold leading-[1.15]">Inicia sesión</h1>
          <p class="mb-8 text-sm leading-relaxed text-muted">
            Entra para gestionar tus citas, tu agenda o el panel del salón.
          </p>

          @if (sesionExpirada()) {
            <div
              role="status"
              class="mb-6 rounded-lg border border-gold/50 bg-[#FFFDF9] px-4 py-3 text-[13px] text-ink">
              Tu sesión expiró por seguridad. Vuelve a iniciar sesión.
            </div>
          }

          @if (errorGeneral(); as mensaje) {
            <div
              role="alert"
              class="mb-6 rounded-lg border border-wine/30 bg-blush px-4 py-3 text-[13px] text-wine-dark">
              {{ mensaje }}
            </div>
          }

          <form [formGroup]="formulario" (ngSubmit)="enviar()" novalidate class="flex flex-col gap-5">
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
              <div class="mb-2 flex items-baseline justify-between">
                <label for="password" class="text-[13px] font-semibold text-ink">Contraseña</label>
                <a routerLink="/recuperar" class="text-xs text-wine underline-offset-2 hover:underline">
                  ¿La olvidaste?
                </a>
              </div>
              <div class="relative">
                <input
                  id="password"
                  [type]="verPassword() ? 'text' : 'password'"
                  formControlName="password"
                  autocomplete="current-password"
                  placeholder="••••••••"
                  [attr.aria-invalid]="esInvalido('password')"
                  [attr.aria-describedby]="esInvalido('password') ? 'error-password' : null"
                  class="w-full rounded-lg border bg-white px-4 py-3 pr-12 text-sm text-ink outline-none transition placeholder:text-muted/70 focus:border-wine focus:ring-2 focus:ring-wine/20"
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
              @if (esInvalido("password")) {
                <p id="error-password" class="mt-1.5 text-xs text-wine">Escribe tu contraseña.</p>
              }
            </div>

            <button
              type="submit"
              [disabled]="auth.cargando()"
              class="mt-1 flex items-center justify-center gap-2 rounded-full bg-wine px-[18px] py-[13px] text-[13px] font-semibold text-white transition hover:bg-wine-dark focus:outline-none focus:ring-2 focus:ring-wine/40 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60">
              @if (auth.cargando()) {
                <i class="pi pi-spin pi-spinner" aria-hidden="true"></i>
                <span>Entrando…</span>
              } @else {
                <span>Entrar</span>
              }
            </button>
          </form>

          <p class="mt-7 text-center text-[13px] text-muted">
            ¿Aún no tienes cuenta?
            <a routerLink="/registro" class="font-semibold text-wine underline-offset-2 hover:underline">Crea una aquí</a>
          </p>
        </div>
      </div>

      <!-- Columna decorativa, misma textura del inicio -->
      <aside class="relative hidden overflow-hidden bg-blush lg:block" aria-hidden="true">
        <img ngSrc="img/salon-113.jpeg" fill priority sizes="45vw" alt="" class="object-cover object-[center_62%]" />
        <div class="absolute inset-0 bg-linear-to-t from-ink/70 via-ink/20 to-transparent"></div>
        <div class="absolute inset-8 rounded border border-white/40"></div>
        <blockquote class="absolute bottom-16 left-12 right-12 font-serif text-[26px] font-semibold leading-[1.25] text-white drop-shadow-[0_2px_8px_rgba(36,23,38,0.6)]">
          Tu cita, sin llamadas ni esperas.
        </blockquote>
      </aside>
    </main>
  `
})
export class LoginPage {
  protected readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly ruta = inject(ActivatedRoute);

  protected readonly nombreSalon = "Salón de Belleza Familiar";
  protected readonly errorGeneral = signal<string | null>(null);
  protected readonly verPassword = signal(false);
  protected readonly sesionExpirada = signal(
    this.ruta.snapshot.queryParamMap.get("sesionExpirada") === "true"
  );

  protected readonly formulario = this.fb.nonNullable.group({
    email: ["", [Validators.required, Validators.email]],
    password: ["", [Validators.required]]
  });

  protected alternarPassword(): void {
    this.verPassword.update(valor => !valor);
  }

  protected esInvalido(control: "email" | "password"): boolean {
    const campo = this.formulario.controls[control];
    return campo.invalid && (campo.dirty || campo.touched);
  }

  protected enviar(): void {
    this.errorGeneral.set(null);
    this.sesionExpirada.set(false);

    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.auth.login(this.formulario.getRawValue()).subscribe({
      next: respuesta => {
        const redirigir = this.ruta.snapshot.queryParamMap.get("redirigir");
        this.router.navigateByUrl(redirigir ?? RUTA_INICIO_POR_ROL[respuesta.usuario.rol]);
      },
      error: (error: ApiError) => this.errorGeneral.set(error.mensaje)
    });
  }
}
