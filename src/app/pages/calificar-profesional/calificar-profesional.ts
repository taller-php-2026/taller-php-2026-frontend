import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-calificar-profesional',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './calificar-profesional.html',
  styleUrl: './calificar-profesional.css'
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
    this.http.get<any[]>('/mock-reservas-lista.json').subscribe({
      next: (datos) => {
        const reserva = datos.find((r) => r.id === id);
        if (reserva) {
          this.profesionalNombre.set(reserva.profesionalNombre);
          this.servicioNombre.set(reserva.servicioNombre);
          this.fecha.set(reserva.fecha);
          this.precio.set(reserva.duracionMinutos ? reserva.duracionMinutos * 0.75 : 45.00);
        }
      }
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
      comentario: this.comentario()
    };

    const url = `http://127.0.0.1:8000/api/reservas/${this.reservaId()}/resena`;

    this.http.post(url, payload).subscribe({
      next: () => {
        alert('¡Gracias por calificar el servicio!');
        this.router.navigate(['/reservas']);
      },
      error: (err) => {
        if (err.status === 422 || err.error?.message?.includes('duplicate')) {
          alert('Esta reserva ya ha sido calificada.');
        } else {
          alert('Ocurrió un error al enviar la calificación.');
        }
        this.router.navigate(['/reservas']);
      }
    });
  }

  // Cancelar y volver.
  cancelar(): void {
    this.router.navigate(['/reservas']);
  }
}
