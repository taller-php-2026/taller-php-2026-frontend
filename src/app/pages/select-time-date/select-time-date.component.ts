import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Calendar } from '@pages/select-time-date/components/calendar/calendar.component';
import { Layout } from '@shared/layout/layout.component';
import { StepsComponent } from '@components/steps/steps.component';
import { Service } from 'app/models/service.model';
import { ServicesService } from 'app/services/services.service';
import { NgIcon } from '@ng-icons/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-select-time-date',
  templateUrl: './select-time-date.component.html',
  imports: [Layout, Calendar, StepsComponent, NgIcon, NgClass, StepsComponent],
})
export class SelectTimeDateComponent {
  private servicesService = inject(ServicesService);
  private cdr = inject(ChangeDetectorRef);

  serviceId: string | null = null;
  service: Service | null = null;

  selectedDate: Date | null = null;
  selectedTime: string | null = null;

  schedules: { id: number; time: string }[] = [];

  onDateSelected(date: Date) {
    this.selectedDate = date;
  }

  onTimeSelected(time: string) {
    this.selectedTime = time;
  }

  goToNextStep() {
    this.router.navigate([`/servicio/${this.serviceId}/pago`]);
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      this.serviceId = params.get('id');

      this.servicesService.getServiceById(this.serviceId!).subscribe((response) => {
        this.service = response.data;
        this.cdr.detectChanges();
      });

      this.schedules = [
        { id: 1, time: '09:00 AM' },
        { id: 2, time: '10:00 AM' },
        { id: 3, time: '11:00 AM' },
        { id: 4, time: '12:00 PM' },
        { id: 5, time: '01:00 PM' },
        { id: 6, time: '02:00 PM' },
        { id: 7, time: '03:00 PM' },
        { id: 8, time: '04:00 PM' },
        { id: 9, time: '05:00 PM' },
      ];
    });
  }
}
