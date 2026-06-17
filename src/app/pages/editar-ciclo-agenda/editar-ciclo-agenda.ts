import { Component, inject, signal, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AgendaService } from '../../services/agenda.service';
import { forkJoin, Observable, switchMap } from 'rxjs';

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
  private agendaService = inject(AgendaService);
  private rutaActiva = inject(ActivatedRoute);

  // ID del ciclo que estamos editando.
  idCiclo = 0;

  // Nombre del ciclo.
  nombreCiclo = signal<string>('');

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

  // Obtener datos agenda desde el backend.
  cargarDatosAgenda(): void {
    const id = Number(this.rutaActiva.snapshot.queryParams['id'] || 1);
    this.idCiclo = id;

    this.agendaService.obtenerCicloPorId(id).subscribe({
      next: (res) => {
        const datos = res.data;
        if (datos) {
          this.nombreCiclo.set(datos.nombre);
          const rangos = datos.rango_horarios || [];

          // Mapear los días activos
          const diasSemanaNombres = rangos.map((r: any) => {
            const dia = r.diaSemana;
            if (dia.startsWith('Mi')) return 'Mié';
            if (dia.startsWith('Sá')) return 'Sáb';
            return dia.substring(0, 3);
          });

          this.diasSemana.forEach((dia) => {
            dia.activo.set(diasSemanaNombres.includes(dia.nombre));
          });

          // Mapear bloques horarios
          const bloques = rangos.map((r: any) => ({
            inicio: r.horaInicio.substring(0, 5),
            fin: r.horaFin.substring(0, 5)
          }));

          // Filtrar únicos
          const bloquesUnicos = bloques.filter(
            (v: any, i: number, a: any[]) => a.findIndex((t: any) => t.inicio === v.inicio && t.fin === v.fin) === i
          );
          this.bloquesHorario.set(bloquesUnicos);
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
    this.enrutador.navigate(['/configurar-ciclos']);
  }

  private capitalizarDia(dia: string): string {
    if (dia === 'miércoles') return 'Miércoles';
    if (dia === 'sábado') return 'Sábado';
    return dia.charAt(0).toUpperCase() + dia.slice(1);
  }

  // Guardar configuración editada (elimina ciclo viejo y crea uno nuevo con datos actualizados).
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
    this.mensajeExito.set('Guardando cambios...');

    // 1. Eliminar el ciclo antiguo.
    this.agendaService.eliminarCiclo(this.idCiclo).pipe(
      // 2. Crear el ciclo actualizado.
      switchMap(() => this.agendaService.crearCiclo(this.nombreCiclo())),
      switchMap((cicloRes) => {
        const idCiclo = cicloRes.data.idCiclo;

        // Crear rangos horarios.
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

        // 3. Crear la agenda.
        return forkJoin(rangoRequests).pipe(
          switchMap(() => this.agendaService.crearAgenda(idCiclo)),
          switchMap((agendaRes) => {
            const idAgenda = agendaRes.data.idAgenda;

            // 4. Crear reglas de disponibilidad.
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
                    idAgenda: idAgenda
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
        this.mensajeExito.set('Configuración editada y guardada exitosamente.');
        setTimeout(() => {
          this.mensajeExito.set('');
          this.volverPaginaAnterior();
        }, 1500);
      },
      error: (err) => {
        let errorMsg = 'Error al guardar los cambios en el ciclo.';
        if (err?.error?.errors) {
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
