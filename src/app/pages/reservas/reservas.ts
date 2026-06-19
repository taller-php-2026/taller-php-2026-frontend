import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Reserva } from 'app/models/reserva.model';
import { PaqueteComprado } from 'app/models/paquete.model';
import { PaquetesService } from 'app/services/paquetes.service';
import { ReservaService } from 'app/services/reserva.service';

type ReservaTab = 'proximas' | 'anteriores' | 'canceladas';
type BadgeKind = 'success' | 'warning' | 'danger' | 'neutral';
type PageSizeOption = '5' | '10' | 'all';

@Component({
  selector: 'app-reservas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reservas.html',
  styleUrl: './reservas.css',
})
export class Reservas implements OnInit {
  private router = inject(Router);
  private reservaService = inject(ReservaService);
  private paquetesService = inject(PaquetesService);

  reservas = signal<Reserva[]>([]);
  paquetes = signal<PaqueteComprado[]>([]);
  loading = signal(false);
  loadingPaquetes = signal(false);
  errorMsg = signal('');
  errorPaquetes = signal('');
  successMsg = signal('');
  pagandoId = signal<number | null>(null);
  reservaACancelar = signal<Reserva | null>(null);
  cancelandoReserva = signal(false);
  errorCancelacion = signal('');
  tabSeleccionada = signal<ReservaTab>('proximas');
  cantidadPorPagina = signal<PageSizeOption>('5');
  paginaActual = signal(1);

  reservasFiltradas = computed(() =>
    this.reservas().filter((reserva) => this.clasificarReserva(reserva) === this.tabSeleccionada()),
  );

  totalPaginas = computed(() => {
    const pageSize = this.getPageSizeNumber();
    if (!pageSize) return 1;
    return Math.max(1, Math.ceil(this.reservasFiltradas().length / pageSize));
  });

  mostrarPaginado = computed(() => {
    const pageSize = this.getPageSizeNumber();
    return !!pageSize && this.reservasFiltradas().length > pageSize;
  });

  reservasPaginadas = computed(() => {
    const reservas = this.reservasFiltradas();
    const pageSize = this.getPageSizeNumber();
    if (!pageSize) return reservas;

    const start = (this.paginaActual() - 1) * pageSize;
    return reservas.slice(start, start + pageSize);
  });

  ngOnInit(): void {
    this.cargarReservas();
    this.cargarPaquetes();
  }

  cargarReservas(): void {
    this.loading.set(true);
    this.errorMsg.set('');
    this.successMsg.set('');

    this.reservaService.getMisReservas().subscribe({
      next: (response) => {
        this.reservas.set(response.data ?? []);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMsg.set(err.error?.message ?? 'No se pudieron cargar tus reservas.');
      },
    });
  }

  cargarPaquetes(): void {
    this.loadingPaquetes.set(true);
    this.errorPaquetes.set('');

    this.paquetesService.getMisPaquetes().subscribe({
      next: (response) => {
        this.paquetes.set(response.data ?? []);
        this.loadingPaquetes.set(false);
      },
      error: (err) => {
        this.loadingPaquetes.set(false);
        this.errorPaquetes.set(err.error?.message ?? 'No se pudieron cargar tus paquetes.');
      },
    });
  }

  seleccionarTab(tab: ReservaTab): void {
    this.tabSeleccionada.set(tab);
    this.paginaActual.set(1);
  }

  cambiarCantidad(event: Event): void {
    const value = (event.target as HTMLSelectElement).value as PageSizeOption;
    this.cantidadPorPagina.set(value);
    this.paginaActual.set(1);
  }

  paginaAnterior(): void {
    this.paginaActual.update((page) => Math.max(1, page - 1));
  }

  paginaSiguiente(): void {
    this.paginaActual.update((page) => Math.min(this.totalPaginas(), page + 1));
  }

  private getPageSizeNumber(): number | null {
    const value = this.cantidadPorPagina();
    return value === 'all' ? null : Number(value);
  }

