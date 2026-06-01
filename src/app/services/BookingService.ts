import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class BookingService {
  companyId: string | null = null;
  serviceId: string | null = null;
  professionalId: string | null = null;

  getCompanyId(): string | null {
    return this.companyId;
  }

  getServiceId(): string | null {
    return this.serviceId;
  }

  getProfessionalId(): string | null {
    return this.professionalId;
  }
}
