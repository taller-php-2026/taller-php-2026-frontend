import { inject } from '@angular/core';
import { Router, Routes } from '@angular/router';
import { AuthService } from './services/auth.service';
import { bookingStep2Guard, bookingStep3Guard } from './guards/booking-guard';

const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  return authService.isAuthenticated() ? true : router.createUrlTree(['/login']);
};

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'auth/callback',
    loadComponent: () =>
      import('./pages/auth-callback/auth-callback.component').then(
        (m) => m.AuthCallbackComponent,
      ),
  },
  {
    path: 'auth/google/callback',
    loadComponent: () =>
      import('./pages/auth-callback/auth-callback.component').then(
        (m) => m.AuthCallbackComponent,
      ),
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
        path: 'anadir-paquete',
        loadComponent: () =>
          import('./pages/anadir-paquete/anadir-paquete').then((m) => m.AnadirPaqueteComponent),
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
        path: 'crear-ciclo-agenda',
        loadComponent: () =>
          import('./pages/crear-ciclo-agenda/crear-ciclo-agenda').then((m) => m.CrearCicloAgenda),
      },
      {
        path: 'editar-ciclo-agenda',
        loadComponent: () =>
          import('./pages/editar-ciclo-agenda/editar-ciclo-agenda').then(
            (m) => m.EditarCicloAgenda,
          ),
      },
      {
        path: 'configurar-ciclos',
        loadComponent: () =>
          import('./pages/configurar-ciclos/configurar-ciclos').then(
            (m) => m.ConfigurarCiclosComponent,
          ),
      },
      {
        path: 'videollamada',
        loadComponent: () =>
          import('./pages/videollamada/videollamada').then((m) => m.Videollamada),
      },
      {
        path: 'pre-videollamada',
        loadComponent: () =>
          import('./pages/pre-videollamada/pre-videollamada').then((m) => m.PreVideollamada),
      },
      {
        path: 'reservas',
        loadComponent: () => import('./pages/reservas/reservas').then((m) => m.Reservas),
      },
      {
        path: 'servicio/:id/seleccionar-profesional',
        loadComponent: () =>
          import('@pages/select-professional/select-professional.component').then(
            (m) => m.SelectProfessional,
          ),
      },
      {
        path: 'servicio/:id/seleccionar-horario',
        loadComponent: () =>
          import('@pages/select-time-date/select-time-date.component').then(
            (m) => m.SelectTimeDateComponent,
          ),
        canActivate: [bookingStep2Guard],
      },
      {
        path: 'servicio/:id/pago',
        loadComponent: () =>
          import('./pages/pago/pago.component').then((m) => m.PagoSeguroComponent),
        canActivate: [bookingStep3Guard],
      },
      {
        path: 'panel-administrador',
        loadComponent: () =>
          import('./pages/panel-administrador/panel-administrador.component').then(
            (m) => m.PanelAdministradorComponent,
          ),
      },
    ],
  },

  {
    path: '**',
    loadComponent: () =>
      import('./pages/not-found/not-found.component').then((m) => m.NotFoundComponent),
  },
];
