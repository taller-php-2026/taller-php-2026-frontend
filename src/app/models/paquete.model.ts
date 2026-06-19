import { Reserva, ReservaPago } from './reserva.model';
import { Service } from './service.model';

export interface PaqueteReserva {
  idReserva: number;
  fechaReserva: string;
  estado: string;
  servicio?: Service | null;
  profesional?: {
    idUsuario: number;
    nombreNegocio?: string | null;
    usuario?: {
      nombre?: string | null;
      email?: string | null;
    } | null;
  } | null;
  horario?: {
    fecha: string;
    horaInicio: string;
    horaFin: string;
  } | null;
}

export interface PaqueteServicio {
  idPaqueteServicio: number;
  idServicio: number;
  totalSesiones: number;
  precio: number | string;
  activo: boolean;
  imagenUrl?: string | null;
  servicio?: Service & {
    ubicacion?: {
      direccion?: string | null;
      ciudad?: string | null;
      latitud?: string | number | null;
      longitud?: string | number | null;
    } | null;
    profesionales?: Array<{
      idUsuario: number;
      nombreNegocio?: string | null;
      ratingPromedio?: number | string | null;
      usuario?: {
        nombre?: string | null;
        email?: string | null;
        imagenPerfilUrl?: string | null;
      } | null;
    }>;
  } | null;
  serviciosComunes?: Array<{
    servicio?: Service | null;
  }>;
}

export interface PaqueteComprado {
  idPaqueteComprado: number;
  idCliente: number;
  idPaqueteServicio: number;
  idPago?: number | null;
  totalSesiones: number;
  sesionesUsadas: number;
  sesionesRestantes: number;
  precioCompra: number | string;
  estado: 'pendiente' | 'activo' | 'agotado' | 'cancelado' | string;
  fechaCompra: string;
  paqueteServicio?: PaqueteServicio | null;
  pago?: ReservaPago | null;
  reservas?: Reserva[];
  reservas?: PaqueteReserva[];
}

export interface PaquetesDisponiblesResponse {
  data: PaqueteServicio[];
}

export interface PaqueteDetalleResponse {
  data: PaqueteServicio;
}

export interface MisPaquetesResponse {
  message: string;
  data: PaqueteComprado[];
}

export interface ComprarPaqueteResponse {
  message: string;
  data: {
    paqueteComprado: PaqueteComprado;
  };
}

export interface MercadoPagoPaqueteResponse {
  message?: string;
  data?: {
    checkout_url: string;
    preference_id: string;
  };
}
