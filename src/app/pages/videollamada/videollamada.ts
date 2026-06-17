import { Component, ElementRef, inject, OnDestroy, OnInit, signal, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Room, RoomEvent, Track, RemoteTrack, RemoteParticipant } from 'livekit-client';
import { LiveKitService } from 'app/services/livekit.service';
import { LiveKitTokenData } from 'app/models/livekit.model';
import { AuthService } from 'app/services/auth.service';

@Component({
  selector: 'app-videollamada',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './videollamada.html',
  styleUrl: './videollamada.css',
})
export class Videollamada implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private enrutador = inject(Router);
  private liveKitService = inject(LiveKitService);
  private authService = inject(AuthService);

  @ViewChild('remoteVideo') remoteVideo?: ElementRef<HTMLVideoElement>;
  @ViewChild('localVideo') localVideo?: ElementRef<HTMLVideoElement>;
  @ViewChild('remoteAudio') remoteAudio?: ElementRef<HTMLAudioElement>;

  livekitUrl = signal<string>('');
  livekitToken = signal<string>('');
  roomName = signal<string>('');
  livekitConectado = signal<boolean>(false);
  cargando = signal<boolean>(true);
  error = signal<string>('');

  profesionalNombre = signal<string>('Profesional');
  servicioNombre = signal<string>('Videollamada');
  participantes = signal<string[]>([]);

  microfonoSilenciado = signal<boolean>(false);
  videoDesactivado = signal<boolean>(false);

  private idReserva: number | null = null;
  private room?: Room;
  private tracksRemotos: RemoteTrack[] = [];

  ngOnInit(): void {
    this.idReserva = this.getReservaId();

    if (!this.idReserva) {
      this.cargando.set(false);
      this.error.set('No se pudo identificar la reserva.');
      return;
    }

    const stateData = history.state?.livekit as LiveKitTokenData | undefined;
    if (stateData?.token && stateData.url) {
      void this.iniciarConexion(stateData);
      return;
    }

    this.liveKitService.generarTokenReserva(this.idReserva).subscribe({
      next: (response) => void this.iniciarConexion(response.data),
      error: (err) => {
        this.cargando.set(false);
        this.error.set(this.getMensajeError(err));
      },
    });
  }

  ngOnDestroy(): void {
    this.tracksRemotos.forEach((track) => track.detach());
    this.room?.disconnect();
  }

  async alternarMicrofono(): Promise<void> {
    const nuevoEstado = !this.microfonoSilenciado();
    this.microfonoSilenciado.set(nuevoEstado);
    await this.room?.localParticipant.setMicrophoneEnabled(!nuevoEstado);
  }

  async alternarVideo(): Promise<void> {
    const nuevoEstado = !this.videoDesactivado();
    this.videoDesactivado.set(nuevoEstado);
    await this.room?.localParticipant.setCameraEnabled(!nuevoEstado);
  }

  finalizarSesion(): void {
    this.room?.disconnect();
    this.enrutador.navigateByUrl(this.getExitRoute());
  }

  private async iniciarConexion(data: LiveKitTokenData): Promise<void> {
    this.livekitUrl.set(data.url || data.livekitUrl || '');
    this.livekitToken.set(data.token);
    this.roomName.set(data.room || data.roomName || '');
    this.profesionalNombre.set(
      data.reserva?.profesional?.nombreNegocio ||
      data.reserva?.profesional?.usuario?.nombre ||
      'Profesional',
    );
    this.servicioNombre.set(data.reserva?.servicio?.nombre || 'Videollamada');

    try {
      const settings = history.state?.settings as { microfonoSilenciado?: boolean; videoDesactivado?: boolean } | undefined;
      const micEnabled = !(settings?.microfonoSilenciado ?? false);
      const camEnabled = !(settings?.videoDesactivado ?? false);

      this.microfonoSilenciado.set(!micEnabled);
      this.videoDesactivado.set(!camEnabled);

      this.room = new Room();
      this.registrarEventos(this.room);
      await this.room.connect(this.livekitUrl(), this.livekitToken());
      await this.room.localParticipant.setMicrophoneEnabled(micEnabled);
      await this.room.localParticipant.setCameraEnabled(camEnabled);

      if (camEnabled && this.localVideo?.nativeElement) {
        const localPart = this.room.localParticipant as any;
        if (localPart && localPart.videoTrackPublications) {
          const publications = Array.from(localPart.videoTrackPublications.values()) as any[];
          for (const pub of publications) {
            if (pub && pub.track && pub.track.kind === 'video') {
              pub.track.attach(this.localVideo.nativeElement);
            }
          }
        }
      }

      this.livekitConectado.set(true);
      this.cargando.set(false);
    } catch (e) {
      console.error('Error al conectar con LiveKit:', e);
      this.cargando.set(false);
      this.error.set('No se pudo conectar a LiveKit.');
    }
  }

  private registrarEventos(room: Room): void {
    room.on(RoomEvent.Connected, () => {
      this.livekitConectado.set(true);
    });

    room.on(RoomEvent.Disconnected, () => {
      this.livekitConectado.set(false);
    });

    room.on(RoomEvent.TrackSubscribed, (track, _publication, participant) => {
      this.agregarParticipante(participant);
      this.adjuntarTrack(track);
    });

    room.on(RoomEvent.TrackUnsubscribed, (track) => {
      track.detach();
      this.tracksRemotos = this.tracksRemotos.filter((item) => item !== track);
    });

    room.on(RoomEvent.LocalTrackPublished, (publication) => {
      const track = publication.track;
      if (track?.kind === Track.Kind.Video && this.localVideo?.nativeElement) {
        track.attach(this.localVideo.nativeElement);
      }
    });
  }

  private adjuntarTrack(track: RemoteTrack): void {
    this.tracksRemotos.push(track);

    if (track.kind === Track.Kind.Video && this.remoteVideo?.nativeElement) {
      track.attach(this.remoteVideo.nativeElement);
      return;
    }

    if (track.kind === Track.Kind.Audio && this.remoteAudio?.nativeElement) {
      track.attach(this.remoteAudio.nativeElement);
    }
  }

  private agregarParticipante(participant: RemoteParticipant): void {
    const nombre = participant.name || participant.identity;
    this.participantes.update((actuales) =>
      actuales.includes(nombre) ? actuales : [...actuales, nombre],
    );
  }

  private getReservaId(): number | null {
    const fromParam = this.route.snapshot.paramMap.get('id');
    const fromQuery = this.route.snapshot.queryParamMap.get('reserva');
    const value = Number(fromParam ?? fromQuery);

    return Number.isFinite(value) && value > 0 ? value : null;
  }

  private getExitRoute(): string {
    const userType = this.authService.userType() || this.authService.currentUser()?.type;

    if (userType === 'cliente') {
      return '/reservas';
    }

    if (userType === 'profesional') {
      return '/';
    }

    return this.authService.isAuthenticated() ? '/' : '/login';
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
        return 'No se pudo conectar a la videollamada.';
    }
  }
}
