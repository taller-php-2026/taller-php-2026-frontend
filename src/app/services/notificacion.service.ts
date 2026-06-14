import { Injectable, inject, signal, effect } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '@env/environment';
import { AuthService } from './auth.service';
import { EchoService } from './echo.service';
import { Observable } from 'rxjs';

export interface Notificacion {
  idNotificacion: number;
  idUsuario: number;
  titulo: string;
  mensaje: string;
  tipo: 'confirmacion' | 'recordatorio' | 'cancelacion' | 'actualizacion' | 'mensaje';
  leida: boolean;
  idReserva: number | null;
  fechaCreacion: string;
}

@Injectable({
  providedIn: 'root',
})
export class NotificacionService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private echoService = inject(EchoService);

  // State
  notifications = signal<Notificacion[]>([]);
  unreadCount = signal<number>(0);

  constructor() {
    // Re-bind listener when auth status changes
    effect(() => {
      if (this.authService.isAuthenticated() && this.authService.currentUser()) {
        this.fetchNotifications();
        this.listenToRealTimeNotifications();
      } else {
        this.notifications.set([]);
        this.unreadCount.set(0);
        this.echoService.disconnect();
      }
    });
  }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    });
  }

  fetchNotifications(): void {
    const headers = this.getHeaders();
    this.http.get<Notificacion[]>(`${environment.apiUrl}/notificaciones`, { headers }).subscribe({
      next: (res) => {
        this.notifications.set(res);
        this.updateUnreadCount();
      },
      error: (err) => console.error('Error fetching notifications:', err),
    });
  }

  markAsRead(id: number): void {
    const headers = this.getHeaders();
    this.http.put<Notificacion>(`${environment.apiUrl}/notificaciones/${id}`, { leida: true }, { headers }).subscribe({
      next: (updated) => {
        this.notifications.update((list) =>
          list.map((n) => (n.idNotificacion === id ? { ...n, leida: true } : n))
        );
        this.updateUnreadCount();
      },
      error: (err) => console.error('Error marking notification as read:', err),
    });
  }

  deleteNotification(id: number): void {
    const headers = this.getHeaders();
    this.http.delete(`${environment.apiUrl}/notificaciones/${id}`, { headers }).subscribe({
      next: () => {
        this.notifications.update((list) => list.filter((n) => n.idNotificacion !== id));
        this.updateUnreadCount();
      },
      error: (err) => console.error('Error deleting notification:', err),
    });
  }

  deleteAllNotifications(): void {
    const headers = this.getHeaders();
    this.http.delete(`${environment.apiUrl}/notificaciones`, { headers }).subscribe({
      next: () => {
        this.notifications.set([]);
        this.updateUnreadCount();
      },
      error: (err) => console.error('Error deleting all notifications:', err),
    });
  }

  private listenToRealTimeNotifications(): void {
    const user = this.authService.currentUser();
    if (!user) return;

    const echo = this.echoService.getEcho();
    echo.private(`notificaciones.${user.idUsuario}`)
      .listen('.NotificacionCreada', (e: any) => {
        const newNotif: Notificacion = {
          idNotificacion: e.idNotificacion,
          idUsuario: e.idUsuario,
          titulo: e.titulo,
          mensaje: e.mensaje,
          tipo: e.tipo,
          leida: e.leida,
          idReserva: e.idReserva,
          fechaCreacion: e.fechaCreacion,
        };
        // Prepend new notification to the list only if not already present
        this.notifications.update((list) => {
          if (list.some((n) => n.idNotificacion === newNotif.idNotificacion)) {
            return list;
          }
          return [newNotif, ...list];
        });
        this.updateUnreadCount();
      });
  }

  private updateUnreadCount(): void {
    const count = this.notifications().filter((n) => !n.leida).length;
    this.unreadCount.set(count);
  }
}
