import { HttpClient } from "@angular/common/http";
import { Injectable, computed, inject, signal } from "@angular/core";
import { forkJoin } from "rxjs";
import { API_URL } from "../../../core/config/api.config";
import { Categoria, GrupoCorteId, GrupoCortes, Producto, Servicio } from "../models/catalogo.models";
import { CategoriaDto, GrupoCortesDto, ProductoDto, ServicioDto, aCategoria, aGrupoCortes, aProducto, aServicio } from "./catalogo.api";

export type EstadoCarga = "inactivo" | "cargando" | "listo" | "error";

// Catálogo del salón: servicios, productos, categorías y cortes. Todo viene de la API y se guarda en señales,
// así las pantallas se actualizan solas cuando llegan los datos. Se carga una sola vez y se comparte.
@Injectable({ providedIn: "root" })
export class CatalogoService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_URL);

  private readonly _servicios = signal<readonly Servicio[]>([]);
  private readonly _productos = signal<readonly Producto[]>([]);
  private readonly _categoriasServicio = signal<readonly Categoria[]>([]);
  private readonly _categoriasProducto = signal<readonly Categoria[]>([]);
  private readonly _gruposCortes = signal<readonly GrupoCortes[]>([]);

  readonly servicios = this._servicios.asReadonly();
  readonly productos = this._productos.asReadonly();
  readonly categoriasServicio = this._categoriasServicio.asReadonly();
  readonly categoriasProducto = this._categoriasProducto.asReadonly();
  readonly gruposCortes = this._gruposCortes.asReadonly();

  // Servicios, productos y categorías se cargan juntos; los cortes aparte, porque solo algunas pantallas los usan
  readonly estado = signal<EstadoCarga>("inactivo");
  readonly estadoCortes = signal<EstadoCarga>("inactivo");
  readonly listo = computed(() => this.estado() === "listo");
  readonly cortesListos = computed(() => this.estadoCortes() === "listo");

  /** Pide servicios, productos y categorías. Si ya se cargaron (o están en camino) no repite la petición. */
  cargar(): void {
    if (this.estado() === "cargando" || this.estado() === "listo") return;
    this.estado.set("cargando");
    forkJoin({
      servicios: this.http.get<ServicioDto[]>(`${this.apiUrl}/api/servicios`),
      productos: this.http.get<ProductoDto[]>(`${this.apiUrl}/api/productos`),
      categoriasServicio: this.http.get<CategoriaDto[]>(`${this.apiUrl}/api/categorias`, { params: { tipo: "SERVICIO" } }),
      categoriasProducto: this.http.get<CategoriaDto[]>(`${this.apiUrl}/api/categorias`, { params: { tipo: "PRODUCTO" } })
    }).subscribe({
      next: r => {
        this._servicios.set(r.servicios.map(s => aServicio(s, this.apiUrl)));
        this._productos.set(r.productos.map(p => aProducto(p, this.apiUrl)));
        this._categoriasServicio.set(r.categoriasServicio.map(aCategoria));
        this._categoriasProducto.set(r.categoriasProducto.map(aCategoria));
        this.estado.set("listo");
      },
      error: () => this.estado.set("error")
    });
  }

  /** Pide el catálogo de cortes (mujeres, hombres, niños y abuelos). */
  cargarCortes(): void {
    if (this.estadoCortes() === "cargando" || this.estadoCortes() === "listo") return;
    this.estadoCortes.set("cargando");
    this.http.get<GrupoCortesDto[]>(`${this.apiUrl}/api/cortes`).subscribe({
      next: grupos => {
        this._gruposCortes.set(grupos.map(g => aGrupoCortes(g, this.apiUrl)));
        this.estadoCortes.set("listo");
      },
      error: () => this.estadoCortes.set("error")
    });
  }

  /** Vuelve a intentar lo que haya fallado. */
  reintentar(): void {
    if (this.estado() === "error") this.cargar();
    if (this.estadoCortes() === "error") this.cargarCortes();
  }

  servicioPorId(id: string): Servicio | undefined {
    return this._servicios().find(s => s.id === id);
  }

  serviciosPorId(ids: readonly string[]): Servicio[] {
    return ids.map(id => this.servicioPorId(id)).filter((s): s is Servicio => !!s);
  }

  // Otros servicios para "También te puede interesar": primero los de la misma categoría
  serviciosRelacionados(id: string, cantidad: number): Servicio[] {
    const actual = this.servicioPorId(id);
    const otros = this._servicios().filter(s => s.id !== id);
    return [...otros.filter(s => s.categoria === actual?.categoria), ...otros.filter(s => s.categoria !== actual?.categoria)].slice(0, cantidad);
  }

  productoPorId(id: string): Producto | undefined {
    return this._productos().find(p => p.id === id);
  }

  productosPorId(ids: readonly string[]): Producto[] {
    return ids.map(id => this.productoPorId(id)).filter((p): p is Producto => !!p);
  }

  productosRelacionados(id: string, cantidad: number): Producto[] {
    const actual = this.productoPorId(id);
    const otros = this._productos().filter(p => p.id !== id);
    return [...otros.filter(p => p.categoria === actual?.categoria), ...otros.filter(p => p.categoria !== actual?.categoria)].slice(0, cantidad);
  }

  cortesDeGrupo(grupo: GrupoCorteId): GrupoCortes | undefined {
    return this._gruposCortes().find(g => g.id === grupo);
  }
}
