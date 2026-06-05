export interface Service {
  idServicio: number;
  nombre: string;
  descripcion: string;
  precio: number;
  duracionMinutos: number;
  activo: number;
  modalidad: 'presencial' | 'virtual' | 'hibrida';
  idUbicacion: number | null;
  idVideoSesion: number | null;
  created_at: string;
  updated_at: string;
}
