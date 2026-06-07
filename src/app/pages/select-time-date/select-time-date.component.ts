import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Layout } from '@shared/layout/layout.component';
import { StepsComponent } from '@components/steps/steps.component';
import { Calendar } from './components/calendar/calendar.component';
import { ScheduleService } from 'app/services/schedule.service';
import { BookingStateService } from 'app/services/booking-state.service';
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
  private bookingState = inject(BookingStateService);
  private cdr = inject(ChangeDetectorRef);

  serviceId: string | null = null;
  service: Service | null = null;
  slots: Slot[] = [];
  selectedDate: Date | null = null;
  selectedSlot: Slot | null = null;

  onDateSelected(date: Date) {
    this.selectedDate = date;
    const fecha = date.toISOString().split('T')[0];

    this.scheduleService.getSlots(4, fecha, 1).subscribe((response) => {
      this.slots = response.data.slots_disponibles;
      this.cdr.detectChanges();
    });
  }

  selectSlot(slot: Slot) {
    this.selectedSlot = slot;
    this.bookingState.selectedTime = slot.horaInicio;
    this.bookingState.selectedDate = this.selectedDate;
  }

  goToNextStep() {
    this.router.navigate([`/servicio/${this.serviceId}/pago`]);
  }

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      this.serviceId = params.get('id');

      this.serviceService.getServiceById(this.serviceId!).subscribe((response) => {
        this.service = response.data;
        this.cdr.detectChanges();
      });
    });
  }
}
