import { Component, inject, signal, OnInit } from '@angular/core';
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
export class PreVideollamada implements OnInit {
  private enrutador = inject(Router);
  private clienteHttp = inject(HttpClient);

  // Datos del profesional
  profesionalNombre = signal<string>('Dr. Elena Santos');
  profesionalFoto = signal<string>('');
  servicioNombre = signal<string>('Consulta General');

  // Controles de audio y video
  microfonoSilenciado = signal<boolean>(false);
  videoDesactivado = signal<boolean>(false);

  // Dispositivos seleccionados
  camaras = signal<string[]>(['FaceTime HD Camera (Built-in)', 'Logitech StreamCam']);
  microfonos = signal<string[]>(['Internal Microphone (Built-in)', 'Yeti Stereo Microphone']);
  altavoces = signal<string[]>(['MacBook Pro Speakers', 'Headphones (External)']);

  camaraSeleccionada = 'FaceTime HD Camera (Built-in)';
  microfonoSeleccionado = 'Internal Microphone (Built-in)';
  altavozSeleccionado = 'MacBook Pro Speakers';

  ngOnInit(): void {
    this.cargarDatosProfesional();
  }

  // Cargar datos del profesional desde mock
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

  // Alternar microfono
  alternarMicrofono(): void {
    this.microfonoSilenciado.update((estado) => !estado);
  }

  // Alternar camara
  alternarVideo(): void {
    this.videoDesactivado.update((estado) => !estado);
  }

  // Ir a la vista de videollamada
  unirseLlamada(): void {
    this.enrutador.navigate(['/videollamada']);
  }
}
