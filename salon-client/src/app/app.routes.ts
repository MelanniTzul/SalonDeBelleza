import { Routes } from "@angular/router";

import { authGuard } from "./core/guards/auth.guard";
import { invitadoGuard } from "./core/guards/invitado.guard";
import { rolGuard } from "./core/guards/rol.guard";
import { PublicLayout } from "./layouts/public-layout/public-layout";

export const routes: Routes = [
  // Sitio público
  {
    path: "",
    component: PublicLayout,
    children: [
      {
        path: "",
        title: "Salón de Belleza Familiar",
        loadComponent: () => import("./features/inicio/pages/inicio-page").then(m => m.InicioPage)
      }
    ]
  },

  // Autenticación (sin layout: ocupan la pantalla completa)
  {
    path: "login",
    title: "Iniciar sesión — Salón de Belleza Familiar",
    canActivate: [invitadoGuard],
    loadComponent: () => import("./features/auth/pages/login-page").then(m => m.LoginPage)
  },
  {
    path: "registro",
    title: "Crear cuenta — Salón de Belleza Familiar",
    canActivate: [invitadoGuard],
    loadComponent: () => import("./features/auth/pages/registro-page").then(m => m.RegistroPage)
  },

  // Panel del cliente
  {
    path: "mi-cuenta",
    canActivate: [authGuard, rolGuard("CLIENTE", "ADMINISTRADOR")],
    loadComponent: () => import("./layouts/panel-layout/panel-layout").then(m => m.PanelLayout),
    children: [
      {
        path: "",
        title: "Mis citas — Salón de Belleza Familiar",
        loadComponent: () => import("./features/reservas/pages/mis-citas-page").then(m => m.MisCitasPage)
      }
    ]
  },

  // Panel de la estilista
  {
    path: "estilista",
    canActivate: [authGuard, rolGuard("ESTILISTA", "ADMINISTRADOR")],
    loadComponent: () => import("./layouts/panel-layout/panel-layout").then(m => m.PanelLayout),
    children: [
      {
        path: "",
        title: "Mi agenda — Salón de Belleza Familiar",
        loadComponent: () => import("./features/agenda/pages/agenda-estilista-page").then(m => m.AgendaEstilistaPage)
      }
    ]
  },

  // Panel del administrador
  {
    path: "admin",
    canActivate: [authGuard, rolGuard("ADMINISTRADOR")],
    loadComponent: () => import("./layouts/admin-layout/admin-layout").then(m => m.AdminLayout),
    children: [
      {
        path: "",
        title: "Panel — Salón de Belleza Familiar",
        loadComponent: () =>
          import("./features/reportes/pages/admin-dashboard-page").then(m => m.AdminDashboardPage)
      }
    ]
  },

  { path: "**", redirectTo: "" }
];
