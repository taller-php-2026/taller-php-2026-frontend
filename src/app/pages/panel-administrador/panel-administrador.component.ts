import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-panel-administrador',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './panel-administrador.component.html',
})
export class PanelAdministradorComponent implements OnInit {
  private adminService = inject(AdminService);

  metricas = signal<any>(null);
  reservasProfesional = signal<any[]>([]);
  reservasServicio = signal<any[]>([]);
  resumenPaquetes = signal<any>(null);
  paquetesServicio = signal<any[]>([]);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.cargarDatos();
  }

  // Cargar todos los datos del panel.
  cargarDatos(): void {
    this.loading.set(true);
    this.error.set(null);

    this.adminService.getMetricas().subscribe({
      next: (res) => {
        this.metricas.set(res.data);
        this.cargarTablas();
      },
      error: (err) => {
        console.error(err);
        // Cargar datos mockup para desarrollo si falla
        this.metricas.set({
          usuarios: { total: 12842, clientes: 11200, profesionales: 1580, administradores: 62 },
          pagos: { montoTotalAprobado: 45200, cantidadAprobados: 310 },
          reservas: { total: 1535, pendientes: 245, confirmadas: 1120, canceladas: 170 },
          paquetes: { sesionesVendidas: 4890, sesionesUsadas: 3520, sesionesRestantes: 1370 },
          servicios: { total: 10, presenciales: 6, virtuales: 3, hibridos: 1 }
        });
        this.resumenPaquetes.set({
          montoTotalAprobado: 45200,
          activos: 140,
          agotados: 35,
          pendientes: 12,
          totalComprados: 195,
          cancelados: 8
        });
        this.reservasServicio.set([
          { nombre: 'Consulta Psicológica', modalidad: 'virtual', totalReservas: 1240, completadas: 1100 },
          { nombre: 'Fisioterapia Deportiva', modalidad: 'presencial', totalReservas: 982, completadas: 900 }
        ]);
        this.reservasProfesional.set([
          { nombreNegocio: 'Dr. Carlos Ruiz', totalReservas: 342, completadas: 300, canceladas: 12 },
          { nombreNegocio: 'Dra. Elena Gómez', totalReservas: 289, completadas: 250, canceladas: 10 }
        ]);
        this.loading.set(false);
      }
    });
  }

  // Cargar datos secundarios de las tablas.
  private cargarTablas(): void {
    this.adminService.getReservasPorProfesional().subscribe({
      next: (res) => this.reservasProfesional.set(res.data),
      error: (err) => console.error(err)
    });

    this.adminService.getReservasPorServicio().subscribe({
      next: (res) => this.reservasServicio.set(res.data),
      error: (err) => console.error(err)
    });

    this.adminService.getResumenPaquetes().subscribe({
      next: (res) => this.resumenPaquetes.set(res.data),
      error: (err) => console.error(err)
    });

    this.adminService.getPaquetesPorServicio().subscribe({
      next: (res) => {
        this.paquetesServicio.set(res.data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.loading.set(false);
      }
    });
  }
}
