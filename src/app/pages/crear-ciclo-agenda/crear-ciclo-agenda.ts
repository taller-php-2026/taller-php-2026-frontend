import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AgendaService } from '../../services/agenda.service';
import { AuthService } from '../../services/auth.service';
import { forkJoin, Observable, switchMap } from 'rxjs';

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
  private agendaService = inject(AgendaService);
  private authService = inject(AuthService);

  // Nombre del ciclo.
  nombreCiclo = signal<string>('Horario Estándar');

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
    this.enrutador.navigate(['/configurar-ciclos']);
  }

  // Capitalizar texto para los nombres de días del Enum backend
  private capitalizarDia(dia: string): string {
    if (dia === 'miércoles') return 'Miércoles';
    if (dia === 'sábado') return 'Sábado';
    return dia.charAt(0).toUpperCase() + dia.slice(1);
  }

  // Guardar configuracion de agenda en el backend.
  guardarConfiguracionAgenda(): void {
    const diasActivos = this.diasSemana.filter((d) => d.activo());
    if (diasActivos.length === 0) {
      this.mensajeError.set('Debe seleccionar al menos un día de la semana.');
      return;
    }
    if (this.bloquesHorario().length === 0) {
      this.mensajeError.set('Debe configurar al menos un bloque de horario.');
      return;
    }
    if (!this.nombreCiclo().trim()) {
      this.mensajeError.set('Debe ingresar un nombre para el ciclo.');
      return;
    }

    this.mensajeError.set('');
    this.mensajeExito.set('Guardando configuración...');

    const idProfesional = this.authService.currentUser()?.idUsuario;
    if (!idProfesional) {
      this.mensajeError.set('No se pudo identificar al profesional logueado.');
      return;
    }

    // 1. Crear el ciclo en el backend.
    this.agendaService.crearCiclo(this.nombreCiclo()).pipe(
      switchMap((cicloRes) => {
        const idCiclo = cicloRes.data.idCiclo;

        // Crear requests de rango_horarios.
        const rangoRequests: Observable<any>[] = [];
        diasActivos.forEach((dia) => {
          const diaCapitalizado = this.capitalizarDia(dia.completo);
          this.bloquesHorario().forEach((bloque) => {
            rangoRequests.push(
              this.agendaService.crearRangoHorario({
                diaSemana: diaCapitalizado,
                horaInicio: bloque.inicio,
                horaFin: bloque.fin,
                idCiclo: idCiclo
              })
            );
          });
        });

        // 2. Crear la Agenda vinculada al nuevo ciclo.
        return forkJoin(rangoRequests).pipe(
          switchMap(() => this.agendaService.crearAgenda(idCiclo)),
          switchMap((agendaRes) => {
            const idAgenda = agendaRes.data.idAgenda;

            // 3. Crear las Reglas de Disponibilidad para cada día y bloque.
            const reglaRequests: Observable<any>[] = [];
            diasActivos.forEach((dia) => {
              const diaCapitalizado = this.capitalizarDia(dia.completo);
              this.bloquesHorario().forEach((bloque) => {
                reglaRequests.push(
                  this.agendaService.crearReglaDisponibilidad({
                    dia_semana: diaCapitalizado,
                    horaInicio: bloque.inicio,
                    horaFin: bloque.fin,
                    pausaMinutos: 0,
                    bufferMinutos: this.tieneDescanso() ? this.tiempoDescansoMinutos() : 0,
                    activa: true,
                    idAgenda: idAgenda,
                    idProfesional: idProfesional
                  })
                );
              });
            });

            return forkJoin(reglaRequests);
          })
        );
      })
    ).subscribe({
      next: () => {
        this.mensajeExito.set('Configuración de ciclo y agenda guardada exitosamente.');
        setTimeout(() => {
          this.mensajeExito.set('');
          this.volverPaginaAnterior();
        }, 1500);
      },
      error: (err) => {
        let errorMsg = 'Error al guardar la configuración de la agenda.';
        if (err?.error?.errors) {
          // Extraer detalles específicos de validación de Laravel
          const list: string[] = [];
          Object.keys(err.error.errors).forEach((key) => {
            err.error.errors[key].forEach((detail: string) => {
              if (detail.includes('validation.after')) {
                list.push('La hora de fin debe ser posterior a la hora de inicio.');
              } else if (detail.includes('date_format')) {
                list.push('El formato de hora debe ser válido (HH:mm).');
              } else {
                list.push(detail);
              }
            });
          });
          if (list.length > 0) {
            errorMsg = list.join(' ');
          }
        } else if (err?.error?.message) {
          if (err.error.message.includes('validation.after')) {
            errorMsg = 'La hora de fin debe ser posterior a la hora de inicio.';
          } else {
            errorMsg = err.error.message;
          }
        }
        this.mensajeError.set(errorMsg);
        this.mensajeExito.set('');
      }
    });
  }
}
