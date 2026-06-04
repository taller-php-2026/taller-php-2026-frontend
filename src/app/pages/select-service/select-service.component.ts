import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CompanyHero } from '@components/company-hero/company-hero.component';
import { Layout } from '@shared/layout/layout.component';
import { ServiceCards } from './components/service-cards/service-cards.component';
import { BookingService } from 'app/services/BookingService';

@Component({
  selector: 'app-select-service',
  templateUrl: './select-service.component.html',
  imports: [CompanyHero, Layout, ServiceCards],
})

export class SelectService implements OnInit {
  @Input() companyId: string | null = null;
  selectedService: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private reserva: BookingService,
    private router: Router,
  ) {}

  selectService(serviceId: string) {
    this.reserva.serviceId = serviceId;
    this.selectedService = serviceId;
  }

  goToNextStep() {
    this.router.navigate(['/empresa', this.companyId, 'seleccionar-profesional']);
  }

  ngOnInit() {
    const companyIdParam = this.route.snapshot.paramMap.get('id');
    this.companyId = companyIdParam;
    this.reserva.companyId = companyIdParam;
    this.selectedService = this.reserva.serviceId;
  }
}
