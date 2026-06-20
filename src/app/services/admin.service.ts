import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private baseUrl = `${environment.apiUrl}/admin`;

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    });
  }

  // Obtener metricas generales.
  getMetricas(): Observable<{ message: string; data: any }> {
    return this.http.get<{ message: string; data: any }>(`${this.baseUrl}/metricas`, {
      headers: this.getHeaders(),
    });
  }

  // Obtener reservas agrupadas por profesional.
  getReservasPorProfesional(): Observable<{ message: string; data: any[] }> {
    return this.http.get<{ message: string; data: any[] }>(`${this.baseUrl}/reservas/profesionales`, {
      headers: this.getHeaders(),
    });
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

  // Obtener todos los usuarios.
  getUsuarios(): Observable<{ data: any[] }> {
    return this.http.get<{ data: any[] }>(`${environment.apiUrl}/usuarios`, {
      headers: this.getHeaders(),
    });
  }

  // Crear un nuevo usuario.
  crearUsuario(data: any): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/usuarios`, data, {
      headers: this.getHeaders(),
    });
  }

  // Eliminar un usuario.
  eliminarUsuario(id: number): Observable<any> {
    return this.http.delete<any>(`${environment.apiUrl}/usuarios/${id}`, {
      headers: this.getHeaders(),
    });
  }
}
