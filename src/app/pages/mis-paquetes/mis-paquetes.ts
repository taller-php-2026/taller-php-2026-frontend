import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { PaqueteComprado, PaqueteReserva } from 'app/models/paquete.model';
import { BookingStateService } from 'app/services/booking-state.service';
import { PaquetesService } from 'app/services/paquetes.service';

@Component({
  selector: 'app-mis-paquetes',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './mis-paquetes.html',
})
export class MisPaquetes implements OnInit {
  private paquetesService = inject(PaquetesService);
  private bookingState = inject(BookingStateService);
  private router = inject(Router);

  paquetes = signal<PaqueteComprado[]>([]);
  loading = signal(false);
  errorMsg = signal('');

  ngOnInit(): void {
    this.cargarPaquetes();
  }

  cargarPaquetes(): void {
    this.loading.set(true);
    this.errorMsg.set('');

    this.paquetesService.getMisPaquetes().subscribe({
      next: (response) => {
        this.paquetes.set(response.data ?? []);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMsg.set(this.getErrorMessage(err, 'No se pudieron cargar tus paquetes.'));
      },
    });
  }

  getNombre(paquete: PaqueteComprado): string {
    return paquete.paqueteServicio?.servicio?.nombre ?? 'Paquete de servicio';
  }

  getDescripcion(paquete: PaqueteComprado): string {
    return paquete.paqueteServicio?.servicio?.descripcion ?? 'Sesiones compradas';
  }

  getImagen(paquete: PaqueteComprado): string {
    return (
      paquete.paqueteServicio?.imagenUrl ||
      paquete.paqueteServicio?.servicio?.imagenUrl ||
      '/assets/placeholders/service-placeholder.svg'
    );
  }

  getPrecio(paquete: PaqueteComprado): string {
    return `$${Number(paquete.precioCompra || 0).toFixed(2)}`;
  }

  getFechaCompra(paquete: PaqueteComprado): string {
    return paquete.fechaCompra?.split(' ')[0] ?? '';
  }

  getModalidad(paquete: PaqueteComprado): string {
    const modalidad = paquete.paqueteServicio?.servicio?.modalidad;
    if (modalidad === 'virtual') return 'Virtual';
    if (modalidad === 'hibrida') return 'Híbrida';
    return 'Presencial';
  }

  getServiciosIncluidos(paquete: PaqueteComprado): string {
    const servicios = paquete.paqueteServicio?.serviciosComunes
      ?.map((item) => item.servicio?.nombre)
      .filter(Boolean);

    if (servicios?.length) return servicios.join(', ');
    return paquete.paqueteServicio?.servicio?.nombre ?? 'Servicio incluido';
  }

  getReservas(paquete: PaqueteComprado): PaqueteReserva[] {
    return paquete.reservas ?? [];
  }

  getFechaReserva(reserva: PaqueteReserva): string {
    const fechaTexto = reserva.horario?.fecha ?? reserva.fechaReserva?.split(' ')[0];
    if (!fechaTexto) return 'Fecha no disponible';

    const [year, month, day] = fechaTexto.split('-').map(Number);
    const fecha = new Date(year, month - 1, day);
    return fecha.toLocaleDateString('es-UY', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  getHoraReserva(reserva: PaqueteReserva): string {
    return reserva.horario?.horaInicio?.slice(0, 5) ?? reserva.fechaReserva?.slice(11, 16) ?? '--:--';
  }

  getProfesionalReserva(reserva: PaqueteReserva): string {
    return reserva.profesional?.nombreNegocio || reserva.profesional?.usuario?.nombre || 'Profesional';
  }

  getModalidadReserva(reserva: PaqueteReserva): string {
    const modalidad = reserva.servicio?.modalidad;
    if (modalidad === 'virtual') return 'Virtual';
    if (modalidad === 'hibrida') return 'Híbrida';
    return 'Presencial';
  }

  puedeUnirse(reserva: PaqueteReserva): boolean {
    const modalidad = reserva.servicio?.modalidad;
    return (modalidad === 'virtual' || modalidad === 'hibrida') && ['confirmada', 'enCurso'].includes(reserva.estado);
  }

  unirseVideollamada(reserva: PaqueteReserva): void {
    this.router.navigate(['/pre-videollamada'], { queryParams: { reserva: reserva.idReserva } });
  }

  estaActivo(paquete: PaqueteComprado): boolean {
    return paquete.estado === 'activo' && Number(paquete.sesionesRestantes) > 0;
  }

  reservarConPaquete(paquete: PaqueteComprado): void {
    const idServicio = paquete.paqueteServicio?.servicio?.idServicio ?? paquete.paqueteServicio?.idServicio;
    if (!idServicio) {
      this.errorMsg.set('No se pudo encontrar el servicio asociado a este paquete.');
      return;
    }

    this.bookingState.setSelectedPaqueteComprado(paquete);
    this.router.navigate([`/servicio/${idServicio}/seleccionar-profesional`]);
  }

  onImgError(event: Event): void {
    (event.target as HTMLImageElement).src = '/assets/placeholders/service-placeholder.svg';
  }

  private getErrorMessage(err: { status?: number; error?: { message?: string } }, fallback: string): string {
    if (err.status === 401) return 'Tu sesion expiro. Volve a iniciar sesion.';
    if (err.status === 403) return 'No tenes permisos para ver estos paquetes.';
    return err.error?.message ?? fallback;
  }
}
