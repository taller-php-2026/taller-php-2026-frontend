import { Component, Input } from '@angular/core';
import { NgIconComponent } from '@ng-icons/core';
import { BookingService } from 'app/services/BookingService';
import { ProfessionalService } from 'app/services/ProfessionalService';

interface Professional {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  reviews: number;
}

@Component({
  selector: 'app-professional-card',
  templateUrl: './professional-card.component.html',
  imports: [NgIconComponent],
})
export class ProfessionalCard {
  @Input() company: string | null = null;
  @Input() service: string | null = null;
  professionals: Professional[] = [];

  constructor(private professionalService: ProfessionalService) {}

  ngOnInit() {
    if (this.company && this.service) {
      this.professionals = this.professionalService.getProfessionalsByCompanyService(
        this.company,
        this.service,
      );
    }
    console.log('Profesionales cargados:', this.professionals);
  }
}
