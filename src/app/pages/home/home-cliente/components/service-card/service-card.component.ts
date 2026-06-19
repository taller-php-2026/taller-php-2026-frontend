import { NgClass } from '@angular/common';
import { Component, Input, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Service } from 'app/models/service.model';

@Component({
  selector: 'app-service-card',
  templateUrl: './service-card.component.html',
  imports: [NgIcon, RouterLink, NgClass],
  standalone: true,
})
export class ServiceCardComponent {
  private sanitizer = inject(DomSanitizer);

  @Input() service!: Service;

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
}

