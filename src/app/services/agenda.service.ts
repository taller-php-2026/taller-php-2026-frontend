import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environment';

export interface RangoHorarioPayload {
  diaSemana: string;
  horaInicio: string;
  horaFin: string;
  idCiclo: number;
}

export interface ReglaDisponibilidadPayload {
  dia_semana: string;
  horaInicio: string;
  horaFin: string;
  pausaMinutos: number;
  bufferMinutos: number;
  activa: boolean;
  idAgenda: number;
  idProfesional: number;
}

@Injectable({
  providedIn: 'root',
})
export class AgendaService {
  private http = inject(HttpClient);
  private ciclosUrl = `${environment.apiUrl}/ciclos`;
  private rangosUrl = `${environment.apiUrl}/rangos-horarios`;
  private agendasUrl = `${environment.apiUrl}/agendas`;
  private reglasUrl = `${environment.apiUrl}/reglas-disponibilidad`;

  // Obtener todos los ciclos.
  obtenerCiclos(): Observable<{ data: any[] }> {
    return this.http.get<{ data: any[] }>(this.ciclosUrl);
  }

  // Obtener un ciclo por ID.
  obtenerCicloPorId(id: number): Observable<{ data: any }> {
    return this.http.get<{ data: any }>(`${this.ciclosUrl}/${id}`);
  }

  // Crear un nuevo ciclo.
  crearCiclo(nombre: string): Observable<{ data: any }> {
    return this.http.post<{ data: any }>(this.ciclosUrl, { nombre });
  }

  // Crear un rango horario para un ciclo.
  crearRangoHorario(payload: RangoHorarioPayload): Observable<any> {
    return this.http.post<any>(this.rangosUrl, payload);
  }

  // Crear una nueva agenda.
  crearAgenda(idCiclo: number): Observable<{ data: any }> {
    return this.http.post<{ data: any }>(this.agendasUrl, { idCiclo });
  }

  // Obtener todas las agendas.
  obtenerAgendas(): Observable<{ data: any[] }> {
    return this.http.get<{ data: any[] }>(this.agendasUrl);
  }

  // Crear una regla de disponibilidad para una agenda.
  crearReglaDisponibilidad(payload: ReglaDisponibilidadPayload): Observable<any> {
    return this.http.post<any>(this.reglasUrl, payload);
  }

  // Eliminar un ciclo (elimina cascada rangos y agendas).
  eliminarCiclo(id: number): Observable<any> {
    return this.http.delete<any>(`${this.ciclosUrl}/${id}`);
  }
}
