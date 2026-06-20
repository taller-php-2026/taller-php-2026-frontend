import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Layout } from '@shared/layout/layout.component';
import { PaqueteServicio } from 'app/models/paquete.model';
import { PaquetesService } from 'app/services/paquetes.service';

@Component({
  selector: 'app-paquete-detalle',
  standalone: true,
  imports: [CommonModule, Layout],
  templateUrl: './paquete-detalle.html',
})
export class PaqueteDetalle implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private paquetesService = inject(PaquetesService);

  paquete = signal<PaqueteServicio | null>(null);
  loading = signal(false);
  comprando = signal(false);
  errorMsg = signal('');
  successMsg = signal('');

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.errorMsg.set('No se encontro el paquete.');
      return;
    }

    this.loading.set(true);
    this.paquetesService.getPaqueteById(id).subscribe({
      next: (response) => {
        this.paquete.set(response.data);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMsg.set(this.getErrorMessage(err, 'No se pudo cargar el paquete.'));
      },
    });
  }

  comprarPaquete(): void {
    const paquete = this.paquete();
    if (!paquete) return;

    this.comprando.set(true);
    this.errorMsg.set('');
    this.successMsg.set('');

    this.paquetesService.comprarPaquete(paquete.idPaqueteServicio).subscribe({
      next: (response) => {
        const idPaqueteComprado = response.data?.paqueteComprado?.idPaqueteComprado;
        if (!idPaqueteComprado) {
          this.comprando.set(false);
          this.successMsg.set('Compra creada correctamente.');
          return;
        }

        this.paquetesService.crearPreferenciaMercadoPagoPaquete(idPaqueteComprado).subscribe({
          next: (mpResponse) => {
            const checkoutUrl = mpResponse.data?.checkout_url;
            if (checkoutUrl) {
              window.location.href = checkoutUrl;
              return;
            }

            this.comprando.set(false);
            this.successMsg.set('Compra creada. No se recibio URL de Mercado Pago.');
          },
          error: (err) => {
            this.comprando.set(false);
            this.errorMsg.set(this.getErrorMessage(err, 'No se pudo iniciar el pago del paquete.'));
          },
        });
      },
      error: (err) => {
        this.comprando.set(false);
        this.errorMsg.set(this.getErrorMessage(err, 'No se pudo comprar el paquete.'));
      },
    });
  }

  volver(): void {
    this.router.navigate(['/']);
  }

  getNombre(paquete: PaqueteServicio): string {
    return paquete.servicio?.nombre ?? 'Paquete de servicio';
  }

  getDescripcion(paquete: PaqueteServicio): string {
    return paquete.servicio?.descripcion ?? 'Paquete de sesiones';
  }

  getImagen(paquete: PaqueteServicio): string {
    return paquete.imagenUrl || paquete.servicio?.imagenUrl || '/assets/placeholders/service-placeholder.svg';
  }

  getModalidad(paquete: PaqueteServicio): string {
    const mainMod = paquete.servicio?.modalidad;
    const comunes = paquete.serviciosComunes ?? [];
    
    const modalities = new Set<string>();
    if (mainMod) modalities.add(mainMod);
    comunes.forEach((c: any) => {
      if (c.servicio?.modalidad) {
        modalities.add(c.servicio.modalidad);
      }
    });

    if (modalities.has('virtual') && (modalities.has('presencial') || modalities.has('hibrida'))) {
      return 'Híbrida';
    }
    if (modalities.has('presencial') && modalities.has('hibrida')) {
      return 'Híbrida';
    }
    if (modalities.has('virtual')) return 'Virtual';
    if (modalities.has('hibrida')) return 'Híbrida';
    return 'Presencial';
  }

  getProfesional(paquete: PaqueteServicio): string {
    const profesional = paquete.servicio?.profesionales?.[0];
    return profesional?.nombreNegocio || profesional?.usuario?.nombre || 'Profesional';
  }

  getPrecioPorSesion(paquete: PaqueteServicio): string {
    const precio = Number(paquete.precio || 0);
    const sesiones = Number(paquete.totalSesiones || 0);
    if (!precio || !sesiones) return 'No disponible';
    return `$${(precio / sesiones).toFixed(2)}`;
  }

  getServiciosIncluidos(paquete: any): Array<{ nombre: string; modalidad: string; duracion: string; precio: string; ubicacionText?: string; googleMapsUrl?: string }> {
    const list: any[] = [];
    if (paquete.servicio) {
      list.push(this.mapServicio(paquete.servicio));
    }
    const servicios = paquete.servicios_comunes ?? paquete.serviciosComunes ?? [];
    servicios.forEach((item: any) => {
      if (item.servicio) {
        if (!list.some(s => s.nombre === item.servicio.nombre)) {
          list.push(this.mapServicio(item.servicio));
        }
      }
    });
    return list;
  }

  onImgError(event: Event): void {
    (event.target as HTMLImageElement).src = '/assets/placeholders/service-placeholder.svg';
  }

  private mapServicio(servicio: NonNullable<PaqueteServicio['servicio']>): { nombre: string; modalidad: string; duracion: string; precio: string; ubicacionText?: string; googleMapsUrl?: string } {
    const res: any = {
      nombre: servicio.nombre,
      modalidad: servicio.modalidad === 'virtual' ? 'Virtual' : servicio.modalidad === 'hibrida' ? 'Hibrida' : 'Presencial',
      duracion: `${servicio.duracionMinutos} min`,
      precio: `$${servicio.precio}`,
    };

    if (servicio.modalidad === 'presencial' && servicio.ubicacion) {
      const u = servicio.ubicacion;
      const text = `${u.direccion ?? ''}, ${u.ciudad ?? ''}`;
      res.ubicacionText = text;
      res.googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(text)}`;
    }

    return res;
  }

  private getErrorMessage(err: any, fallback: string): string {
    if (err?.status === 401) return 'Tu sesion expiro. Volve a iniciar sesion.';
    if (err?.status === 403) return 'No tenes permisos para realizar esta accion.';
    if (err?.status === 404) return 'No se encontro el paquete.';
    return err?.error?.message ?? fallback;
  }
}
