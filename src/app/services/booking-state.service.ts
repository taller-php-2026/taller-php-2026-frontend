import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class BookingStateService {
  serviceId: number | null = null;
  professionalId: number | null = null;
  selectedDate: Date | null = null;
  selectedTime: string | null = null;
}
