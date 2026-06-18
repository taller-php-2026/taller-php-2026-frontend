import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NotificacionService } from '../../services/notificacion.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class NavbarComponent implements OnInit, OnDestroy {
  protected authService = inject(AuthService);
  protected notificacionService = inject(NotificacionService);
  private router = inject(Router);

  // Estado del dropdown de usuario
  dropdownAbierto = signal<boolean>(false);
  notificacionesAbiertas = signal<boolean>(false);

  ngOnInit(): void {
    this.notificacionService.iniciarRealtime();
  }

  ngOnDestroy(): void {
    this.notificacionService.detenerRealtime();
  }

  // Obtener ruta de configuracion segun tipo de usuario
  obtenerRutaConfiguracion(): string {
    return this.authService.userType() === 'cliente'
      ? '/configuracion-cliente'
      : '/configuracion-negocio';
  }

  // Alternar visibilidad del dropdown
  alternarDropdown(): void {
    this.dropdownAbierto.update((v) => !v);
    this.notificacionesAbiertas.set(false);
  }

  // Cerrar dropdown
  cerrarDropdown(): void {
    this.dropdownAbierto.set(false);
  }

  alternarNotificaciones(): void {
    this.notificacionesAbiertas.update((v) => !v);
    this.dropdownAbierto.set(false);
    this.notificacionService.cargar();
  }

  cerrarNotificaciones(): void {
    this.notificacionesAbiertas.set(false);
  }

  marcarNotificacionLeida(idNotificacion: number): void {
    this.notificacionService.marcarComoLeida(idNotificacion);
  }

  marcarTodasLeidas(): void {
    this.notificacionService.marcarTodasComoLeidas();
  }

  logout() {
    this.cerrarDropdown();
    this.cerrarNotificaciones();
    this.notificacionService.detenerRealtime();
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

