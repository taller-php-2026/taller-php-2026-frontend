import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { PaqueteComprado } from 'app/models/paquete.model';
import { PaquetesService } from 'app/services/paquetes.service';

@Component({
  selector: 'app-mis-paquetes',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './mis-paquetes.html',
})
export class MisPaquetes implements OnInit {
  private paquetesService = inject(PaquetesService);
  private router = inject(Router);

  paquetes = signal<PaqueteComprado[]>([]);
  loading = signal(false);
  errorMsg = signal('');

  ngOnInit(): void {
    this.cargarPaquetes();
  }

  cargarPaquetes(): void {
    this.loading.set(true);
    this.errorMsg.set('');

    this.paquetesService.getMisPaquetes().subscribe({
      next: (response) => {
        this.paquetes.set(response.data ?? []);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMsg.set(this.getErrorMessage(err, 'No se pudieron cargar tus paquetes.'));
      },
    });
  }

  getNombre(paquete: PaqueteComprado): string {
    return paquete.paqueteServicio?.servicio?.nombre ?? 'Paquete de servicio';
  }

  getDescripcion(paquete: PaqueteComprado): string {
    return paquete.paqueteServicio?.servicio?.descripcion ?? 'Sesiones compradas';
  }

  getImagen(paquete: PaqueteComprado): string {
    return (
      paquete.paqueteServicio?.imagenUrl ||
      paquete.paqueteServicio?.servicio?.imagenUrl ||
      '/assets/placeholders/service-placeholder.svg'
    );
  }

  getPrecio(paquete: PaqueteComprado): string {
    return `$${Number(paquete.precioCompra || 0).toFixed(2)}`;
  }

  getFechaCompra(paquete: PaqueteComprado): string {
    return paquete.fechaCompra?.split(' ')[0] ?? '';
  }

  estaActivo(paquete: PaqueteComprado): boolean {
    return paquete.estado === 'activo' && Number(paquete.sesionesRestantes) > 0;
  }

  reservarConPaquete(paquete: PaqueteComprado): void {
    const idServicio = paquete.paqueteServicio?.servicio?.idServicio ?? paquete.paqueteServicio?.idServicio;
    if (!idServicio) return;

    this.router.navigate([`/servicio/${idServicio}/seleccionar-profesional`]);
  }

  onImgError(event: Event): void {
    (event.target as HTMLImageElement).src = '/assets/placeholders/service-placeholder.svg';
  }

  private getErrorMessage(err: { status?: number; error?: { message?: string } }, fallback: string): string {
    if (err.status === 401) return 'Tu sesion expiro. Volve a iniciar sesion.';
    if (err.status === 403) return 'No tenes permisos para ver estos paquetes.';
    return err.error?.message ?? fallback;
  }
}
