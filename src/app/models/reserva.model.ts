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

export interface ReservaUsuario {
  idUsuario: number;
  nombre: string;
  email: string;
  imagenPerfilUrl?: string | null;
}

export interface ReservaServicio {
  idServicio: number;
  nombre: string;
  descripcion: string;
  precio: number | string;
  duracionMinutos: number;
  modalidad: 'presencial' | 'virtual' | 'hibrida' | string;
  imagenUrl?: string | null;
}

export interface ReservaProfesional {
  idUsuario: number;
  nombreNegocio?: string | null;
  descripcion?: string | null;
  usuario?: ReservaUsuario | null;
}

export interface ReservaHorario {
  idHorario: number;
  fecha: string;
  horaInicio: string;
  horaFin: string;
}

export interface ReservaPago {
  idPago: number;
  monto: number | string;
  metodoPago?: string | null;
  estado: 'aprobado' | 'pendiente' | 'rechazado' | 'cancelado' | string;
  fechaPago?: string | null;
  referenciaExterna?: string | null;
}

export interface Reserva {
  idReserva: number;
  fechaReserva: string;
  estado: 'pendiente' | 'confirmada' | 'cancelada' | 'completada' | 'enCurso' | string;
  comentarios?: string | null;
  idPaqueteComprado?: number | null;
  servicio?: ReservaServicio | null;
  profesional?: ReservaProfesional | null;
  horario?: ReservaHorario | null;
  pago?: ReservaPago | null;
  paqueteComprado?: {
    idPaqueteComprado: number;
    sesionesUsadas?: number;
    sesionesRestantes?: number;
    estado?: string;
  } | null;
}

export interface MisReservasResponse {
  message: string;
  data: Reserva[];
}

export interface CancelarReservaResponse {
  message: string;
  data: {
    reserva: Reserva;
    paqueteComprado?: unknown;
  };
}
