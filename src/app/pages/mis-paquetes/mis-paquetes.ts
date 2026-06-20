import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { PaqueteComprado, PaqueteReserva } from 'app/models/paquete.model';
import { BookingStateService } from 'app/services/booking-state.service';
import { PaquetesService } from 'app/services/paquetes.service';
import { ScheduleService } from 'app/services/schedule.service';
import { ServicesService } from 'app/services/services.service';
import { ReservaService } from 'app/services/reserva.service';
import { Slot } from 'app/models/schedule.model';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

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
  private scheduleService = inject(ScheduleService);
  private servicesService = inject(ServicesService);
  private reservaService = inject(ReservaService);

  paquetes = signal<PaqueteComprado[]>([]);
  loading = signal(false);
  errorMsg = signal('');
  pestanaActiva = signal<'activos' | 'anteriores'>('activos');

  getPaquetesActivos(): PaqueteComprado[] {
    return this.paquetes().filter(p => p.estado !== 'agotado' && p.estado !== 'cancelado' && Number(p.sesionesRestantes) > 0);
  }

  getPaquetesAnteriores(): PaqueteComprado[] {
    return this.paquetes().filter(p => p.estado === 'agotado' || p.estado === 'cancelado' || Number(p.sesionesRestantes) <= 0);
  }

  // Estados del modal de reserva
  modalOpen = signal(false);
  modalPaquete = signal<PaqueteComprado | null>(null);
  modalServicios = signal<any[]>([]);
  modalServicioSeleccionado = signal<any | null>(null);
  modalProfesionales = signal<any[]>([]);
  modalProfesionalSeleccionado = signal<any | null>(null);
  currentMonth = signal<Date>(new Date());
  emptyDays: any[] = [];
  daysInMonth: Array<{ date: Date; dayNum: number; dateString: string; hasSlots: boolean }> = [];
  selectedDate = signal<Date | null>(null);
  slots = signal<Slot[]>([]);
  selectedSlot = signal<Slot | null>(null);
  diasConDisponibilidad = signal<Set<string>>(new Set());
  loadingSlots = signal(false);
  reserving = signal(false);

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

  getNombre(paquete: any): string {
    const pServ = paquete.paquete_servicio ?? paquete.paqueteServicio;
    return pServ?.servicio?.nombre ?? 'Paquete de servicio';
  }

  getDescripcion(paquete: any): string {
    const pServ = paquete.paquete_servicio ?? paquete.paqueteServicio;
    return pServ?.servicio?.descripcion ?? 'Sesiones compradas';
  }

  getImagen(paquete: any): string {
    const pServ = paquete.paquete_servicio ?? paquete.paqueteServicio;
    return (
      pServ?.imagenUrl ||
      pServ?.servicio?.imagenUrl ||
      '/assets/placeholders/service-placeholder.svg'
    );
  }

  getPrecio(paquete: PaqueteComprado): string {
    return `$${Number(paquete.precioCompra || 0).toFixed(2)}`;
  }

  getFechaCompra(paquete: PaqueteComprado): string {
    return paquete.fechaCompra?.split(' ')[0] ?? '';
  }

  getModalidad(paquete: any): string {
    const pServ = paquete.paquete_servicio ?? paquete.paqueteServicio;
    const mainMod = pServ?.servicio?.modalidad;
    const comunes = pServ?.servicios_comunes ?? pServ?.serviciosComunes ?? [];
    
    const modalities = new Set<string>();
    if (mainMod) modalities.add(mainMod);
    comunes.forEach((c: any) => {
      if (c.servicio?.modalidad) {
        modalities.add(c.servicio.modalidad);
      }
    });

    if (modalities.has('virtual') && (modalities.has('presencial') || modalities.has('hibrida'))) {
      return 'Híbrida';
    }
    if (modalities.has('presencial') && modalities.has('hibrida')) {
      return 'Híbrida';
    }
    if (modalities.has('virtual')) return 'Virtual';
    if (modalities.has('hibrida')) return 'Híbrida';
    return 'Presencial';
  }

  getServiciosIncluidos(paquete: any): string {
    const pServ = paquete.paquete_servicio ?? paquete.paqueteServicio;
    const servicios = (pServ?.servicios_comunes ?? pServ?.serviciosComunes)
      ?.map((item: any) => item.servicio?.nombre)
      .filter(Boolean);

    if (servicios?.length) return servicios.join(', ');
    return pServ?.servicio?.nombre ?? 'Servicio incluido';
  }

  getServiciosDetalle(paquete: any): any[] {
    const pServ = paquete.paquete_servicio ?? paquete.paqueteServicio;
    const list: any[] = [];
    if (pServ?.servicio) {
      list.push(pServ.servicio);
    }
    const comunes = pServ?.servicios_comunes ?? pServ?.serviciosComunes ?? [];
    comunes.forEach((c: any) => {
      if (c.servicio) {
        if (!list.some(s => s.idServicio === c.servicio.idServicio)) {
          list.push(c.servicio);
        }
      }
    });
    return list;
  }

  getDireccionText(servicio: any): string {
    const u = servicio?.ubicacion;
    return u ? `${u.direccion ?? ''}, ${u.ciudad ?? ''}` : '';
  }

  getDireccionLink(servicio: any): string {
    const text = this.getDireccionText(servicio);
    return text ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(text)}` : '';
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

  // Reservar sesión usando el paquete.
  reservarConPaquete(paquete: any): void {
    this.abrirModalReservar(paquete);
  }

  // Métodos del modal de reserva
  abrirModalReservar(paquete: any): void {
    this.modalPaquete.set(paquete);
    this.selectedDate.set(null);
    this.selectedSlot.set(null);
    this.slots.set([]);
    this.diasConDisponibilidad.set(new Set());
    this.errorMsg.set('');

    const pServ = paquete.paquete_servicio ?? paquete.paqueteServicio;
    const list: any[] = [];
    if (pServ?.servicio) {
      list.push(pServ.servicio);
    }
    const comunes = pServ?.servicios_comunes ?? pServ?.serviciosComunes ?? [];
    comunes.forEach((c: any) => {
      if (c.servicio) {
        if (!list.some(s => s.idServicio === c.servicio.idServicio)) {
          list.push(c.servicio);
        }
      }
    });
    this.modalServicios.set(list);

    if (list.length > 0) {
      this.seleccionarServicioModal(list[0]);
    }

    this.currentMonth.set(new Date());
    this.modalOpen.set(true);
  }

  seleccionarServicioModal(service: any): void {
    this.modalServicioSeleccionado.set(service);
    this.modalProfesionalSeleccionado.set(null);
    this.modalProfesionales.set([]);
    this.selectedDate.set(null);
    this.selectedSlot.set(null);
    this.slots.set([]);
    this.diasConDisponibilidad.set(new Set());

    this.servicesService.getProfessionalsByService(service.idServicio).subscribe({
      next: (resp) => {
        const profs = resp.data ?? [];
        this.modalProfesionales.set(profs);
        if (profs.length > 0) {
          this.modalProfesionalSeleccionado.set(profs[0]);
          this.generarCalendario();
        }
      }
    });
  }

  prevMonth(): void {
    const d = new Date(this.currentMonth());
    d.setMonth(d.getMonth() - 1);
    this.currentMonth.set(d);
    this.generarCalendario();
  }

  nextMonth(): void {
    const d = new Date(this.currentMonth());
    d.setMonth(d.getMonth() + 1);
    this.currentMonth.set(d);
    this.generarCalendario();
  }

  getMonthYearLabel(): string {
    const date = this.currentMonth();
    return date.toLocaleDateString('es-UY', { month: 'long', year: 'numeric' });
  }

  generarCalendario(): void {
    const date = this.currentMonth();
    const year = date.getFullYear();
    const month = date.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay();
    this.emptyDays = Array.from({ length: firstDayIndex });

    const totalDays = new Date(year, month + 1, 0).getDate();
    const days: any[] = [];
    for (let i = 1; i <= totalDays; i++) {
      const d = new Date(year, month, i);
      const dateString = this.formatDateKey(d);
      days.push({
        date: d,
        dayNum: i,
        dateString,
        hasSlots: this.diasConDisponibilidad().has(dateString)
      });
    }
    this.daysInMonth = days;
    this.cargarDisponibilidadMes();
  }

  isPast(date: Date): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  }

  getDayClass(day: any): string {
    const isSelected = this.selectedDate() && this.formatDateKey(this.selectedDate()!) === day.dateString;
    const isPast = this.isPast(day.date);
    
    let base = "w-9 h-9 flex flex-col items-center justify-center text-xs relative rounded-full transition-colors ";
    
    if (isPast) {
      base += "text-gray-300 cursor-not-allowed";
    } else if (isSelected) {
      base += "bg-primary text-white font-bold shadow-md cursor-pointer";
    } else if (day.hasSlots) {
      base += "bg-primary/10 text-primary font-bold border border-primary/20 cursor-pointer hover:bg-primary hover:text-white";
    } else {
      base += "text-on-surface hover:bg-surface-container-high cursor-pointer";
    }
    
    return base;
  }

  selectCalendarDate(date: Date): void {
    this.selectedDate.set(date);
    this.selectedSlot.set(null);
    this.slots.set([]);
    this.errorMsg.set('');

    const service = this.modalServicioSeleccionado();
    const prof = this.modalProfesionalSeleccionado();
    if (!service || !prof) return;

    const fecha = this.formatDateKey(date);
    this.loadingSlots.set(true);
    this.scheduleService.getSlots(prof.idUsuario, fecha, service.idServicio).subscribe({
      next: (response) => {
        this.slots.set(response.data.slots_disponibles);
        this.loadingSlots.set(false);
      },
      error: () => {
        this.loadingSlots.set(false);
      }
    });
  }

  cargarDisponibilidadMes(): void {
    const service = this.modalServicioSeleccionado();
    const prof = this.modalProfesionalSeleccionado();
    if (!service || !prof) return;

    const date = this.currentMonth();
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonthCount = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const datesToFetch: string[] = [];
    for (let day = 1; day <= daysInMonthCount; day++) {
      const d = new Date(year, month, day);
      if (d >= today) {
        datesToFetch.push(this.formatDateKey(d));
      }
    }

    if (datesToFetch.length === 0) return;

    forkJoin(
      datesToFetch.map((fStr) =>
        this.scheduleService.getSlots(prof.idUsuario, fStr, service.idServicio).pipe(
          catchError(() => of(null))
        )
      )
    ).subscribe((responses) => {
      const set = new Set<string>();
      responses.forEach((resp) => {
        if (resp && resp.data && resp.data.slots_disponibles && resp.data.slots_disponibles.length > 0) {
          set.add(resp.data.fecha);
        }
      });
      this.diasConDisponibilidad.set(set);
      this.daysInMonth = this.daysInMonth.map((d) => ({
        ...d,
        hasSlots: set.has(d.dateString)
      }));
    });
  }

  confirmarReservaModal(): void {
    const paquete = this.modalPaquete();
    const service = this.modalServicioSeleccionado();
    const prof = this.modalProfesionalSeleccionado();
    const slot = this.selectedSlot();
    const date = this.selectedDate();

    if (!paquete || !service || !prof || !slot || !date) {
      this.errorMsg.set('Faltan datos para confirmar la reserva.');
      return;
    }

    this.reserving.set(true);
    this.errorMsg.set('');

    const payload = {
      idServicio: service.idServicio,
      fecha: this.formatDateKey(date),
      horaInicio: slot.horaInicio,
      idPaqueteComprado: paquete.idPaqueteComprado
    };

    this.reservaService.crearReserva(prof.idUsuario, payload).subscribe({
      next: () => {
        this.reserving.set(false);
        this.modalOpen.set(false);
        this.cargarPaquetes();
      },
      error: (err) => {
        this.reserving.set(false);
        this.errorMsg.set(err.error?.message ?? 'No se pudo crear la reserva.');
      }
    });
  }

  cerrarModal(): void {
    this.modalOpen.set(false);
    this.modalPaquete.set(null);
  }

  private formatDateKey(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Redirigir al checkout de Mercado Pago.
  pagarPaquete(paquete: PaqueteComprado): void {
    this.loading.set(true);
    this.errorMsg.set('');
    this.paquetesService.crearPreferenciaMercadoPagoPaquete(paquete.idPaqueteComprado).subscribe({
      next: (mpResponse) => {
        const checkoutUrl = mpResponse.data?.checkout_url;
        if (checkoutUrl) {
          window.location.href = checkoutUrl;
          return;
        }
        this.loading.set(false);
        this.errorMsg.set('No se recibió la URL de pago de Mercado Pago.');
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMsg.set(this.getErrorMessage(err, 'No se pudo iniciar el proceso de pago.'));
      }
    });
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
