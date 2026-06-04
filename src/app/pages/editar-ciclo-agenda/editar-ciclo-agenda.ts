import { Component, inject, signal, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface HorarioBloque {
  inicio: string;
  fin: string;
}

@Component({
  selector: 'app-editar-ciclo-agenda',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './editar-ciclo-agenda.html',
  styleUrl: './editar-ciclo-agenda.css',
})
export class EditarCicloAgenda implements OnInit {
  private enrutador = inject(Router);
  private clienteHttp = inject(HttpClient);
  private rutaActiva = inject(ActivatedRoute);

  // Dias de la semana
  diasSemana = [
    { nombre: 'Lun', completo: 'lunes', activo: signal(false) },
    { nombre: 'Mar', completo: 'martes', activo: signal(false) },
    { nombre: 'Mié', completo: 'miércoles', activo: signal(false) },
    { nombre: 'Jue', completo: 'jueves', activo: signal(false) },
    { nombre: 'Vie', completo: 'viernes', activo: signal(false) },
    { nombre: 'Sáb', completo: 'sábado', activo: signal(false) },
    { nombre: 'Dom', completo: 'domingo', activo: signal(false) },
  ];

  // Bloques de horario
  bloquesHorario = signal<HorarioBloque[]>([]);

  // Limpieza y descanso
  tieneDescanso = signal<boolean>(false);
  tiempoDescansoMinutos = signal<number>(0);

  // Mensajes de estado
  mensajeExito = signal<string>('');
  mensajeError = signal<string>('');

  ngOnInit(): void {
    this.cargarDatosAgenda();
  }

  // Obtener datos agenda.
  cargarDatosAgenda(): void {
    const id = Number(this.rutaActiva.snapshot.queryParams['id'] || 1);
    this.clienteHttp.get<any[]>('/mock-ciclo-agenda.json').subscribe({
      next: (lista) => {
        const datos = lista?.find((c) => c.id === id) || lista?.[0];
        if (datos) {
          // Marcar dias activos
          this.diasSemana.forEach((dia) => {
            const esActivo = datos.diasSemana.includes(dia.nombre);
            dia.activo.set(esActivo);
          });
          // Establecer bloques y descanso
          this.bloquesHorario.set(datos.bloquesHorario || []);
          this.tieneDescanso.set(!!datos.tieneDescanso);
          this.tiempoDescansoMinutos.set(datos.tiempoDescansoMinutos || 0);
        }
      },
      error: () => {
        this.mensajeError.set('Error al cargar la configuración de la agenda.');
      }
    });
  }

  // Alternar dia de la semana
  alternarDiaSemana(dia: any): void {
    dia.activo.update((valor: boolean) => !valor);
  }

  // Agregar bloque de horario
  agregarBloqueHorario(): void {
    this.bloquesHorario.update((lista) => [...lista, { inicio: '09:00', fin: '18:00' }]);
  }

  // Eliminar bloque de horario
  eliminarBloqueHorario(indice: number): void {
    this.bloquesHorario.update((lista) => lista.filter((_, i) => i !== indice));
  }

  // Alternar activacion de descanso
  alternarTiempoDescanso(): void {
    this.tieneDescanso.update((valor) => !valor);
  }

  // Obtener dias activos para el resumen
  obtenerTextoResumenDias(): string {
    const seleccionados = this.diasSemana
      .filter((d) => d.activo())
      .map((d) => d.completo);

    if (seleccionados.length === 0) {
      return 'ningún día';
    }
    if (seleccionados.length === 1) {
      return seleccionados[0];
    }
    const ultimo = seleccionados.pop();
    return `${seleccionados.join(', ')} y ${ultimo}`;
  }

  // Obtener horas extremas para el resumen
  obtenerTextoResumenHoras(): string {
    const lista = this.bloquesHorario();
    if (lista.length === 0) {
      return 'sin bloques de horario definidos';
    }
    const horasInicio = lista.map((b) => b.inicio).sort();
    const horasFin = lista.map((b) => b.fin).sort();
    return `desde las ${horasInicio[0]} hasta las ${horasFin[horasFin.length - 1]}`;
  }

  // Volver a la pagina anterior
  volverPaginaAnterior(): void {
    this.enrutador.navigate(['/']);
  }

  // Guardar configuracion de agenda
  guardarConfiguracionAgenda(): void {
    if (this.diasSemana.filter((d) => d.activo()).length === 0) {
      this.mensajeError.set('Debe seleccionar al menos un día de la semana.');
      return;
    }
    if (this.bloquesHorario().length === 0) {
      this.mensajeError.set('Debe configurar al menos un bloque de horario.');
      return;
    }

    this.mensajeError.set('');
    this.mensajeExito.set('Configuración de agenda editada exitosamente.');

    setTimeout(() => {
      this.mensajeExito.set('');
      this.volverPaginaAnterior();
    }, 1500);
  }
}
