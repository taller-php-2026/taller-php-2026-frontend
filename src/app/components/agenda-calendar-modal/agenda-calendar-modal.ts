import { Component, ElementRef, ViewChild, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '@env/environment';
import { AuthService } from '../../services/auth.service';
import { BookingDetailModalComponent } from '../booking-detail-modal/booking-detail-modal';

@Component({
  selector: 'app-agenda-calendar-modal',
  standalone: true,
  imports: [CommonModule, BookingDetailModalComponent],
  templateUrl: './agenda-calendar-modal.html',
  styleUrls: ['./agenda-calendar-modal.css']
})
export class AgendaCalendarModalComponent implements OnInit {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  @ViewChild('dialogEl') dialogEl!: ElementRef<HTMLDialogElement>;
  @ViewChild(BookingDetailModalComponent) bookingModal!: BookingDetailModalComponent;

  // Calendario
  currentDate = new Date();
  days: (number | null)[] = [];
  selectedDay: number | null = null;
  monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  // Datos
  reservations = signal<any[]>([]);
  bookedDays = signal<Set<string>>(new Set());
  filteredReservations = signal<any[]>([]);
  cargando = signal<boolean>(false);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.generateCalendar();
  }

  open(): void {
    this.selectedDay = null;
    this.filteredReservations.set([]);
    this.dialogEl.nativeElement.showModal();
    this.cargarReservas();
  }

  close(): void {
    this.dialogEl.nativeElement.close();
  }

  cargarReservas(): void {
    this.cargando.set(true);
    this.error.set(null);

    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    });

    this.http.get<{ data: any[] }>(`${environment.apiUrl}/me/profesional/reservas`, { headers }).subscribe({
      next: (res) => {
        this.reservations.set(res.data || []);
        
        // Extraer dias con agenda
        const dates = new Set<string>();
        res.data.forEach((r: any) => {
          const dateStr = r.horario?.fecha || r.fechaReserva?.substring(0, 10);
          if (dateStr) {
            dates.add(dateStr);
          }
        });
        this.bookedDays.set(dates);
        this.cargando.set(false);

        // Si hay un día actual o seleccionado, cargar sus reservas
        const today = new Date();
        if (this.currentDate.getFullYear() === today.getFullYear() && this.currentDate.getMonth() === today.getMonth()) {
          this.selectDay(today.getDate());
        }
      },
      error: (err) => {
        console.error('Error al cargar reservas:', err);
        this.error.set('No se pudieron obtener las reservas de la agenda.');
        this.cargando.set(false);
      }
    });
  }

  getCurrentMonthName(): string {
    return `${this.monthNames[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
  }

  generateCalendar(): void {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Rellenar días anteriores con null para cuadrar la grilla
    this.days = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  }

  prevMonth(): void {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1);
    this.selectedDay = null;
    this.filteredReservations.set([]);
    this.generateCalendar();
  }

  nextMonth(): void {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1);
    this.selectedDay = null;
    this.filteredReservations.set([]);
    this.generateCalendar();
  }

  selectDay(day: number): void {
    this.selectedDay = day;
    const selectedDateStr = this.formatDateKey(day);

    const filtered = this.reservations().filter((r: any) => {
      const rDate = r.horario?.fecha || r.fechaReserva?.substring(0, 10);
      return rDate === selectedDateStr;
    }).sort((a: any, b: any) => {
      const timeA = a.horario?.horaInicio || '00:00';
      const timeB = b.horario?.horaInicio || '00:00';
      return timeA.localeCompare(timeB);
    });

    this.filteredReservations.set(filtered);
  }

  hasBookings(day: number): boolean {
    return this.bookedDays().has(this.formatDateKey(day));
  }

  getDayClasses(day: number | null): object {
    if (day === null) return {};
    const selected = day === this.selectedDay;
    const booked = this.hasBookings(day);

    return {
      'rounded-full': true,
      'cursor-pointer hover:bg-primary hover:text-white transition-colors': true,
      'bg-primary/10 text-primary font-bold border border-primary/20': booked && !selected,
      'bg-primary text-white font-bold shadow-md': selected,
      'text-on-surface': !booked && !selected
    };
  }

  verDetalleTurno(idReserva: number): void {
    this.bookingModal.open(idReserva);
  }

  onBackdropClick(event: MouseEvent): void {
    const dialog = this.dialogEl.nativeElement;
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

  private formatDateKey(day: number): string {
    const year = this.currentDate.getFullYear();
    const month = String(this.currentDate.getMonth() + 1).padStart(2, '0');
    const dayText = String(day).padStart(2, '0');
    return `${year}-${month}-${dayText}`;
  }
}
