import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';

export interface ExcepcionPayload {
  fecha: string;
  horaInicio: string;
  horaFin: string;
  motivo?: string;
  idAgenda: number;
}

@Injectable({
  providedIn: 'root',
})
export class ExcepcionService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/excepciones-disponibilidad`;
  private agendaUrl = `${environment.apiUrl}/agendas`;
  private misAgendasUrl = `${environment.apiUrl}/me/profesional/agendas`;
  private misExcepcionesUrl = `${environment.apiUrl}/me/profesional/excepciones`;

  // Obtener todas las agendas.
  obtenerAgendas(): Observable<{ data: any[] }> {
    return this.http.get<{ data: any[] }>(this.agendaUrl);
  }

  // Obtener agendas del profesional autenticado.
  obtenerAgendasProfesional(): Observable<{ data: any[] }> {
    return this.http.get<{ data: any[] }>(this.misAgendasUrl);
  }

  // Obtener todas las excepciones de disponibilidad.
  obtenerExcepciones(): Observable<{ data: any[] }> {
    return this.http.get<{ data: any[] }>(this.apiUrl);
  }

  // Obtener excepciones del profesional autenticado.
  obtenerMisExcepciones(): Observable<{ data: any[] }> {
    return this.http.get<{ data: any[] }>(this.misExcepcionesUrl);
  }

  // Crear una nueva excepción de disponibilidad.
  crearExcepcion(payload: ExcepcionPayload): Observable<any> {
    return this.http.post<any>(this.apiUrl, payload);
  }

  // Eliminar una excepción de disponibilidad.
  eliminarExcepcion(idExcepcion: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${idExcepcion}`);
  }
}
