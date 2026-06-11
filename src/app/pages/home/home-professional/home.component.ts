import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'app/services/auth.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';
import { CommonModule } from '@angular/common';

interface Turno {
  id: number;
  clientName: string;
  service: string;
  time: string;
  status: string;
  clientPicture: string;
}

interface Metricas {
  turnosTotales: number;
  turnosConfirmados: number;
  turnosPendientes: number;
  ingresosEstimados: number;
  ingresosConfirmados?: number;
  hoy?: any;
  proximos?: any;
  mesActual?: any;
  totales?: any;
}

@Component({
  selector: 'app-home-professional',
  templateUrl: './home.component.html',
  styleUrl: './home.css',
  standalone: true,
  imports: [CommonModule],
})
export class HomeProfessionalComponent implements OnInit {
  private router = inject(Router);
  authService = inject(AuthService);
  private http = inject(HttpClient);

  // Fecha del día en formato amigable
  todayDate = new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Lista de turnos obtenidos de la base de datos
  upcomingTurns: Turno[] = [];

  // Metricas reales del profesional
  metricas: Metricas = {
    turnosTotales: 0,
    turnosConfirmados: 0,
    turnosPendientes: 0,
    ingresosEstimados: 0,
  };

  ngOnInit(): void {
    this.obtenerDatos();
  }

  // Obtener datos reales de metricas y proximos turnos.
  obtenerDatos(): void {
    // Cargar metricas reales del profesional autenticado
    this.http.get<{ data: Metricas }>(`${environment.apiUrl}/me/profesional/metricas`)
      .subscribe({
        next: (res) => {
          if (res && res.data) {
            this.metricas = res.data;
          }
        },
        error: (err) => console.error('Error al cargar métricas del profesional:', err)
      });

    // Cargar turnos reales del profesional autenticado
    this.http.get<{ data: any[] }>(`${environment.apiUrl}/me/profesional/reservas`)
      .subscribe({
        next: (res) => {
          if (res && res.data) {
            const ahora = new Date();
            this.upcomingTurns = res.data
              .filter((reserva: any) => this.getReservaDateTime(reserva) >= ahora)
              .sort((a: any, b: any) =>
                this.getReservaDateTime(a).getTime() - this.getReservaDateTime(b).getTime()
              )
              .slice(0, 5)
              .map((reserva: any) => {
              const hora = reserva.horario?.horaInicio || reserva.fechaReserva;
              const timeStr = hora?.includes(':')
                ? hora.substring(0, 5)
                : new Date(hora).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
              return {
                id: reserva.idReserva,
                clientName: reserva.cliente?.usuario?.nombre || 'Cliente sin nombre',
                service: reserva.servicio?.nombre || 'Servicio',
                time: timeStr,
                status: reserva.estado === 'confirmada' ? 'Confirmado' : reserva.estado === 'pendiente' ? 'Pendiente' : reserva.estado,
                clientPicture: reserva.cliente?.usuario?.imagenPerfilUrl || ''
              };
            });
          }
        },
        error: (err) => console.error('Error al cargar reservas del profesional:', err)
      });
  }

  private getReservaDateTime(reserva: any): Date {
    const fecha = reserva.horario?.fecha || reserva.fechaReserva;
    const hora = reserva.horario?.horaInicio;

    if (fecha && hora) {
      return new Date(`${fecha}T${hora}`);
    }

    return new Date(fecha || reserva.fechaReserva);
  }

  // Navegar a Mis Servicios
  goToConfigurarServicios(): void {
    this.router.navigate(['/configurar-servicios']);
  }

  // Navegar a Ciclos de Agenda
  goToConfigurarCiclos(): void {
    this.router.navigate(['/configurar-ciclos']);
  }

  // Navegar a Gestionar Excepciones
  goToGestionarExcepciones(): void {
    this.router.navigate(['/gestionar-excepciones']);
  }

  // Navegar a Configuracion de Negocio
  goToConfiguracionNegocio(): void {
    this.router.navigate(['/configuracion-negocio']);
  }
}
