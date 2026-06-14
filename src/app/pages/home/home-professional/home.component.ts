import { ChangeDetectorRef, Component, inject, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'app/services/auth.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';
import { CommonModule } from '@angular/common';
import { AgendaCalendarModalComponent } from '../../../components/agenda-calendar-modal/agenda-calendar-modal';

interface Turno {
  id: number;
  clientName: string;
  service: string;
  fechaTexto: string;
  time: string;
  status: string;
  estado: string;
  modalidad: string;
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
  imports: [CommonModule, AgendaCalendarModalComponent],
})
export class HomeProfessionalComponent implements OnInit {
  private router = inject(Router);
  authService = inject(AuthService);
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);

  @ViewChild(AgendaCalendarModalComponent) calendarModal!: AgendaCalendarModalComponent;

  // Fecha del día en formato amigable
  todayDate = new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Lista de turnos obtenidos de la base de datos
  upcomingTurns: Turno[] = [];
  reservasProfesional: any[] = [];
  fechaFiltro = '';

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
            this.metricas = {
              ...res.data,
              turnosTotales: res.data.turnosTotales ?? res.data.hoy?.turnosTotales ?? 0,
              turnosConfirmados: res.data.turnosConfirmados ?? res.data.hoy?.turnosConfirmados ?? 0,
              turnosPendientes: res.data.turnosPendientes ?? res.data.hoy?.turnosPendientes ?? 0,
              ingresosEstimados: res.data.ingresosEstimados ?? res.data.hoy?.ingresosEstimados ?? 0,
            };
            this.cdr.detectChanges();
          }
        },
        error: (err) => console.error('Error al cargar métricas del profesional:', err)
      });

    // Cargar turnos reales del profesional autenticado
    this.http.get<{ data: any[] }>(`${environment.apiUrl}/me/profesional/reservas`)
      .subscribe({
        next: (res) => {
          if (res && res.data) {
            this.reservasProfesional = res.data;
            this.actualizarTurnos();
            this.cdr.detectChanges();
          }
        },
        error: (err) => console.error('Error al cargar reservas del profesional:', err)
      });
  }

  filtrarPorFecha(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.fechaFiltro = input.value;
    this.actualizarTurnos();
  }

  limpiarFiltroFecha(): void {
    this.fechaFiltro = '';
    this.actualizarTurnos();
  }

  private actualizarTurnos(): void {
    const ahora = new Date();
    const reservas = this.reservasProfesional
      .filter((reserva: any) => !this.esEstadoCerrado(reserva.estado))
      .filter((reserva: any) => {
        if (this.fechaFiltro) {
          return this.getReservaDateKey(reserva) === this.fechaFiltro;
        }

        return this.getReservaDateTime(reserva) >= ahora;
      })
      .sort((a: any, b: any) =>
        this.getReservaDateTime(a).getTime() - this.getReservaDateTime(b).getTime()
      );

    this.upcomingTurns = (this.fechaFiltro ? reservas : reservas.slice(0, 5))
      .map((reserva: any) => this.mapReservaToTurno(reserva));
  }

  private mapReservaToTurno(reserva: any): Turno {
    return {
      id: reserva.idReserva,
      clientName: reserva.cliente?.usuario?.nombre || 'Cliente sin nombre',
      service: reserva.servicio?.nombre || 'Servicio',
      fechaTexto: this.formatFecha(this.getReservaDateKey(reserva)),
      time: this.getReservaTime(reserva),
      status: reserva.estado === 'confirmada' ? 'Confirmado' : reserva.estado === 'pendiente' ? 'Pendiente' : reserva.estado,
      estado: reserva.estado,
      modalidad: reserva.servicio?.modalidad || 'presencial',
      clientPicture: reserva.cliente?.usuario?.imagenPerfilUrl || ''
    };
  }

  private esEstadoCerrado(estado?: string): boolean {
    return ['cancelada', 'completada', 'finalizada', 'no_asistida'].includes(estado || '');
  }

  private getReservaDateTime(reserva: any): Date {
    const fecha = this.getReservaDateKey(reserva);
    const hora = this.getReservaTimeRaw(reserva);
    const [year, month, day] = fecha.split('-').map(Number);
    const [hour, minute, second] = hora.split(':').map(Number);

    return new Date(year, month - 1, day, hour || 0, minute || 0, second || 0);
  }

  private getReservaDateKey(reserva: any): string {
    const fecha = reserva.horario?.fecha || reserva.fechaReserva || '';
    return String(fecha).split(' ')[0].split('T')[0];
  }

  private getReservaTime(reserva: any): string {
    return this.getReservaTimeRaw(reserva).substring(0, 5);
  }

  private getReservaTimeRaw(reserva: any): string {
    const hora = reserva.horario?.horaInicio || String(reserva.fechaReserva || '').split(' ')[1] || '00:00:00';
    return String(hora || '00:00:00');
  }

  private formatFecha(fecha: string): string {
    const [year, month, day] = fecha.split('-').map(Number);
    return new Date(year, month - 1, day).toLocaleDateString('es-ES', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
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

  // Abrir modal de calendario completo de turnos
  abrirCalendarioCompleto(): void {
    this.calendarModal.open();
  }

  puedeUnirse(turno: Turno): boolean {
    return ['virtual', 'hibrida'].includes(turno.modalidad) && ['confirmada', 'enCurso'].includes(turno.estado);
  }

  unirseVideollamada(idReserva: number): void {
    this.router.navigate(['/pre-videollamada'], { queryParams: { reserva: idReserva } });
  }
}
