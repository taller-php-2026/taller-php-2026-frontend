export interface UbicacionServicio {
  idUbicacion?: number;
  direccion?: string | null;
  ciudad?: string | null;
  pais?: string | null;
  latitud?: string | number | null;
  longitud?: string | number | null;
}

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
  ubicacion?: UbicacionServicio | null;
  video_sesion?: {
    idVideoSesion: number;
    proveedor?: string;
    urlAcceso?: string;
    nombreSala?: string;
  } | null;
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
