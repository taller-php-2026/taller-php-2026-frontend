import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class BookingService {
  companyId: string | null = null;
  serviceId: string | null = null;
  professionalId: string | null = null;
}
