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
      }
    ]
  },
  { path: "**", redirectTo: "" }
];
