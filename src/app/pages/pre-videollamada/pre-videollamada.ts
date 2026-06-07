import { Component, inject, signal, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-pre-videollamada',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pre-videollamada.html',
  styleUrl: './pre-videollamada.css',
})
export class PreVideollamada implements OnInit, OnDestroy {
  private enrutador = inject(Router);
  private clienteHttp = inject(HttpClient);

  @ViewChild('videoPlayer') videoPlayer!: ElementRef<HTMLVideoElement>;

  // Datos del profesional
  profesionalNombre = signal<string>('Dr. Elena Santos');
  profesionalFoto = signal<string>('');
  servicioNombre = signal<string>('Consulta General');

  // Controles de audio y video
  microfonoSilenciado = signal<boolean>(false);
  videoDesactivado = signal<boolean>(false);

  // Dispositivos reales detectados
  camaras = signal<MediaDeviceInfo[]>([]);
  microfonos = signal<MediaDeviceInfo[]>([]);
  altavoces = signal<MediaDeviceInfo[]>([]);

  idCamaraSeleccionada = signal<string>('');
  idMicrofonoSeleccionado = signal<string>('');
  idAltavozSeleccionado = signal<string>('');

  private mediaStream: MediaStream | null = null;

  ngOnInit(): void {
    this.cargarDatosProfesional();
    this.iniciarPrevisualizacionReal();
  }

  ngOnDestroy(): void {
    this.detenerStream();
  }

  // Detener stream.
  private detenerStream(): void {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }
  }

  // Obtener dispositivos y cámara.
  async iniciarPrevisualizacionReal(): Promise<void> {
    try {
      // Solicitar permisos de cámara y micrófono de forma real
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      this.mediaStream = stream;
      this.asignarStreamAVideo();

      // Listar dispositivos disponibles
      const dispositivos = await navigator.mediaDevices.enumerateDevices();
      
      const listaCamaras = dispositivos.filter(d => d.kind === 'videoinput');
      const listaMics = dispositivos.filter(d => d.kind === 'audioinput');
      const listaSpks = dispositivos.filter(d => d.kind === 'audiooutput');

      this.camaras.set(listaCamaras);
      this.microfonos.set(listaMics);
      this.altavoces.set(listaSpks);

      if (listaCamaras.length > 0) this.idCamaraSeleccionada.set(listaCamaras[0].deviceId);
      if (listaMics.length > 0) this.idMicrofonoSeleccionado.set(listaMics[0].deviceId);
      if (listaSpks.length > 0) this.idAltavozSeleccionado.set(listaSpks[0].deviceId);

    } catch (e) {
      console.warn('No se pudo acceder a la cámara y micrófono reales.', e);
    }
  }

  // Asignar stream al player de video.
  private asignarStreamAVideo(): void {
    setTimeout(() => {
      if (this.videoPlayer && this.videoPlayer.nativeElement && this.mediaStream) {
        this.videoPlayer.nativeElement.srcObject = this.mediaStream;
      }
    }, 100);
  }

  // Cambiar dispositivo de video.
  async cambiarDispositivoVideo(): Promise<void> {
    this.detenerStream();
    if (this.videoDesactivado()) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: this.idCamaraSeleccionada() ? { exact: this.idCamaraSeleccionada() } : undefined },
        audio: { deviceId: this.idMicrofonoSeleccionado() ? { exact: this.idMicrofonoSeleccionado() } : undefined }
      });
      this.mediaStream = stream;
      this.asignarStreamAVideo();
    } catch (e) {
      console.error(e);
    }
  }

  // Manejar cambio de cámara real.
  cambiarCamaraReal(event: Event): void {
    const devId = (event.target as HTMLSelectElement).value;
    this.idCamaraSeleccionada.set(devId);
    this.cambiarDispositivoVideo();
  }

  // Manejar cambio de micrófono real.
  cambiarMicrofonoReal(event: Event): void {
    const devId = (event.target as HTMLSelectElement).value;
    this.idMicrofonoSeleccionado.set(devId);
    this.cambiarDispositivoVideo();
  }

  // Manejar cambio de altavoz real.
  cambiarAltavozReal(event: Event): void {
    const devId = (event.target as HTMLSelectElement).value;
    this.idAltavozSeleccionado.set(devId);
  }

  // Cargar datos del profesional.
  cargarDatosProfesional(): void {
    this.clienteHttp.get<any>('/mock-videollamada.json').subscribe({
      next: (datos) => {
        if (datos) {
          this.profesionalNombre.set(datos.profesionalNombre || 'Dr. Elena Santos');
          this.profesionalFoto.set(datos.profesionalFoto || '');
          this.servicioNombre.set(datos.servicioNombre || 'Consulta General');
        }
      }
    });
  }

  // Alternar micrófono.
  alternarMicrofono(): void {
    this.microfonoSilenciado.update((estado) => {
      const nuevo = !estado;
      if (this.mediaStream) {
        this.mediaStream.getAudioTracks().forEach(track => track.enabled = !nuevo);
      }
      return nuevo;
    });
  }

  // Alternar video.
  alternarVideo(): void {
    this.videoDesactivado.update((estado) => {
      const nuevo = !estado;
      if (this.mediaStream) {
        this.mediaStream.getVideoTracks().forEach(track => track.enabled = !nuevo);
      }
      return nuevo;
    });
  }

  // Unirse a la llamada.
  unirseLlamada(): void {
    this.detenerStream();
    this.enrutador.navigate(['/videollamada']);
  }
}
