import { Injectable } from '@angular/core';
import { Service } from '../models/service.model';
import { Professional } from '../models/professional.model';
import { Slot } from '../models/schedule.model';
import { ReservaCreada } from '../models/reserva.model';
import { PaqueteComprado } from 'app/models/paquete.model';

@Injectable({ providedIn: 'root' })
export class BookingStateService {
  serviceId: number | null = null;
  professionalId: number | null = null;
  selectedDate: Date | null = null;
  selectedTime: string | null = null;

  // Objetos completos para el resumen de pago
  selectedService: Service | null = null;
  selectedProfessional: Professional | null = null;
  selectedSlot: Slot | null = null;
  selectedPaqueteComprado: PaqueteComprado | null = null;
  createdReserva: ReservaCreada | null = null;

  reset() {
    this.serviceId = null;
    this.professionalId = null;
    this.selectedDate = null;
    this.selectedTime = null;
    this.selectedService = null;
    this.selectedProfessional = null;
    this.selectedSlot = null;
    this.selectedPaqueteComprado = null;
    this.createdReserva = null;
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

  setSelectedService(service: Service) {
    this.selectedService = service;
  }

  setSelectedProfessional(professional: Professional) {
    this.selectedProfessional = professional;
  }

  setSelectedSlot(slot: Slot) {
    this.selectedSlot = slot;
  }

  setSelectedPaqueteComprado(paquete: PaqueteComprado | null) {
    this.selectedPaqueteComprado = paquete;
  }

  setCreatedReserva(reserva: ReservaCreada) {
    this.createdReserva = reserva;
  }
}

