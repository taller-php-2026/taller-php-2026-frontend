import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

interface Reserva {
  idReserva: number;
  idCliente: number;
  idProfesional: number;
  idServicio: number;
  idHorario: number;
  idPago: number | null;
  fechaReserva: string;
  estado: 'pendiente' | 'confirmada' | 'cancelada' | 'completada' | 'enCurso';
  comentarios?: string;
  servicio?: {
    idServicio: number;
    nombre: string;
    precio: number;
    modalidad: 'presencial' | 'virtual' | 'hibrida';
  };
  cliente?: {
    usuario?: {
      nombre: string;
      email: string;
    };
  };
}

@Component({
  selector: 'app-metricas-profesional',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './metricas-profesional.html',
  styleUrl: './metricas-profesional.css',
})
export class MetricasProfesional implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);
  protected authService = inject(AuthService);
  protected Math = Math;

  // Reservas del profesional
  reservas = signal<Reserva[]>([]);
  resenas = signal<any[]>([]);
  cargando = signal<boolean>(true);

  // Filtro temporal
  filtroTemporal = signal<'30' | '90' | '365'>('30');

  // Filtrar reservas por fecha (según el filtro seleccionado)
  reservasFiltradasPorFecha = computed(() => {
    const limiteDias = Number(this.filtroTemporal());
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() - limiteDias);

    return this.reservas().filter((r) => {
      const fechaRes = new Date(r.fechaReserva);
      return fechaRes >= fechaLimite;
    });
  });

  // Métricas calculadas
  totalReservas = computed(() => this.reservasFiltradasPorFecha().length);

  reservasCompletadas = computed(() => {
    return this.reservasFiltradasPorFecha().filter((r) => r.estado === 'completada').length;
  });

  reservasCanceladas = computed(() => {
    return this.reservasFiltradasPorFecha().filter((r) => r.estado === 'cancelada').length;
  });

  reservasPendientes = computed(() => {
    return this.reservasFiltradasPorFecha().filter(
      (r) => r.estado === 'pendiente' || r.estado === 'confirmada' || r.estado === 'enCurso'
    ).length;
  });

  ingresosTotales = computed(() => {
    return this.reservasFiltradasPorFecha()
      .filter((r) => r.estado === 'completada' || r.estado === 'confirmada')
      .reduce((sum, r) => sum + Number(r.servicio?.precio || 0), 0);
  });

  // Tasa de completitud (turnos completados / turnos totales)
  tasaCompletitud = computed(() => {
    const total = this.totalReservas();
    if (total === 0) return 0;
    return Math.round((this.reservasCompletadas() / total) * 100);
  });

  // Promedio de reseñas real del backend
  promedioRating = computed(() => {
    const lista = this.resenas();
    if (lista.length === 0) return 0.0; // Mostrar 0.0 si no hay reseñas reales
    const suma = lista.reduce((sum, r) => sum + Number(r.calificacion || 0), 0);
    return Math.round((suma / lista.length) * 10) / 10;
  });

  // Agrupamiento para gráficos y listados
  // Distribución por Modalidad de Servicio
  modalidadStats = computed(() => {
    const stats = { presencial: 0, virtual: 0, hibrido: 0 };
    this.reservasFiltradasPorFecha().forEach((r) => {
      const mod = r.servicio?.modalidad;
      if (mod === 'presencial') stats.presencial++;
      else if (mod === 'virtual') stats.virtual++;
      else if (mod === 'hibrida') stats.hibrido++;
    });
    return stats;
  });

  // Distribución de Ingresos por Servicio
  ingresosPorServicio = computed(() => {
    const map = new Map<string, number>();
    this.reservasFiltradasPorFecha()
      .filter((r) => r.estado === 'completada' || r.estado === 'confirmada')
      .forEach((r) => {
        const nombre = r.servicio?.nombre || 'Otro';
        const precio = Number(r.servicio?.precio || 0);
        map.set(nombre, (map.get(nombre) || 0) + precio);
      });

    // Ordenar y devolver array
    return Array.from(map.entries())
      .map(([nombre, monto]) => ({ nombre, monto }))
      .sort((a, b) => b.monto - a.monto)
      .slice(0, 4); // Top 4
  });

  // Porcentaje del ingreso por servicio (para las barras de progreso)
  porcentajeIngreso(monto: number): number {
    const total = this.ingresosTotales();
    if (total === 0) return 0;
    return Math.round((monto / total) * 100);
  }

  // Distribución Semanal de Operaciones (Lunes a Domingo)
  operacionesSemanales = computed(() => {
    const completadas = [0, 0, 0, 0, 0, 0, 0]; // Lun a Dom
    const canceladas = [0, 0, 0, 0, 0, 0, 0];

    this.reservasFiltradasPorFecha().forEach((r) => {
      const fecha = new Date(r.fechaReserva);
      // getDay() devuelve 0 para domingo, 1 lunes, etc.
      let diaIndex = fecha.getDay() - 1;
      if (diaIndex === -1) diaIndex = 6; // Domingo al final

      if (r.estado === 'completada') {
        completadas[diaIndex]++;
      } else if (r.estado === 'cancelada') {
        canceladas[diaIndex]++;
      }
    });

    // Encontrar el valor máximo para escalar la altura de las barras (max 100%)
    const maxVal = Math.max(...completadas, ...canceladas, 1);

    return [
      { nombre: 'Lun', completadas: completadas[0], canceladas: canceladas[0], pct: Math.round((completadas[0] / maxVal) * 100) },
      { nombre: 'Mar', completadas: completadas[1], canceladas: canceladas[1], pct: Math.round((completadas[1] / maxVal) * 100) },
      { nombre: 'Mié', completadas: completadas[2], canceladas: canceladas[2], pct: Math.round((completadas[2] / maxVal) * 100) },
      { nombre: 'Jue', completadas: completadas[3], canceladas: canceladas[3], pct: Math.round((completadas[3] / maxVal) * 100) },
      { nombre: 'Vie', completadas: completadas[4], canceladas: canceladas[4], pct: Math.round((completadas[4] / maxVal) * 100) },
      { nombre: 'Sáb', completadas: completadas[5], canceladas: canceladas[5], pct: Math.round((completadas[5] / maxVal) * 100) },
      { nombre: 'Dom', completadas: completadas[6], canceladas: canceladas[6], pct: Math.round((completadas[6] / maxVal) * 100) },
    ];
  });

  ngOnInit(): void {
    this.cargarDatos();
  }

  // Cargar reservas y reseñas desde el backend
  cargarDatos(): void {
    this.cargando.set(true);
    const profId = this.authService.currentUser()?.idUsuario;

    this.http.get<{ data: Reserva[] }>('http://127.0.0.1:8000/api/reservas').subscribe({
      next: (res) => {
        if (res && res.data) {
          const filtradas = res.data.filter((r) => r.idProfesional === profId);
          this.reservas.set(filtradas);
        }
        
        // Cargar reseñas para el profesional
        this.http.get<any[]>('http://127.0.0.1:8000/api/resenas').subscribe({
          next: (resenasList) => {
            if (resenasList) {
              const filtradasResenas = resenasList.filter((r) => r.idProfesional === profId);
              this.resenas.set(filtradasResenas);
            }
            this.cargando.set(false);
          },
          error: () => {
            this.cargando.set(false);
          }
        });
      },
      error: () => {
        this.cargando.set(false);
      },
    });
  }

  // Cambiar filtro de días
  cambiarFiltro(event: Event): void {
    const val = (event.target as HTMLSelectElement).value as '30' | '90' | '365';
    this.filtroTemporal.set(val);
  }

  // Volver a la página principal
  volver(): void {
    this.router.navigate(['/']);
  }
}
