import { ChangeDetectorRef, Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Layout } from '@shared/layout/layout.component';
import { StepsComponent } from '@components/steps/steps.component';
import { Calendar } from './components/calendar/calendar.component';
import { ScheduleService } from 'app/services/schedule.service';
import { BookingStateService } from 'app/services/booking-state.service';
import { ReservaService } from 'app/services/reserva.service';
import { Slot } from 'app/models/schedule.model';
import { NgClass } from '@angular/common';
import { Service } from 'app/models/service.model';
import { ServicesService } from 'app/services/services.service';
import { NgIcon } from '@ng-icons/core';
import { catchError, forkJoin, of } from 'rxjs';
import { PaquetesService } from 'app/services/paquetes.service';
import { PaqueteComprado } from 'app/models/paquete.model';

@Component({
  selector: 'app-select-time-date',
  templateUrl: './select-time-date.component.html',
  imports: [Layout, StepsComponent, Calendar, NgClass, NgIcon],
})
export class SelectTimeDateComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private scheduleService = inject(ScheduleService);
  private serviceService = inject(ServicesService);
  private reservaService = inject(ReservaService);
  private paquetesService = inject(PaquetesService);
  private bookingState = inject(BookingStateService);
  private cdr = inject(ChangeDetectorRef);

  serviceId: string | null = null;
  service: Service | null = null;
  slots: Slot[] = [];
  selectedDate: Date | null = null;
  selectedSlot: Slot | null = null;
  misPaquetes: PaqueteComprado[] = [];
  paqueteSeleccionado: PaqueteComprado | null = null;
  diasConDisponibilidad = new Set<string>();

  loadingReserva = signal(false);
  errorReserva = signal('');
  cargandoPaquetes = signal(false);
  errorPaquetes = signal('');

  onVisibleMonthChanged(month: { year: number; month: number }) {
    this.cargarDiasConDisponibilidad(month.year, month.month);
  }

  onDateSelected(date: Date) {
    this.selectedDate = date;
    this.errorReserva.set('');

    const profId = this.bookingState.professionalId;
    const svcId = this.bookingState.serviceId;

    if (!profId || !svcId) {
      this.router.navigate(['/']);
      return;
    }

    const fecha = this.formatDateKey(date);
    this.scheduleService.getSlots(profId, fecha, svcId).subscribe((response) => {
      this.slots = response.data.slots_disponibles;
      this.actualizarDiaConDisponibilidad(response.data.fecha, this.slots.length > 0);
      this.cdr.detectChanges();
    });
  }

  selectSlot(slot: Slot) {
    this.selectedSlot = slot;
    this.bookingState.setSelectedSlot(slot);
    this.bookingState.selectedTime = slot.horaInicio;
    this.bookingState.selectedDate = this.selectedDate;
    this.errorReserva.set('');
  }

  goToNextStep() {
    if (!this.selectedSlot || !this.selectedDate) return;

    const profId = this.bookingState.professionalId;
    const svcId = this.bookingState.serviceId;

    if (!profId || !svcId) {
      this.errorReserva.set('Faltan datos del profesional o servicio. Volvé al inicio.');
      return;
    }

    if (!this.selectedSlot.horaInicio) {
      this.errorReserva.set('No se pudo determinar el horario seleccionado.');
      return;
    }

    this.loadingReserva.set(true);
    this.errorReserva.set('');

    const fecha = this.formatDateKey(this.selectedDate); // YYYY-MM-DD

    const payload = {
      idServicio: svcId,
      fecha,
      horaInicio: this.selectedSlot.horaInicio,
    };

    const paqueteUsado = this.paqueteSeleccionado;
    if (paqueteUsado) {
      Object.assign(payload, { idPaqueteComprado: paqueteUsado.idPaqueteComprado });
    }

    this.reservaService.crearReserva(profId, payload).subscribe({
      next: (res) => {
        const reserva = res.data ?? (res as unknown as import('app/models/reserva.model').ReservaCreada);
        this.bookingState.setCreatedReserva(reserva);
        this.bookingState.setSelectedPaqueteComprado(paqueteUsado);
        this.loadingReserva.set(false);
        this.router.navigate([paqueteUsado ? '/reservas' : `/servicio/${this.serviceId}/pago`]);
      },
      error: (err) => {
        this.loadingReserva.set(false);
        if (err.error?.message) {
          this.errorReserva.set(err.error.message);
        } else if (err.status === 422 && err.error?.errors) {
          const msgs = Object.values(err.error.errors as Record<string, string[]>)
            .flat()
            .join(' ');
          this.errorReserva.set(msgs);
        } else {
          this.errorReserva.set('No se pudo crear la reserva. Intenta con otro horario.');
        }
      },
    });
  }

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      this.serviceId = params.get('id');

      this.serviceService.getServiceById(this.serviceId!).subscribe((response) => {
        this.service = response.data;
        this.bookingState.setSelectedService(response.data);
        this.cargarPaquetesCliente();
        this.cdr.detectChanges();
      });
    });
  }

  paquetesDisponiblesParaServicio(): PaqueteComprado[] {
    const idServicio = Number(this.bookingState.serviceId ?? this.service?.idServicio);
    if (!idServicio) return [];

    return this.misPaquetes.filter((paquete: any) => {
      const pServ = paquete.paquete_servicio ?? paquete.paqueteServicio;
      const paqueteIdServicio = Number(
        pServ?.servicio?.idServicio ?? pServ?.idServicio,
      );

      return (
        paquete.estado === 'activo' &&
        Number(paquete.sesionesRestantes) > 0 &&
        paqueteIdServicio === idServicio
      );
    });
  }

  seleccionarPaquete(paquete: PaqueteComprado | null): void {
    this.paqueteSeleccionado = paquete;
    this.bookingState.setSelectedPaqueteComprado(paquete);
    this.errorReserva.set('');
  }

  getPaqueteLabel(paquete: PaqueteComprado): string {
    const restantes = Number(paquete.sesionesRestantes);
    return `${restantes} ${restantes === 1 ? 'sesion disponible' : 'sesiones disponibles'}`;
  }

  private cargarPaquetesCliente(): void {
    this.cargandoPaquetes.set(true);
    this.errorPaquetes.set('');

    this.paquetesService.getMisPaquetes().subscribe({
      next: (response) => {
        this.misPaquetes = response.data ?? [];
        this.cargandoPaquetes.set(false);

        const disponibles = this.paquetesDisponiblesParaServicio();
        const paqueteGuardado = this.bookingState.selectedPaqueteComprado;
        const paqueteDisponible = paqueteGuardado
          ? disponibles.find((paquete) => paquete.idPaqueteComprado === paqueteGuardado.idPaqueteComprado)
          : null;

        if (paqueteDisponible) {
          this.seleccionarPaquete(paqueteDisponible);
        } else if (disponibles.length === 1) {
          this.seleccionarPaquete(disponibles[0]);
        } else if (this.paqueteSeleccionado && !disponibles.some((paquete) => paquete.idPaqueteComprado === this.paqueteSeleccionado?.idPaqueteComprado)) {
          this.seleccionarPaquete(null);
        }

        this.cdr.detectChanges();
      },
      error: (err) => {
        this.cargandoPaquetes.set(false);
        if (err.status !== 401) {
          this.errorPaquetes.set(err.error?.message ?? 'No se pudieron cargar tus paquetes.');
        }
      },
    });
  }

  private cargarDiasConDisponibilidad(year: number, month: number): void {
    const profId = this.bookingState.professionalId;
    const svcId = this.bookingState.serviceId;

    if (!profId || !svcId) {
      this.diasConDisponibilidad = new Set<string>();
      return;
    }

    const fechas = this.getFechasDelMes(year, month);
    if (fechas.length === 0) {
      this.diasConDisponibilidad = new Set<string>();
      return;
    }

    forkJoin(
      fechas.map((fecha) =>
        this.scheduleService.getSlots(profId, fecha, svcId).pipe(
          catchError(() => of(null)),
        ),
      ),
    ).subscribe((responses) => {
      const disponibles = new Set<string>();

      responses.forEach((response) => {
        const fecha = response?.data?.fecha;
        const slotsDisponibles = response?.data?.slots_disponibles ?? [];

        if (fecha && slotsDisponibles.length > 0) {
          disponibles.add(fecha);
        }
      });

      this.diasConDisponibilidad = disponibles;
      this.cdr.detectChanges();
    });
  }

  private actualizarDiaConDisponibilidad(fecha: string, tieneDisponibilidad: boolean): void {
    const dias = new Set(this.diasConDisponibilidad);

    if (tieneDisponibilidad) {
      dias.add(fecha);
    } else {
      dias.delete(fecha);
    }

    this.diasConDisponibilidad = dias;
  }

  private getFechasDelMes(year: number, month: number): string[] {
    const daysInMonth = new Date(year, month, 0).getDate();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const fechas: string[] = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day);
      date.setHours(0, 0, 0, 0);

      if (date >= today) {
        fechas.push(this.formatDateKey(date));
      }
    }

    return fechas;
  }

  private formatDateKey(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}

