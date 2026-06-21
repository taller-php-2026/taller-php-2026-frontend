import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from 'app/services/auth.service';
import { environment } from '@env/environment';

@Component({
  selector: 'app-resenas-profesional',
  templateUrl: './resenas-profesional.html',
  standalone: true,
  imports: [CommonModule],
})
export class ResenasProfesional implements OnInit {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private router = inject(Router);

  resenas = signal<any[]>([]);
  loading = signal<boolean>(true);
  error = signal<string>('');

  // Inicializar componente.
  ngOnInit(): void {
    this.cargarResenas();
  }

  // Cargar reseñas asociadas al profesional actual.
  cargarResenas(): void {
    const user = this.authService.currentUser();
    if (!user) {
      this.error.set('No se pudo identificar al usuario.');
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    this.error.set('');

    const url = `${environment.apiUrl}/resenas?idProfesional=${user.idUsuario}`;
    this.http.get<any[]>(url).subscribe({
      next: (data) => {
        this.resenas.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar tus opiniones.');
        this.loading.set(false);
      },
    });
  }

  // Volver a la pantalla de inicio.
  volver(): void {
    this.router.navigate(['/']);
  }
}
