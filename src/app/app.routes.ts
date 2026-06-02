import { inject } from '@angular/core';
import { Router, Routes } from '@angular/router';
import { AuthService } from './services/auth.service';

const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  return authService.isAuthenticated() ? true : router.createUrlTree(['/login']);
};

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then((m) => m.LoginComponent),
  },
  {
    path: 'elegir-tipo',
    loadComponent: () =>
      import('./pages/elegir-tipo/elegir-tipo.component').then((m) => m.ElegirTipoComponent),
  },
  {
    path: 'registro',
    loadComponent: () =>
      import('./pages/registro/registro.component').then((m) => m.RegistroComponent),
  },

  {
    path: '',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/home/home.component').then((m) => m.HomeComponent),
      },
      {
        path: 'configuracion-cliente',
        loadComponent: () =>
          import('./pages/configuracion-cliente/configuracion-cliente.component').then(
            (m) => m.ConfiguracionClienteComponent,
          ),
      },
      {
        path: 'anadir-servicio',
        loadComponent: () =>
          import('./pages/anadir-servicio/anadir-servicio.component').then(
            (m) => m.AnadirServicioComponent,
          ),
      },
      {
        path: 'editar-servicio',
        loadComponent: () =>
          import('./pages/editar-servicio/editar-servicio.component').then(
            (m) => m.EditarServicioComponent,
          ),
      },
      {
        path: 'configuracion-negocio',
        loadComponent: () =>
          import('./pages/configuracion-negocio/configuracion-negocio.component').then(
            (m) => m.ConfiguracionNegocioComponent,
          ),
      },
      {
        path: 'configurar-servicios',
        loadComponent: () =>
          import('./pages/configurar-servicios/configurar-servicios.component').then(
            (m) => m.ConfigurarServiciosComponent,
          ),
      },
      {
        path: 'pago-seguro',
        loadComponent: () =>
          import('./pages/pago-seguro/pago-seguro.component').then((m) => m.PagoSeguroComponent),
      },
      {
        path: 'empresa/:id/seleccionar-servicio',
        loadComponent: () =>
          import('@pages/select-service/select-service.component').then((m) => m.SelectService),
      },
      {
        path: 'empresa/:id/seleccionar-profesional',
        loadComponent: () =>
          import('@pages/select-professional/select-professional.component').then(
            (m) => m.SelectProfessional,
          ),
      },
      {
        path: '**',
        loadComponent: () =>
          import('./pages/not-found/not-found.component').then((m) => m.NotFoundComponent),
      },
    ],
  },

  {
    path: '**',
    redirectTo: 'login',
  },
];

