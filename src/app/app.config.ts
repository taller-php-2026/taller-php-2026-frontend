import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideIcons } from '@ng-icons/core';
import {
  heroCalendarDays,
  heroMagnifyingGlass,
  heroMapPin,
  heroClock,
} from '@ng-icons/heroicons/outline';
import { heroStarSolid } from '@ng-icons/heroicons/solid';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(),
    provideIcons({
      heroCalendarDays,
      heroMagnifyingGlass,
      heroStarSolid,
      heroMapPin,
      heroClock,
    }),
  ],
};

