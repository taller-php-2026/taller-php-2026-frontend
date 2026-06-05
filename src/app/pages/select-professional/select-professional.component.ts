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
  serviceId: string | null = null;
  selectedProfessional: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  goToNextStep() {
    this.router.navigate([`/servicio/${this.serviceId}/seleccionar-horario`]);
  }

  selectProfessional(professionalId: string) {
    this.selectedProfessional = professionalId;
  }

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      this.serviceId = params.get('id');
    });
  }
}
