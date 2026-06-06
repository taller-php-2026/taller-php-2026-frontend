import { NgClass, UpperCasePipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { Service } from 'app/models/service.model';

@Component({
  selector: 'app-service-card',
  templateUrl: './service-card.component.html',
  imports: [UpperCasePipe, NgIcon, RouterLink, NgClass],
  standalone: true,
})
export class ServiceCardComponent {
  @Input() service!: Service;
}
