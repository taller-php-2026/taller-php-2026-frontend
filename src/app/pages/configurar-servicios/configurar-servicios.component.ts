import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { environment } from '@env/environment';

@Component({
  selector: 'app-configurar-servicios',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './configurar-servicios.component.html',
  styleUrl: './configurar-servicios.component.css'
})
export class ConfigurarServiciosComponent implements OnInit {
  private router = inject(Router);
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  servicios = signal<any[]>([]);
  cargando = signal<boolean>(true);

  tieneServiciosBase = computed(() => this.servicios().some(s => !s.esPaquete));

  ngOnInit(): void {
    this.cargarServicios();
  }

  cargarServicios(): void {
    const idProf = this.authService.currentUser()?.idUsuario;
    if (!idProf) {
      this.cargando.set(false);
      return;
    }
    this.cargando.set(true);

    this.http.get<any>(`${environment.apiUrl}/servicios/buscar?idProfesional=${idProf}`).subscribe({
      next: (res) => {
        const list = res.data || [];
        const mapped = list.map((s: any) => ({
          idServicio: s.idServicio,
          nombre: s.nombre,
          precio: s.precio,
          duracionMinutos: s.duracionMinutos,
          fotoUrl: s.imagenUrl || '',
          esPaquete: !!s.paquete_servicio,
          totalSesiones: s.paquete_servicio ? s.paquete_servicio.totalSesiones : 0,
        }));
        this.servicios.set(mapped);
        this.cargando.set(false);
      },
      error: () => {
        console.error('Error al cargar servicios');
        this.cargando.set(false);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  goToAdd(): void {
    this.router.navigate(['/anadir-servicio']);
  }

  goToAddPaquete(): void {
    this.router.navigate(['/anadir-paquete']);
  }

  goToEdit(id: number): void {
    this.router.navigate(['/editar-servicio'], { queryParams: { id } });
  }

  getIcon(nombre: string): string {
    const n = nombre.toLowerCase();
    if (n.includes('corte') || n.includes('barba')) return 'content_cut';
    if (n.includes('facial') || n.includes('tratamiento')) return 'spa';
    if (n.includes('color') || n.includes('tin')) return 'palette';
    return 'settings';
  }

  getIconClass(nombre: string): string {
    const n = nombre.toLowerCase();
    if (n.includes('corte') || n.includes('barba')) return 'bg-emerald-100 text-emerald-800';
    if (n.includes('facial') || n.includes('tratamiento')) return 'bg-purple-100 text-purple-800';
    if (n.includes('color') || n.includes('tin')) return 'bg-amber-100 text-amber-800';
    return 'bg-sky-100 text-sky-800';
  }

  formatDuration(minutos: number): string {
    const hrs = Math.floor(minutos / 60);
    const mins = minutos % 60;
    
    if (hrs > 0 && mins > 0) {
      return `${hrs} ${hrs === 1 ? 'Hora' : 'Horas'} ${mins} Min`;
    } else if (hrs > 0) {
      return `${hrs} ${hrs === 1 ? 'Hora' : 'Horas'}`;
    } else {
      return `${mins} Min`;
    }
  }
}
