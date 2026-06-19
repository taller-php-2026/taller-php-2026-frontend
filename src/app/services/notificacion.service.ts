import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { environment } from '@env/environment';
import { Notificacion, NotificacionesResponse } from '../models/notificacion.model';
import { AuthService } from './auth.service';

type NotificacionRealtime = Omit<Notificacion, 'enviadaMail'> & {
  enviadaMail?: boolean;
};

@Injectable({ providedIn: 'root' })
export class NotificacionService {
  notificaciones = signal<Notificacion[]>([]);
  unreadCount = signal(0);

  private echo?: Echo<'reverb'>;
  private canalActual?: string;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
  ) {}

  cargar(): void {
    this.http.get<NotificacionesResponse>(`${environment.apiUrl}/me/notificaciones`).subscribe({
      next: (response) => {
        this.notificaciones.set(response.data ?? []);
        this.unreadCount.set(response.unreadCount ?? 0);
      },
      error: () => {
        this.notificaciones.set([]);
        this.unreadCount.set(0);
      },
    });
  }

  iniciarRealtime(): void {
    const idUsuario = this.authService.currentUser()?.idUsuario;
    const token = this.authService.getToken();

    this.cargar();

    if (!idUsuario || !token || this.canalActual === `notificaciones.${idUsuario}`) return;

    this.detenerRealtime(false);

    (window as unknown as { Pusher: typeof Pusher }).Pusher = Pusher;

    this.echo = new Echo<'reverb'>({
      broadcaster: 'reverb',
      key: environment.reverb.key,
      wsHost: environment.reverb.host,
      wsPort: environment.reverb.port,
      wssPort: environment.reverb.port,
      forceTLS: environment.reverb.scheme === 'https',
      enabledTransports: ['ws', 'wss'],
      authEndpoint: `${environment.apiUrl.replace(/\/api$/, '')}/broadcasting/auth`,
      auth: {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      },
    });

    this.canalActual = `notificaciones.${idUsuario}`;
    this.echo.private(this.canalActual).listen('.NotificacionCreada', (event: NotificacionRealtime) => {
      const notificacion: Notificacion = {
        ...event,
        enviadaMail: event.enviadaMail ?? false,
      };

      this.notificaciones.update((actuales) => {
        if (actuales.some((item) => item.idNotificacion === notificacion.idNotificacion)) {
          return actuales;
        }

        return [notificacion, ...actuales];
      });

      if (!notificacion.leida) {
        this.unreadCount.update((count) => count + 1);
      }
    });
  }

  detenerRealtime(limpiarEstado = true): void {
    if (this.canalActual) {
      this.echo?.leave(this.canalActual);
    }

    this.echo?.disconnect();
    this.echo = undefined;
    this.canalActual = undefined;

    if (limpiarEstado) {
      this.notificaciones.set([]);
      this.unreadCount.set(0);
    }
  }

  marcarComoLeida(idNotificacion: number): void {
    this.http.patch(`${environment.apiUrl}/me/notificaciones/${idNotificacion}/leida`, {}).subscribe({
      next: () => {
        this.notificaciones.update((actuales) =>
          actuales.map((item) =>
            item.idNotificacion === idNotificacion ? { ...item, leida: true, fechaLectura: new Date().toISOString() } : item,
          ),
        );
        this.actualizarContadorNoLeidas();
      },
    });
  }

  marcarTodasComoLeidas(): void {
    this.http.patch(`${environment.apiUrl}/me/notificaciones/leidas`, {}).subscribe({
      next: () => {
        const fechaLectura = new Date().toISOString();
        this.notificaciones.update((actuales) => actuales.map((item) => ({ ...item, leida: true, fechaLectura })));
        this.unreadCount.set(0);
      },
    });
  }

  eliminar(idNotificacion: number): void {
    this.http.delete(`${environment.apiUrl}/notificaciones/${idNotificacion}`).subscribe({
      next: () => {
        this.notificaciones.update((actuales) => actuales.filter((item) => item.idNotificacion !== idNotificacion));
        this.actualizarContadorNoLeidas();
      },
    });
  }

  eliminarTodas(): void {
    this.http.delete(`${environment.apiUrl}/notificaciones`).subscribe({
      next: () => {
        this.notificaciones.set([]);
        this.unreadCount.set(0);
      },
    });
  }

  private actualizarContadorNoLeidas(): void {
    this.unreadCount.set(this.notificaciones().filter((notificacion) => !notificacion.leida).length);
  }
}
