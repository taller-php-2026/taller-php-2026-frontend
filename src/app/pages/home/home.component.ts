import { Component, inject } from '@angular/core';
import { HomeClientComponent } from './home-cliente/home.component';
import { HomeProfessionalComponent } from './home-professional/home.component';
import { AuthService } from 'app/services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  imports: [HomeClientComponent, HomeProfessionalComponent],
  standalone: true,
})
export class HomeComponent {
  auth = inject(AuthService);
}
