import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { AuthService } from './auth.service';
import { Reserva } from 'app/models/reserva.model';

export interface AdminReservasResponse {
  message: string;
  data: Reserva[];
  meta: {
    current_page: number;
    per_page: number;
    total: number;
  };
}

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = environment.apiUrl;
  private baseUrl = `${environment.apiUrl}/admin`;

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    });
  }

  getReservas(
    filtros: { estado?: string; perPage?: number; page?: number } = {},
  ): Observable<AdminReservasResponse> {
    let params = new HttpParams();
    Object.entries(filtros).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, String(value));
      }
    });

    return this.http.get<AdminReservasResponse>(`${this.baseUrl}/reservas`, { params });
  }

  completarReserva(idReserva: number): Observable<{ message: string; data: any }> {
    return this.http.post<{ message: string; data: any }>(
      `${this.apiUrl}/reservas/${idReserva}/completar`,
      {},
    );
  }

  // Obtener metricas generales.
  getMetricas(): Observable<{ message: string; data: any }> {
    return this.http.get<{ message: string; data: any }>(`${this.baseUrl}/metricas`, {
      headers: this.getHeaders(),
    });
  }

  // Obtener reservas agrupadas por profesional.
  getReservasPorProfesional(): Observable<{ message: string; data: any[] }> {
    return this.http.get<{ message: string; data: any[] }>(
      `${this.baseUrl}/reservas/profesionales`,
      {
        headers: this.getHeaders(),
      },
    );
  }

  // Obtener reservas agrupadas por servicio.
  getReservasPorServicio(): Observable<{ message: string; data: any[] }> {
    return this.http.get<{ message: string; data: any[] }>(`${this.baseUrl}/reservas/servicios`, {
      headers: this.getHeaders(),
    });
  }

  // Obtener resumen de paquetes.
  getResumenPaquetes(): Observable<{ message: string; data: any }> {
    return this.http.get<{ message: string; data: any }>(`${this.baseUrl}/paquetes/resumen`, {
      headers: this.getHeaders(),
    });
  }

  // Obtener paquetes comprados agrupados por servicio.
  getPaquetesPorServicio(): Observable<{ message: string; data: any[] }> {
    return this.http.get<{ message: string; data: any[] }>(`${this.baseUrl}/paquetes/servicios`, {
      headers: this.getHeaders(),
    });
  }
}
