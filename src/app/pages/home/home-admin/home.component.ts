import { NgClass, UpperCasePipe, CommonModule } from '@angular/common';
import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Reserva } from 'app/models/reserva.model';
import { AdminService } from 'app/services/admin.service';

@Component({
  selector: 'app-home-admin',
  templateUrl: './home.component.html',
  standalone: true,
  imports: [NgClass, UpperCasePipe, CommonModule, FormsModule],
})
export class HomeAdminComponent implements OnInit {
  private adminService = inject(AdminService);

  reservas = signal<Reserva[]>([]);
  loading = signal<boolean>(true);
  error = signal<string>('');
  procesandoId = signal<number | null>(null);

  clientes = signal<any[]>([]);
  profesionales = signal<any[]>([]);
  servicios = signal<any[]>([]);
  editingId = signal<number | null>(null);
  editForm = signal<any>({});

  estadosFinalizables = ['confirmada', 'enCurso'];
  estadosDisponibles = ['pendiente', 'confirmada', 'enCurso', 'completada', 'finalizada', 'cancelada'];

  // Inicializar componente.
  ngOnInit(): void {
    this.cargarReservas();
    this.cargarDatosAuxiliares();
  }

  // Cargar lista de reservas.
  cargarReservas(): void {
    this.loading.set(true);
    this.error.set('');

    this.adminService.getReservas({ perPage: 50 }).subscribe({
      next: (res) => {
        this.reservas.set(res.data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar las reservas.');
        this.loading.set(false);
      },
    });
  }

  // Cargar clientes, profesionales y servicios.
  cargarDatosAuxiliares(): void {
    this.adminService.getClientes().subscribe({
      next: (res) => this.clientes.set(res.data ?? []),
    });
    this.adminService.getProfesionales().subscribe({
      next: (res) => this.profesionales.set(res.data ?? []),
    });
    this.adminService.getServicios().subscribe({
      next: (res) => this.servicios.set(res.data ?? []),
    });
  }

  // Iniciar la edición en línea de una reserva.
  iniciarEdicion(reserva: Reserva): void {
    this.editingId.set(reserva.idReserva);
    const fecha = reserva.horario?.fecha ?? reserva.fechaReserva?.split(' ')[0] ?? '';
    const horaInicio = reserva.horario?.horaInicio?.slice(0, 5) ?? reserva.fechaReserva?.split(' ')[1]?.slice(0, 5) ?? '';

    this.editForm.set({
      idCliente: reserva.idCliente,
      idProfesional: reserva.idProfesional,
      idServicio: reserva.idServicio,
      estado: reserva.estado,
      fecha: fecha,
      horaInicio: horaInicio,
    });
  }

  // Guardar los cambios realizados en la edición de una reserva.
  guardarEdicion(idReserva: number): void {
    this.procesandoId.set(idReserva);
    const formValue = this.editForm();
    const payload = {
      idCliente: formValue.idCliente,
      idProfesional: formValue.idProfesional,
      idServicio: formValue.idServicio,
      estado: formValue.estado,
      fechaReserva: `${formValue.fecha} ${formValue.horaInicio}:00`,
    };

    this.adminService.actualizarReserva(idReserva, payload).subscribe({
      next: (response) => {
        const actualizada = response.data;
        this.reservas.update((lista) =>
          lista.map((r) => (r.idReserva === idReserva ? actualizada : r)),
        );
        this.editingId.set(null);
        this.procesandoId.set(null);
      },
      error: (err) => {
        alert(err.error?.message ?? 'No se pudo guardar la reserva.');
        this.procesandoId.set(null);
      },
    });
  }

  // Cancelar el estado de edición en línea.
  cancelarEdicion(): void {
    this.editingId.set(null);
  }

  // Verificar si la reserva se puede completar.
  puedeFinalizar(reserva: Reserva): boolean {
    return this.estadosFinalizables.includes(reserva.estado);
  }

  // Marcar una reserva como finalizada.
  marcarComoFinalizada(reserva: Reserva): void {
    if (!this.puedeFinalizar(reserva)) return;

    this.procesandoId.set(reserva.idReserva);

    this.adminService.completarReserva(reserva.idReserva).subscribe({
      next: () => {
        this.reservas.update((lista) =>
          lista.map((r) =>
            r.idReserva === reserva.idReserva ? { ...r, estado: 'completada' } : r,
          ),
        );
        this.procesandoId.set(null);
      },
      error: (err) => {
        alert(err.error?.message ?? 'No se pudo marcar la reserva como finalizada.');
        this.procesandoId.set(null);
      },
    });
  }

  // Retornar clase css según el estado de la reserva.
  estadoClase(estado: Reserva['estado']): string {
    const clases: Record<string, string> = {
      pendiente: 'bg-yellow-100 text-yellow-800',
      confirmada: 'bg-blue-100 text-blue-800',
      enCurso: 'bg-purple-100 text-purple-800',
      completada: 'bg-green-100 text-green-800',
      finalizada: 'bg-green-100 text-green-800',
      cancelada: 'bg-red-100 text-red-800',
    };
    return clases[estado] ?? 'bg-gray-100 text-gray-800';
  }
}
