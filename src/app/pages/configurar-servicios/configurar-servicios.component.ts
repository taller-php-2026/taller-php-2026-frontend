import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-configurar-servicios',
  standalone: true,
  imports: [],
  templateUrl: './configurar-servicios.component.html',
  styleUrl: './configurar-servicios.component.css'
})
export class ConfigurarServiciosComponent {
  private router = inject(Router);
  private http = inject(HttpClient);

  servicios = toSignal(this.http.get<any[]>('/mock-servicios.json'), { initialValue: [] });

  goBack() {
    this.router.navigate(['/']);
  }

  goToAdd() {
    this.router.navigate(['/anadir-servicio']);
  }

  goToEdit(id: number) {
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
