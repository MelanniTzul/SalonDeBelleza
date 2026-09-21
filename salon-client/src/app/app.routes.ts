import { Routes } from "@angular/router";
import { PublicLayout } from "./layouts/public-layout/public-layout";

export const routes: Routes = [
  {
    path: "",
    component: PublicLayout,
    children: [
      {
        path: "",
        loadComponent: () => import("./features/inicio/pages/inicio-page").then(m => m.InicioPage)
      },
      {
        path: "servicios",
        loadComponent: () => import("./features/catalogo/pages/servicios-page").then(m => m.ServiciosPage)
      },
      {
        path: "servicios/:id",
        loadComponent: () => import("./features/catalogo/pages/servicio-detalle-page").then(m => m.ServicioDetallePage)
      },
      {
        path: "productos",
        loadComponent: () => import("./features/catalogo/pages/productos-page").then(m => m.ProductosPage)
      },
      {
        path: "productos/:id",
        loadComponent: () => import("./features/catalogo/pages/producto-detalle-page").then(m => m.ProductoDetallePage)
      }
    ]
  },
  { path: "**", redirectTo: "" }
];
