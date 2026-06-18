import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { HeroComponent } from './components/hero-home/hero.component';
import { Layout } from '@shared/layout/layout.component';
import { Service } from 'app/models/service.model';
import { ServicesService } from 'app/services/services.service';
import { ServiceCardComponent } from './components/service-card/service-card.component';
import { NgIconComponent } from '@ng-icons/core';
import { PaqueteServicio } from 'app/models/paquete.model';
import { PaquetesService } from 'app/services/paquetes.service';
import { NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

type TipoListado = 'todos' | 'servicios' | 'paquetes';

@Component({
  selector: 'app-home-client',
  imports: [HeroComponent, Layout, ServiceCardComponent, NgIconComponent, NgClass, FormsModule, RouterLink],
  templateUrl: './home.component.html',
  standalone: true,
})
export class HomeClientComponent {
  private servicesService = inject(ServicesService);
  private paquetesService = inject(PaquetesService);
  private cdr = inject(ChangeDetectorRef);

  services: Service[] = [];
  paquetes: PaqueteServicio[] = [];
  tipoListado: TipoListado = 'todos';
  modalidadFiltro = 'todas';
  precioMinFiltro: number | null = null;
  precioMaxFiltro: number | null = null;
  ratingMinFiltro: number | null = null;
  ordenarPorFiltro = 'recientes';
  searchTerm = '';
  comprandoPaqueteId: number | null = null;
  paqueteMsg = '';
  paqueteError = '';
  loadingServicios = false;
  loadingPaquetes = false;
  serviciosError = '';

  handleSearch(term: string) {
    this.searchTerm = term;
    this.cargarServicios();
  }

  cambiarTipo(tipo: TipoListado): void {
    this.tipoListado = tipo;
    if ((tipo === 'paquetes' || tipo === 'todos') && this.paquetes.length === 0) {
      this.cargarPaquetes();
    }
  }

  cambiarModalidad(event: Event): void {
    this.modalidadFiltro = (event.target as HTMLSelectElement).value;
    this.cargarServicios();
  }

  aplicarFiltros(): void {
    this.cargarServicios();
  }

  limpiarFiltros(): void {
    this.modalidadFiltro = 'todas';
    this.precioMinFiltro = null;
    this.precioMaxFiltro = null;
    this.ratingMinFiltro = null;
    this.ordenarPorFiltro = 'recientes';
    this.cargarServicios();
  }

  comprarPaquete(paquete: PaqueteServicio): void {
    this.comprandoPaqueteId = paquete.idPaqueteServicio;
    this.paqueteMsg = '';
    this.paqueteError = '';

    this.paquetesService.comprarPaquete(paquete.idPaqueteServicio).subscribe({
      next: (response) => {
        const idPaqueteComprado = response.data?.paqueteComprado?.idPaqueteComprado;
        this.paqueteMsg = 'Compra creada correctamente.';

        if (!idPaqueteComprado) {
          this.comprandoPaqueteId = null;
          return;
        }

        this.paquetesService.crearPreferenciaMercadoPagoPaquete(idPaqueteComprado).subscribe({
          next: (mpResponse) => {
            const checkoutUrl = mpResponse.data?.checkout_url;
            if (checkoutUrl) {
              window.location.href = checkoutUrl;
              return;
            }

            this.comprandoPaqueteId = null;
            this.paqueteMsg = 'Compra creada. No se recibio URL de Mercado Pago.';
          },
          error: (err) => {
            this.comprandoPaqueteId = null;
            this.paqueteError = this.getErrorMessage(err, 'No se pudo iniciar el pago del paquete.');
          },
        });
      },
      error: (err) => {
        this.comprandoPaqueteId = null;
        this.paqueteError = this.getErrorMessage(err, 'No se pudo comprar el paquete.');
      },
    });
  }

  getPaqueteNombre(paquete: PaqueteServicio): string {
    return paquete.servicio?.nombre ?? 'Paquete de servicio';
  }

  getPaqueteDescripcion(paquete: PaqueteServicio): string {
    return paquete.servicio?.descripcion ?? 'Paquete de sesiones';
  }

  getPaqueteImagen(paquete: PaqueteServicio): string {
    return paquete.imagenUrl || paquete.servicio?.imagenUrl || 'assets/placeholders/service-placeholder.svg';
  }

  getPaqueteProfesional(paquete: PaqueteServicio): string {
    const profesional = paquete.servicio?.profesionales?.[0];
    return profesional?.nombreNegocio || profesional?.usuario?.nombre || 'Profesional';
  }

  getPrecioPorSesion(paquete: PaqueteServicio): string {
    const precio = Number(paquete.precio || 0);
    const sesiones = Number(paquete.totalSesiones || 0);
    if (!precio || !sesiones) return '';
    return `$${(precio / sesiones).toFixed(2)} por sesion`;
  }

  paquetesFiltrados(): PaqueteServicio[] {
    const term = this.searchTerm.trim().toLowerCase();

    return this.paquetes.filter((paquete) => {
      const modalidad = paquete.servicio?.modalidad;
      const coincideModalidad = this.modalidadFiltro === 'todas' || modalidad === this.modalidadFiltro;
      const precio = Number(paquete.precio || 0);
      const rating = Number(paquete.servicio?.profesionales?.[0]?.ratingPromedio || 0);
      const nombre = this.getPaqueteNombre(paquete).toLowerCase();
      const descripcion = this.getPaqueteDescripcion(paquete).toLowerCase();
      const coincideTexto = !term || nombre.includes(term) || descripcion.includes(term);
      const coincidePrecioMin = this.precioMinFiltro === null || precio >= this.precioMinFiltro;
      const coincidePrecioMax = this.precioMaxFiltro === null || precio <= this.precioMaxFiltro;
      const coincideRating = this.ratingMinFiltro === null || rating >= this.ratingMinFiltro;

      return coincideModalidad && coincideTexto && coincidePrecioMin && coincidePrecioMax && coincideRating;
    }).sort((a, b) => {
      if (this.ordenarPorFiltro === 'precio') return Number(a.precio || 0) - Number(b.precio || 0);
      if (this.ordenarPorFiltro === 'nombre') return this.getPaqueteNombre(a).localeCompare(this.getPaqueteNombre(b));
      if (this.ordenarPorFiltro === 'rating') {
        return Number(b.servicio?.profesionales?.[0]?.ratingPromedio || 0) - Number(a.servicio?.profesionales?.[0]?.ratingPromedio || 0);
      }
      return 0;
    });
  }

  onPaqueteImgError(event: Event): void {
    (event.target as HTMLImageElement).src = 'assets/placeholders/service-placeholder.svg';
  }

  private cargarServicios(): void {
    const filtros: any = {};
    if (this.searchTerm) filtros.texto = this.searchTerm;
    if (this.modalidadFiltro !== 'todas') filtros.modalidad = this.modalidadFiltro;
    if (this.precioMinFiltro !== null) filtros.precioMin = this.precioMinFiltro;
    if (this.precioMaxFiltro !== null) filtros.precioMax = this.precioMaxFiltro;
    if (this.ratingMinFiltro !== null) filtros.ratingMin = this.ratingMinFiltro;
    if (this.ordenarPorFiltro !== 'recientes') filtros.ordenarPor = this.ordenarPorFiltro;
    filtros.orden = this.ordenarPorFiltro === 'precio' || this.ordenarPorFiltro === 'nombre' ? 'asc' : 'desc';

    this.loadingServicios = true;
    this.serviciosError = '';

    this.servicesService.getFilteredServices(filtros).subscribe({
      next: (response) => {
        this.services = response.data;
        this.loadingServicios = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.services = [];
        this.loadingServicios = false;
        this.serviciosError = this.getErrorMessage(err, 'No se pudieron cargar los servicios.');
        this.cdr.detectChanges();
      },
    });
  }

  private cargarPaquetes(): void {
    this.loadingPaquetes = true;
    this.paqueteError = '';

    this.paquetesService.getPaquetesDisponibles().subscribe({
      next: (response) => {
        this.paquetes = response.data ?? [];
        this.loadingPaquetes = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.paquetes = [];
        this.loadingPaquetes = false;
        this.paqueteError = this.getErrorMessage(err, 'No se pudieron cargar los paquetes.');
        this.cdr.detectChanges();
      },
    });
  }

  private getErrorMessage(err: any, fallback: string): string {
    if (err?.status === 401) return 'Tu sesion expiro. Volve a iniciar sesion.';
    if (err?.status === 403) return 'No tenes permisos para realizar esta accion.';
    if (err?.status === 404) return 'No se encontro el paquete.';
    return err?.error?.message ?? fallback;
  }

  ngOnInit() {
    this.cargarServicios();
    this.cargarPaquetes();
  }
}
