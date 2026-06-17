export interface LiveKitReservaResumen {
  idReserva: number;
  estado: string;
  fechaReserva?: string | null;
  servicio?: {
    nombre?: string | null;
    modalidad?: string | null;
    duracionMinutos?: number | null;
    imagenUrl?: string | null;
  } | null;
  profesional?: {
    nombreNegocio?: string | null;
    imagenPerfilUrl?: string | null;
    usuario?: {
      nombre?: string | null;
      imagenPerfilUrl?: string | null;
    } | null;
  } | null;
  cliente?: {
    usuario?: {
      nombre?: string | null;
      imagenPerfilUrl?: string | null;
    } | null;
  } | null;
}

export interface LiveKitTokenData {
  url: string;
  token: string;
  room: string;
  identity: string;
  nombre: string;
  roomName?: string;
  livekitUrl?: string;
  reserva?: LiveKitReservaResumen;
}

export interface LiveKitTokenResponse {
  message: string;
  data: LiveKitTokenData;
}
