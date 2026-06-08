export interface ReservaPayload {
  idServicio: number;
  fecha: string;       // YYYY-MM-DD
  horaInicio: string;  // HH:MM
  idPaqueteComprado?: number;
}

export interface ReservaCreada {
  idReserva: number;
  estado: string;
  fechaReserva?: string;
  horarioInicio?: string;
  horarioFin?: string;
  idProfesional?: number;
  idCliente?: number;
  idServicio?: number;
  servicioNombre?: string;
  clienteNombre?: string;
  precio?: number;
  [key: string]: unknown;
}

export interface ReservaCreadaResponse {
  message?: string;
  data?: ReservaCreada;
  // algunos endpoints devuelven el objeto directamente
  idReserva?: number;
  estado?: string;
}
