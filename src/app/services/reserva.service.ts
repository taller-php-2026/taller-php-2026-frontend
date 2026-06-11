import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import {
  CancelarReservaResponse,
  MisReservasResponse,
  ReservaPayload,
  ReservaCreadaResponse,
} from '../models/reserva.model';

export interface PagoPayload {
  metodoPago: string;
  referenciaExterna?: string;
}

export interface PagoResponse {
  message?: string;
  estado?: string;
  [key: string]: unknown;
}

export interface MercadoPagoPreferenciaResponse {
  message?: string;
  data?: {
    checkout_url: string;
    preference_id: string;
  };
}

@Injectable({ providedIn: 'root' })
export class ReservaService {
  constructor(private http: HttpClient) {}

  crearReserva(
    idProfesional: number,
    payload: ReservaPayload,
  ): Observable<ReservaCreadaResponse> {
    return this.http.post<ReservaCreadaResponse>(
      `${environment.apiUrl}/profesionales/${idProfesional}/reservar-slot`,
      payload,
    );
  }

  pagarReserva(idReserva: number, payload: PagoPayload): Observable<PagoResponse> {
    return this.http.post<PagoResponse>(
      `${environment.apiUrl}/reservas/${idReserva}/pagar`,
      payload,
    );
  }

  crearPreferenciaMercadoPago(idReserva: number): Observable<MercadoPagoPreferenciaResponse> {
    return this.http.post<MercadoPagoPreferenciaResponse>(
      `${environment.apiUrl}/reservas/${idReserva}/mercadopago`,
      {},
    );
  }

  getMisReservas(): Observable<MisReservasResponse> {
    return this.http.get<MisReservasResponse>(`${environment.apiUrl}/me/reservas`);
  }

  cancelarReserva(idReserva: number): Observable<CancelarReservaResponse> {
    return this.http.post<CancelarReservaResponse>(
      `${environment.apiUrl}/reservas/${idReserva}/cancelar`,
      {},
    );
  }
}
