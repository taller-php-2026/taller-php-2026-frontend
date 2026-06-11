import { Component, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { of, switchMap } from 'rxjs';

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
  private authService = inject(AuthService);

  name = signal('');
  description = signal('');
  price = signal<number | null>(null);
  totalSesiones = signal<number | null>(null);
  fechaInicio = signal('');
  fechaFin = signal('');

  // Listar servicios.
  servicios = signal<any[]>([]);

  // Servicios seleccionados (permitimos múltiples en UI pero tomamos el primero).
  selectedServicios = signal<number[]>([]);

  // Imagen cargada.
  imagePreview = signal<string | null>(null);
  selectedFile: File | null = null;

  loading = signal(false);
  successMsg = signal('');
  errorMsg = signal('');

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    const idProf = this.authService.currentUser()?.idUsuario;
    if (!idProf) return;

    // Cargar solo los servicios activos de este profesional
    this.http.get<any>(`http://localhost:8080/api/servicios/buscar?idProfesional=${idProf}&activo=1`).subscribe({
      next: (res) => {
        this.servicios.set(res.data || []);
      }
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview.set(reader.result as string);
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  toggleServicio(id: number): void {
    const current = this.selectedServicios();
    if (current.includes(id)) {
      this.selectedServicios.set(current.filter(x => x !== id));
    } else {
      this.selectedServicios.set([...current, id]);
    }
    
    // Si hay al menos un servicio seleccionado, sugerir nombre del primero
    const firstId = this.selectedServicios()[0];
    if (firstId) {
      const serv = this.servicios().find(s => s.idServicio === firstId);
      if (serv) {
        this.name.set(`Paquete: ${serv.nombre}`);
        this.description.set(serv.descripcion || '');
      }
    }
  }

  goBack(): void {
    this.router.navigate(['/configurar-servicios']);
  }

  goToAddServicio(): void {
    this.router.navigate(['/anadir-servicio']);
  }

  onSubmit(): void {
    if (this.selectedServicios().length === 0) {
      this.errorMsg.set('Debes seleccionar un servicio base.');
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

    this.loading.set(true);
    this.errorMsg.set('');
    this.successMsg.set('');

    const idProf = this.authService.currentUser()?.idUsuario;
    if (!idProf) {
      this.errorMsg.set('No se encontró el profesional autenticado.');
      return;
    }

    // Obtener datos del servicio base para crear el nuevo servicio del paquete
    const baseServ = this.servicios().find(s => s.idServicio === this.selectedServicios()[0]);

    const payload = {
      nombre: this.name(),
      descripcion: this.description(),
      precio: this.price(),
      duracionMinutos: baseServ ? baseServ.duracionMinutos : 60,
      modalidad: baseServ ? baseServ.modalidad : 'presencial',
      idUbicacion: baseServ ? baseServ.idUbicacion : null,
      idVideoSesion: baseServ ? baseServ.idVideoSesion : null,
      idProfesional: idProf,
      servicios_ids: this.selectedServicios(),
      totalSesiones: this.totalSesiones(),
      activo: true,
    };

    this.http.post<any>('http://localhost:8080/api/paquete-servicios', payload).pipe(
      switchMap((res) => {
        const idPaquete = res.data.idPaqueteServicio;
        if (this.selectedFile) {
          const formData = new FormData();
          formData.append('imagen', this.selectedFile);
          return this.http.post<any>(`http://localhost:8080/api/paquete-servicios/${idPaquete}/imagen`, formData);
        }
        return of(res);
      })
    ).subscribe({
      next: () => {
        this.loading.set(false);
        this.successMsg.set('¡Paquete añadido con éxito!');
        setTimeout(() => {
          this.goBack();
        }, 1500);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMsg.set(err?.error?.message || 'Error al guardar el paquete.');
      }
    });
  }
}
