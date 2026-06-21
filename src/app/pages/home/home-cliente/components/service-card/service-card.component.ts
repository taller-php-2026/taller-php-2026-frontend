import { NgClass, CommonModule } from '@angular/common';
import { Component, Input, OnInit, inject, ChangeDetectorRef, signal } from '@angular/core';
import { Router } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Service } from 'app/models/service.model';
import { ServicesService } from 'app/services/services.service';
import { BookingStateService } from 'app/services/booking-state.service';
import { Professional } from 'app/models/professional.model';

@Component({
  selector: 'app-service-card',
  templateUrl: './service-card.component.html',
  imports: [NgIcon, NgClass, CommonModule],
  standalone: true,
})
export class ServiceCardComponent implements OnInit {
  private sanitizer = inject(DomSanitizer);
  private servicesService = inject(ServicesService);
  private bookingsService = inject(BookingStateService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  @Input() service!: Service;

  professionals: Professional[] = [];
  resenas = signal<any[]>([]);
  loadingResenas = signal<boolean>(false);
  mostrarModal = signal<boolean>(false);

  ngOnInit() {
    // Cargar profesionales asociados al servicio.
    this.servicesService.getProfessionalsByService(this.service.idServicio.toString()).subscribe({
      next: (response) => {
        this.professionals = response.data;
        this.cdr.detectChanges();
      }
    });
  }

  onImgError(event: Event) {
    (event.target as HTMLImageElement).src = '/assets/placeholders/service-placeholder.svg';
  }

  getDescripcionCorta(): string {
    const descripcion = this.service.descripcion ?? '';
    return descripcion.length > 105 ? `${descripcion.slice(0, 102)}...` : descripcion;
  }

  getModalidadLabel(): string {
    if (this.service.modalidad === 'virtual') return 'Virtual';
    if (this.service.modalidad === 'hibrida') return 'Híbrida';
    return 'Presencial';
  }

  getPlaceholderIcon(): string {
    if (this.service.modalidad === 'virtual') return 'videocam';
    if (this.service.modalidad === 'hibrida') return 'hub';
    return 'location_on';
  }

  getDireccion(): string {
    const ubicacion = this.service.ubicacion;
    return [ubicacion?.direccion, ubicacion?.ciudad, ubicacion?.pais].filter(Boolean).join(', ');
  }

  getModalidadClass(): string {
    if (this.service.modalidad === 'virtual') return 'bg-sky-100 text-sky-800';
    if (this.service.modalidad === 'hibrida') return 'bg-amber-100 text-amber-800';
    return 'bg-emerald-100 text-emerald-800';
  }

  getMapUrl(): SafeResourceUrl | null {
    const direccion = this.service.ubicacion?.direccion;
    const ciudad = this.service.ubicacion?.ciudad;
    if (direccion) {
      const query = encodeURIComponent(`${direccion}${ciudad ? ', ' + ciudad : ''}`);
      const url = `https://maps.google.com/maps?q=${query}&z=15&output=embed`;
      return this.sanitizer.bypassSecurityTrustResourceUrl(url);
    }
    return null;
  }

  // Guardar profesional y servicio seleccionados e ir al horario.
  selectProfessionalAndGoToSchedule(professional: Professional, event: Event) {
    event.stopPropagation();
    event.preventDefault();
    this.bookingsService.reset();
    this.bookingsService.setServiceId(this.service.idServicio);
    this.bookingsService.setSelectedService(this.service);
    this.bookingsService.setProfessionalId(professional.idUsuario);
    this.bookingsService.setSelectedProfessional(professional);
    this.router.navigate([`/servicio/${this.service.idServicio}/seleccionar-horario`]);
  }

  onProfImgError(event: Event) {
    (event.target as HTMLImageElement).src = 'assets/placeholders/user-placeholder.svg';
  }

  // Abrir el modal de reseñas del servicio.
  abrirResenas(event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    this.loadingResenas.set(true);
    this.mostrarModal.set(true);
    this.servicesService.getResenasDelServicio(this.service.idServicio).subscribe({
      next: (data) => {
        this.resenas.set(data);
        this.loadingResenas.set(false);
        this.cdr.detectChanges();
      },
      error: () => {
        this.loadingResenas.set(false);
      }
    });
  }

  // Cerrar el modal de reseñas.
  cerrarResenas(): void {
    this.mostrarModal.set(false);
  }
}

