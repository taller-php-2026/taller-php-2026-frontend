import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface HorarioBloque {
  inicio: string;
  fin: string;
}

@Component({
  selector: 'app-crear-ciclo-agenda',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './crear-ciclo-agenda.html',
  styleUrl: './crear-ciclo-agenda.css',
})
export class CrearCicloAgenda {
  private enrutador = inject(Router);

  // Dias de la semana
  diasSemana = [
    { nombre: 'Lun', completo: 'lunes', activo: signal(true) },
    { nombre: 'Mar', completo: 'martes', activo: signal(false) },
    { nombre: 'Mié', completo: 'miércoles', activo: signal(true) },
    { nombre: 'Jue', completo: 'jueves', activo: signal(true) },
    { nombre: 'Vie', completo: 'viernes', activo: signal(true) },
    { nombre: 'Sáb', completo: 'sábado', activo: signal(false) },
    { nombre: 'Dom', completo: 'domingo', activo: signal(false) },
  ];

  // Bloques de horario
  bloquesHorario = signal<HorarioBloque[]>([
    { inicio: '09:00', fin: '14:00' },
    { inicio: '16:00', fin: '20:00' }
  ]);

  // Limpieza y descanso
  tieneDescanso = signal<boolean>(true);
  tiempoDescansoMinutos = signal<number>(5);

  // Mensajes de estado
  mensajeExito = signal<string>('');
  mensajeError = signal<string>('');

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
    this.mensajeExito.set('Configuración guardada exitosamente.');

    setTimeout(() => {
      this.mensajeExito.set('');
      this.volverPaginaAnterior();
    }, 1500);
  }
}
