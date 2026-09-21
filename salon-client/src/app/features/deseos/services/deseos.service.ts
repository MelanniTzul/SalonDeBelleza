import { HttpClient } from "@angular/common/http";
import { Injectable, computed, effect, inject, signal } from "@angular/core";
import { Observable, of, switchMap, tap } from "rxjs";

import { API_URL } from "../../../core/config/api.config";
import { environment } from "../../../../environments/environment";
import { AuthService } from "../../../core/services/auth.service";
import { Producto, Servicio } from "../../catalogo/models/catalogo.models";
import { ProductoDto, ServicioDto, aProducto, aServicio } from "../../catalogo/services/catalogo.api";

export type TipoDeseo = "servicio" | "producto";

interface ListaDeseosDto {
  servicios: ServicioDto[];
  productos: ProductoDto[];
}

// Lista de deseos del cliente en memoria. Se carga una vez por sesion y los corazones
// de todo el sitio leen de aqui. Solo aplica a clientes.
@Injectable({ providedIn: "root" })
export class DeseosService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly apiUrl = inject(API_URL);
  private readonly base = `${environment.apiUrl}/cliente/deseos`;

  private readonly _servicios = signal<readonly Servicio[]>([]);
  private readonly _productos = signal<readonly Producto[]>([]);
  private cargadoPara: string | null = null;

  readonly servicios = this._servicios.asReadonly();
  readonly productos = this._productos.asReadonly();
  readonly estado = signal<"inactivo" | "cargando" | "listo" | "error">("inactivo");

  readonly puedeUsar = computed(() => this.auth.autenticado() && this.auth.rol() === "CLIENTE");
  readonly total = computed(() => this._servicios().length + this._productos().length);

  private readonly slugsServicios = computed(() => new Set(this._servicios().map(s => s.id)));
  private readonly slugsProductos = computed(() => new Set(this._productos().map(p => p.id)));

  constructor() {
    // Al cerrar sesion o cambiar de usuario, la lista anterior no debe quedar en memoria.
    effect(() => {
      const email = this.puedeUsar() ? this.auth.usuario()?.email ?? null : null;
      if (email !== this.cargadoPara) {
        this.limpiar();
      }
    });
  }

  tiene(tipo: TipoDeseo, slug: string): boolean {
    return tipo === "servicio" ? this.slugsServicios().has(slug) : this.slugsProductos().has(slug);
  }

  cargar(forzar = false): void {
    if (!this.puedeUsar()) {
      this.limpiar();
      return;
    }
    const email = this.auth.usuario()?.email ?? null;
    if (!forzar && this.cargadoPara === email) {
      return;
    }
    this.estado.set("cargando");
    this.http.get<ListaDeseosDto>(this.base).subscribe({
      next: dto => {
        this._servicios.set(dto.servicios.map(s => aServicio(s, this.apiUrl)));
        this._productos.set(dto.productos.map(p => aProducto(p, this.apiUrl)));
        this.cargadoPara = email;
        this.estado.set("listo");
      },
      error: () => this.estado.set("error")
    });
  }

  // Devuelve el estado nuevo: true si quedo guardado, false si se quito.
  alternar(tipo: TipoDeseo, slug: string): Observable<boolean> {
    const ruta = `${this.base}/${tipo === "servicio" ? "servicios" : "productos"}/${slug}`;

    if (this.tiene(tipo, slug)) {
      // Se quita de la lista al instante; si la API falla se vuelve a cargar para no mentir.
      const previosS = this._servicios();
      const previosP = this._productos();
      if (tipo === "servicio") {
        this._servicios.update(lista => lista.filter(s => s.id !== slug));
      } else {
        this._productos.update(lista => lista.filter(p => p.id !== slug));
      }
      return this.http.delete<void>(ruta).pipe(
        tap({ error: () => { this._servicios.set(previosS); this._productos.set(previosP); } }),
        switchMap(() => of(false))
      );
    }

    // Para agregar hace falta el item completo (la tarjeta lo necesita), asi que se recarga.
    return this.http.put<void>(ruta, {}).pipe(
      tap(() => this.cargar(true)),
      switchMap(() => of(true))
    );
  }

  private limpiar(): void {
    this._servicios.set([]);
    this._productos.set([]);
    this.cargadoPara = null;
    this.estado.set("inactivo");
  }
}
