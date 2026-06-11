export interface Service {
  idServicio: number;
  nombre: string;
  descripcion: string;
  precio: number;
  duracionMinutos: number;
  activo: boolean;
  modalidad?: 'presencial' | 'virtual' | 'hibrida';
  idUbicacion?: number | null;
  idVideoSesion?: number | null;
  imagenUrl?: string;
  imagenPublicId?: string;
  created_at?: string;
  updated_at?: string;
}

export interface FilteredService {
  texto?: string;
  modalidad?: string;
  precioMin?: number;
  precioMax?: number;
  ratingMin?: number;
  ordenarPor?: string;
  orden?: string;
  perPage?: number;
}
