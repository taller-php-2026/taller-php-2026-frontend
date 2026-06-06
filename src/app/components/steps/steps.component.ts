import { NgClass } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-steps',
  templateUrl: './steps.component.html',
  imports: [NgClass],
})
export class StepsComponent {
  @Input() currentStep: number = 1;
}
