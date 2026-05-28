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
    path: 'empresa/:id/seleccionar-profesional',
    loadChildren: () =>
      import('@pages/select-professional/select-professional.routes').then(
        (m) => m.PROFESIONAL_ROUTES,
      ),
  },
];
