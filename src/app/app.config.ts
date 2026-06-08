import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './interceptors/auth.interceptor';
import { provideIcons } from '@ng-icons/core';
import {
  heroCalendarDays,
  heroMagnifyingGlass,
  heroMapPin,
  heroClock,
  heroCurrencyDollar,
} from '@ng-icons/heroicons/outline';
import { heroStarSolid } from '@ng-icons/heroicons/solid';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideIcons({
      heroCalendarDays,
      heroMagnifyingGlass,
      heroStarSolid,
      heroMapPin,
      heroClock,
      heroCurrencyDollar,
    }),
  ],
};
