import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-elegir-tipo',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './elegir-tipo.component.html',
  styleUrl: './elegir-tipo.component.css'
})
export class ElegirTipoComponent {
  selectedRole: 'cliente' | 'profesional' = 'cliente';
  phone: string = '';
  nombreNegocio: string = '';
  descripcion: string = '';

  constructor(public auth: AuthService, private router: Router) {}

  completarRegistro() {
    this.auth.setUserType(this.selectedRole);
    if (this.selectedRole === 'cliente') {
      this.router.navigate(['/home-cliente']);
    } else {
      this.router.navigate(['/home-profesional']);
    }
  }
}
