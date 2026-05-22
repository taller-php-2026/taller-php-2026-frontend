import { Component } from '@angular/core';
import { NgIconComponent } from '@ng-icons/core';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [NgIconComponent],
  templateUrl: './hero.component.html',
})
export class HeroComponent {}