  clasificarReserva(reserva: Reserva): ReservaTab {
    if (reserva.estado === 'cancelada') {
      return 'canceladas';
    }

    const fecha = this.getReservaDateTime(reserva);
    return fecha.getTime() < Date.now() ? 'anteriores' : 'proximas';
  }

  getServicioImagen(reserva: Reserva): string {
    return (
      reserva.servicio?.imagenUrl ||
      reserva.paqueteComprado?.paqueteServicio?.servicio?.imagenUrl ||
      '/assets/placeholders/service-placeholder.svg'
    );
  }

  getServicioNombre(reserva: Reserva): string {
    return (
      reserva.servicio?.nombre ??
      reserva.paqueteComprado?.paqueteServicio?.servicio?.nombre ??
      'Servicio'
    );
  }

  getProfesionalNombre(reserva: Reserva): string {
    return (
      reserva.profesional?.nombreNegocio || reserva.profesional?.usuario?.nombre || 'Profesional'
    );
  }

  getFecha(reserva: Reserva): string {
    const fecha = this.parseLocalDate(this.getReservaDateString(reserva));
    return fecha.toLocaleDateString('es-UY', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  getHora(reserva: Reserva): string {
    return reserva.horario?.horaInicio?.slice(0, 5) ?? reserva.fechaReserva.slice(11, 16);
  }

  getDuracion(reserva: Reserva): string {
    const duracion =
      reserva.servicio?.duracionMinutos ??
      reserva.paqueteComprado?.paqueteServicio?.servicio?.duracionMinutos;
    return duracion ? `${duracion} min` : '';
  }

  getModalidad(reserva: Reserva): string {
    const modalidad =
      reserva.servicio?.modalidad ??
      reserva.paqueteComprado?.paqueteServicio?.servicio?.modalidad ??
      'presencial';
    if (modalidad === 'virtual') return 'Online';
    if (modalidad === 'hibrida') return 'Hibrida';
    return 'Presencial';
  }

  esVirtual(reserva: Reserva): boolean {
    const modalidad =
      reserva.servicio?.modalidad ?? reserva.paqueteComprado?.paqueteServicio?.servicio?.modalidad;
    return modalidad === 'virtual' || modalidad === 'hibrida';
  }

  getMonto(reserva: Reserva): string {
    const monto = reserva.pago?.monto ?? reserva.servicio?.precio;
    if (monto === undefined || monto === null || monto === '') return 'Sin monto';
    return `$${Number(monto).toFixed(2)}`;
  }

  getMetodoPago(reserva: Reserva): string {
    return reserva.pago?.metodoPago ?? 'Sin pago registrado';
  }

  getPagoDetalle(reserva: Reserva): string {
    if (reserva.paqueteComprado || reserva.idPaqueteComprado) {
      return 'Pagada con paquete';
    }

    if (reserva.pago?.estado === 'pendiente') {
      return 'Mercado Pago esta validando tu pago';
    }

    return `Pago: ${this.getMetodoPago(reserva)} - ${this.getMonto(reserva)}`;
  }

  getPaqueteNombre(paquete: PaqueteComprado): string {
    return paquete.paqueteServicio?.servicio?.nombre ?? 'Paquete de servicio';
  }

  getPaqueteImagen(paquete: PaqueteComprado): string {
    return (
      paquete.paqueteServicio?.imagenUrl ||
      paquete.paqueteServicio?.servicio?.imagenUrl ||
      '/assets/placeholders/service-placeholder.svg'
    );
  }

  getPaqueteSesiones(paquete: PaqueteComprado): string {
    const disponibles = Number(paquete.sesionesRestantes ?? 0);
    const total = Number(paquete.totalSesiones ?? paquete.paqueteServicio?.totalSesiones ?? 0);
    const usadas = Number(paquete.sesionesUsadas ?? 0);

    return `${disponibles} de ${total} disponibles · ${usadas} usadas`;
  }

  getPaqueteReservas(paquete: PaqueteComprado): any[] {
    return paquete.reservas ?? [];
  }

  getReservaPaqueteTexto(reserva: Reserva): string {
    const paquete = reserva.paqueteComprado;
    const servicio = paquete?.paqueteServicio?.servicio?.nombre ?? this.getServicioNombre(reserva);
    const total = paquete?.totalSesiones ?? paquete?.paqueteServicio?.totalSesiones;
    const restantes = paquete?.sesionesRestantes;

    if (total !== undefined && restantes !== undefined) {
      return `Paquete: ${servicio} - ${restantes} de ${total} sesiones disponibles`;
    }

    return `Paquete: ${servicio}`;
  }

  getBadge(reserva: Reserva): { text: string; kind: BadgeKind } {
    if (reserva.estado === 'cancelada') {
      return { text: 'Cancelada', kind: 'neutral' };
    }

    if (reserva.pago?.estado === 'rechazado') {
      return { text: 'Pago rechazado', kind: 'danger' };
    }

    if (reserva.pago?.estado === 'pendiente') {
      return { text: 'Pago pendiente', kind: 'warning' };
    }

    if (reserva.estado === 'confirmada' || reserva.pago?.estado === 'aprobado') {
      return { text: 'Confirmada', kind: 'success' };
    }

    if (reserva.estado === 'pendiente') {
      return { text: 'Pendiente de pago', kind: 'warning' };
    }

    return { text: reserva.estado, kind: 'neutral' };
  }

  getBadgeClass(reserva: Reserva): string {
    const classes: Record<BadgeKind, string> = {
      success: 'bg-emerald-100 text-emerald-800',
      warning: 'bg-amber-100 text-amber-800',
      danger: 'bg-red-100 text-red-700',
      neutral: 'bg-gray-100 text-gray-700',
    };

    return classes[this.getBadge(reserva).kind];
  }

  puedePagar(reserva: Reserva): boolean {
    if (reserva.paqueteComprado || reserva.idPaqueteComprado) return false;
    if (reserva.estado === 'cancelada') return false;
    if (this.clasificarReserva(reserva) === 'anteriores') return false;

    return reserva.estado === 'pendiente' || reserva.pago?.estado === 'rechazado';
  }

  puedeCancelar(reserva: Reserva): boolean {
    if (reserva.estado === 'cancelada') return false;
    if (this.clasificarReserva(reserva) === 'anteriores') return false;

    return reserva.estado === 'pendiente' || reserva.estado === 'confirmada';
  }

  puedeUnirseVideollamada(reserva: Reserva): boolean {
    if (reserva.estado === 'cancelada') return false;
    if (this.clasificarReserva(reserva) === 'anteriores') return false;
    if (!this.esVirtual(reserva)) return false;

    return reserva.estado === 'confirmada';
  }

  puedeCalificar(reserva: Reserva): boolean {
    if (reserva.estado === 'cancelada') return false;
    if (this.clasificarReserva(reserva) !== 'anteriores') return false;

    const estadosValidos = ['finalizada', 'completada', 'realizada'];
    return estadosValidos.includes(reserva.estado);
  }

  irACalificar(reservaId: number): void {
    this.router.navigate(['/calificar'], { queryParams: { reserva: reservaId } });
  }

  textoBotonPago(reserva: Reserva): string {
    return reserva.pago?.estado === 'rechazado' ? 'Reintentar pago' : 'Pagar ahora';
  }

  pagarReserva(reserva: Reserva): void {
    this.pagandoId.set(reserva.idReserva);
    this.errorMsg.set('');
    this.successMsg.set('');

    this.reservaService.crearPreferenciaMercadoPago(reserva.idReserva).subscribe({
      next: (response) => {
        const checkoutUrl = response.data?.checkout_url;
        if (checkoutUrl) {
          window.location.href = checkoutUrl;
          return;
        }

        this.pagandoId.set(null);
        this.errorMsg.set('No se recibio la URL de pago.');
      },
      error: (err) => {
        this.pagandoId.set(null);
        this.errorMsg.set(err.error?.message ?? 'No se pudo iniciar el pago.');
      },
    });
  }

  abrirModalCancelacion(reserva: Reserva): void {
    this.reservaACancelar.set(reserva);
    this.errorCancelacion.set('');
    this.successMsg.set('');
  }

  cerrarModalCancelacion(): void {
    if (this.cancelandoReserva()) {
      return;
    }

    this.reservaACancelar.set(null);
    this.errorCancelacion.set('');
  }

  confirmarCancelacion(): void {
    const reserva = this.reservaACancelar();
    if (!reserva) {
      return;
    }

    this.cancelandoReserva.set(true);
    this.errorCancelacion.set('');
    this.successMsg.set('');

    this.reservaService.cancelarReserva(reserva.idReserva).subscribe({
      next: (response) => {
        const reservaActualizada = response.data?.reserva;
        if (reservaActualizada) {
          this.reservas.update((reservas) =>
            reservas.map((item) =>
              item.idReserva === reservaActualizada.idReserva ? reservaActualizada : item,
            ),
          );
        } else {
          this.reservas.update((reservas) =>
            reservas.map((item) =>
              item.idReserva === reserva.idReserva
                ? { ...item, estado: 'cancelada', comentarios: 'Cancelada por el usuario' }
                : item,
            ),
          );
        }

        this.cancelandoReserva.set(false);
        this.reservaACancelar.set(null);
        this.successMsg.set(response.message ?? 'Reserva cancelada correctamente.');
      },
      error: (err) => {
        this.cancelandoReserva.set(false);
        this.errorCancelacion.set(this.getMensajeErrorCancelacion(err));
      },
    });
  }

  private getMensajeErrorCancelacion(err: {
    status?: number;
    error?: { message?: string };
  }): string {
    switch (err.status) {
      case 401:
        return 'Tu sesión expiró. Volvé a iniciar sesión.';
      case 403:
        return 'No tenés permisos para cancelar esta reserva.';
      case 404:
        return 'No se encontró la reserva.';
      case 422:
        return err.error?.message ?? 'No se pudo cancelar la reserva.';
      case 500:
        return 'Ocurrió un error al cancelar la reserva.';
      default:
        return err.error?.message ?? 'No se pudo cancelar la reserva.';
    }
  }

  unirseVideollamada(idReserva: number): void {
    this.router.navigate(['/pre-videollamada'], { queryParams: { reserva: idReserva } });
  }

  esCalificada(reserva: Reserva): boolean {
    return !!reserva.resena;
  }

  buscarServicios(): void {
    this.router.navigate(['/']);
  }

  private getReservaDateString(reserva: Reserva): string {
    return reserva.horario?.fecha ?? reserva.fechaReserva;
  }

  private getReservaTimeString(reserva: Reserva): string | undefined {
    return reserva.horario?.horaInicio ?? this.extractTimePart(reserva.fechaReserva);
  }

  private getReservaDateTime(reserva: Reserva): Date {
    return this.parseLocalDateTime(
      this.getReservaDateString(reserva),
      this.getReservaTimeString(reserva),
    );
  }

  private parseLocalDate(dateString: string): Date {
    const dateOnly = this.extractDatePart(dateString);
    const [year, month, day] = dateOnly.split('-').map(Number);

    return new Date(year, month - 1, day);
  }

  private parseLocalDateTime(dateString: string, timeString?: string): Date {
    const dateOnly = this.extractDatePart(dateString);
    const [year, month, day] = dateOnly.split('-').map(Number);
    const timeOnly = (timeString ?? this.extractTimePart(dateString) ?? '00:00:00').split(
      /[Z+-]/,
    )[0];
    const [hour = 0, minute = 0, second = 0] = timeOnly.split(':').map(Number);

    return new Date(year, month - 1, day, hour || 0, minute || 0, second || 0);
  }

  private extractDatePart(dateString: string): string {
    return dateString.split(' ')[0].split('T')[0];
  }

  private extractTimePart(dateString: string): string | undefined {
    return dateString.includes('T') ? dateString.split('T')[1] : dateString.split(' ')[1];
  }
}
