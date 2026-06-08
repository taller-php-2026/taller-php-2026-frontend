import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { BookingStateService } from 'app/services/booking-state.service';

export const bookingStep2Guard: CanActivateFn = () => {
  const state = inject(BookingStateService);
  const router = inject(Router);

  if (!state.professionalId) {
    router.navigate(['/']);
    return false;
  }
  return true;
};

export const bookingStep3Guard: CanActivateFn = () => {
  const state = inject(BookingStateService);
  const router = inject(Router);

  if (!state.createdReserva) {
    router.navigate(['/']);
    return false;
  }
  return true;
};
