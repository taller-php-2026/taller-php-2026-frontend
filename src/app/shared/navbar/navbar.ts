import { Component, OnDestroy, OnInit, ViewChild, inject, signal } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NotificacionService } from '../../services/notificacion.service';
import { Notificacion } from '../../models/notificacion.model';
import { CommonModule } from '@angular/common';
import { BookingDetailModalComponent } from '../../components/booking-detail-modal/booking-detail-modal';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, CommonModule, BookingDetailModalComponent],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class NavbarComponent implements OnInit, OnDestroy {
  protected authService = inject(AuthService);
  protected notificacionService = inject(NotificacionService);
  private router = inject(Router);

  @ViewChild(BookingDetailModalComponent) bookingModal!: BookingDetailModalComponent;

  dropdownAbierto = signal<boolean>(false);
  notificacionesAbiertas = signal<boolean>(false);

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.notificacionService.iniciarRealtime();
    }
  }

  ngOnDestroy(): void {
    this.notificacionService.detenerRealtime();
  }

  obtenerRutaConfiguracion(): string {
    const isAdmin = this.authService.currentUser()?.roles?.includes('administrador');
    return this.authService.userType() === 'cliente' || isAdmin ? '/configuracion-cliente' : '/configuracion-negocio';
  }

  alternarDropdown(): void {
    this.dropdownAbierto.update((v) => !v);
    this.notificacionesAbiertas.set(false);
  }

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

  marcarNotificacionLeida(notificacion: Notificacion): void {
    if (!notificacion.leida) {
      this.notificacionService.marcarComoLeida(notificacion.idNotificacion);
    }

    this.cerrarNotificaciones();

    if (notificacion.idReserva) {
      this.bookingModal.open(notificacion.idReserva);
    }
  }

  marcarTodasLeidas(): void {
    this.notificacionService.marcarTodasComoLeidas();
  }

  eliminarNotificacion(idNotificacion: number, event: Event): void {
    event.stopPropagation();
    this.notificacionService.eliminar(idNotificacion);
  }

  eliminarTodasLasNotificaciones(event: Event): void {
    event.stopPropagation();
    this.notificacionService.eliminarTodas();
  }

  logout(): void {
    this.cerrarDropdown();
    this.cerrarNotificaciones();
    this.notificacionService.detenerRealtime();
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
