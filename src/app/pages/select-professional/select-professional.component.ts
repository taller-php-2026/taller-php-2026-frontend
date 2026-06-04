import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CompanyHero } from '@components/company-hero/company-hero.component';
import { Layout } from '@shared/layout/layout.component';
import { ProfessionalCard } from './components/professional-card/professional-card.component';
import { BookingService } from 'app/services/BookingService';

@Component({
  selector: 'app-select-professional',
  templateUrl: './select-professional.component.html',
  imports: [Layout, CompanyHero, ProfessionalCard],
})

export class SelectProfessional {
  companyId: string | null = null;
  serviceId: string | null = null;
  selectedProfessional: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private bookingService: BookingService,
    private router: Router,
  ) {}

  goToNextStep() {
    this.router.navigate([`/empresa/${this.companyId}/seleccionar-horario`]);
  }

  selectProfessional(professionalId: string) {
    this.selectedProfessional = professionalId;
    this.bookingService.professionalId = professionalId;
  }

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      this.companyId = params.get('id');
    });
    this.serviceId = this.bookingService.getServiceId();
  }
}
