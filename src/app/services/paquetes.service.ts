import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import {
  ComprarPaqueteResponse,
  MercadoPagoPaqueteResponse,
  PaqueteDetalleResponse,
  MisPaquetesResponse,
  PaquetesDisponiblesResponse,
} from 'app/models/paquete.model';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PaquetesService {
  constructor(private http: HttpClient) {}

  getPaquetesDisponibles(filtros: Record<string, string | number> = {}): Observable<PaquetesDisponiblesResponse> {
    const params = new HttpParams({ fromObject: filtros });
    return this.http.get<PaquetesDisponiblesResponse>(`${environment.apiUrl}/paquete-servicios`, { params });
  }

  getPaqueteById(idPaqueteServicio: number): Observable<PaqueteDetalleResponse> {
    return this.http.get<PaqueteDetalleResponse>(
      `${environment.apiUrl}/paquete-servicios/${idPaqueteServicio}`,
    );
  }

  comprarPaquete(idPaqueteServicio: number): Observable<ComprarPaqueteResponse> {
    return this.http.post<ComprarPaqueteResponse>(
      `${environment.apiUrl}/paquete-servicios/${idPaqueteServicio}/comprar`,
      {},
    );
  }

  getMisPaquetes(): Observable<MisPaquetesResponse> {
    return this.http.get<MisPaquetesResponse>(`${environment.apiUrl}/me/paquetes`);
  }

  pagarPaquete(idPaqueteComprado: number): Observable<unknown> {
    return this.http.post(`${environment.apiUrl}/paquetes-comprados/${idPaqueteComprado}/pagar`, {});
  }

  crearPreferenciaMercadoPagoPaquete(
    idPaqueteComprado: number,
  ): Observable<MercadoPagoPaqueteResponse> {
    return this.http.post<MercadoPagoPaqueteResponse>(
      `${environment.apiUrl}/paquetes-comprados/${idPaqueteComprado}/mercadopago`,
      {},
    );
  }
}
