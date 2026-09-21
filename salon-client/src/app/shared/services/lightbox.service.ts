import { Injectable, computed, signal } from "@angular/core";

export interface ImagenAmpliada {
  src: string;
  alt: string;
  titulo?: string;
  // Texto que acompaña a la imagen (un párrafo por elemento): con él, el visor pone la foto a la izquierda y el texto a la derecha
  descripcion?: readonly string[];
}

@Injectable({ providedIn: "root" })
export class LightboxService {
  private readonly _imagenes = signal<readonly ImagenAmpliada[]>([]);
  private readonly _indice = signal(0);
  private readonly _abierto = signal(false);

  readonly abierto = this._abierto.asReadonly();
  readonly indice = this._indice.asReadonly();
  readonly total = computed(() => this._imagenes().length);
  readonly actual = computed(() => this._imagenes()[this._indice()]);
  readonly hayVarias = computed(() => this.total() > 1);

  abrir(imagenes: readonly ImagenAmpliada[], indice = 0): void {
    if (!imagenes.length) return;
    this._imagenes.set(imagenes);
    this._indice.set(Math.min(Math.max(indice, 0), imagenes.length - 1));
    this._abierto.set(true);
  }

  cerrar(): void {
    this._abierto.set(false);
  }

  siguiente(): void {
    const total = this.total();
    if (total > 1) this._indice.update(i => (i + 1) % total);
  }

  anterior(): void {
    const total = this.total();
    if (total > 1) this._indice.update(i => (i - 1 + total) % total);
  }
}
