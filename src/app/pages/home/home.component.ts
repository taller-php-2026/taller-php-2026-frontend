import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { HeroComponent } from './components/hero-home/hero.component';
import { Layout } from '@shared/layout/layout.component';
import { Service } from 'app/models/service.model';
import { ServicesService } from 'app/services/services.service';
import { ServiceCardComponent } from './components/service-card/service-card.component';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [HeroComponent, Layout, ServiceCardComponent],
  templateUrl: './home.component.html',
})
export class HomeComponent {
  private servicesService = inject(ServicesService);
  private cdr = inject(ChangeDetectorRef);

  services: Service[] = [];

  ngOnInit() {
    this.servicesService.getAllServices().subscribe({
      next: (response) => {
        this.services = response.data;
        this.cdr.detectChanges();
      },
    });
  }
}
