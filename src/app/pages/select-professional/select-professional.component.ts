import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Layout } from '@shared/layout/layout.component';
import { ProfessionalCard } from './components/professional-card/professional-card.component';
import { BookingService } from 'app/services/BookingService';
import { Service } from 'app/models/service.model';
import { ServicesService } from 'app/services/services.service';
import { Professional } from 'app/models/professional.model';
import { NgIcon } from '@ng-icons/core';
import { StepsComponent } from '@components/steps/steps.component';

@Component({
  selector: 'app-select-professional',
  templateUrl: './select-professional.component.html',
  imports: [Layout, ProfessionalCard, NgIcon, StepsComponent],
})
export class SelectProfessional {
  private servicesService = inject(ServicesService);
  private cdr = inject(ChangeDetectorRef);

  serviceId: string | null = null;
  service: Service | null = null;

  professionals: Professional[] = [];

  selectedProfessional: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  goToNextStep() {
    this.router.navigate([`/servicio/${this.serviceId}/seleccionar-horario`]);
  }

  onProfessionalSelected(professionalId: number) {
    this.selectedProfessional = professionalId;
  }

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      this.serviceId = params.get('id');

      this.servicesService.getServiceById(this.serviceId!).subscribe((response) => {
        this.service = response.data;
        this.cdr.detectChanges();
      });

      this.servicesService.getProfessionalsByService(this.serviceId!).subscribe((response) => {
        this.professionals = response.data;
        this.cdr.detectChanges();
      });
    });
  }
}
