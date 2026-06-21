import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

const apiUrl = environment.apiUrl;

@Component({
  selector: 'app-calificar-profesional',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './calificar-profesional.html',
  styleUrl: './calificar-profesional.css',
})
export class CalificarProfesional implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);

  reservaId = signal<number | null>(null);
  profesionalNombre = signal<string>('');
  servicioNombre = signal<string>('');
  fecha = signal<string>('');
  precio = signal<number>(0);
  rating = signal<number>(0);
  ratingLabel = signal<string>('');
  comentario = signal<string>('');
  charCount = signal<number>(0);

  labels = ['', 'Muy Pobre', 'Regular', 'Bueno', 'Muy Bueno', 'Excelente'];

  // Inicializar componente.
  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.reservaId.set(Number(id));
      this.cargarReserva(Number(id));
    }
  }

  // Cargar datos de la reserva.
  cargarReserva(id: number): void {
    this.http.get<any>(`${apiUrl}/reservas/${id}`).subscribe({
      next: (response) => {
        const reserva = response.data;
        this.profesionalNombre.set(
          reserva.profesional?.usuario?.nombre ?? reserva.profesional?.nombreNegocio ?? '',
        );
        this.servicioNombre.set(reserva.servicio?.nombre ?? '');
        this.fecha.set(reserva.horario?.fecha ?? '');
        this.precio.set(reserva.servicio?.precio ?? 0);
      },
      error: () => {
        alert('No se pudo cargar la información de la reserva.');
        this.router.navigate(['/reservas']);
      },
    });
  }

  // Establecer calificacion.
  setRating(valor: number): void {
    this.rating.set(valor);
    this.ratingLabel.set(this.labels[valor]);
  }

  // Actualizar contador de caracteres.
  updateCount(): void {
    this.charCount.set(this.comentario().length);
  }

  // Enviar calificacion.
  enviarCalificacion(): void {
    if (this.rating() === 0) {
      alert('Por favor selecciona una calificación de estrellas.');
      return;
    }

    const payload = {
      calificacion: this.rating(),
      comentario: this.comentario(),
    };

    const url = `${apiUrl}/reservas/${this.reservaId()}/resena`;

    this.http.post(url, payload).subscribe({
      next: () => {
        alert('¡Gracias por calificar el servicio!');
        this.router.navigate(['/reservas']);
      },
      error: (err) => {
        const mensaje: string = err.error?.message ?? '';

        if (mensaje.toLowerCase().includes('ya') && mensaje.toLowerCase().includes('resen')) {
          alert('Esta reserva ya ha sido calificada.');
        } else if (mensaje) {
          alert(mensaje);
        } else {
          alert('Ocurrió un error al enviar la calificación.');
        }
        this.router.navigate(['/reservas']);
      },
    });
  }

  // Cancelar y volver.
  cancelar(): void {
    this.router.navigate(['/reservas']);
  }
}
