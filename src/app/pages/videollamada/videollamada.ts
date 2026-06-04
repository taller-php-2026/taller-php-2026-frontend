import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-videollamada',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './videollamada.html',
  styleUrl: './videollamada.css',
})
export class Videollamada implements OnInit, OnDestroy {
  private enrutador = inject(Router);
  private clienteHttp = inject(HttpClient);

  // Parámetros de conexión para integración futura con LiveKit Meet
  livekitUrl = signal<string>('');
  livekitToken = signal<string>('');
  roomName = signal<string>('');
  livekitConectado = signal<boolean>(false);

  // Datos cargados desde Mock
  profesionalNombre = signal<string>('Cargando...');
  profesionalFoto = signal<string>('');
  servicioId = signal<string>('');
  servicioNombre = signal<string>('');

  // Listas de datos reactivos
  participantes = signal<any[]>([]);
  mensajes = signal<any[]>([]);
  archivos = signal<any[]>([]);

  // Entrada de nuevo mensaje
  nuevoMensajeTexto = signal<string>('');

  // Estados de video, microfono y barra lateral
  microfonoSilenciado = signal<boolean>(false);
  videoDesactivado = signal<boolean>(false);
  sidebarAbierto = signal<boolean>(false);

  // Control de pestaña seleccionada en el sidebar
  tabSeleccionada = signal<'participantes' | 'chat' | 'archivos' | 'ajustes'>('participantes');

  // Estados del temporizador
  tiempoRestanteSegundos = signal<number>(0);
  progresoPorcentaje = signal<number>(100);
  textoTemporizador = signal<string>('--:--');
  totalTiempo = 1200;

  // Hablante activo
  hablanteActivo = signal<boolean>(true);

  private intervaloTemporizador: any;
  private intervaloHablante: any;

  ngOnInit(): void {
    this.cargarDatosVideollamada();
    this.iniciarSimulacionHablante();
  }

  ngOnDestroy(): void {
    if (this.intervaloTemporizador) {
      clearInterval(this.intervaloTemporizador);
    }
    if (this.intervaloHablante) {
      clearInterval(this.intervaloHablante);
    }
  }

  // Cargar datos de la videollamada desde mock
  cargarDatosVideollamada(): void {
    this.clienteHttp.get<any>('/mock-videollamada.json').subscribe({
      next: (datos) => {
        if (datos) {
          this.profesionalNombre.set(datos.profesionalNombre);
          this.profesionalFoto.set(datos.profesionalFoto);
          this.servicioId.set(datos.servicioId);
          this.servicioNombre.set(datos.servicioNombre);
          this.tiempoRestanteSegundos.set(datos.tiempoRestanteInicial || 600);
          this.totalTiempo = datos.duracionSegundos || 1200;

          // Parámetros de LiveKit
          this.livekitUrl.set(datos.livekitUrl || '');
          this.livekitToken.set(datos.livekitToken || '');
          this.roomName.set(datos.roomName || '');

          // Cargar listas
          this.participantes.set(datos.participantes || []);
          this.mensajes.set(datos.mensajes || []);
          this.archivos.set(datos.archivos || []);

          // Simular conexión establecida con LiveKit
          this.simularConexionLivekit();

          this.iniciarTemporizador();
        }
      },
      error: () => {
        this.profesionalNombre.set('Especialista');
        this.tiempoRestanteSegundos.set(600);
        this.iniciarTemporizador();
      }
    });
  }

  // Simular conexión exitosa de LiveKit
  simularConexionLivekit(): void {
    if (this.livekitUrl() && this.livekitToken()) {
      // Registrar log para futura referencia
      console.log(`[LiveKit] Conectando a la sala ${this.roomName()} en el servidor ${this.livekitUrl()} usando token.`);
      this.livekitConectado.set(true);
    }
  }

  // Alternar estado del microfono
  alternarMicrofono(): void {
    this.microfonoSilenciado.update((estado) => !estado);
  }

  // Alternar estado de la camara
  alternarVideo(): void {
    this.videoDesactivado.update((estado) => !estado);
  }

  // Alternar visibilidad de la barra lateral en moviles
  alternarSidebar(): void {
    this.sidebarAbierto.update((estado) => !estado);
  }

  // Cambiar pestaña seleccionada en el sidebar
  seleccionarTab(tab: 'participantes' | 'chat' | 'archivos' | 'ajustes'): void {
    this.tabSeleccionada.set(tab);
    // En móviles, asegurar abrir el sidebar al seleccionar una tab
    this.sidebarAbierto.set(true);
  }

  // Enviar mensaje en el chat
  enviarMensaje(): void {
    const texto = this.nuevoMensajeTexto().trim();
    if (texto) {
      const ahora = new Date();
      const horaFormato = `${ahora.getHours().toString().padStart(2, '0')}:${ahora.getMinutes().toString().padStart(2, '0')}`;
      
      this.mensajes.update((lista) => [
        ...lista,
        {
          remitente: 'Tú',
          texto: texto,
          tiempo: horaFormato
        }
      ]);
      
      this.nuevoMensajeTexto.set('');
    }
  }

  // Finalizar sesion y redirigir
  finalizarSesion(): void {
    this.enrutador.navigate(['/']);
  }

  // Iniciar cuenta regresiva
  iniciarTemporizador(): void {
    this.intervaloTemporizador = setInterval(() => {
      const tiempo = this.tiempoRestanteSegundos();
      if (tiempo > 0) {
        const nuevoTiempo = tiempo - 1;
        this.tiempoRestanteSegundos.set(nuevoTiempo);

        const minutos = Math.floor(nuevoTiempo / 60);
        const segundos = nuevoTiempo % 60;
        this.textoTemporizador.set(`${minutos}:${segundos.toString().padStart(2, '0')}`);

        const porcentaje = (nuevoTiempo / this.totalTiempo) * 100;
        this.progresoPorcentaje.set(porcentaje);
      }
    }, 1000);
  }

  // Simular cambio de hablante activo
  iniciarSimulacionHablante(): void {
    this.intervaloHablante = setInterval(() => {
      this.hablanteActivo.update((estado) => !estado);
    }, 5000);
  }
}


