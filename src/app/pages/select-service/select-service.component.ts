import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Header } from '@shared/header/header.component';
import { CompanyHero } from '@shared/company-hero/company-hero.component';
import { Layout } from '@shared/layout/layout.component';
import { ServiceCards } from './components/service-cards/service-cards.component';
import { BookingService } from 'app/services/BookingService';

@Component({
  selector: 'app-select-service',
  templateUrl: './select-service.component.html',
  imports: [Header, CompanyHero, Layout, ServiceCards],
})
export class SelectService implements OnInit {
  @Input() empresaId: string | null = null;
  selectedService: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private reserva: BookingService,
    private router: Router,
  ) {}

  selectService(serviceId: string) {
    this.reserva.serviceId = serviceId;
  }

  goToNextStep() {
    this.router.navigate(['/empresa', this.empresaId, 'select-professional']);
  }

  ngOnInit() {
    const companyIdParam = this.route.snapshot.paramMap.get('id');
    this.empresaId = companyIdParam;
    this.reserva.companyId = companyIdParam;
    this.selectedService = this.reserva.serviceId;
  }
}
