import { Component, inject, signal, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { Service } from 'app/models/service.model';
import { ServicesService } from 'app/services/services.service';
import { BookingStateService } from 'app/services/booking-state.service';
import { ReservaService } from 'app/services/reserva.service';
import { NgIcon } from '@ng-icons/core';
import { StepsComponent } from '@components/steps/steps.component';
import { Layout } from '@shared/layout/layout.component';

@Component({
  selector: 'app-pago',
  standalone: true,
  imports: [FormsModule, CurrencyPipe, NgIcon, StepsComponent, Layout],
  templateUrl: './pago.component.html',
  styleUrl: './pago.component.css',
})
export class PagoSeguroComponent implements OnInit {
  private router = inject(Router);
  private servicesService = inject(ServicesService);
  private bookingState = inject(BookingStateService);
  private reservaService = inject(ReservaService);
  private cdr = inject(ChangeDetectorRef);

  serviceId: string | null = null;
  service: Service | null = null;

  paymentStatus = signal<
    'selector' | 'formulario_tarjeta' | 'efectivo' | 'procesando' | 'exito'
  >('selector');

  transactionStatus = signal<'approved' | 'pending' | 'rejected'>('approved');

  selectedMethod = signal<'mercadopago' | 'tarjeta_credito' | 'tarjeta_debito' | 'efectivo' | null>(
    null,
  );
  cashProvider = signal<'abitab' | 'redpagos'>('abitab');

  errorMsg = signal('');

  // Tarjeta: siempre usa el formulario propio (sin MP Brick)
  useFallbackForm = signal(true);
  fallbackCard = { number: '', name: '', expiry: '', cvv: '' };

  reservation = {
    serviceName: '',
    duration: '',
    professionalName: '',
    professionalRole: '',
    date: '',
    time: '',
    subtotal: 0,
    tax: 0,
    total: 0,
  };

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    if (!this.bookingState.createdReserva) {
      this.router.navigate(['/']);
      return;
    }
    this.buildReservationSummary();
    this.route.paramMap.subscribe((params) => {
      this.serviceId = params.get('id');
      this.servicesService.getServiceById(this.serviceId!).subscribe((response) => {
        this.service = response.data;
        this.cdr.detectChanges();
      });
    });
  }

  private buildReservationSummary() {
    const svc = this.bookingState.selectedService;
    const prof = this.bookingState.selectedProfessional;
    const slot = this.bookingState.selectedSlot;
    const date = this.bookingState.selectedDate;
    const reserva = this.bookingState.createdReserva;

    const serviceName = svc?.nombre ?? reserva?.servicioNombre ?? '';
    const duracion = svc?.duracionMinutos ?? slot?.duracionMinutos ?? 0;
    const precio = svc?.precio ?? reserva?.precio ?? 0;
    const profName = prof?.usuario?.nombre ?? prof?.nombreNegocio ?? '';
    const profRole = prof?.descripcion ?? '';
    const fechaStr = date
      ? date.toLocaleDateString('es-UY', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
      : (reserva?.fechaReserva ?? '');
    const timeStr = slot?.horaInicio ?? reserva?.horarioInicio ?? this.bookingState.selectedTime ?? '';
    const tax = +(precio * 0.22).toFixed(2);

    this.reservation = {
      serviceName,
      duration: duracion ? `${duracion} min` : '',
      professionalName: profName,
      professionalRole: profRole,
      date: fechaStr,
      time: timeStr,
      subtotal: precio,
      tax,
      total: +(precio + tax).toFixed(2),
    };
  }

  /** Envía el pago real a POST /api/reservas/{idReserva}/pagar */
  private submitPago(metodoPago: string): void {
    const reserva = this.bookingState.createdReserva;
    const idReserva = (reserva as any)?.reserva?.idReserva ?? reserva?.idReserva;
    if (!idReserva) {
      this.errorMsg.set('No se encontró la reserva. Volvé al inicio.');
      this.paymentStatus.set('selector');
      return;
    }

    this.paymentStatus.set('procesando');
    this.errorMsg.set('');

    this.reservaService.pagarReserva(idReserva, { metodoPago }).subscribe({
      next: () => {
        this.transactionStatus.set('approved');
        this.paymentStatus.set('exito');
      },
      error: (err) => {
        const msg =
          err.error?.message ??
          (String(Object.values(err.error?.errors ?? {}).flat().join(' ')) || 'Error al procesar el pago.');
        this.errorMsg.set(msg);
        this.paymentStatus.set('selector');
      },
    });
  }

  selectMethodOption(
    option: 'mercadopago' | 'tarjeta_credito' | 'tarjeta_debito' | 'efectivo',
  ) {
    this.selectedMethod.set(option);
    this.errorMsg.set('');

    if (option === 'tarjeta_credito' || option === 'tarjeta_debito') {
      this.paymentStatus.set('formulario_tarjeta');
    } else if (option === 'efectivo') {
      this.paymentStatus.set('efectivo');
    } else if (option === 'mercadopago') {
      this.iniciarCheckoutPro();
    }
  }

  /** Llama POST /api/reservas/{id}/mercadopago → redirige a checkout_url de MercadoPago */
  iniciarCheckoutPro(): void {
    const reserva = this.bookingState.createdReserva;
    const idReserva = (reserva as any)?.reserva?.idReserva ?? reserva?.idReserva;

    console.log('[Pago] Iniciando Checkout Pro');
    console.log('[Pago] createdReserva', reserva);
    console.log('[Pago] idReserva', idReserva);

    if (!idReserva) {
      this.errorMsg.set('No se encontró la reserva. Volvé al inicio para repetir el flujo.');
      return;
    }

    this.paymentStatus.set('procesando');
    this.errorMsg.set('');

    this.reservaService.crearPreferenciaMercadoPago(idReserva).subscribe({
      next: (res) => {
        console.log('[Pago] respuesta preferencia', res);
        const checkoutUrl = res.data?.checkout_url;
        if (checkoutUrl) {
          window.location.href = checkoutUrl;
        } else {
          this.errorMsg.set('No se recibió la URL de pago. Intenta de nuevo.');
          this.paymentStatus.set('selector');
        }
      },
      error: (err) => {
        console.error('[Pago] error preferencia', err);
        const msg =
          err.error?.message ??
          (String(Object.values(err.error?.errors ?? {}).flat().join(' ')) || 'Error al crear la preferencia de pago.');
        this.errorMsg.set(msg);
        this.paymentStatus.set('selector');
      },
    });
  }

  async submitFallbackPayment() {
    this.submitPago(this.selectedMethod() ?? 'tarjeta_credito');
  }

  selectCashProvider(provider: 'abitab' | 'redpagos') {
    this.cashProvider.set(provider);
  }

  submitCashPayment() {
    this.submitPago('efectivo');
  }

  submitWalletPayment() {
    this.iniciarCheckoutPro();
  }

  resetToSelector() {
    this.paymentStatus.set('selector');
    this.selectedMethod.set(null);
    this.errorMsg.set('');
    this.fallbackCard = { number: '', name: '', expiry: '', cvv: '' };
  }

  volverAlInicio(): void {
    this.router.navigate(['/']);
  }

  goBack() {
    if (this.paymentStatus() !== 'selector') {
      this.resetToSelector();
    } else {
      this.router.navigate(['/']);
    }
  }
}
