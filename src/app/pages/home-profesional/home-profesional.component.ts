import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home-profesional',
  standalone: true,
  imports: [],
  templateUrl: './home-profesional.component.html',
  styleUrl: './home-profesional.component.css'
})
export class HomeProfesionalComponent {
  constructor(public auth: AuthService, private router: Router) {}
}
