export interface Notificacion {
  idNotificacion: number;
  idUsuario: number;
  titulo: string;
  mensaje: string;
  tipo: 'confirmacion' | 'recordatorio' | 'cancelacion' | 'actualizacion' | 'mensaje';
  leida: boolean;
  enviadaMail: boolean;
  fechaCreacion: string;
  fechaLectura?: string | null;
  idReserva?: number | null;
}

export interface NotificacionesResponse {
  data: Notificacion[];
  unreadCount: number;
}
