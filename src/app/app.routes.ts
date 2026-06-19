import { inject } from '@angular/core';
import { Router, Routes } from '@angular/router';
import { AuthService } from './services/auth.service';
import { bookingStep2Guard, bookingStep3Guard } from './guards/booking-guard';

const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  return authService.isAuthenticated() ? true : router.createUrlTree(['/login']);
};

const professionalGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  return authService.userType() === 'profesional' ? true : router.createUrlTree(['/']);
};

const adminGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  // Un usuario administrador tendrá el rol 'administrador' cargado en roles
  const user = authService.currentUser();
  const isAdmin = user?.roles?.includes('administrador') || false;
  return isAdmin ? true : router.createUrlTree(['/']);
};

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'auth/callback',
    loadComponent: () =>
      import('./pages/auth-callback/auth-callback.component').then((m) => m.AuthCallbackComponent),
  },
  {
    path: 'auth/google/callback',
    loadComponent: () =>
      import('./pages/auth-callback/auth-callback.component').then((m) => m.AuthCallbackComponent),
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
        canActivate: [professionalGuard],
        loadComponent: () =>
          import('./pages/anadir-servicio/anadir-servicio.component').then(
            (m) => m.AnadirServicioComponent,
          ),
      },
      {
        path: 'anadir-paquete',
        canActivate: [professionalGuard],
        loadComponent: () =>
          import('./pages/anadir-paquete/anadir-paquete').then((m) => m.AnadirPaqueteComponent),
      },
      {
        path: 'editar-servicio',
        canActivate: [professionalGuard],
        loadComponent: () =>
          import('./pages/editar-servicio/editar-servicio.component').then(
            (m) => m.EditarServicioComponent,
          ),
      },
      {
        path: 'configuracion-negocio',
        canActivate: [professionalGuard],
        loadComponent: () =>
          import('./pages/configuracion-negocio/configuracion-negocio.component').then(
            (m) => m.ConfiguracionNegocioComponent,
          ),
      },
      {
        path: 'configurar-servicios',
        canActivate: [professionalGuard],
        loadComponent: () =>
          import('./pages/configurar-servicios/configurar-servicios.component').then(
            (m) => m.ConfigurarServiciosComponent,
          ),
      },
      {
        path: 'crear-ciclo-agenda',
        canActivate: [professionalGuard],
        loadComponent: () =>
          import('./pages/crear-ciclo-agenda/crear-ciclo-agenda').then((m) => m.CrearCicloAgenda),
      },
      {
        path: 'editar-ciclo-agenda',
        canActivate: [professionalGuard],
        loadComponent: () =>
          import('./pages/editar-ciclo-agenda/editar-ciclo-agenda').then(
            (m) => m.EditarCicloAgenda,
          ),
      },
      {
        path: 'configurar-ciclos',
        canActivate: [professionalGuard],
        loadComponent: () =>
          import('./pages/configurar-ciclos/configurar-ciclos').then(
            (m) => m.ConfigurarCiclosComponent,
          ),
      },
      {
        path: 'gestionar-excepciones',
        canActivate: [professionalGuard],
        loadComponent: () =>
          import('./pages/gestionar-excepciones/gestionar-excepciones').then(
            (m) => m.GestionarExcepcionesComponent,
          ),
      },
      {
        path: 'videollamada',
        loadComponent: () =>
          import('./pages/videollamada/videollamada').then((m) => m.Videollamada),
      },
      {
        path: 'videollamada/:id',
        loadComponent: () =>
          import('./pages/videollamada/videollamada').then((m) => m.Videollamada),
      },
      {
        path: 'pre-videollamada',
        loadComponent: () =>
          import('./pages/pre-videollamada/pre-videollamada').then((m) => m.PreVideollamada),
      },
      {
        path: 'pre-videollamada/:id',
        loadComponent: () =>
          import('./pages/pre-videollamada/pre-videollamada').then((m) => m.PreVideollamada),
      },
      {
        path: 'reservas',
        loadComponent: () => import('./pages/reservas/reservas').then((m) => m.Reservas),
      },
      {
        path: 'mis-paquetes',
        loadComponent: () => import('./pages/mis-paquetes/mis-paquetes').then((m) => m.MisPaquetes),
      },
      {
        path: 'paquete/:id',
        loadComponent: () =>
          import('./pages/paquete-detalle/paquete-detalle').then((m) => m.PaqueteDetalle),
      },
      {
        path: 'reservas/:id/confirmacion',
        loadComponent: () =>
          import('./pages/reserva-confirmacion/reserva-confirmacion.component').then(
            (m) => m.ReservaConfirmacionComponent,
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
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./pages/panel-administrador/panel-administrador.component').then(
            (m) => m.PanelAdministradorComponent,
          ),
      },
      {
        path: 'reservas/:id/calificar',
        loadComponent: () =>
          import('./pages/calificar-profesional/calificar-profesional').then(
            (m) => m.CalificarProfesional,
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
