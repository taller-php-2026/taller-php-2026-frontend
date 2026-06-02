import { Component, EventEmitter, Input, Output } from '@angular/core';
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
  @Output() selectedProfessional = new EventEmitter<string>();
  selectedProfessionalId: string | null = null;

  constructor(private professionalService: ProfessionalService) {}

  selectProfessional(professionalId: string) {
    this.selectedProfessionalId = professionalId;
    this.selectedProfessional.emit(professionalId);
  }

  ngOnInit() {
    if (this.company && this.service) {
      this.professionals = this.professionalService.getProfessionalsByCompanyService(
        this.company,
        this.service,
      );
    }
  }
}
