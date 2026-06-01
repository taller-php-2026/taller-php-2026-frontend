import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgIconComponent } from '@ng-icons/core';
import { CompanyService } from 'app/services/CompanyService';

interface Service {
  id: string;
  name: string;
  description: string;
  duration: string;
  price: string;
}

@Component({
  selector: 'app-service-cards',
  templateUrl: './service-cards.component.html',
  imports: [NgIconComponent],
})
export class ServiceCards {
  @Input() companyId: string | null = null;
  @Output() servicioSeleccionado = new EventEmitter<string>();
  selectedServiceId: string | null = null;
  services: Service[] = [];

  constructor(private companyService: CompanyService) {}

  seleccionarServicio(serviceId: string) {
    this.selectedServiceId = serviceId;
    this.servicioSeleccionado.emit(serviceId);
  }

  ngOnInit() {
    if (this.companyId) {
      this.services = this.companyService.getServicesByCompanyId(this.companyId);
    }
  }
}
