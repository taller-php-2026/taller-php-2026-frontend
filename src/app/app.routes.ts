import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('@pages/home/home.routes').then((m) => m.HOME_ROUTES),
  },
  {
    path: 'empresa/:id/seleccionar-servicio',
    loadChildren: () =>
      import('@pages/select-service/select-service.routes').then((m) => m.SERVICIO_ROUTES),
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then((m) => m.LoginComponent),
  },
  {
    path: 'elegir-tipo',
    loadComponent: () => import('./pages/elegir-tipo/elegir-tipo.component').then((m) => m.ElegirTipoComponent),
  },
  {
    path: 'home-cliente',
    loadComponent: () => import('./pages/home-cliente/home-cliente.component').then((m) => m.HomeClienteComponent),
  },
  {
    path: 'home-profesional',
    loadComponent: () => import('./pages/home-profesional/home-profesional.component').then((m) => m.HomeProfesionalComponent),
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];
