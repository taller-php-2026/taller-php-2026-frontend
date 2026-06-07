import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class BookingStateService {
  serviceId: number | null = null;
  professionalId: number | null = null;
  selectedDate: Date | null = null;
  selectedTime: string | null = null;

  reset() {
    this.serviceId = null;
    this.professionalId = null;
    this.selectedDate = null;
    this.selectedTime = null;
  }

  setServiceId(id: number) {
    this.serviceId = id;
  }

  setProfessionalId(id: number) {
    this.professionalId = id;
  }

  setSelectedDate(date: Date) {
    this.selectedDate = date;
  }

  setSelectedTime(time: string) {
    this.selectedTime = time;
  }
}
