import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';

type PaymentStatus = 'approved' | 'pending' | 'failure' | 'rejected' | 'unknown';

@Component({
  selector: 'app-reserva-confirmacion',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './reserva-confirmacion.component.html',
  styleUrl: './reserva-confirmacion.component.css',
})
export class ReservaConfirmacionComponent {
  private route = inject(ActivatedRoute);

  idReserva = toSignal(this.route.paramMap.pipe(map((params) => params.get('id') ?? '')), {
    initialValue: '',
  });

  private rawStatus = toSignal(
    this.route.queryParamMap.pipe(map((params) => params.get('status'))),
    { initialValue: null },
  );

  status = computed<PaymentStatus>(() => {
    const s = this.rawStatus();
    if (s === 'approved' || s === 'pending' || s === 'failure' || s === 'rejected') {
      return s;
    }
    return 'unknown';
  });

  title = computed(() => {
    switch (this.status()) {
      case 'approved':
        return 'Pago aprobado';
      case 'pending':
        return 'Pago pendiente de confirmación';
      case 'failure':
      case 'rejected':
        return 'El pago no pudo completarse';
      default:
        return 'Estamos confirmando tu pago';
    }
  });

  message = computed(() => {
    switch (this.status()) {
      case 'approved':
        return 'Mercado Pago aprobó la operación. Si tu reserva aún aparece pendiente, espera unos segundos mientras el sistema recibe la confirmación.';
      case 'pending':
        return 'Tu pago quedó pendiente. Te avisaremos cuando Mercado Pago confirme el resultado final.';
      case 'failure':
      case 'rejected':
        return 'No se aprobó el pago. Puedes revisar tus reservas y volver a intentar desde el flujo de reserva.';
      default:
        return 'Recibimos el retorno de Mercado Pago y estamos esperando la confirmación final.';
    }
  });

  statusLabel = computed(() => {
    switch (this.status()) {
      case 'approved':
        return 'Aprobado';
      case 'pending':
        return 'Pendiente';
      case 'failure':
        return 'Fallido';
      case 'rejected':
        return 'Rechazado';
      default:
        return 'En revisión';
    }
  });

  statusClass = computed(() => {
    switch (this.status()) {
      case 'approved':
        return 'status-approved';
      case 'pending':
        return 'status-pending';
      case 'failure':
      case 'rejected':
        return 'status-rejected';
      default:
        return 'status-unknown';
    }
  });
}
