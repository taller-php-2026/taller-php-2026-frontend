import { NgClass, UpperCasePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Reserva } from 'app/models/reserva.model';
import { AdminService } from 'app/services/admin.service';

@Component({
  selector: 'app-home-admin',
  templateUrl: './home.component.html',
  standalone: true,
  imports: [NgClass, UpperCasePipe],
})
export class HomeAdminComponent {
  private adminService = inject(AdminService);

  reservas = signal<Reserva[]>([]);
  loading = signal<boolean>(true);
  error = signal<string>('');
  procesandoId = signal<number | null>(null);

  estadosFinalizables = ['confirmada', 'enCurso'];

  ngOnInit(): void {
    this.cargarReservas();
  }

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

  puedeFinalizar(reserva: Reserva): boolean {
    return this.estadosFinalizables.includes(reserva.estado);
  }

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
