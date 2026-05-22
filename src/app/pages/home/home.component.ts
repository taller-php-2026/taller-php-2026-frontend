import { Component } from '@angular/core';
import { HeaderComponent } from '@shared/header/header.component';
import { HeroComponent } from '@components/hero/hero.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [HeaderComponent, HeroComponent],
  templateUrl: './home.component.html',
})
export class HomeComponent {}
