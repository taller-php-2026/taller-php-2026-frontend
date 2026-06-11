import { Component, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AgendaService } from '../../services/agenda.service';
import { AuthService } from '../../services/auth.service';

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
  private authService = inject(AuthService);

  // Listar ciclos.
  ciclos = signal<any[]>([]);

  // Estado de carga.
  cargando = signal<boolean>(true);

  // Inicializar componente.
  ngOnInit(): void {
    this.cargarDatos();
  }

  // Cargar ciclos asociados al profesional actual.
  cargarDatos(): void {
    const idUsuarioActivo = this.authService.currentUser()?.idUsuario;
    this.cargando.set(true);

    this.agendaService.obtenerAgendas().subscribe({
      next: (agendasRes) => {
        const todasAgendas = agendasRes.data || [];
        // Filtrar las agendas del profesional actual para obtener sus ciclos correspondientes
        const ciclosIdsProfesional = todasAgendas
          .filter((agenda) =>
            agenda.reglas_disponibilidad?.some(
              (regla: any) => Number(regla.idProfesional) === Number(idUsuarioActivo)
            )
          )
          .map((agenda) => agenda.idCiclo);

        // Obtener todos los ciclos y filtrar solo los del profesional actual
        this.agendaService.obtenerCiclos().subscribe({
          next: (ciclosRes) => {
            const todosCiclos = ciclosRes.data || [];
            const backendCiclos = todosCiclos.filter((c: any) =>
              ciclosIdsProfesional.includes(c.idCiclo)
            );

            const mapped = backendCiclos.map((c: any) => {
              const rangos = c.rango_horarios || [];
              const diasSemana = Array.from(new Set(rangos.map((r: any) => {
                const dia = r.diaSemana;
                if (dia.startsWith('Mi')) return 'Mié';
                if (dia.startsWith('Sá')) return 'Sáb';
                return dia.substring(0, 3);
              })));

              const bloquesHorario = rangos.map((r: any) => ({
                inicio: r.horaInicio.substring(0, 5),
                fin: r.horaFin.substring(0, 5)
              }));

              const bloquesUnicos = bloquesHorario.filter(
                (v: any, i: number, a: any[]) => a.findIndex((t: any) => t.inicio === v.inicio && t.fin === v.fin) === i
              );

              return {
                id: c.idCiclo,
                nombre: c.nombre,
                diasSemana: diasSemana.length > 0 ? diasSemana : ['Sin días'],
                bloquesHorario: bloquesUnicos,
                tieneDescanso: false,
                tiempoDescansoMinutos: 0
              };
            });
            this.ciclos.set(mapped);
            this.cargando.set(false);
          },
          error: () => {
            console.error('Error al cargar ciclos de agenda');
            this.cargando.set(false);
          }
        });
      },
      error: () => {
        console.error('Error al obtener agendas');
        this.cargando.set(false);
      }
    });
  }

  // Volver a inicio.
  goBack(): void {
    this.router.navigate(['/']);
  }

  // Redirigir a crear ciclo.
  goToAdd(): void {
    this.router.navigate(['/crear-ciclo-agenda']);
  }

  // Redirigir a editar ciclo.
  goToEdit(id: number): void {
    this.router.navigate(['/editar-ciclo-agenda'], { queryParams: { id } });
  }

  // Obtener texto de bloques.
  formatBloques(bloques: any[]): string {
    if (!bloques || bloques.length === 0) return 'Sin bloques';
    return bloques.map((b) => `${b.inicio} - ${b.fin}`).join(', ');
  }
}
