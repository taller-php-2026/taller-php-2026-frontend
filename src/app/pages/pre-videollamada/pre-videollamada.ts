import { Component, inject, signal, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LiveKitService } from 'app/services/livekit.service';
import { LiveKitTokenData } from 'app/models/livekit.model';

@Component({
  selector: 'app-pre-videollamada',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pre-videollamada.html',
  styleUrl: './pre-videollamada.css',
})
export class PreVideollamada implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private enrutador = inject(Router);
  private liveKitService = inject(LiveKitService);

  @ViewChild('previewVideo') previewVideoElement!: ElementRef<HTMLVideoElement>;

  profesionalNombre = signal<string>('Cargando...');
  profesionalFoto = signal<string>('');
  servicioNombre = signal<string>('Videollamada');
  modalidad = signal<string>('');
  cargando = signal<boolean>(true);
  error = signal<string>('');

  microfonoSilenciado = signal<boolean>(false);
  videoDesactivado = signal<boolean>(false);

  camaras = signal<string[]>([]);
  microfonos = signal<string[]>([]);
  altavoces = signal<string[]>([]);

  camaraSeleccionada = '';
  microfonoSeleccionado = '';
  altavozSeleccionado = '';

  private idReserva: number | null = null;
  private tokenData: LiveKitTokenData | null = null;
  private localStream: MediaStream | null = null;

  ngOnInit(): void {
    this.idReserva = this.getReservaId();

    if (!this.idReserva) {
      this.cargando.set(false);
      this.error.set('No se pudo identificar la reserva.');
      return;
    }

    this.cargarDatosVideollamada(this.idReserva);
    this.iniciarVistaPrevia();
  }

  ngOnDestroy(): void {
    this.detenerStream();
  }

  async iniciarVistaPrevia() {
    try {
      // Request permissions and initialize media stream
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      this.localStream = stream;

      // Assign to video tag
      this.asignarStreamAVideo();

      // Enumerate actual media devices
      const devices = await navigator.mediaDevices.enumerateDevices();
      const listCamaras: string[] = [];
      const listMicrofonos: string[] = [];
      const listAltavoces: string[] = [];

      devices.forEach((device) => {
        if (device.kind === 'videoinput') {
          listCamaras.push(device.label || `Cámara ${listCamaras.length + 1}`);
        } else if (device.kind === 'audioinput') {
          listMicrofonos.push(device.label || `Micrófono ${listMicrofonos.length + 1}`);
        } else if (device.kind === 'audiooutput') {
          listAltavoces.push(device.label || `Altavoz ${listAltavoces.length + 1}`);
        }
      });

      this.camaras.set(listCamaras.length > 0 ? listCamaras : ['Cámara predeterminada']);
      this.microfonos.set(listMicrofonos.length > 0 ? listMicrofonos : ['Micrófono predeterminado']);
      this.altavoces.set(listAltavoces.length > 0 ? listAltavoces : ['Altavoces predeterminados']);

      this.camaraSeleccionada = this.camaras()[0];
      this.microfonoSeleccionado = this.microfonos()[0];
      this.altavozSeleccionado = this.altavoces()[0];

    } catch (e) {
      console.warn('Permisos de cámara/micrófono denegados o no disponibles:', e);
      this.error.set('No se pudo acceder a la cámara o micrófono. Asegúrate de otorgar los permisos de cámara y micrófono.');
    }
  }

  asignarStreamAVideo() {
    setTimeout(() => {
      if (this.previewVideoElement && this.previewVideoElement.nativeElement && this.localStream) {
        this.previewVideoElement.nativeElement.srcObject = this.localStream;
      }
    }, 100);
  }

  detenerStream(): void {
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
      this.localStream = null;
    }
  }

  cargarDatosVideollamada(idReserva: number): void {
    this.cargando.set(true);
    this.error.set('');

    this.liveKitService.generarTokenReserva(idReserva).subscribe({
      next: (response) => {
        this.tokenData = response.data;
        this.profesionalNombre.set(
          response.data.reserva?.profesional?.nombreNegocio ||
          response.data.reserva?.profesional?.usuario?.nombre ||
          'Profesional',
        );
        this.profesionalFoto.set(
          response.data.reserva?.profesional?.imagenPerfilUrl ||
          response.data.reserva?.profesional?.usuario?.imagenPerfilUrl ||
          '',
        );
        this.servicioNombre.set(response.data.reserva?.servicio?.nombre || 'Videollamada');
        this.modalidad.set(response.data.reserva?.servicio?.modalidad || '');
        this.cargando.set(false);
      },
      error: (err) => {
        this.cargando.set(false);
        this.error.set(this.getMensajeError(err));
      },
    });
  }

  alternarMicrofono(): void {
    this.microfonoSilenciado.update((estado) => {
      const nuevoEstado = !estado;
      if (this.localStream) {
        this.localStream.getAudioTracks().forEach((track) => {
          track.enabled = !nuevoEstado;
        });
      }
      return nuevoEstado;
    });
  }

  alternarVideo(): void {
    this.videoDesactivado.update((estado) => {
      const nuevoEstado = !estado;
      if (this.localStream) {
        this.localStream.getVideoTracks().forEach((track) => {
          track.enabled = !nuevoEstado;
        });
      }
      if (!nuevoEstado) {
        this.asignarStreamAVideo();
      }
      return nuevoEstado;
    });
  }

  unirseLlamada(): void {
    if (!this.idReserva || !this.tokenData) {
      this.error.set('No se pudo preparar la videollamada.');
      return;
    }

    this.detenerStream();

    this.enrutador.navigate(['/videollamada', this.idReserva], {
      state: {
        livekit: this.tokenData,
        settings: {
          microfonoSilenciado: this.microfonoSilenciado(),
          videoDesactivado: this.videoDesactivado(),
        }
      },
    });
  }

  private getReservaId(): number | null {
    const fromParam = this.route.snapshot.paramMap.get('id');
    const fromQuery = this.route.snapshot.queryParamMap.get('reserva');
    const value = Number(fromParam ?? fromQuery);

    return Number.isFinite(value) && value > 0 ? value : null;
  }

  private getMensajeError(err: { status?: number; error?: { message?: string } }): string {
    if (err.error?.message) return err.error.message;

    switch (err.status) {
      case 401:
        return 'Tu sesion expiro. Volve a iniciar sesion.';
      case 403:
        return 'No tenes permisos para entrar a esta videollamada.';
      case 404:
        return 'No se encontro la reserva.';
      case 422:
        return 'Esta reserva no permite videollamada.';
      default:
        return 'No se pudo preparar la videollamada.';
    }
  }
}
