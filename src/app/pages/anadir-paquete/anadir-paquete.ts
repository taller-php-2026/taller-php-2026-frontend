import { Component, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-anadir-paquete',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './anadir-paquete.html',
  styleUrl: './anadir-paquete.css',
})
export class AnadirPaqueteComponent implements OnInit {
  private router = inject(Router);
  private http = inject(HttpClient);

  name = signal('');
  description = signal('');
  price = signal<number | null>(null);
  totalSesiones = signal<number | null>(null);
  fechaInicio = signal('');
  fechaFin = signal('');

  // Listar ciclos.
  ciclos = signal<any[]>([]);

  // Listar servicios.
  servicios = signal<any[]>([]);

  // Listar ciclos seleccionados.
  selectedCiclos = signal<number[]>([]);

  // Servicios seleccionados.
  selectedServicios = signal<number[]>([]);

  // Imagen cargada.
  imagePreview = signal<string | null>(null);

  loading = signal(false);
  successMsg = signal('');
  errorMsg = signal('');

  // Inicializar componente.
  ngOnInit(): void {
    this.cargarDatos();
  }

  // Obtener ciclos y servicios.
  cargarDatos(): void {
    this.http.get<any[]>('/mock-ciclo-agenda.json').subscribe((datos) => {
      this.ciclos.set(datos || []);
    });
    this.http.get<any[]>('/mock-servicios.json').subscribe((datos) => {
      this.servicios.set(datos || []);
    });
  }

  // Cambiar selección de ciclo.
  toggleCiclo(id: number): void {
    this.selectedCiclos.update((lista) =>
      lista.includes(id) ? lista.filter((c) => c !== id) : [...lista, id]
    );
  }

  // Cargar imagen.
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview.set(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  // Cambiar selección de servicio.
  toggleServicio(id: number): void {
    this.selectedServicios.update((lista) =>
      lista.includes(id) ? lista.filter((s) => s !== id) : [...lista, id]
    );
  }

  // Volver a configurar servicios.
  goBack(): void {
    this.router.navigate(['/configurar-servicios']);
  }

  // Guardar paquete.
  onSubmit(): void {
    if (!this.name().trim()) {
      this.errorMsg.set('El nombre del paquete es requerido.');
      return;
    }
    if (this.selectedServicios().length === 0) {
      this.errorMsg.set('Debes seleccionar al menos un servicio.');
      return;
    }
    if (this.price() === null || this.price()! <= 0) {
      this.errorMsg.set('El precio debe ser mayor a 0.');
      return;
    }
    if (this.totalSesiones() === null || this.totalSesiones()! <= 0) {
      this.errorMsg.set('El total de sesiones debe ser mayor a 0.');
      return;
    }
    if (!this.fechaInicio() || !this.fechaFin()) {
      this.errorMsg.set('Debe seleccionar rango de fechas.');
      return;
    }
    if (this.selectedCiclos().length === 0) {
      this.errorMsg.set('Debes seleccionar al menos un ciclo de agenda.');
      return;
    }

    this.loading.set(true);
    this.errorMsg.set('');
    this.successMsg.set('');

    setTimeout(() => {
      this.loading.set(false);
      this.successMsg.set('¡Paquete añadido con éxito!');
      setTimeout(() => {
        this.goBack();
      }, 1500);
    }, 1000);
  }
}
