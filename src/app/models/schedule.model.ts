export interface Slot {
  horaInicio: string;
  horaFin: string;
  idRegla: number;
  /** El backend puede devolver idHorario directamente; si no, se usa idRegla como fallback */
  idHorario?: number;
  idServicio: number;
  duracionMinutos: number;
}

export interface ScheduleResponse {
  message: string;
  data: {
    profesional: {
      idUsuario: number;
      nombreNegocio: string;
      descripcion: string;
      ratingPromedio: number;
      usuario: {
        idUsuario: number;
        nombre: string;
        email: string;
        telefono: string;
      };
    };
    servicio: {
      idServicio: number;
      nombre: string;
      descripcion: string;
      precio: number;
      duracionMinutos: number;
      modalidad: 'presencial' | 'virtual' | 'hibrida';
    };
    fecha: string;
    dia_semana: string;
    slots_disponibles: Slot[];
  };
}
