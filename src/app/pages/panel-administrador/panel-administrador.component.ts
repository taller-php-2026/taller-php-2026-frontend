import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-panel-administrador',
  standalone: true,
  imports: [CommonModule],
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
        this.error.set('No se pudieron cargar los datos del panel de administrador.');
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
