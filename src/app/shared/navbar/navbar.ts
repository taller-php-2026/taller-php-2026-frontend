import { Component, inject, signal, ViewChild } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { NotificacionService, Notificacion } from '../../services/notificacion.service';
import { BookingDetailModalComponent } from '../../components/booking-detail-modal/booking-detail-modal';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, CommonModule, BookingDetailModalComponent],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class NavbarComponent {
  protected authService = inject(AuthService);
  protected notifService = inject(NotificacionService);
  private router = inject(Router);

  @ViewChild(BookingDetailModalComponent) bookingModal!: BookingDetailModalComponent;

  // Estado de los dropdowns
  dropdownAbierto = signal<boolean>(false);
  notifDropdownAbierto = signal<boolean>(false);

  // Obtener ruta de configuracion segun tipo de usuario.
  obtenerRutaConfiguracion(): string {
    const isAdmin = this.authService.currentUser()?.roles?.includes('administrador');
    return (this.authService.userType() === 'cliente' || isAdmin)
      ? '/configuracion-cliente'
      : '/configuracion-negocio';
  }

  // Alternar visibilidad del dropdown de usuario
  alternarDropdown(): void {
    this.dropdownAbierto.update((v) => !v);
    if (this.dropdownAbierto()) {
      this.notifDropdownAbierto.set(false);
    }
  }

  // Cerrar dropdown de usuario
  cerrarDropdown(): void {
    this.dropdownAbierto.set(false);
  }

  // Alternar visibilidad del dropdown de notificaciones
  alternarNotifDropdown(): void {
    this.notifDropdownAbierto.update((v) => !v);
    if (this.notifDropdownAbierto()) {
      this.dropdownAbierto.set(false);
    }
  }

  // Cerrar dropdown de notificaciones
  cerrarNotifDropdown(): void {
    this.notifDropdownAbierto.set(false);
  }

  // Eliminar una notificación
  eliminarNotificacion(id: number, event: Event): void {
    event.stopPropagation();
    this.notifService.deleteNotification(id);
  }

  // Eliminar todas las notificaciones
  eliminarTodasLasNotificaciones(event: Event): void {
    event.stopPropagation();
    this.notifService.deleteAllNotifications();
  }

  // Ver detalles de la agenda de la notificación
  verDetalleNotificacion(notif: Notificacion): void {
    if (!notif.leida) {
      this.notifService.markAsRead(notif.idNotificacion);
    }
    this.cerrarNotifDropdown();

    if (notif.idReserva) {
      this.bookingModal.open(notif.idReserva);
    } else {
      alert('Esta notificación no tiene detalles de reserva asociados.');
    }
  }

  logout() {
    this.cerrarDropdown();
    this.cerrarNotifDropdown();
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

