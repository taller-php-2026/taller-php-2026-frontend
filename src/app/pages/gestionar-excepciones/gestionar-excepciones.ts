import { Component, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ExcepcionService, ExcepcionPayload } from '../../services/excepcion.service';
import { AuthService } from '../../services/auth.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-gestionar-excepciones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestionar-excepciones.html',
  styleUrl: './gestionar-excepciones.css',
})
export class GestionarExcepcionesComponent implements OnInit {
  private router = inject(Router);
  private authService = inject(AuthService);
  private excepcionService = inject(ExcepcionService);

  // Listado de excepciones del profesional activo.
  excepciones = signal<any[]>([]);

  // Listado de agendas del profesional activo.
  agendasProfesional = signal<any[]>([]);

  // Agenda seleccionada por defecto para la nueva excepción.
  idAgendaSeleccionada = signal<number | null>(null);

  // Formulario reactivo con signals (Fecha y hora de inicio / fin).
  fechaHoraInicio = signal<string>('');
  fechaHoraFin = signal<string>('');
  motivo = signal<string>('');

  // Mensajes de feedback.
  loading = signal<boolean>(false);
  successMsg = signal<string>('');
  errorMsg = signal<string>('');

  // Toasts flotantes.
  toasts = signal<string[]>([]);

  ngOnInit(): void {
    this.cargarDatos();
  }

  // Cargar agendas y filtrar por el profesional activo.
  cargarDatos(): void {
    this.loading.set(true);
    const idUsuarioActivo = this.authService.currentUser()?.idUsuario;

    this.excepcionService.obtenerAgendas().subscribe({
      next: (res) => {
        const todasAgendas = res.data || [];
        // Filtrar las agendas que pertenezcan al profesional activo (mediante sus reglas de disponibilidad).
        const filtradas = todasAgendas.filter((agenda) =>
          agenda.reglas_disponibilidad?.some(
            (regla: any) => Number(regla.idProfesional) === Number(idUsuarioActivo),
          ),
        );
        this.agendasProfesional.set(filtradas);

        if (filtradas.length > 0) {
          this.idAgendaSeleccionada.set(filtradas[0].idAgenda);
        }
        this.cargarExcepciones();
      },
      error: () => {
        this.errorMsg.set('Error al obtener la configuración de agendas.');
        this.loading.set(false);
      },
    });
  }

  // Cargar excepciones y filtrar por las agendas del profesional.
  cargarExcepciones(): void {
    const agendaIds = this.agendasProfesional().map((a) => a.idAgenda);
    if (agendaIds.length === 0) {
      this.excepciones.set([]);
      this.loading.set(false);
      return;
    }

    this.excepcionService.obtenerExcepciones().subscribe({
      next: (res) => {
        const todasExcepciones = res.data || [];
        // Filtrar excepciones asociadas a las agendas del profesional.
        const filtradas = todasExcepciones.filter((e) => agendaIds.includes(e.idAgenda));
        this.excepciones.set(filtradas);
        this.loading.set(false);
      },
      error: () => {
        this.errorMsg.set('Error al cargar la lista de excepciones.');
        this.loading.set(false);
      },
    });
  }

  // Mostrar toast dinámico.
  mostrarToast(mensaje: string): void {
    this.toasts.update((current) => [...current, mensaje]);
    setTimeout(() => {
      this.toasts.update((current) => current.filter((t) => t !== mensaje));
    }, 3000);
  }

  // Volver a inicio.
  goBack(): void {
    this.router.navigate(['/']);
  }

  // Redirigir a la configuración de ciclos de agenda.
  goToConfigurarAgendas(): void {
    this.router.navigate(['/configurar-ciclos']);
  }

  // Confirmar y crear bloqueo.
  confirmarBloqueo(): void {
    if (!this.fechaHoraInicio() || !this.fechaHoraFin()) {
      this.mostrarToast('Por favor, selecciona fecha y hora de inicio y fin');
      return;
    }
    if (!this.idAgendaSeleccionada()) {
      this.mostrarToast('No hay agenda activa asignada');
      return;
    }

    const start = new Date(this.fechaHoraInicio());
    const end = new Date(this.fechaHoraFin());

    if (end <= start) {
      this.mostrarToast('La fecha/hora de fin debe ser posterior a la de inicio');
      return;
    }

    // Generar las excepciones por cada día en el rango
    const requests: Observable<any>[] = [];
    let current = new Date(start);

    // Iterar por cada día
    while (current <= end) {
      const dateString = current.toISOString().split('T')[0];
      let hInicio = '00:00';
      let hFin = '23:59';

      // Si es el primer día, la hora de inicio es la seleccionada
      if (current.toDateString() === start.toDateString()) {
        hInicio = this.formatTime(start);
      }
      // Si es el último día, la hora de fin es la seleccionada
      if (current.toDateString() === end.toDateString()) {
        hFin = this.formatTime(end);
      }

      // Si es el mismo día, verificar rango
      if (start.toDateString() === end.toDateString()) {
        hInicio = this.formatTime(start);
        hFin = this.formatTime(end);
      }

      // Solo agregar request si la hora de fin es posterior a la de inicio en ese día
      const timeStartVal = this.timeToMinutes(hInicio);
      const timeEndVal = this.timeToMinutes(hFin);

      if (timeEndVal > timeStartVal) {
        const payload: ExcepcionPayload = {
          fecha: dateString,
          horaInicio: hInicio,
          horaFin: hFin,
          motivo: this.motivo() || undefined,
          idAgenda: this.idAgendaSeleccionada()!,
        };
        requests.push(this.excepcionService.crearExcepcion(payload));
      }

      // Avanzar al siguiente día
      current.setDate(current.getDate() + 1);
    }

    if (requests.length === 0) {
      this.mostrarToast('Rango de tiempo no válido para crear un bloqueo');
      return;
    }

    this.loading.set(true);
    import('rxjs').then(({ forkJoin }) => {
      forkJoin(requests).subscribe({
        next: () => {
          this.mostrarToast('Bloqueo(s) confirmado(s) exitosamente');
          this.fechaHoraInicio.set('');
          this.fechaHoraFin.set('');
          this.motivo.set('');
          this.cargarExcepciones();
        },
        error: (err) => {
          const msg = err?.error?.message || 'Error al intentar guardar el bloqueo';
          this.mostrarToast(msg);
          this.loading.set(false);
        }
      });
    });
  }

  // Eliminar un bloqueo existente.
  cancelarBloqueo(idExcepcion: number): void {
    this.loading.set(true);
    this.excepcionService.eliminarExcepcion(idExcepcion).subscribe({
      next: () => {
        this.mostrarToast('Bloqueo cancelado correctamente');
        this.cargarExcepciones();
      },
      error: () => {
        this.mostrarToast('Error al intentar eliminar el bloqueo');
        this.loading.set(false);
      },
    });
  }

  private formatTime(date: Date): string {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  private timeToMinutes(timeStr: string): number {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  }
}
