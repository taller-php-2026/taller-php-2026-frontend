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
];
