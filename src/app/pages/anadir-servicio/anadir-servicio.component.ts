import { Component, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { forkJoin, Observable, of, switchMap } from 'rxjs';
import { environment } from '@env/environment';
import * as L from 'leaflet';

type ModalidadServicioForm = 'presencial' | 'online' | 'hibrida';

@Component({
  selector: 'app-anadir-servicio',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './anadir-servicio.component.html',
  styleUrl: './anadir-servicio.component.css'
})
export class AnadirServicioComponent implements OnInit {
  private router = inject(Router);
  private http = inject(HttpClient);
  private backendBaseUrl = environment.apiUrl.replace(/\/api$/, '');

  name = signal('');
  hours = signal<number | null>(null);
  minutes = signal<number | null>(null);
  price = signal<number | null>(null);
  description = signal('');
  imagePreview = signal<string | null>(null);
  selectedFile: File | null = null;

  // Modalidad de servicio.
  modalidad = signal<ModalidadServicioForm>('presencial');
  direccion = signal('');
  ciudad = signal('');
  proveedor = signal('');
  urlAcceso = signal('');
  nombreSala = signal('');

  // Mapa y coordenadas.
  private map: L.Map | null = null;
  private marker: L.Marker | null = null;
  latitud = signal<number | null>(null);
  longitud = signal<number | null>(null);

  loading = signal(false);
  successMsg = signal('');
  errorMsg = signal('');

  // Inicializar componente.
  ngOnInit(): void {
    if (this.modalidad() === 'presencial') {
      this.inicializarMapa();
    }
  }

  inicializarMapa(lat: number = -34.9011, lng: number = -56.1645) {
    setTimeout(() => {
      const container = document.getElementById('map');
      if (!container) return;

      if (this.map) {
        this.map.remove();
      }

      this.map = L.map('map').setView([lat, lng], 15);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(this.map);

      const iconDefault = L.icon({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        tooltipAnchor: [16, -28],
        shadowSize: [41, 41]
      });

      this.marker = L.marker([lat, lng], { draggable: true, icon: iconDefault }).addTo(this.map);
      this.latitud.set(lat);
      this.longitud.set(lng);

      this.marker.on('dragend', () => {
        const position = this.marker?.getLatLng();
        if (position) {
          this.latitud.set(position.lat);
          this.longitud.set(position.lng);
          this.obtenerDireccionDesdeCoordenadas(position.lat, position.lng);
        }
      });

      this.map.on('click', (e: L.LeafletMouseEvent) => {
        const position = e.latlng;
        this.marker?.setLatLng(position);
        this.latitud.set(position.lat);
        this.longitud.set(position.lng);
        this.obtenerDireccionDesdeCoordenadas(position.lat, position.lng);
      });
    }, 150);
  }

  obtenerDireccionDesdeCoordenadas(lat: number, lng: number) {
    this.http.get<any>(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`).subscribe({
      next: (res) => {
        if (res && res.address) {
          const addr = res.address;
          const calle = addr.road || addr.pedestrian || addr.suburb || '';
          const numero = addr.house_number || '';
          const dirTexto = calle ? `${calle} ${numero}`.trim() : (res.display_name || '');
          const ciudadTexto = addr.city || addr.town || addr.village || addr.state || '';

          this.direccion.set(dirTexto);
          this.ciudad.set(ciudadTexto);
        }
      }
    });
  }

  buscarDireccion() {
    const dir = this.direccion().trim();
    const city = this.ciudad().trim();
    if (!dir) return;

    const query = `${dir}, ${city}, Uruguay`;
    this.http.get<any[]>(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`).subscribe({
      next: (res) => {
        if (res && res.length > 0) {
          const lat = parseFloat(res[0].lat);
          const lon = parseFloat(res[0].lon);
          this.latitud.set(lat);
          this.longitud.set(lon);
          if (this.map && this.marker) {
            this.map.setView([lat, lon], 16);
            this.marker.setLatLng([lat, lon]);
          } else {
            this.inicializarMapa(lat, lon);
          }
        }
      }
    });
  }

  setModalidad(value: ModalidadServicioForm) {
    this.modalidad.set(value);
    if (this.requiereUbicacion()) {
      this.inicializarMapa(this.latitud() || -34.9011, this.longitud() || -56.1645);
    }
  }

  requiereUbicacion(): boolean {
    return this.modalidad() === 'presencial' || this.modalidad() === 'hibrida';
  }

  requiereVideoSesion(): boolean {
    return this.modalidad() === 'online' || this.modalidad() === 'hibrida';
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

  goBack() {
    this.router.navigate(['/configurar-servicios']);
  }

  resetFields() {
    this.name.set('');
    this.hours.set(null);
    this.minutes.set(null);
    this.price.set(null);
    this.description.set('');
    this.imagePreview.set(null);
    this.selectedFile = null;
    this.modalidad.set('presencial');
    this.direccion.set('');
    this.ciudad.set('');
    this.proveedor.set('');
    this.urlAcceso.set('');
    this.nombreSala.set('');
    this.latitud.set(null);
    this.longitud.set(null);
    if (this.map) {
      this.map.remove();
      this.map = null;
      this.marker = null;
    }
  }

  private getErrorMessage(err: any, fallback: string): string {
    const validationMessage = Object.values(err?.error?.errors ?? {}).flat().join(' ');
    return validationMessage || err?.error?.message || fallback;
  }

  onSubmit() {
    if (!this.name().trim()) {
      this.errorMsg.set('El nombre del servicio es requerido.');
      return;
    }
    if (this.price() === null || this.price()! <= 0) {
      this.errorMsg.set('El precio debe ser mayor a 0.');
      return;
    }
    if (this.requiereUbicacion()) {
      if (!this.direccion().trim() || !this.ciudad().trim()) {
        this.errorMsg.set('La dirección y la ciudad son requeridas para servicios presenciales o híbridos.');
        return;
      }
    }

    this.loading.set(true);
    this.errorMsg.set('');
    this.successMsg.set('');

    const duracionMinutos = (this.hours() || 0) * 60 + (this.minutes() || 0);

    // 1. Crear Ubicación y/o VideoSesión si corresponde
    let prepObs$: Observable<any>;
    const ubicacionPayload = {
        direccion: this.direccion(),
        ciudad: this.ciudad(),
        pais: 'Uruguay',
        latitud: this.latitud(),
        longitud: this.longitud()
      };
    const room = this.nombreSala().trim() || ('sala-' + Math.random().toString(36).substring(2, 9));
    const videoPayload = {
        proveedor: this.proveedor().trim() || 'livekit',
        url: this.urlAcceso().trim() || this.backendBaseUrl,
        nombreSala: room,
        fechaHoraInicio: new Date().toISOString().slice(0, 19).replace('T', ' '),
        estado: 'programada'
      };

    if (this.modalidad() === 'hibrida') {
      prepObs$ = forkJoin({
        ubicacion: this.http.post<any>(`${environment.apiUrl}/ubicaciones`, ubicacionPayload),
        videoSesion: this.http.post<any>(`${environment.apiUrl}/video-sesiones`, videoPayload),
      });
    } else if (this.modalidad() === 'presencial') {
      prepObs$ = this.http.post<any>(`${environment.apiUrl}/ubicaciones`, ubicacionPayload);
    } else {
      prepObs$ = this.http.post<any>(`${environment.apiUrl}/video-sesiones`, videoPayload);
    }

    prepObs$.pipe(
      switchMap((prepRes) => {
        const payload: any = {
          nombre: this.name(),
          descripcion: this.description(),
          precio: this.price(),
          duracionMinutos: duracionMinutos > 0 ? duracionMinutos : 30,
          modalidad: this.modalidad() === 'online' ? 'virtual' : this.modalidad(),
          activo: true,

        };

        if (this.modalidad() === 'hibrida') {
          payload.idUbicacion = prepRes.ubicacion.idUbicacion;
          payload.idVideoSesion = prepRes.videoSesion.idVideoSesion;
        } else if (this.modalidad() === 'presencial') {
          payload.idUbicacion = prepRes.idUbicacion;
        } else if (this.modalidad() === 'online') {
          payload.idVideoSesion = prepRes.idVideoSesion;
        }

        // 2. Crear el Servicio
        return this.http.post<any>(`${environment.apiUrl}/servicios`, payload);
      }),
      switchMap((servRes) => {
        const idServicio = servRes.data.idServicio;
        if (this.selectedFile) {
          // 3. Subir la imagen si hay una
          const formData = new FormData();
          formData.append('imagen', this.selectedFile);
          return this.http.post<any>(`${environment.apiUrl}/servicios/${idServicio}/imagen`, formData);
        }
        return of(servRes);
      })
    ).subscribe({
      next: () => {
        this.loading.set(false);
        this.successMsg.set('¡Servicio añadido con éxito!');
        this.resetFields();
        setTimeout(() => {
          this.successMsg.set('');
          this.goBack();
        }, 1500);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMsg.set(this.getErrorMessage(err, 'Error al crear el servicio.'));
      }
    });
  }
}
