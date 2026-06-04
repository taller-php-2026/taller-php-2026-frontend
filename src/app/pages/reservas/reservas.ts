import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

interface Reserva {
  id: number;
  empresaNombre: string;
  empresaLogo: string;
  servicioNombre: string;
  profesionalNombre: string;
  fecha: string;
  hora: string;
  estado: 'CANCELADA' | 'PENDIENTE' | 'CONFIRMADA' | 'EN_CURSO' | 'FINALIZADA';
  tipo: 'proximas' | 'anteriores' | 'canceladas';
  modalidad?: 'online' | 'presencial';
  duracionMinutos?: number;
}

@Component({
  selector: 'app-reservas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reservas.html',
  styleUrl: './reservas.css',
})
export class Reservas implements OnInit {
  private enrutador = inject(Router);
  private clienteHttp = inject(HttpClient);

  // Listar reservas.
  reservas = signal<Reserva[]>([]);

  // Seleccionar pestaña.
  tabSeleccionada = signal<'proximas' | 'anteriores' | 'canceladas'>('proximas');

  // Filtrar reservas.
  reservasFiltradas = computed(() => {
    return this.reservas().filter((r) => r.tipo === this.tabSeleccionada());
  });

  // Inicializar componente.
  ngOnInit(): void {
    this.cargarReservas();
  }

  // Obtener reservas.
  cargarReservas(): void {
    this.clienteHttp.get<Reserva[]>('/mock-reservas-lista.json').subscribe({
      next: (datos) => {
        if (datos) {
          this.reservas.set(datos);
        }
      }
    });
  }

  // Cambiar pestaña activa.
  seleccionarTab(tab: 'proximas' | 'anteriores' | 'canceladas'): void {
    this.tabSeleccionada.set(tab);
  }

  // Cancelar reserva.
  cancelarReserva(id: number): void {
    if (confirm('¿Estás seguro de que deseas cancelar esta reserva?')) {
      this.reservas.update((lista) =>
        lista.map((r) => {
          if (r.id === id) {
            return { ...r, tipo: 'canceladas', estado: 'CANCELADA' };
          }
          return r;
        })
      );
    }
  }

  // Ir al sitio de la empresa.
  irAlSitio(id: number): void {
    const reservaEncontrada = this.reservas().find((r) => r.id === id);
    if (reservaEncontrada) {
      this.enrutador.navigate([`/empresa/${id}/seleccionar-servicio`]);
    }
  }

  // Unirse a videollamada.
  unirseVideollamada(id: number): void {
    this.enrutador.navigate(['/pre-videollamada']);
  }

  // Buscar servicios.
  buscarServicios(): void {
    this.enrutador.navigate(['/']);
  }
}
