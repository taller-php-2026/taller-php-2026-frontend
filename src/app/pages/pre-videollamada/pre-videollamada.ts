import { Component, inject, signal, OnInit } from '@angular/core';
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
export class PreVideollamada implements OnInit {
  private route = inject(ActivatedRoute);
  private enrutador = inject(Router);
  private liveKitService = inject(LiveKitService);

  profesionalNombre = signal<string>('Cargando...');
  profesionalFoto = signal<string>('');
  servicioNombre = signal<string>('Videollamada');
  modalidad = signal<string>('');
  cargando = signal<boolean>(true);
  error = signal<string>('');

  microfonoSilenciado = signal<boolean>(false);
  videoDesactivado = signal<boolean>(false);

  camaras = signal<string[]>(['Camara predeterminada']);
  microfonos = signal<string[]>(['Microfono predeterminado']);
  altavoces = signal<string[]>(['Altavoces predeterminados']);

  camaraSeleccionada = 'Camara predeterminada';
  microfonoSeleccionado = 'Microfono predeterminado';
  altavozSeleccionado = 'Altavoces predeterminados';

  private idReserva: number | null = null;
  private tokenData: LiveKitTokenData | null = null;

  ngOnInit(): void {
    this.idReserva = this.getReservaId();

    if (!this.idReserva) {
      this.cargando.set(false);
      this.error.set('No se pudo identificar la reserva.');
      return;
    }

    this.cargarDatosVideollamada(this.idReserva);
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
    this.microfonoSilenciado.update((estado) => !estado);
  }

  alternarVideo(): void {
    this.videoDesactivado.update((estado) => !estado);
  }

  unirseLlamada(): void {
    if (!this.idReserva || !this.tokenData) {
      this.error.set('No se pudo preparar la videollamada.');
      return;
    }

    this.enrutador.navigate(['/videollamada', this.idReserva], {
      state: {
        livekit: this.tokenData,
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
