import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

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

  idReserva = this.route.snapshot.paramMap.get('id') ?? '';
  status: PaymentStatus = this.normalizeStatus(this.route.snapshot.queryParamMap.get('status'));

  title = computed(() => {
    switch (this.status) {
      case 'approved':
        return 'Pago aprobado';
      case 'pending':
        return 'Pago pendiente de confirmacion';
      case 'failure':
      case 'rejected':
        return 'El pago no pudo completarse';
      default:
        return 'Estamos confirmando tu pago';
    }
  });

  message = computed(() => {
    switch (this.status) {
      case 'approved':
        return 'Mercado Pago aprobo la operacion. Si tu reserva aun aparece pendiente, espera unos segundos mientras el sistema recibe la confirmacion.';
      case 'pending':
        return 'Tu pago quedo pendiente. Te avisaremos cuando Mercado Pago confirme el resultado final.';
      case 'failure':
      case 'rejected':
        return 'No se aprobo el pago. Puedes revisar tus reservas y volver a intentar desde el flujo de reserva.';
      default:
        return 'Recibimos el retorno de Mercado Pago y estamos esperando la confirmacion final.';
    }
  });

  statusLabel = computed(() => {
    switch (this.status) {
      case 'approved':
        return 'Aprobado';
      case 'pending':
        return 'Pendiente';
      case 'failure':
        return 'Fallido';
      case 'rejected':
        return 'Rechazado';
      default:
        return 'En revision';
    }
  });

  statusClass = computed(() => {
    switch (this.status) {
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

  private normalizeStatus(status: string | null): PaymentStatus {
    if (status === 'approved' || status === 'pending' || status === 'failure' || status === 'rejected') {
      return status;
    }

    return 'unknown';
  }
}
