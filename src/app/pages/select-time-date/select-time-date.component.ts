import { ChangeDetectorRef, Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Layout } from '@shared/layout/layout.component';
import { StepsComponent } from '@components/steps/steps.component';
import { Calendar } from './components/calendar/calendar.component';
import { ScheduleService } from 'app/services/schedule.service';
import { BookingStateService } from 'app/services/booking-state.service';
import { ReservaService } from 'app/services/reserva.service';
import { Slot } from 'app/models/schedule.model';
import { NgClass } from '@angular/common';
import { Service } from 'app/models/service.model';
import { ServicesService } from 'app/services/services.service';
import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 'app-select-time-date',
  templateUrl: './select-time-date.component.html',
  imports: [Layout, StepsComponent, Calendar, NgClass, NgIcon],
})
export class SelectTimeDateComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private scheduleService = inject(ScheduleService);
  private serviceService = inject(ServicesService);
  private reservaService = inject(ReservaService);
  private bookingState = inject(BookingStateService);
  private cdr = inject(ChangeDetectorRef);

  serviceId: string | null = null;
  service: Service | null = null;
  slots: Slot[] = [];
  selectedDate: Date | null = null;
  selectedSlot: Slot | null = null;

  loadingReserva = signal(false);
  errorReserva = signal('');

  onDateSelected(date: Date) {
    this.selectedDate = date;
    this.errorReserva.set('');

    const profId = this.bookingState.professionalId;
    const svcId = this.bookingState.serviceId;

    if (!profId || !svcId) {
      this.router.navigate(['/']);
      return;
    }

    const fecha = date.toISOString().split('T')[0];
    this.scheduleService.getSlots(profId, fecha, svcId).subscribe((response) => {
      this.slots = response.data.slots_disponibles;
      this.cdr.detectChanges();
    });
  }

  selectSlot(slot: Slot) {
    this.selectedSlot = slot;
    this.bookingState.setSelectedSlot(slot);
    this.bookingState.selectedTime = slot.horaInicio;
    this.bookingState.selectedDate = this.selectedDate;
    this.errorReserva.set('');
  }

  goToNextStep() {
    if (!this.selectedSlot || !this.selectedDate) return;

    const profId = this.bookingState.professionalId;
    const svcId = this.bookingState.serviceId;

    if (!profId || !svcId) {
      this.errorReserva.set('Faltan datos del profesional o servicio. Volvé al inicio.');
      return;
    }

    if (!this.selectedSlot.horaInicio) {
      this.errorReserva.set('No se pudo determinar el horario seleccionado.');
      return;
    }

    this.loadingReserva.set(true);
    this.errorReserva.set('');

    const fecha = this.selectedDate.toISOString().split('T')[0]; // YYYY-MM-DD

    const payload = {
      idServicio: svcId,
      fecha,
      horaInicio: this.selectedSlot.horaInicio,
    };

    this.reservaService.crearReserva(profId, payload).subscribe({
      next: (res) => {
        const reserva = res.data ?? (res as unknown as import('app/models/reserva.model').ReservaCreada);
        this.bookingState.setCreatedReserva(reserva);
        this.loadingReserva.set(false);
        this.router.navigate([`/servicio/${this.serviceId}/pago`]);
      },
      error: (err) => {
        this.loadingReserva.set(false);
        if (err.error?.message) {
          this.errorReserva.set(err.error.message);
        } else if (err.status === 422 && err.error?.errors) {
          const msgs = Object.values(err.error.errors as Record<string, string[]>)
            .flat()
            .join(' ');
          this.errorReserva.set(msgs);
        } else {
          this.errorReserva.set('No se pudo crear la reserva. Intenta con otro horario.');
        }
      },
    });
  }

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      this.serviceId = params.get('id');

      this.serviceService.getServiceById(this.serviceId!).subscribe((response) => {
        this.service = response.data;
        this.bookingState.setSelectedService(response.data);
        this.cdr.detectChanges();
      });
    });
  }
}

