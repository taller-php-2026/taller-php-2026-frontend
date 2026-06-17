import { Component, ElementRef, ViewChild, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '@env/environment';
import { AuthService } from '../../services/auth.service';
import { Reserva } from '../../models/reserva.model';

@Component({
  selector: 'app-booking-detail-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './booking-detail-modal.html',
  styleUrls: ['./booking-detail-modal.css']
})
export class BookingDetailModalComponent {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  @ViewChild('dialogEl') dialogEl!: ElementRef<HTMLDialogElement>;

  reserva = signal<Reserva | null>(null);
  cargando = signal<boolean>(false);
  error = signal<string | null>(null);

  open(idReserva: number): void {
    this.reserva.set(null);
    this.error.set(null);
    this.cargando.set(true);

    // Open native dialog modal
    this.dialogEl.nativeElement.showModal();

    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    });

    this.http.get<{ data: Reserva }>(`${environment.apiUrl}/reservas/${idReserva}`, { headers }).subscribe({
      next: (res) => {
        this.reserva.set(res.data);
        this.cargando.set(false);
      },
      error: (err) => {
        console.error('Error fetching reservation details:', err);
        this.error.set('No se pudieron obtener los detalles de la reserva.');
        this.cargando.set(false);
      }
    });
  }

  close(): void {
    this.dialogEl.nativeElement.close();
  }

  // Fallback trigger for light dismiss (clicking on the backdrop)
  onBackdropClick(event: MouseEvent): void {
    const dialog = this.dialogEl.nativeElement;
    // Only dismiss if the click is directly on the dialog wrapper (backdrop)
    if (event.target === dialog) {
      const rect = dialog.getBoundingClientRect();
      const isInsideContent = (
        rect.top <= event.clientY &&
        event.clientY <= rect.top + rect.height &&
        rect.left <= event.clientX &&
        event.clientX <= rect.left + rect.width
      );

      if (!isInsideContent) {
        this.close();
      }
    }
  }
}
