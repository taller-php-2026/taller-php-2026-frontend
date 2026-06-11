import { Component, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AgendaService } from '../../services/agenda.service';

@Component({
  selector: 'app-configurar-ciclos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './configurar-ciclos.html',
  styleUrl: './configurar-ciclos.css',
})
export class ConfigurarCiclosComponent implements OnInit {
  private router = inject(Router);
  private agendaService = inject(AgendaService);

  ciclos = signal<any[]>([]);
  cargando = signal<boolean>(true);

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargando.set(true);

    this.agendaService.obtenerMisAgendas().subscribe({
      next: (agendasRes) => {
        const agendas = agendasRes.data || [];
        const ciclosPorId = new Map<number, any>();

        agendas.forEach((agenda: any) => {
          const ciclo = agenda.ciclo;
          if (ciclo?.idCiclo && !ciclosPorId.has(ciclo.idCiclo)) {
            ciclosPorId.set(ciclo.idCiclo, ciclo);
          }
        });

        const mapped = Array.from(ciclosPorId.values()).map((c: any) => {
          const rangos = c.rango_horarios || c.rangoHorarios || [];
          const diasSemana = Array.from(new Set(rangos.map((r: any) => {
            const dia = r.diaSemana;
            if (dia.startsWith('Mi')) return 'Mie';
            if (dia.startsWith('Sa')) return 'Sab';
            return dia.substring(0, 3);
          })));

          const bloquesHorario = rangos.map((r: any) => ({
            inicio: r.horaInicio.substring(0, 5),
            fin: r.horaFin.substring(0, 5),
          }));

          const bloquesUnicos = bloquesHorario.filter(
            (v: any, i: number, a: any[]) =>
              a.findIndex((t: any) => t.inicio === v.inicio && t.fin === v.fin) === i,
          );

          return {
            id: c.idCiclo,
            nombre: c.nombre,
            diasSemana: diasSemana.length > 0 ? diasSemana : ['Sin dias'],
            bloquesHorario: bloquesUnicos,
            tieneDescanso: false,
            tiempoDescansoMinutos: 0,
          };
        });

        this.ciclos.set(mapped);
        this.cargando.set(false);
      },
      error: () => {
        console.error('Error al obtener agendas del profesional');
        this.cargando.set(false);
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  goToAdd(): void {
    this.router.navigate(['/crear-ciclo-agenda']);
  }

  goToEdit(id: number): void {
    this.router.navigate(['/editar-ciclo-agenda'], { queryParams: { id } });
  }

  formatBloques(bloques: any[]): string {
    if (!bloques || bloques.length === 0) return 'Sin bloques';
    return bloques.map((b) => `${b.inicio} - ${b.fin}`).join(', ');
  }
}
