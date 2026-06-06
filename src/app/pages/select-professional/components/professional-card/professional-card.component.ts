import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgIconComponent } from '@ng-icons/core';
import { Professional } from 'app/models/professional.model';

@Component({
  selector: 'app-professional-card',
  templateUrl: './professional-card.component.html',
  imports: [NgIconComponent],
})
export class ProfessionalCard {
  @Input() professional!: Professional;
  @Input() isSelected!: boolean;
  @Output() selectedProfessional = new EventEmitter<number>();

  selectProfessional() {
    this.selectedProfessional.emit(this.professional.idUsuario);
  }
}
