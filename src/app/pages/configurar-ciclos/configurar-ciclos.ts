import { Component, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-configurar-ciclos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './configurar-ciclos.html',
  styleUrl: './configurar-ciclos.css',
})
export class ConfigurarCiclosComponent implements OnInit {
  private router = inject(Router);
  private http = inject(HttpClient);

  // Listar ciclos.
  ciclos = signal<any[]>([]);

  // Listar servicios.
  servicios = signal<any[]>([]);

  // Inicializar componente.
  ngOnInit(): void {
    this.cargarDatos();
  }

  // Cargar ciclos y servicios.
  cargarDatos(): void {
    this.http.get<any[]>('/mock-ciclo-agenda.json').subscribe((datosCiclos) => {
      this.ciclos.set(datosCiclos || []);
    });
    this.http.get<any[]>('/mock-servicios.json').subscribe((datosServicios) => {
      this.servicios.set(datosServicios || []);
    });
  }

  // Volver a inicio.
  goBack(): void {
    this.router.navigate(['/']);
  }

  // Redirigir a crear ciclo.
  goToAdd(): void {
    this.router.navigate(['/crear-ciclo-agenda']);
  }

  // Redirigir a editar ciclo.
  goToEdit(id: number): void {
    this.router.navigate(['/editar-ciclo-agenda'], { queryParams: { id } });
  }

  // Obtener texto de bloques.
  formatBloques(bloques: any[]): string {
    if (!bloques || bloques.length === 0) return 'Sin bloques';
    return bloques.map((b) => `${b.inicio} - ${b.fin}`).join(', ');
  }

  // Obtener nombres de servicios asociados.
  obtenerNombresServicios(serviciosIds: number[]): string {
    if (!serviciosIds || serviciosIds.length === 0) return 'Ninguno';
    return this.servicios()
      .filter((s) => serviciosIds.includes(s.idServicio))
      .map((s) => s.nombre)
      .join(', ');
  }
}
