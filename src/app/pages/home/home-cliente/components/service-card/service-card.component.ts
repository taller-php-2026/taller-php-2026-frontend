import { NgClass } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { Service } from 'app/models/service.model';

@Component({
  selector: 'app-service-card',
  templateUrl: './service-card.component.html',
  imports: [NgIcon, RouterLink, NgClass],
  standalone: true,
})
export class ServiceCardComponent {
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
    if (this.service.modalidad === 'hibrida') return 'Hibrida';
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
}
