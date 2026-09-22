import { ChangeDetectionStrategy, Component, ElementRef, computed, inject, signal, viewChild } from "@angular/core";
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from "@angular/forms";

import { ApiError } from "../../../core/models/auth.models";
import { AuthService } from "../../../core/services/auth.service";
import { Avatar } from "../../../shared/components/avatar/avatar";
import { PerfilService } from "../services/perfil.service";

const TAMANIO_MAXIMO_FOTO = 5 * 1024 * 1024;
const FORMATOS_FOTO = ["image/jpeg", "image/png", "image/webp"];

const passwordsCoinciden = (grupo: AbstractControl): ValidationErrors | null => {
  const nueva = grupo.get("passwordNueva")?.value;
  const confirmacion = grupo.get("confirmacion")?.value;
  return nueva && confirmacion && nueva !== confirmacion ? { noCoinciden: true } : null;
};

@Component({
  selector: "app-perfil-page",
  imports: [ReactiveFormsModule, Avatar],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mx-auto w-full max-w-[760px] px-6 py-8 md:px-8">
      <header class="mb-7">
        <h1 class="font-serif text-[22px] font-semibold">Mi perfil</h1>
        <p class="mt-1 text-[13px] text-muted">Tu foto, tus datos y tu contrasena.</p>
      </header>

      @if (aviso(); as mensaje) {
        <div role="status" class="mb-5 rounded-lg border border-sage/40 bg-[#F2F7F3] px-4 py-3 text-[13px] text-ink">
          {{ mensaje }}
        </div>
      }

      <!-- Foto -->
      <section aria-labelledby="titulo-foto" class="mb-6 rounded-[10px] border border-line p-5">
        <h2 id="titulo-foto" class="mb-4 font-serif text-[17px] font-semibold">Foto de perfil</h2>

        @if (errorFoto(); as mensaje) {
          <div role="alert" class="mb-4 rounded-lg border border-wine/30 bg-blush px-4 py-3 text-[13px] text-wine-dark">
            {{ mensaje }}
          </div>
        }

        <div class="flex flex-wrap items-center gap-5">
          <div class="relative">
            <app-avatar [usuario]="auth.usuario()" [tamanio]="96" />
            @if (subiendoFoto()) {
              <span class="absolute inset-0 flex items-center justify-center rounded-full bg-white/70" aria-hidden="true">
                <i class="pi pi-spin pi-spinner text-xl text-wine"></i>
              </span>
            }
          </div>

          <div class="flex flex-col gap-2">
            <input
              #inputFoto
              type="file"
              accept="image/jpeg,image/png,image/webp"
              class="sr-only"
              aria-label="Elegir foto de perfil"
              (change)="alElegirFoto($event)" />
            <div class="flex flex-wrap gap-2">
              <button
                type="button"
                (click)="inputFoto.click()"
                [disabled]="subiendoFoto()"
                class="rounded-full bg-wine px-[18px] py-[9px] text-[13px] font-semibold text-white transition hover:bg-wine-dark focus:outline-none focus:ring-2 focus:ring-wine/40 focus:ring-offset-2 disabled:opacity-60">
                {{ auth.usuario()?.fotoUrl ? "Cambiar foto" : "Subir foto" }}
              </button>
              @if (auth.usuario()?.fotoUrl) {
                <button
                  type="button"
                  (click)="quitarFoto()"
                  [disabled]="subiendoFoto()"
                  class="rounded-full border border-line px-4 py-[9px] text-[13px] font-semibold text-ink transition hover:border-wine/40 hover:bg-ivory focus:outline-none focus:ring-2 focus:ring-wine/30 disabled:opacity-60">
                  Quitar
                </button>
              }
            </div>
            <p class="text-xs text-muted">JPG, PNG o WebP. Maximo 5 MB.</p>
          </div>
        </div>
      </section>

      <!-- Datos -->
      <section aria-labelledby="titulo-datos" class="mb-6 rounded-[10px] border border-line p-5">
        <h2 id="titulo-datos" class="mb-4 font-serif text-[17px] font-semibold">Mis datos</h2>

        @if (errorDatos(); as mensaje) {
          <div role="alert" class="mb-4 rounded-lg border border-wine/30 bg-blush px-4 py-3 text-[13px] text-wine-dark">
            {{ mensaje }}
          </div>
        }

        <form [formGroup]="formDatos" (ngSubmit)="guardarDatos()" novalidate class="flex flex-col gap-4">
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label for="p-nombre" class="mb-1.5 block text-[13px] font-semibold">Nombre</label>
              <input id="p-nombre" type="text" formControlName="nombre" autocomplete="given-name" [class]="claseCampo(invalido(formDatos, 'nombre'))" />
              @if (invalido(formDatos, "nombre")) {
                <p class="mt-1 text-xs text-wine">Escribe tu nombre.</p>
              }
            </div>
            <div>
              <label for="p-apellido" class="mb-1.5 block text-[13px] font-semibold">Apellido</label>
              <input id="p-apellido" type="text" formControlName="apellido" autocomplete="family-name" [class]="claseCampo(invalido(formDatos, 'apellido'))" />
              @if (invalido(formDatos, "apellido")) {
                <p class="mt-1 text-xs text-wine">Escribe tu apellido.</p>
              }
            </div>
          </div>

          <div>
            <label for="p-email" class="mb-1.5 block text-[13px] font-semibold">Correo electronico</label>
            <input id="p-email" type="email" [value]="auth.usuario()?.email" readonly aria-describedby="ayuda-email" [class]="claseCampo(false) + ' bg-ivory text-muted'" />
            <p id="ayuda-email" class="mt-1 text-xs text-muted">El correo es tu usuario para entrar y no se cambia desde aqui.</p>
          </div>

          <div>
            <label for="p-telefono" class="mb-1.5 block text-[13px] font-semibold">
              Telefono <span class="font-normal text-muted">(opcional)</span>
            </label>
            <input id="p-telefono" type="tel" formControlName="telefono" autocomplete="tel" placeholder="5555-0000" [class]="claseCampo(false)" />
          </div>

          @if (esEstilista()) {
            <div>
              <label for="p-especialidad" class="mb-1.5 block text-[13px] font-semibold">
                Especialidad <span class="font-normal text-muted">(opcional)</span>
              </label>
              <input id="p-especialidad" type="text" formControlName="especialidad" placeholder="Corte y color" [class]="claseCampo(false)" />
            </div>
          }

          <div class="flex justify-end">
            <button
              type="submit"
              [disabled]="guardandoDatos()"
              class="flex items-center gap-2 rounded-full bg-wine px-5 py-2.5 text-[13px] font-semibold text-white transition hover:bg-wine-dark focus:outline-none focus:ring-2 focus:ring-wine/40 disabled:opacity-60">
              @if (guardandoDatos()) {
                <i class="pi pi-spin pi-spinner" aria-hidden="true"></i>
              }
              Guardar cambios
            </button>
          </div>
        </form>
      </section>

      <!-- Contrasena -->
      <section aria-labelledby="titulo-password" class="rounded-[10px] border border-line p-5">
        <h2 id="titulo-password" class="mb-4 font-serif text-[17px] font-semibold">Cambiar contrasena</h2>

        @if (errorPassword(); as mensaje) {
          <div role="alert" class="mb-4 rounded-lg border border-wine/30 bg-blush px-4 py-3 text-[13px] text-wine-dark">
            {{ mensaje }}
          </div>
        }

        <form [formGroup]="formPassword" (ngSubmit)="guardarPassword()" novalidate class="flex flex-col gap-4">
          <div>
            <label for="p-actual" class="mb-1.5 block text-[13px] font-semibold">Contrasena actual</label>
            <input id="p-actual" type="password" formControlName="passwordActual" autocomplete="current-password" [class]="claseCampo(invalido(formPassword, 'passwordActual'))" />
            @if (invalido(formPassword, "passwordActual")) {
              <p class="mt-1 text-xs text-wine">Escribe tu contrasena actual.</p>
            }
          </div>

          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label for="p-nueva" class="mb-1.5 block text-[13px] font-semibold">Nueva contrasena</label>
              <input id="p-nueva" type="password" formControlName="passwordNueva" autocomplete="new-password" aria-describedby="ayuda-nueva" [class]="claseCampo(invalido(formPassword, 'passwordNueva'))" />
              <p id="ayuda-nueva" class="mt-1 text-xs" [class.text-muted]="!invalido(formPassword, 'passwordNueva')" [class.text-wine]="invalido(formPassword, 'passwordNueva')">
                Minimo 8 caracteres.
              </p>
            </div>
            <div>
              <label for="p-confirmacion" class="mb-1.5 block text-[13px] font-semibold">Repite la nueva</label>
              <input id="p-confirmacion" type="password" formControlName="confirmacion" autocomplete="new-password" [class]="claseCampo(errorConfirmacion())" />
              @if (errorConfirmacion()) {
                <p class="mt-1 text-xs text-wine">Las contrasenas no coinciden.</p>
              }
            </div>
          </div>

          <div class="flex justify-end">
            <button
              type="submit"
              [disabled]="guardandoPassword()"
              class="flex items-center gap-2 rounded-full border border-wine px-5 py-2.5 text-[13px] font-semibold text-wine transition hover:bg-blush focus:outline-none focus:ring-2 focus:ring-wine/30 disabled:opacity-60">
              @if (guardandoPassword()) {
                <i class="pi pi-spin pi-spinner" aria-hidden="true"></i>
              }
              Cambiar contrasena
            </button>
          </div>
        </form>
      </section>
    </div>
  `
})
export class PerfilPage {
  protected readonly auth = inject(AuthService);
  private readonly perfil = inject(PerfilService);
  private readonly fb = inject(FormBuilder);

  private readonly inputFoto = viewChild<ElementRef<HTMLInputElement>>("inputFoto");

  protected readonly aviso = signal<string | null>(null);
  protected readonly errorFoto = signal<string | null>(null);
  protected readonly errorDatos = signal<string | null>(null);
  protected readonly errorPassword = signal<string | null>(null);
  protected readonly subiendoFoto = signal(false);
  protected readonly guardandoDatos = signal(false);
  protected readonly guardandoPassword = signal(false);

  protected readonly esEstilista = computed(() => this.auth.rol() === "ESTILISTA");

  protected readonly formDatos = this.fb.nonNullable.group({
    nombre: [this.auth.usuario()?.nombre ?? "", [Validators.required, Validators.maxLength(100)]],
    apellido: [this.auth.usuario()?.apellido ?? "", [Validators.required, Validators.maxLength(100)]],
    telefono: [this.auth.usuario()?.telefono ?? "", [Validators.maxLength(20)]],
    especialidad: [this.auth.usuario()?.especialidad ?? "", [Validators.maxLength(150)]]
  });

  protected readonly formPassword = this.fb.nonNullable.group(
    {
      passwordActual: ["", [Validators.required]],
      passwordNueva: ["", [Validators.required, Validators.minLength(8), Validators.maxLength(72)]],
      confirmacion: ["", [Validators.required]]
    },
    { validators: passwordsCoinciden }
  );

  constructor() {
    // Por si lo guardado en localStorage quedo viejo (ej. editado desde otro dispositivo)
    this.perfil.obtener().subscribe({
      next: u => this.formDatos.patchValue({
        nombre: u.nombre,
        apellido: u.apellido,
        telefono: u.telefono ?? "",
        especialidad: u.especialidad ?? ""
      }),
      error: () => undefined
    });
  }

  protected claseCampo(conError: boolean): string {
    const base =
      "w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition focus:border-wine focus:ring-2 focus:ring-wine/20";
    return `${base} ${conError ? "border-wine" : "border-line"}`;
  }

  protected invalido(form: FormGroup, campo: string): boolean {
    const control = form.get(campo);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  protected errorConfirmacion(): boolean {
    const campo = this.formPassword.controls.confirmacion;
    return this.formPassword.hasError("noCoinciden") && (campo.dirty || campo.touched);
  }

  protected alElegirFoto(evento: Event): void {
    const archivo = (evento.target as HTMLInputElement).files?.[0];
    if (!archivo) {
      return;
    }
    this.errorFoto.set(null);
    this.aviso.set(null);

    // Se valida aqui para no subir 20 MB a lo tonto; el backend vuelve a validar.
    if (!FORMATOS_FOTO.includes(archivo.type)) {
      this.errorFoto.set("Solo se aceptan imagenes JPG, PNG o WebP.");
      this.limpiarInput();
      return;
    }
    if (archivo.size > TAMANIO_MAXIMO_FOTO) {
      this.errorFoto.set("La imagen supera los 5 MB.");
      this.limpiarInput();
      return;
    }

    this.subiendoFoto.set(true);
    this.perfil.subirFoto(archivo).subscribe({
      next: () => {
        this.subiendoFoto.set(false);
        this.mostrarAviso("Tu foto quedo guardada.");
        this.limpiarInput();
      },
      error: (e: ApiError) => {
        this.subiendoFoto.set(false);
        this.errorFoto.set(e.mensaje);
        this.limpiarInput();
      }
    });
  }

  protected quitarFoto(): void {
    this.errorFoto.set(null);
    this.subiendoFoto.set(true);
    this.perfil.eliminarFoto().subscribe({
      next: () => {
        this.subiendoFoto.set(false);
        this.mostrarAviso("Quitamos tu foto.");
      },
      error: (e: ApiError) => {
        this.subiendoFoto.set(false);
        this.errorFoto.set(e.mensaje);
      }
    });
  }

  protected guardarDatos(): void {
    this.errorDatos.set(null);
    if (this.formDatos.invalid) {
      this.formDatos.markAllAsTouched();
      return;
    }
    const v = this.formDatos.getRawValue();
    this.guardandoDatos.set(true);
    this.perfil
      .actualizar({
        nombre: v.nombre,
        apellido: v.apellido,
        telefono: v.telefono || null,
        especialidad: this.esEstilista() ? v.especialidad || null : null
      })
      .subscribe({
        next: () => {
          this.guardandoDatos.set(false);
          this.formDatos.markAsPristine();
          this.mostrarAviso("Tus datos quedaron guardados.");
        },
        error: (e: ApiError) => {
          this.guardandoDatos.set(false);
          this.errorDatos.set(e.mensaje);
        }
      });
  }

  protected guardarPassword(): void {
    this.errorPassword.set(null);
    if (this.formPassword.invalid) {
      this.formPassword.markAllAsTouched();
      return;
    }
    const v = this.formPassword.getRawValue();
    this.guardandoPassword.set(true);
    this.perfil.cambiarPassword(v.passwordActual, v.passwordNueva).subscribe({
      next: () => {
        this.guardandoPassword.set(false);
        this.formPassword.reset();
        this.mostrarAviso("Tu contrasena cambio. La proxima vez entra con la nueva.");
      },
      error: (e: ApiError) => {
        this.guardandoPassword.set(false);
        this.errorPassword.set(e.mensaje);
      }
    });
  }

  private limpiarInput(): void {
    const input = this.inputFoto()?.nativeElement;
    if (input) {
      input.value = "";
    }
  }

  private mostrarAviso(texto: string): void {
    this.aviso.set(texto);
    setTimeout(() => this.aviso.set(null), 5000);
  }
}
