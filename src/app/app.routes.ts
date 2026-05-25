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
    path: '',
    loadChildren: () => import('@pages/home/home.routes').then((m) => m.HOME_ROUTES),
    canActivate: [authGuard],
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
    path: 'registro',
    loadComponent: () => import('./pages/registro/registro.component').then((m) => m.RegistroComponent),
  },

  {
    path: '**',
    redirectTo: 'login',
  },
];
