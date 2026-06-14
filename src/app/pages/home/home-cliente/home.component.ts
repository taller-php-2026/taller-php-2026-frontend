import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { HeroComponent } from './components/hero-home/hero.component';
import { Layout } from '@shared/layout/layout.component';
import { Service } from 'app/models/service.model';
import { ServicesService } from 'app/services/services.service';
import { ServiceCardComponent } from './components/service-card/service-card.component';
import { NgIconComponent } from '@ng-icons/core';

@Component({
  selector: 'app-home-client',
  imports: [HeroComponent, Layout, ServiceCardComponent, NgIconComponent],
  templateUrl: './home.component.html',
  standalone: true,
})
export class HomeClientComponent {
  private servicesService = inject(ServicesService);
  private cdr = inject(ChangeDetectorRef);

  services: Service[] = [];

  handleSearch(term: string) {
    this.servicesService.getFilteredServices({ texto: term }).subscribe({
      next: (response) => {
        this.services = response.data;
        this.cdr.detectChanges();
      },
    });
  }

  ngOnInit() {
    this.servicesService.getFilteredServices({}).subscribe({
      next: (response) => {
        this.services = response.data;
        this.cdr.detectChanges();
      },
    });
  }
}
