import { Component, inject, signal } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class NavbarComponent {
  protected authService = inject(AuthService);
  private router = inject(Router);

  // Estado del dropdown de usuario
  dropdownAbierto = signal<boolean>(false);

  // Obtener ruta de configuracion segun tipo de usuario
  obtenerRutaConfiguracion(): string {
    return this.authService.userType() === 'cliente'
      ? '/configuracion-cliente'
      : '/configuracion-negocio';
  }

  // Alternar visibilidad del dropdown
  alternarDropdown(): void {
    this.dropdownAbierto.update((v) => !v);
  }

  // Cerrar dropdown
  cerrarDropdown(): void {
    this.dropdownAbierto.set(false);
  }

  logout() {
    this.cerrarDropdown();
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

