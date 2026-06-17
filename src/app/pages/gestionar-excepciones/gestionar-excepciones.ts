import { Component, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ExcepcionService, ExcepcionPayload } from '../../services/excepcion.service';

@Component({
  selector: 'app-gestionar-excepciones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestionar-excepciones.html',
  styleUrl: './gestionar-excepciones.css',
})
export class GestionarExcepcionesComponent implements OnInit {
  private router = inject(Router);
  private excepcionService = inject(ExcepcionService);

  // Listado de excepciones del profesional activo.
  excepciones = signal<any[]>([]);

  // Listado de agendas del profesional activo.
  agendasProfesional = signal<any[]>([]);

  // Agenda seleccionada por defecto para la nueva excepción.
  idAgendaSeleccionada = signal<number | null>(null);

  // Formulario reactivo con signals (Fecha, Hora de inicio / fin).
  fechaExcepcion = signal<string>('');
  horaInicio = signal<string>('');
  horaFin = signal<string>('');
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

  // Cargar agendas del profesional autenticado.
  cargarDatos(): void {
    this.loading.set(true);

    this.excepcionService.obtenerAgendasProfesional().subscribe({
      next: (res) => {
        const agendas = res.data || [];
        this.agendasProfesional.set(agendas);

        if (agendas.length > 0) {
          this.idAgendaSeleccionada.set(agendas[0].idAgenda);
        }
        this.cargarExcepciones();
      },
      error: () => {
        this.errorMsg.set('Error al obtener la configuración de agendas.');
        this.loading.set(false);
      },
    });
  }

  // Cargar excepciones del profesional autenticado.
  cargarExcepciones(): void {
    this.excepcionService.obtenerMisExcepciones().subscribe({
      next: (res) => {
        this.excepciones.set(res.data || []);
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
    if (!this.fechaExcepcion() || !this.horaInicio() || !this.horaFin()) {
      this.mostrarToast('Por favor, completa la fecha y las horas de inicio y fin');
      return;
    }
    if (!this.idAgendaSeleccionada()) {
      this.mostrarToast('No hay agenda activa asignada');
      return;
    }

    const tStart = this.timeToMinutes(this.horaInicio());
    const tEnd = this.timeToMinutes(this.horaFin());

    if (tEnd <= tStart) {
      this.mostrarToast('La hora de fin debe ser posterior a la de inicio');
      return;
    }

    const payload: ExcepcionPayload = {
      fecha: this.fechaExcepcion(),
      horaInicio: this.horaInicio(),
      horaFin: this.horaFin(),
      motivo: this.motivo() || undefined,
      idAgenda: this.idAgendaSeleccionada()!,
    };

    this.loading.set(true);
    this.excepcionService.crearExcepcion(payload).subscribe({
      next: () => {
        this.mostrarToast('Bloqueo confirmado exitosamente');
        this.fechaExcepcion.set('');
        this.horaInicio.set('');
        this.horaFin.set('');
        this.motivo.set('');
        this.cargarExcepciones();
      },
      error: (err) => {
        let msg = 'Error al intentar guardar el bloqueo';
        if (err?.error?.errors) {
          const list: string[] = [];
          Object.keys(err.error.errors).forEach((key) => {
            err.error.errors[key].forEach((detail: string) => {
              if (detail.includes('validation.after')) {
                list.push('La hora de fin debe ser posterior a la hora de inicio.');
              } else {
                list.push(detail);
              }
            });
          });
          if (list.length > 0) msg = list.join(' ');
        } else if (err?.error?.message) {
          msg = err.error.message.includes('validation.after')
            ? 'La hora de fin debe ser posterior a la hora de inicio.'
            : err.error.message;
        }
        this.mostrarToast(msg);
        this.loading.set(false);
      }
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

  formatFechaExcepcion(fechaStr: string): string {
    if (!fechaStr) return '';
    const parts = fechaStr.split('-');
    if (parts.length !== 3) return fechaStr;
    const [year, month, day] = parts;
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    const mesIndex = parseInt(month, 10) - 1;
    const nombreMes = meses[mesIndex] || month;
    return `${day} de ${nombreMes}, ${year}`;
  }

  private timeToMinutes(timeStr: string): number {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  }
}
