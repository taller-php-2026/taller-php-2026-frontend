import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import * as L from 'leaflet';
import { UbicacionServicio } from 'app/models/service.model';

@Component({
  selector: 'app-service-location-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './service-location-map.html',
})
export class ServiceLocationMap implements AfterViewInit, OnChanges, OnDestroy {
  @Input() ubicacion?: UbicacionServicio | null;
  @Input() modalidad?: string | null;
  @Input() compact = false;

  mapId = `service-location-map-${Math.random().toString(36).slice(2)}`;
  private map: L.Map | null = null;
  private marker: L.Marker | null = null;
  private viewReady = false;

  ngAfterViewInit(): void {
    this.viewReady = true;
    this.renderMapSoon();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['ubicacion'] || changes['modalidad']) {
      this.renderMapSoon();
    }
  }

  ngOnDestroy(): void {
    this.map?.remove();
    this.map = null;
    this.marker = null;
  }

  shouldShow(): boolean {
    return this.modalidad !== 'virtual' && !!this.ubicacion && this.hasAddress();
  }

  hasCoordinates(): boolean {
    return this.getLat() !== null && this.getLng() !== null;
  }

  getAddress(): string {
    const parts = [
      this.ubicacion?.direccion,
      this.ubicacion?.ciudad,
      this.ubicacion?.pais,
    ].filter(Boolean);

    return parts.join(', ');
  }

  private renderMapSoon(): void {
    if (!this.viewReady) return;

    setTimeout(() => this.renderMap());
  }

  private renderMap(): void {
    if (!this.shouldShow() || !this.hasCoordinates()) {
      this.map?.remove();
      this.map = null;
      this.marker = null;
      return;
    }

    const lat = this.getLat();
    const lng = this.getLng();
    if (lat === null || lng === null) return;

    const iconDefault = L.icon({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });

    if (!this.map) {
      this.map = L.map(this.mapId, {
        scrollWheelZoom: false,
        dragging: !this.compact,
        zoomControl: !this.compact,
      }).setView([lat, lng], 15);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(this.map);
    } else {
      this.map.setView([lat, lng], 15);
    }

    if (!this.marker) {
      this.marker = L.marker([lat, lng], { icon: iconDefault }).addTo(this.map);
    } else {
      this.marker.setLatLng([lat, lng]);
    }

    this.marker.bindPopup(this.getAddress());
    this.map.invalidateSize();
  }

  private hasAddress(): boolean {
    return !!(this.ubicacion?.direccion || this.ubicacion?.ciudad || this.ubicacion?.pais);
  }

  private getLat(): number | null {
    return this.toNumber(this.ubicacion?.latitud);
  }

  private getLng(): number | null {
    return this.toNumber(this.ubicacion?.longitud);
  }

  private toNumber(value: string | number | null | undefined): number | null {
    if (value === null || value === undefined || value === '') return null;
    const parsed = typeof value === 'number' ? value : Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
}
