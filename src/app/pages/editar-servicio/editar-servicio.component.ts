import { Component, inject, signal, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { forkJoin, Observable, of, switchMap } from 'rxjs';
import { environment } from '@env/environment';
import * as L from 'leaflet';

type ModalidadServicioForm = 'presencial' | 'online' | 'hibrida';

@Component({
  selector: 'app-editar-servicio',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './editar-servicio.component.html',
  styleUrl: './editar-servicio.component.css'
})
export class EditarServicioComponent implements OnInit {
  private router = inject(Router);
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private backendBaseUrl = environment.apiUrl.replace(/\/api$/, '');

  idServicio: number | null = null;
  idUbicacion: number | null = null;
  idVideoSession: number | null = null;

  name = signal('Cargando...');
  hours = signal<number | null>(0);
  minutes = signal<number | null>(0);
  price = signal<number | null>(0);
  description = signal('');
  imagePreview = signal<string | null>(null);
  selectedFile: File | null = null;
  isActive = signal(true);

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
  deleting = signal(false);
  successMsg = signal('');
  errorMsg = signal('');

  ngOnInit(): void {
    const idParam = this.route.snapshot.queryParamMap.get('id');
    if (idParam) {
      this.idServicio = +idParam;
      this.cargarServicio(this.idServicio);
    } else {
      this.errorMsg.set('Identificador de servicio no provisto.');
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

  cargarServicio(id: number) {
    this.http.get<any>(`${environment.apiUrl}/servicios/${id}`).subscribe({
      next: (res) => {
        const serv = res.data;
        if (!serv) return;

        this.name.set(serv.nombre);
        this.description.set(serv.descripcion || '');
        this.price.set(serv.precio);
        this.isActive.set(!!serv.activo);
        this.imagePreview.set(serv.imagenUrl || null);

        const hrs = Math.floor(serv.duracionMinutos / 60);
        const mins = serv.duracionMinutos % 60;
        this.hours.set(hrs > 0 ? hrs : null);
        this.minutes.set(mins);

        // Mapear modalidad
        const mod: ModalidadServicioForm = serv.modalidad === 'virtual' ? 'online' : serv.modalidad === 'hibrida' ? 'hibrida' : 'presencial';
        this.modalidad.set(mod);

        if (serv.ubicacion) {
          this.idUbicacion = serv.ubicacion.idUbicacion;
          this.direccion.set(serv.ubicacion.direccion || '');
          this.ciudad.set(serv.ubicacion.ciudad || '');
          if (serv.ubicacion.latitud && serv.ubicacion.longitud) {
            const lat = parseFloat(serv.ubicacion.latitud);
            const lng = parseFloat(serv.ubicacion.longitud);
            this.latitud.set(lat);
            this.longitud.set(lng);
            this.inicializarMapa(lat, lng);
          } else {
            this.inicializarMapa();
          }
        } else if (this.requiereUbicacion()) {
          this.inicializarMapa();
        }

        if (serv.video_sesion) {
          this.idVideoSession = serv.video_sesion.idVideoSesion;
          this.proveedor.set(serv.video_sesion.proveedor || '');
          this.urlAcceso.set(serv.video_sesion.url || '');
          this.nombreSala.set(serv.video_sesion.nombreSala || '');
        }
      },
      error: () => {
        this.errorMsg.set('Error al cargar la información del servicio.');
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

  quitarFoto(): void {
    this.imagePreview.set(null);
    this.selectedFile = null;
  }

  toggleActive() {
    this.isActive.update(v => !v);
  }

  goBack() {
    this.router.navigate(['/configurar-servicios']);
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

    // 1. Guardar/Actualizar Ubicación y/o VideoSesión si corresponde
    let prepObs$: Observable<any> = of(null);
    const ubicacionPayload = {
      direccion: this.direccion(),
      ciudad: this.ciudad(),
      pais: 'Uruguay',
      latitud: this.latitud(),
      longitud: this.longitud()
    };
    const videoPayload = {
      proveedor: this.proveedor().trim() || 'livekit',
      url: this.urlAcceso().trim() || this.backendBaseUrl,
      nombreSala: this.nombreSala().trim() || ('sala-' + Math.random().toString(36).substring(2, 9)),
      fechaHoraInicio: new Date().toISOString().slice(0, 19).replace('T', ' '),
      estado: 'programada'
    };
    const ubicacionObs$ = this.idUbicacion
      ? this.http.put<any>(`${environment.apiUrl}/ubicaciones/${this.idUbicacion}`, ubicacionPayload)
      : this.http.post<any>(`${environment.apiUrl}/ubicaciones`, ubicacionPayload);
    const videoObs$ = this.idVideoSession
      ? this.http.put<any>(`${environment.apiUrl}/video-sesiones/${this.idVideoSession}`, videoPayload)
      : this.http.post<any>(`${environment.apiUrl}/video-sesiones`, videoPayload);

    if (this.modalidad() === 'hibrida') {
      prepObs$ = forkJoin({ ubicacion: ubicacionObs$, videoSesion: videoObs$ });
    } else if (this.modalidad() === 'presencial') {
      if (this.idUbicacion) {
        prepObs$ = ubicacionObs$;
      } else {
        prepObs$ = ubicacionObs$;
      }
    } else {
      if (this.idVideoSession) {
        prepObs$ = videoObs$;
      } else {
        prepObs$ = videoObs$;
      }
    }

    prepObs$.pipe(
      switchMap((prepRes) => {
        const payload: any = {
          nombre: this.name(),
          descripcion: this.description(),
          precio: this.price(),
          duracionMinutos: duracionMinutos > 0 ? duracionMinutos : 30,
          modalidad: this.modalidad() === 'online' ? 'virtual' : this.modalidad(),
          activo: this.isActive(),
        };

        if (this.modalidad() === 'hibrida' && prepRes) {
          payload.idUbicacion = prepRes.ubicacion.idUbicacion || this.idUbicacion;
          payload.idVideoSesion = prepRes.videoSesion.idVideoSesion || this.idVideoSession;
        } else if (this.modalidad() === 'presencial' && prepRes) {
          payload.idUbicacion = prepRes.idUbicacion || this.idUbicacion;
        } else if (this.modalidad() === 'online' && prepRes) {
          payload.idVideoSesion = prepRes.idVideoSesion || this.idVideoSession;
        }

        // 2. Actualizar el Servicio
        return this.http.put<any>(`${environment.apiUrl}/servicios/${this.idServicio}`, payload);
      }),
      switchMap((servRes) => {
        if (this.selectedFile && this.idServicio) {
          // 3. Subir la imagen si hay una nueva
          const formData = new FormData();
          formData.append('imagen', this.selectedFile);
          return this.http.post<any>(`${environment.apiUrl}/servicios/${this.idServicio}/imagen`, formData);
        }
        return of(servRes);
      })
    ).subscribe({
      next: () => {
        this.loading.set(false);
        this.successMsg.set('¡Cambios guardados con éxito!');
        setTimeout(() => {
          this.successMsg.set('');
          this.goBack();
        }, 1500);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMsg.set(this.getErrorMessage(err, 'Error al guardar los cambios.'));
      }
    });
  }

  onDelete() {
    if (confirm('¿Estás seguro de que deseas eliminar este servicio?')) {
      this.deleting.set(true);
      this.errorMsg.set('');
      this.successMsg.set('');

      this.http.delete<any>(`${environment.apiUrl}/servicios/${this.idServicio}`).subscribe({
        next: () => {
          this.deleting.set(false);
          this.successMsg.set('Servicio eliminado correctamente.');
          setTimeout(() => {
            this.goBack();
          }, 1200);
        },
        error: (err) => {
          this.deleting.set(false);
          this.errorMsg.set(err?.error?.message || 'Error al eliminar el servicio.');
        }
      });
    }
  }
}
