import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CompanyHero } from '@components/company-hero/company-hero.component';
import { Header } from '@shared/header/header.component';
import { Layout } from '@shared/layout/layout.component';
import { ProfessionalCard } from './components/professional-card/professional-card.component';
import { BookingService } from 'app/services/BookingService';

@Component({
  selector: 'app-select-professional',
  templateUrl: './select-professional.component.html',
  imports: [Header, Layout, CompanyHero, ProfessionalCard],
})
export class SelectProfessional {
  companyId: string | null = null;
  serviceId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private bookingService: BookingService,
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      this.companyId = params.get('id');
    });
    this.serviceId = this.bookingService.getServiceId();
  }
}
